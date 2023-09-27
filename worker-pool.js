class Queue {
  #start = 0
  #end = 0
  #len = 0

  #cap = 1 << 10
  #cap_mask = this.#cap - 1

  #data = new Array(this.#cap)

  enqueue(item) {
    if (this.#len == this.#cap) {
      this.#data = this.#data.concat(this.#data)
      this.#end += this.#cap
      this.#cap <<= 1
      this.#cap_mask = (this.#cap_mask << 1) | 1
    }
    this.#start = (this.#start - 1) & this.#cap_mask
    this.#len++
    this.#data[this.#start] = item
  }

  dequeue() {
    if (this.#len == 0) return null
    this.#end = (this.#end - 1) & this.#cap_mask
    this.#len--
    return this.#data[this.#end]
  }
}

function CreateWorker(worker_url) {
  const worker = new Worker(worker_url, { type: "module" })

  return new Promise((resolve, reject) => worker.addEventListener('message', e => {
    const msg = e.data
    if (msg != 'ready') reject(new Error(`Expected 'ready', got '${msg}'`))

    resolve(worker)
  }, { once: true }))
}

function CreateWorkers(worker_url, count) {
  let workers = new Array(count)
  for (let i = 0; i < count; ++i) workers[i] = CreateWorker(worker_url)

  return Promise.all(workers)
}

const destroy_sym = Symbol("destroy")

export default {
  async create(module_path, worker_count = navigator.hardwareConcurrency) {
    const url = new URL(module_path, import.meta.url).href
    const worker_code = `
      import * as module from "${url}"

      addEventListener("message", e => {
      const { fn, inputs } = e.data

      Promise.resolve(module[fn](...inputs)).then(output => postMessage(output))
      })

      postMessage("ready")
    `

    const worker_blob = new Blob([worker_code], { type: "text/javascript" })
    const worker_url = URL.createObjectURL(worker_blob)
    const workers = await CreateWorkers(worker_url, worker_count)
    URL.revokeObjectURL(worker_url)

    const free_workers = new Uint32Array(worker_count)
    for (let i = 0; i < worker_count; ++i) free_workers[i] = i
    let free_workers_top = worker_count

    const processing = new Array(worker_count)
    const task_queue = new Queue()

    for (let i = 0; i < worker_count; ++i) {
      workers[i].addEventListener("message", e => {
        processing[i](e.data)

        const task = task_queue.dequeue()
        if (task != null) {
          const [fn, inputs, resolve] = task
          processing[i] = resolve
          workers[i].postMessage({ fn, inputs })
        } else {
          free_workers[free_workers_top++] = i
        }
      })
    }

    const pool = {}

    for (const [key, value] of Object.entries(await import(url))) {
      if (typeof value != "function") continue

      pool[key] = (...inputs) => new Promise(resolve => {
        if (free_workers_top) {
          const worker = free_workers[--free_workers_top]
          processing[worker] = resolve
          workers[worker].postMessage({ fn: key, inputs })
        } else {
          task_queue.enqueue([key, inputs, resolve])
        }
      })
    }

    pool[destroy_sym] = () => {
      for (let i = 0; i < worker_count; ++i) workers[i].terminate()
    }

    return pool
  },

  destroy(pool) {
    pool[destroy_sym]()
  }
}
