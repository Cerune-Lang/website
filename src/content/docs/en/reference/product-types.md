---
title: Product Types
description: Cerune named product types, fields, defaults, construction, update expressions, and value copies.
---

A **named product type** in Cerune groups several values into named fields. Declare it with `type` and construct values using the type name.

## Definitions and construction

```cerune
type Task {
    title: string,
    done: bool = false,
    priority: i64 = 1,
}

task: Task = Task {
    title: "Review translations",
};

print(task.title);    // Review translations
print(task.done);     // false
print(task.priority); // 1
```

Every field must have an explicit type; `infer` is not allowed in a field definition.

- A field such as `title` without a default must be specified when constructing a value.
- Fields such as `done` and `priority` can be omitted because they have defaults.
- Construction uses named `field: expression` entries, which need not follow definition order.
- Entries are separated by commas, and trailing commas are accepted.
- Fields may contain primitives, strings, arrays, or other named product types.

## Field access and nominal types

Access fields using `.`. Nested fields can be read using expressions such as `group.task.title`.

**Types with different names are different types even if they contain identical fields.** For example, `Task` and `ArchivedTask` are not implicitly interchangeable.

Type declarations appear at the top level. Within a file, type names can be referenced regardless of declaration order. Product types may appear as function parameters and results, or as array element types.

## Update expressions (..base)

An update expression **creates a new value with selected fields replaced**, leaving the original unchanged.

```cerune
initial: Task = Task {
    title: "Review translations",
};

completed: Task = Task {
    ..initial,
    done: true,
};

print(initial.done);    // false
print(completed.done);  // true
print(completed.title); // Review translations
```

`Task { ..initial, done: true }` first evaluates and copies `initial` once, then replaces `done`. Other fields retain their copied values; field defaults are not evaluated again.

`Task { ..initial }` is also valid and makes a copy without replacing any fields. **Exactly one base may appear, and it must come first.** Using a base of a different named type or placing it after other fields is an error.

## Fields cannot be assigned directly

`task.done = true;` is not allowed after construction. Instead, reassign the **entire value** through a `mut` binding:

```cerune
mut current: Task = Task { title: "Review translations" };
before: Task = current;

current = Task { ..current, done: true };

print(before.done);  // false
print(current.done); // true
```

Product types have **value semantics**. Reassigning the original binding does not affect another binding holding an earlier value. Copied nested arrays remain independent, while string contents are immutable.

Whole-product `==`, `!=`, and `print` are supported. See [aggregate value rules](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/aggregate-values.en.md) for exact comparison and display behavior.

## Expression evaluation order

**Ordinary construction** and **updates from an existing value** evaluate expressions differently.

| Syntax | Evaluation order |
| --- | --- |
| `Task { title: expr, ... }` | Evaluate explicit fields in source order, then omitted defaults in definition order |
| `Task { ..base, done: expr }` | Evaluate and copy `base` once, then evaluate replacement expressions in source order |

An update never re-evaluates inherited defaults. The base is still evaluated even when every field is replaced. If evaluation fails, later expressions and the final assignment do not run.

The core [product_update_order.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/product_update_order.ceru) program demonstrates this order using visible output.

## Current limitations

- Product types with no fields (`type Empty {}`) and empty constructions (`Type {}`) are not supported.
- Types that would require an infinitely sized value through recursive nesting fail type checking.
- Unknown or duplicate fields, missing required fields, and incompatible field types are compilation errors.
- Direct field assignment and per-field visibility modifiers are not supported.

To expose a type from another file, declare it with `pub type`. Currently, all fields of a public product type are accessible. See [Modules](/en/reference/modules/).

## Examples and primary sources

- [product-point.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/product-point.ceru) — Definitions, defaults, and field access
- [product_update.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/product_update.ceru) — Copies, nested values, and arrays
- [product_update_order.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/product_update_order.ceru) — Evaluation order of updates and defaults
- [product_arrays.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/product_arrays.ceru) — Arrays of named types
- [Language reference (primary source)](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md)
- [Named product type design](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/product-types.en.md)
- [Product update design](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/product-updates.en.md)

This page summarizes implemented features. For exact type-checking, evaluation order, and runtime failure behavior, consult the primary sources.
