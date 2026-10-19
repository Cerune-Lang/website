---
title: Variables and Bindings
description: Cerune bindings, mut, infer, reassignment, and scopes.
---

Cerune **binds a name to a value**. Each binding has a type determined when it is declared. Reassignment is not allowed by default. Add `mut` to allow reassignment with another value of the same type.

## Declarations and reassignment

This example starts with five items in stock, removes two, and prints the remaining three.

```cerune
initial_stock: i64 = 5;
mut remaining: i64 = initial_stock;
remaining = remaining - 2;
print(remaining); // 3
```

| Syntax | Meaning |
| --- | --- |
| `name: T = value;` | Declare a binding of type `T` that cannot be reassigned |
| `mut name: T = value;` | Declare a binding of type `T` that permits reassignment |
| `name = value;` | Reassign an existing `mut` binding |

Do not repeat the type annotation when assigning to an existing binding. Assigning to a binding without `mut` is a type-checking error.

## Type inference (infer)

`infer` determines the type from the declaration's initializer. It does not make a binding dynamically typed.

```cerune
mut value: infer = 1; // i64
value = 2;            // OK
// value = 0.5;       // type error: cannot assign f64
```

An integer literal with no contextual type defaults to `i64`, while a floating-point literal defaults to `f64`. Explicit type annotations or surrounding expressions can determine a literal's type instead.

Cerune does not perform implicit numeric conversions. See [Types](/en/reference/types/) and the [primary source's numeric literal rules](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md#numeric-literals).

## Updating arrays and strings

A `mut` array binding permits element updates. Arrays have value-copy semantics, so an element update to one copy does not affect another.

The contents of a `string` value are immutable. A `mut` string binding can be reassigned to a different string but cannot be used to change part of the string in place.

## Block scope

Braced blocks, including the bodies of `if` statements and loops, create new scopes.

- A binding declared in a block is not available outside it.
- Inner blocks can read outer bindings and reassign them if declared with `mut`.
- Inner blocks may declare a distinct binding with the same name as an outer binding (shadowing).
- Bindings declared by a `for` initializer are available in its condition, update, and body, but not after the loop.

## Examples and primary sources

- [conditional.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/conditional.ceru) — Reassignment of outer bindings and bindings inside branches
- [loop_control.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/loop_control.ceru) — `mut` bindings updated in loops
- [owned_arguments.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/owned_arguments.ceru) — Value copies and array updates
- [Language reference (primary source)](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md) — “Mutable bindings and reassignment” and “Conditionals, loops, and block scope”

This page is a summary. Consult the primary specification for exact evaluation-order, assignment, and scoping rules.
