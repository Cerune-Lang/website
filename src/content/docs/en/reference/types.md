---
title: Types
description: Cerune primitive types, arrays, user-defined types, and typing rules.
---

Cerune is a statically typed language. Types are resolved during source validation, and numeric types are not converted implicitly.

## Primitive types

| Category | Types | Operations and rules |
| --- | --- | --- |
| Signed integers | `i8`, `i16`, `i32`, `i64` | Arithmetic, comparison, and bitwise operations. Out-of-range arithmetic stops execution |
| Unsigned integers | `u8`, `u16`, `u32`, `u64` | Nonnegative integers. Out-of-range arithmetic stops execution |
| Floating point | `f32`, `f64` | Floating-point arithmetic rounded to the type's precision |
| Boolean | `bool` | `true`, `false`, logical operations, and comparisons |
| Strings | `string` | Immutable UTF-8 strings. Output, equality comparison, and concatenation |

Use `concat` to concatenate strings and `byte_len` to get the number of **UTF-8 bytes**. Counting characters and string indexing are not implemented.

:::note
A type's numeric range is not the same as its storage width. In the current implementation, smaller integer types also occupy 64-bit storage regions in generated code; changing `i64` to `i8` does not necessarily reduce memory usage.
:::

## Arrays and user-defined types

| Category | Syntax | Operations and rules |
| --- | --- | --- |
| Fixed-length arrays | `[T; N]` | Length is part of the type. Element access, iteration, and value copying |
| Dynamic arrays | `[T]` | Runtime-determined length. Explicit copying, range copying, and iteration |
| Named product types | `type` | Named fields, defaults, and whole-value updates |
| Sum types | `enum` | Variants with optional payloads and `match` branching |

`array_len` returns the outer array length as `i64` for both array kinds. Changes to a copied array do not modify the original array.

**Current limitations:** Appending or growing a dynamic array and borrowing slices are not implemented. Named product-type fields cannot be assigned directly; construct a new value and reassign the whole binding. Generic `Option`/`Result` types are also not implemented.

See [Arrays](/en/reference/arrays/) for operations on fixed-length and dynamic arrays.

## Type annotations and numeric conversion

Use `count: i64 = 40;` to declare a typed binding. `count: infer = 40;` requests type inference for the declaration; `infer` is not a runtime-dynamic type.

Numeric types are not converted implicitly. `T(value)` and `convert<T>(value)` support **value-preserving conversions**; conversions that cannot preserve the value exactly stop execution. Separate explicit operations provide rounding or saturation.

Integer overflow does not wrap implicitly. Out-of-range arithmetic and integer division by zero stop execution. Floating-point calculations use different precision for `f32` and `f64`.

Use `void` for a function that does not return a value.

## Examples

These executable programs are maintained in the core Cerune repository:

- [hello.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/hello.ceru) — Integer bindings and addition
- [floating_point.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/floating_point.ceru) — `f32` and `f64`
- [string_byte_length.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/string_byte_length.ceru) — UTF-8 byte lengths
- [array_iteration.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/array_iteration.ceru) — Fixed-length array iteration
- [product-point.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/product-point.ceru) — Named product types
- [sum_lookup.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/sum_lookup.ceru) — `enum` and `match`

## Primary sources

This page summarizes the specification; it is not normative. Consult these sources for precise ranges, conversion rules, evaluation order, and runtime failure conditions:

- [Language reference](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md)
- [Feature status](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/language-roadmap.en.md)
