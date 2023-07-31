export default class BitSet {
  #cap = 32
  #bits = new Uint32Array(this.#cap)

  /**
   * @param {Iterable<number>} iterable
   */
  constructor(iterable = []) {
    for (const n of iterable) this.add(n)
  }

  clear() {
    this.#bits.fill(0)
  }

  /**
   * @param {number} n
   */
  add(n) {
    const idx = n >> 5
    if (this.#cap <= idx) {
      while (this.#cap <= idx) this.#cap <<= 1
      const old_bits = this.#bits
      this.#bits = new Uint32Array(this.#cap)
      this.#bits.set(old_bits)
    }

    this.#bits[idx] |= 1 << (n & 31)
  }

  /**
   * @param {number} n
   */
  has(n) {
    const idx = n >> 5
    return this.#cap > idx && !!((this.#bits[idx] >> (n & 31)) & 1)
  }

  /**
   * @param {number} n
   */
  delete(n) {
    const idx = n >> 5
    if (this.#cap <= idx) return
    this.#bits[idx] &= ~(1 << (n & 31))
  }

  count() {
    let count = 0
    for (let i = 0; i < this.#cap; ++i) {
      let n = this.#bits[i]
      n = n - ((n >> 1) & 0x55555555)
      n = (n & 0x33333333) + ((n >> 2) & 0x33333333)
      count += ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24
    }
    return count
  }
  
  items() {
    let result = new Uint32Array(this.count())
    let result_ptr = 0

    for (let i = 0; i < this.#cap; ++i) {
      let n = this.#bits[i]
      let shift = i << 5

      while (n) {
        const bit = n & -n
        n ^= bit

        result[result_ptr++] = (31 - Math.clz32(bit)) | shift
      }
    }

    return result
  }

  *[Symbol.iterator]() {
    yield *this.items()
  }
}
