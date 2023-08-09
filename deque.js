/**
 * @template T
 */
export default class Deque {
  static #INIT_SIZE = 1 << 16

  #start = 0
  #end
  #len

  #cap = Deque.#INIT_SIZE
  #cap_mask = Deque.#INIT_SIZE - 1

  #data

  /**
   * @param {T[]} data
   */
  constructor(data = []) {
    const len = data.length
    while (this.#cap < len) {
      this.#cap <<= 1
      this.#cap_mask = (this.#cap_mask << 1) | 1
    }

    this.#data = data.concat(new Array(this.#cap - len))
    this.#end = len
    this.#len = len
  }

  get len() {
    return this.#len
  }

  #grow() {
    this.#data = this.#data.concat(this.#data)
    this.#end += this.#cap
    this.#cap <<= 1
    this.#cap_mask = (this.#cap_mask << 1) | 1
  }

  clear() {
    this.#start = 0
    this.#end = 0
    this.#len = 0
  }

  /**
   * @param {T} item
   */
  pushBack(item) {
    if (this.#len == this.#cap) this.#grow()
    this.#data[this.#end] = item
    this.#end = (this.#end + 1) & this.#cap_mask
    this.#len++
  }

  /**
   * @param {T} item
   */
  pushFront(item) {
    if (this.#len == this.#cap) this.#grow()
    this.#start = (this.#start - 1) & this.#cap_mask
    this.#len++
    this.#data[this.#start] = item
  }

  popBack() {
    if (this.#len == 0) return null
    this.#end = (this.#end - 1) & this.#cap_mask
    this.#len--
    return this.#data[this.#end]
  }

  popFront() {
    if (this.#len == 0) return null
    const item = this.#data[this.#start]
    this.#start = (this.#start + 1) & this.#cap_mask
    this.#len--
    return item
  }

  peek(idx) {
    return this.#data[(this.#start + idx) & this.#cap_mask]
  }

  toArray() {
    if (this.#end != this.#start + this.#len) {
      if (this.#len <= (this.#cap >> 1)) {
        this.#data.copyWithin(this.#end + this.#cap - this.#start, 0, this.#end)
        this.#data.copyWithin(this.#end, this.#start)
        this.#start = this.#end
        this.#end += this.#len
      } else {
        this.#grow()
      }
    }
    return this.#data.slice(this.#start, this.#end)
  }
}
