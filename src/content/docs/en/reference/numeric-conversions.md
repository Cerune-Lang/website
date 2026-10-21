---
title: Numeric Conversions
description: Exact numeric conversions, truncation, rounding, saturation, type requirements, and failures in Cerune.
---

Cerune does **not implicitly convert numeric types**. A conversion must explicitly choose whether to **preserve the exact value**, **round a floating-point value to an integer**, or **saturate results to the destination type's range**.

## Choose a conversion

| Purpose | Syntax | When the value cannot be represented |
| --- | --- | --- |
| Preserve the original value exactly | `T(value)` / `convert<T>(value)` | Stop execution |
| Round floating-point to integer | `trunc<T>`, `floor<T>`, `ceil<T>`, `round<T>`, `round_ties_even<T>` | Stop for nonfinite or out-of-range results |
| Round and clamp to destination range | The five `saturating_` variants | Clamp to limits; NaN becomes zero |

Exact conversions support **all pairs of the eight integer types and `f32`/`f64`**. Rounding and saturation accept only **`f32` or `f64` inputs and integer destinations**. They do not convert `bool`, strings, arrays, or named types.

## Exact conversion: T(value) and convert<T>

These two forms have the same semantics. For example, widen a quantity from `i32` to `i64` and then convert it back.

```cerune
items: i32 = 17;
wide: i64 = i64(items);
restored: i32 = convert<i32>(wide);

print(restored); // 17
```

A conversion succeeds **only if the destination represents the same value without loss**.

- Every `i32` value fits in `i64`.
- `u32` to `i32` can fail even though both types are 32 bits.
- Integer-to-float conversion requires exact representation of the integer.
- Float-to-integer conversion requires a finite, integral, in-range value that is **not negative zero**.
- `f32` to `f64` succeeds except for NaN; `f64` to `f32` must preserve the value exactly and rejects NaN.
- Same-type conversion preserves the original value, including NaN payloads and the sign of zero.

```cerune
print(i32(3.0));          // 3
// print(i32(3.7));       // fails: fractional part would be lost
// print(i32(-0.0));      // fails: sign of zero would be lost
// print(f32(16777217));  // fails: integer not exactly representable
```

An integer literal outside its declared type's range causes a **compile-time** error. A correctly typed input that cannot fit in the requested destination fails **at runtime**.

### Evaluate the input first

```cerune
print(f64(1 / 2));       // 0 — integer division first
print(f64(1) / f64(2));  // 0.5 — floating-point division
```

The destination does not retroactively change how the argument expression or its literals are typed. Evaluate the argument **once**, then convert its result.

## Choose a rounding direction

The five operations, including `trunc<T>`, evaluate the floating-point input once and **round before checking** the integer range.

| Operation | Rounding rule | `2.5` | `-2.5` |
| --- | --- | ---: | ---: |
| `trunc<T>(x)` | Toward zero | 2 | -2 |
| `floor<T>(x)` | Toward negative infinity | 2 | -3 |
| `ceil<T>(x)` | Toward positive infinity | 3 | -2 |
| `round<T>(x)` | Nearest; ties away from zero | 3 | -3 |
| `round_ties_even<T>(x)` | Nearest; ties to even | 2 | -2 |

For **17 items packed six per box**, rounding up produces three boxes. For positions in cells of width ten, negative coordinates can be assigned using floor.

```cerune
print("Boxes required");
print(ceil<i64>(17.0 / 6.0)); // 3

print("Cell for a negative coordinate");
print(floor<i32>(-0.1 / 10.0)); // -1
```

`trunc<u8>(255.9)` succeeds with 255, whereas `trunc<u8>(256.0)` fails. A negative fraction can still round to zero for an unsigned destination: `ceil<u8>(-0.9)` gives zero.

Ordinary rounding operations stop with `conversion-not-finite` for **NaN or either infinity**, and `conversion-out-of-range` when the rounded finite result is outside the destination range.

## Saturation: clamp into the type's range

Prefix any of the five rounding operations with `saturating_` to return the **minimum or maximum** of the destination type when the rounded result does not fit.

```cerune
print("8-bit pixel values");
print(saturating_round<u8>(300.5)); // 255
print(saturating_floor<u8>(-0.1));  // 0
print(saturating_round<u8>(127.5)); // 128
```

This is useful for pixel channels constrained to `u8` values from 0 through 255.

| Input | Checked rounding | `saturating_` variant |
| --- | --- | --- |
| Rounded result in range | The integer | The integer |
| Rounded result outside range | Stop execution | Minimum or maximum |
| NaN | Stop execution | 0 |
| Positive/negative infinity | Stop execution | Maximum/minimum |
| Positive/negative zero | 0 | 0 |

Saturation **does not catch failures in the argument expression**. If the calculation supplying a value fails, for example through integer division by zero, execution stops at that operation.

## Evaluation order, constants, and type parameters

Every conversion evaluates its input expression **exactly once**. Failure locations refer to the originating expression. All these operations also work in `const` evaluation and functions with explicit type arguments.

```cerune
const BOX_COUNT: i64 = ceil<i64>(17.0 / 6.0);
boxes: [i64; BOX_COUNT] = [10, 20, 30];
print(array_len(boxes)); // 3
```

Names like `trunc` and `floor` are not reserved keywords. Built-in `floor<i64>(x)` and a user-defined generic call `floor::<i64>(x)` are distinguished by their syntax.

## Inspect the conversion

```sh
cerune run examples/rounding_quantities.ceru
cerune emit-ir examples/rounding_quantities.ceru
cerune emit-bytecode examples/rounding_conversions.ceru
```

Cerune IR and bytecode retain the **input/destination types, exact or rounding/saturation mode, NodeIds, and source origins**. Observation text distinguishes operations such as `convert.exact`, `convert.floor`, and `convert.saturating_floor`. `emit-ir` prints an IR representation, not an execution trace.

## Limitations and primary sources

Implicit numeric conversion, truncating integer bit patterns, and implicit integer wraparound are not supported. Conversions also cannot undo rounding that already occurred in normal `f32` or `f64` arithmetic.

- [integer_conversions.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/integer_conversions.ceru) — Value-preserving conversions
- [rounding_quantities.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/rounding_quantities.ceru) — Cells and required boxes
- [rounding_conversions.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/rounding_conversions.ceru) — Five rounding rules
- [saturating_conversions.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/saturating_conversions.ceru) — Saturating pixel values
- [rounding_evaluation_order.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/rounding_evaluation_order.ceru) — Evaluation order and short-circuiting
- [Language reference (primary source)](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md)
- [Rounding and saturation design](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/rounding-conversions.en.md)
- [Truncating conversion design](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/truncating-conversions.en.md)

This page summarizes implemented behavior. See the primary sources for the exact conversion rules, special values, failure diagnoses, and generated-code behavior.
