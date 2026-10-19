---
title: Arrays
description: Cerune fixed-length and dynamic arrays, copying, updates, iteration, and limitations.
---

Cerune supports **fixed-length arrays** `[T; N]` and **dynamic arrays** `[T]`. Both store elements of a given type, but differ in how their lengths are represented and how values are created.

## Fixed-length arrays

`[i64; 3]` is an array type with three `i64` elements. Length is part of the type, so `[i64; 2]` and `[i64; 3]` are different types.

```cerune
values: [i64; 3] = [10, 20, 30];
print(values[1]);       // 20
print(array_len(values)); // 3
```

- Indices start at zero and have type `i64`.
- Array literals with incompatible element types or lengths fail type checking.
- Lengths may be positive integer literals or supported integer constants.
- Empty fixed-length array literals are not currently supported.

## Dynamic arrays

`[T]` represents an array whose length is known at runtime. **The literal `[10, 20, 30]` is a fixed-length array** and is not implicitly converted to a dynamic array.

```cerune
values: [i64] = array_copy([10, 20, 30]);
print(array_len(values)); // 3
```

| Operation | Behavior |
| --- | --- |
| `array_copy(values)` | Create an independent dynamic array from a fixed or dynamic array |
| `array_copy_range(values, start, end)` | Copy a half-open range `[start, end)` |
| `array_repeat::<T>(value, count)` | Create an array with `count` independent copies of `value` |
| `array_len(values)` | Return the outer array length as `i64` |

Range bounds use `i64` and must satisfy `0 <= start <= end <= length`. An empty dynamic array can be created with `array_copy_range([1], 0, 0)`.

`array_repeat` requires an explicit type argument and a nonnegative `i64` count. A negative count causes a runtime failure. Both argument expressions are evaluated even when the count is zero.

## Copies and element updates

Arrays have **value-copy semantics**. Updating the original does not change a previously created copy. Nested dynamic arrays are also copied independently.

```cerune
mut values: [i64] = array_copy([10, 20, 30]);
saved: [i64] = values;
values[1] = 99;

print(values); // [10, 99, 30]
print(saved);  // [10, 20, 30]
```

A `mut` array binding permits element updates. Updating elements through an immutable binding fails type checking. A `mut` dynamic array binding may also be **reassigned to an array of a different length**, but this is not an append operation.

Negative or out-of-bounds indices cause runtime failures for both kinds of arrays. Nested indexed assignments evaluate and check each index in order before evaluating the right-hand side.

## Array iteration

Use `for … in` to process array elements in order:

```cerune
values: [i64; 3] = [4, 7, 9];
for (value: infer in values) {
    print(value);
}
```

Iteration **evaluates and copies the subject once at loop entry**. Updating the original array inside the loop does not change the elements being visited. To include an index, use `for (index: i64, value: infer in values)`.

`array_len` returns the **outermost length** of a nested array. For UTF-8 string byte lengths, use `byte_len` instead.

## Limitations and memory budgets

- Growing or appending to a dynamic array, borrowed slices, and dynamic arrays inside `const` are not implemented.
- Dynamic array element storage has a default budget of 64 MiB, configurable with `--array-heap-limit <bytes>`. This is not a process-wide physical memory cap.
- Copying may require both the original and new allocations at the same time.
- LLVM, QBE, and some other output paths require explicit targets or external tools. See the primary documentation for backend-specific constraints.

## Examples and primary sources

Runnable examples are maintained in the core Cerune repository:

- [array_iteration.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/array_iteration.ceru) — Fixed-array iteration and copies
- [array_length.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/array_length.ceru) — Lengths and nested arrays
- [constant_array_lengths.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/constant_array_lengths.ceru) — Array lengths from constants
- [dynamic_arrays/copy.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/dynamic_arrays/copy.ceru) — Dynamic array copying, updates, and ranges
- [dynamic_arrays/repeat.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/dynamic_arrays/repeat.ceru) — Constructing arrays with a specified count
- [Dynamic array examples](https://github.com/Cerune-Lang/Cerune/blob/master/examples/dynamic_arrays/README.en.md)

This page is a summary. Consult the [language reference](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md) and [dynamic array design](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/owned-arrays.en.md) for precise evaluation order, ownership, bounds checks, and runtime failure conditions.
