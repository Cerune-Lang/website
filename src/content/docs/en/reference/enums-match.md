---
title: Enums and Match
description: Cerune sum types, variants, payload bindings, match statements and expressions, guards, and exhaustiveness.
---

Cerune's **sum types (`enum`)** represent **one of several alternatives**. A lookup result, for example, can be either`Found` containing a title or`Missing` with no payload.

## Declaring and constructing variants

```cerune
enum Lookup {
    Found { title: string },
    Missing,
}

found: Lookup = Lookup::Found { title: "Getting Started" };
missing: Lookup = Lookup::Missing {};
```

Use `Enum::Variant { field: value }` to create a variant. **The braces `{}` are required even for a variant without fields.**

- An `enum` must declare at least one variant.
- Payload fields have explicit names and types; field defaults are not supported.
- Fields may hold numbers, strings, arrays, named product types, and other sum types.
- Types have nominal identity; two differently named sum types are not implicitly interchangeable.
- Sum types can appear in bindings, function parameters and results, arrays, named products, and `const`.

## Match expressions: describe a lookup result

`match` can be an **expression that produces a value**. This example looks up a documentation page and produces a title or an explanation when the entry is missing.

```cerune
enum Lookup {
    Found { title: string },
    Missing,
}

fn lookup(key: string) -> Lookup {
    if key == "intro" {
        return Lookup::Found { title: "Getting Started" };
    }
    return Lookup::Missing {};
}

fn describe(result: Lookup) -> string {
    return match result {
        Lookup::Found { title: title } if byte_len(title) > 0 => concat("Found: ", title),
        Lookup::Found { title: _ } => "Untitled",
        Lookup::Missing {} => "Not found",
    };
}

print(describe(lookup("intro")));
print(describe(lookup("other")));
```

Output:

```text
Found: Getting Started
Not found
```

Each `=> expression` arm must produce a **compatible result type**. A contextual expected type applies to all arms; without one, the first result establishes the type. Numeric values are not implicitly converted. Expression arms cannot contain statement blocks in place of expressions.

## Match statements: perform an action

Use `=> { statements... }` to **execute statements** instead of producing a match result.

```cerune
match lookup("intro") {
    Lookup::Found { title: title } => { print(title); },
    Lookup::Missing {} => { print("Not found"); },
}
```

This prints `Getting Started`. Only the selected arm executes.

A pattern such as `title: title` binds the payload field to a new immutable local. Use `title: _` to discard an unused field. **Every payload field must be bound or discarded.** Extracted values are copies, not references into the subject. Bindings are in scope only for the guard and corresponding arm.

## Guards and exhaustive matching

An `if condition` following a pattern is evaluated **only when its variant matches**. The guard must have type `bool`; a false guard moves to the next arm.

In the `describe` example, the first arm handles `Found` with a nonempty title. A later unguarded arm handles other `Found` values.

**Every variant requires an unguarded arm.** Guarded arms alone are not exhaustive. Placing another arm for a variant after its unguarded arm is diagnosed as unreachable.

A `match` evaluates and **copies its subject once**, then checks arms in source order. Only the selected body or result is evaluated. Reassigning the original `mut` binding inside an arm does not change the extracted values.

## Functions and loops

A `return` inside a match arm returns from the function. `break` and `continue` target the **enclosing loop**, not the `match` itself. Return-path analysis accepts a match statement whose every arm guarantees a return.

When matching a constructor directly, parenthesize it to distinguish its `{` from the beginning of the match body: `match (Lookup::Missing {}) { ... }`.

Use `pub enum` to export a sum type from a module and `alias::Enum::Variant` to access its variants through an import. See [Modules](/en/reference/modules/).

## Recoverable outcomes versus runtime failures

Variants such as `Found`/`Missing` or `Success`/`Error` can represent **recoverable outcomes as values**. However, `match` does **not catch runtime stops** such as division by zero or integer overflow. Return an appropriate variant before performing an invalid operation.

See the official [sum_divide.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/sum_divide.ceru) example.

## Current limitations

- Direct field access or assignment on an enum value, and `..base` product updates for enums, are not supported.
- Whole-arm wildcards and nested patterns are not supported (discarding one field with `field: _` **is** supported).
- Payload defaults, generic enum declarations, built-in generic `Option`/`Result`, and implicit error propagation are not implemented.
- Recursive value types requiring infinite storage are rejected.

Whole-enum `==`, `!=`, and `print` are supported. See [aggregate value rules](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/aggregate-values.en.md) for the exact comparison and display behavior.

## Examples and primary sources

- [sum_lookup.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/sum_lookup.ceru) — Present/missing lookup results
- [match_values.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/match_values.ceru) — Match expressions, guards, return values, and `const`
- [match_guards.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/match_guards.ceru) — Guard order, copies, and loop control
- [sum_values.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/sum_values.ceru) — Value copies across arrays, products, and sums
- [Language reference (primary source)](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md)
- [Sum type design](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/sum-types.en.md)

This page summarizes implemented features. Consult the primary sources for precise evaluation order, type checking, and runtime failure behavior.
