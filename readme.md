# JSds - Small, efficient data structures in JavaScript

JSds is a collection of JavaScript data structures that are not available in
the standard library. It uses modern JavaScript and balances between
performance, readability and versatility.

## Included data structures

### Deque

A fast double-ended queue implemented on top of a growable ring buffer and
relies on native JS memory operations like `Array.concat` and
`Array.copyWithin`.

```js
const queue = new Deque([1, 2, 3, 4])

queue.pushBack(queue.popFront())
queue.pushBack(queue.popFront())

queue.toArray() // [3, 4, 1, 2]
```

It also supports TypeScript and Generics

```ts
const queue = new Deque<number>()

// Error: Type 'number | null' is not assignable to type 'number'.
const x: number = queue.popBack()
```

### BitSet

An efficient, dynamic bitset implementation. It's generally faster and smaller
than the native generic `Set` thanks to the use of `TypedArray` and as the name
suggest, bitwise operations.

```js
const set = new BitSet([1, 5, 10, 500])
set.delete(10)
set.add(100)

set.items() // [1, 5, 100, 500]
```

Todo:
- Ranged add/remove/flip
- Set operations (e.g. difference, union, intersection, equality,
subset/superset relations)

## Installation

You can either:

- Download the files to your project
- Import with URL (only for deno and browsers)

## License

This project is licensed under the [MIT License](LICENSE).
