/**
 * @template T
 * @param {T} a
 * @param {T} b
 */
function less(a, b) { return a < b }

/**
 * @template T
 * @param {T[]} array
 * @param {number} idx
 * @param {T} val
 * @param {(a: T, b: T) => boolean} cmp
 */
function siftdown(array, idx, val, cmp) {
  const half = array.length >> 1
  while (idx < half) {
    const l_idx = (idx << 1) + 1;
    const r_idx = (idx << 1) + 2;
    if (r_idx < array.length && cmp(array[r_idx], val)) {
      if (cmp(array[r_idx], array[l_idx])) {
        array[idx] = array[r_idx]
        idx = r_idx
      } else {
        array[idx] = array[l_idx]
        idx = l_idx
      }
    } else if (l_idx < array.length && cmp(array[l_idx], val)) {
      array[idx] = array[l_idx]
      idx = l_idx
    } else {
      break
    }
  }
  array[idx] = val
}

/**
 * @template T
 * @param {T[]} array
 * @param {(a: T, b: T) => boolean} [cmp]
 * Construct a binary heap from an array in-place.
 */
export function heapify(array, cmp = less) {
  for (let i = (array.length >> 1) - 1; i >= 0; --i) {
    siftdown(array, i, array[i], cmp)
  }
}

/**
 * @template T
 * @param {T[]} array
 * @param {(a: T, b: T) => boolean} [cmp]
 * Gets the largest element and removes it from the heap.
 * @returns {T | undefined} the removed element, or `undefined` if the heap is empty.
 */
export function pop(array, cmp = less) {
  const ret = array[0]
  const val = /** @type {T} */ (array.pop())
  if (array.length) siftdown(array, 0, val, cmp)
  return ret
}

/**
 * @template T
 * @param {T[]} array
 * @param {T} val
 * @param {(a: T, b: T) => boolean} [cmp]
 * Push an element into the heap, maintaining the heap invariant.
 */
export function push(array, val, cmp = less) {
  let idx = array.length
  let p = (idx - 1) >> 1
  array.push(val)
  while (idx > 0 && !cmp(array[p], val)) {
    array[idx] = array[p]
    idx = p
    p = (idx - 1) >> 1
  }
  array[idx] = val
}

/**
 * @template T
 * @param {T[]} array
 * @param {T} val
 * @param {(a: T, b: T) => boolean} [cmp]
 * Replace the element on top of the heap with another element.
 * This is equivalent to, but faster than a `pop` followed by a `push`.
 * @returns {T | undefined} the replaced element, or `undefined` if the heap is empty.
 */
export function replace(array, val, cmp = less) {
  if (array.length) {
    const ret = array[0]
    siftdown(array, 0, val, cmp)
    return ret
  }
}
