---
title: Functions
description: Cerune function definitions, arguments, return values, generics, and entrypoints.
---

Use `fn` to define a function in Cerune. **Parameter and return types are explicit**, and functions are called by name.

## Definitions and calls

```cerune
fn add(left: i64, right: i64) -> i64 {
    return left + right;
}

result: i64 = add(20, 22);
print(result); // 42
```

| Syntax | Meaning |
| --- | --- |
| `fn name(parameters) -> T { ... }` | Define a function returning type `T` |
| `name(arguments)` | Call a function |
| `return value;` | Return a value and exit the function |
| `-> void` | Specify a function without a return value |
| `return;` | Exit a `void` function early |

A value-returning function must return a value along every execution path. **A trailing expression is not an implicit return value**.

## Functions without return values

```cerune
fn show(value: i64) -> void {
    print(value);
}

show(42);
```

A `void` function may reach the end of its body or exit using `return;`. Call `void` functions as statements and value-returning functions as expressions.

## Arguments and value semantics

Argument expressions are evaluated **once each, from left to right**. Cerune does not implicitly convert arguments between numeric types.

Arrays and named product types are passed as values. Modifying a received value does not change the caller's value. Cerune sets no fixed language-level limit on the number of parameters.

Parameters and local bindings are only visible inside their function. Functions cannot directly read top-level runtime bindings.

## Program entrypoints

A Cerune program may use top-level executable statements or explicitly define `fn main() -> void`.

```cerune
fn main() -> void {
    print(42);
}
```

**An explicit `main` cannot coexist with top-level executable statements.** `main` takes no parameters.

## Functions with type and array-length parameters

You can declare type parameters such as `T` and fixed-array length parameters such as `const N: i64`.

```cerune
fn first<T, const N: i64>(values: [T; N]) -> T {
    return values[0];
}

print(first::<string, 2>(["first", "second"]));
```

Specify type and length arguments **explicitly, in declaration order**, with `::<...>`. A length argument may be a positive integer literal, an integer constant name, or an enclosing length parameter.

**Current limitations:** Type-argument inference, traits, generic type definitions, and recursion are not supported. Generic function bodies are checked for concrete types when those instantiations are used; unused instantiations are not necessarily checked.

## Modules and visibility

Use `pub fn` to export a function for another module, then call it through the imported namespace. See the [language reference](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md) for module syntax.

## Examples and primary sources

These examples are maintained in the core Cerune repository:

- [functions.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/functions.ceru) — Arguments, return values, and `void`
- [function_arguments.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/function_arguments.ceru) — Evaluation order and value passing
- [function_values.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/function_values.ceru) — Arrays and product types as arguments and results
- [generic_functions.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/generic_functions.ceru) — Type and length parameters
- [ir_execution.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_execution.ceru) — Explicit `main`

This page is a summary. For precise evaluation order, type checking, and call semantics, consult the [language reference (primary source)](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md) and [function design](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/functions.en.md).
