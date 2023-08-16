/**
 * A generic, efficient double-ended queue (deque) implementation
 * @template T - The value type of the deque
 */
export default class Deque {
  static #INIT_SIZE = 1 << 16

  #start = 0
  #end
  #len

  #cap = Deque.#INIT_SIZE
  #cap_mask

  #data

  /**
   * Creates a new deque objects.
   * @param {T[]} data - If an array is passed, add all its elements into the
   * deque.
   */
  constructor(data = []) {
    const len = data.length
    while (this.#cap < len) this.#cap <<= 1
    this.#cap_mask = this.#cap - 1

    this.#data = data.concat(new Array(this.#cap - len))
    this.#end = len
    this.#len = len
  }

  /**
   * @returns The length of the deque.
   */
  get len() {
    return this.#len
  }

  #grow() {
    this.#data = this.#data.concat(this.#data)
    this.#end += this.#cap
    this.#cap <<= 1
    this.#cap_mask = (this.#cap_mask << 1) | 1
  }

  /**
   * Removes all elements from the deque.
   */
  clear() {
    this.#start = 0
    this.#end = 0
    this.#len = 0
  }

  /**
   * Appends an element to the back of the deque
   * @param {T} item
   */
  pushBack(item) {
    if (this.#len == this.#cap) this.#grow()
    this.#data[this.#end] = item
    this.#end = (this.#end + 1) & this.#cap_mask
    this.#len++
  }

  /**
   * Appends an element to the front of the deque
   * @param {T} item
   */
  pushFront(item) {
    if (this.#len == this.#cap) this.#grow()
    this.#start = (this.#start - 1) & this.#cap_mask
    this.#len++
    this.#data[this.#start] = item
  }

  /**
   * Gets the last element and removes it from the deque.
   * @returns the removed element, or `null` if the deque is empty.
   */
  popBack() {
    if (this.#len == 0) return null
    this.#end = (this.#end - 1) & this.#cap_mask
    this.#len--
    return this.#data[this.#end]
  }

  /**
   * Gets the first element and removes it from the deque.
   * @returns the removed element, or `null` if the deque is empty.
   */
  popFront() {
    if (this.#len == 0) return null
    const item = this.#data[this.#start]
    this.#start = (this.#start + 1) & this.#cap_mask
    this.#len--
    return item
  }

  /**
   * @param {number} idx - Zero-based index of the array element to be returned.
   * For performance reasons, values less than zero or more than the length of
   * the deque has undefined behaviour. It is up to the user if they need to and
   * how to bounds check the value.
   *
   * @returns The element at the specified index.
   */
  peek(idx) {
    return this.#data[(this.#start + idx) & this.#cap_mask]
  }

  /**
   * Gets the last element without removing it from the deque.
   * @returns The element at the back of the deque.
   */
  peekBack() {
    return this.peek(this.#len - 1)
  }

  /**
   * Gets the first element without removing it from the deque.
   * @returns The element at the front of the deque.
   */
  peekFront() {
    return this.peek(0)
  }

  /**
   * Converts the deque into an array.
   * @returns An array with its elements copied from the deque.
   */
  toArray() {
    if (this.#end != this.#start + this.#len) {
      // Rotates the array so that the elements do not wrap
      if (this.#len <= (this.#cap >> 1)) {
        this.#data.copyWithin(this.#end + this.#cap - this.#start, 0, this.#end)
        this.#data.copyWithin(this.#end, this.#start)
        this.#start = this.#end
        this.#end += this.#len
      } else {
        // TODO: Speed up this path
        this.#grow()
      }
    }
    return this.#data.slice(this.#start, this.#end)
  }
}
