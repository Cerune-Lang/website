---
title: Operators
description: Cerune arithmetic, comparisons, logical and bitwise operations, evaluation order, precedence, and failures.
---

Cerune defines **operand types and evaluation order** for its operators. Numeric types are not implicitly converted, and integer overflow or invalid shifts are checked at runtime.

## Arithmetic

| Operators | Behavior | Operand types |
| --- | --- | --- |
| `+`, `-`, `*` | Addition, subtraction, multiplication | Integers, `f32`, `f64` |
| `/` | Division | Integers, `f32`, `f64` |
| `%` | Integer remainder | Integers only |
| Unary `-` | Negation | Signed integers and floating-point values |

Both operands of a binary arithmetic operation must have the **same numeric type**. An unsuffixed integer literal may take its type from context, but already typed values of different numeric types are not converted automatically.

Use remainder`%` to wrap a ring buffer's next write position back to the beginning:

```cerune
mut next: i64 = 3;
next = (next + 1) % 4;
print(next); // 0 — wrap to the first position
```

Integer division **truncates toward zero**. For example, `-7 / 3` is `-2`, and `-7 % 3` is `-1`. A nonzero remainder takes the sign of its left operand.

### Integer operations that stop execution

- An integer `+`, `-`, `*`, or signed unary `-` when the result does not fit the type.
- Integer `/` or `%` when the right operand is zero.
- The minimum signed integer value divided by `-1` (`/` fails, while `%` succeeds with result zero).

```cerune
amount: u8 = 250;
// print(amount + 10); // would exceed the u8 maximum of 255
```

**Integer arithmetic does not silently wrap.** Negating a signed integer's minimum value also fails because the result does not fit. Output produced before a runtime failure is preserved, and later expressions are not executed.

Floating-point operations use the precision of `f32` or `f64`, with **round-to-nearest, ties-to-even**. Multiplication and addition are not silently contracted into FMA when that changes the result. See the [floating-point rounding design](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/float-rounding.en.md).

## Comparisons

| Operators | Operand types | Result |
| --- | --- | --- |
| `==`, `!=` | Matching types: numbers, `bool`, strings, arrays, named products, and sums | `bool` |
| `<`, `<=`, `>`, `>=` | Matching numeric types | `bool` |

String and aggregate equality compares contents, elements, or fields in order. Sum types compare the selected variant and its active payload. Comparison stops on the first mismatch. Ordering comparisons on strings or booleans are not supported.

```cerune
expected: [i64; 3] = [4, 7, 9];
actual: [i64; 3] = [4, 7, 9];
print(actual == expected); // true
```

## Logical operators and short-circuiting

`!`, `&&`, and `||` require **`bool`**. Numeric zero and one are not substitutes for boolean values.

| Expression | Evaluate the right operand when |
| --- | --- |
| `left && right` | `left` is `true` |
| `left \|\| right` | `left` is `false` |
| `!value` | Unary negation of a boolean |

```cerune
values: [i64; 2] = [4, 9];
index: i64 = 2;
print(index == 2 || values[index] == 9); // true
```

The left side is already true, so the **invalid `values[2]` access is not evaluated**. A required right operand is evaluated once. Calls and checks in an omitted operand are not executed.

**Both operands are still type-checked and name-resolved.** `false && unknown_name` and `true || 1` are compilation errors even though their right sides would be skipped at runtime.

## Bit operations and shifts

Bit operations support the eight integer types (`i8` through `i64`, and `u8` through `u64`). They cannot be applied to **booleans or floating-point values**.

| Operator | Behavior |
| --- | --- |
| `&` | Keep bits set in both operands |
| `\|` | Set bits appearing in either operand |
| `^` | Set bits appearing in exactly one operand |
| `~` | Complement bits within the type's width |
| `<<`, `>>` | Shift left or right |

For example, permission flags can encode read and write access:

```cerune
read: u8 = 1;
write: u8 = 2;

mut permissions: u8 = read | write;
print((permissions & write) != 0); // true

permissions = permissions & ~write;
print((permissions & write) != 0); // false
```

Binary operands and shift counts must have the **same integer type**. A shift count must be nonnegative and smaller than the type's width. For `u8`, valid counts are 0–7.

- `0u8 << 8` fails because its shift count is invalid, even though the value is zero.
- `128u8 << 1` fails because the mathematical result does not fit `u8`.
- Signed right shifts preserve the sign: `-3i8 >> 1` produces `-2i8`.
- **`&` and `|` do not short-circuit**, unlike boolean `&&` and `||`.

## Evaluation order and precedence

Ordinary binary operations **evaluate the left operand once, then the right operand once**. If the left fails, the right is not evaluated. Boolean `&&` and `||` can skip the right operand when it is unnecessary.

Precedence, from **strongest to weakest**, is:

1. Unary `-`, `!`, `~`
2. `*`, `/`, `%`
3. `+`, `-`
4. `<<`, `>>`
5. `<`, `<=`, `>`, `>=`
6. `==`, `!=`
7. `&`, then `^`, then `|`
8. `&&`, then `||`

Binary operators at the same precedence level associate to the left. **Comparisons bind more tightly than bit operators**, so write `(flags & mask) != 0` to test bits explicitly.

## Limitations and primary sources

Implicit numeric conversions, wrapping integer arithmetic, left shifts that silently discard bits, and string ordering are not implemented. Numeric conversions, rounding, and saturation use **separate explicit operations** (see [Types](/en/reference/types/)).

Official examples show these operators in practical use:

- [bit_flags.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/bit_flags.ceru) — Add, test, and clear permission flags
- [ring_buffer.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ring_buffer.ceru) — Use remainder to cycle through array positions
- [short_circuit.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/short_circuit.ceru) — Protect array access through short-circuit evaluation
- [aggregate_comparison.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/aggregate_comparison.ceru) — Compare aggregate values
- [integer_limits.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/integer_limits.ceru) — Integer ranges and overflow
- [Language reference (primary source)](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md)

This page summarizes supported language behavior. See the primary specification for exact integer ranges, type checks, evaluation order, and runtime failure conditions.
