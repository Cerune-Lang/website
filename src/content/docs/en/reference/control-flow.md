---
title: Control Flow
description: Cerune if, while, for, break, continue, match, and evaluation rules.
---

Cerune uses `if` for conditional execution, `while` and `for` for loops, and `match` to branch on sum types (`enum`).

## Conditional statements (if / else)

An `if` condition must have type `bool`. The `else` branch is optional.

```cerune
value: i64 = 7;
if value < 10 {
    print(value);
} else {
    print(10);
}
```

**`if` is a statement**, not a value-producing expression. Numeric conditions are not implicitly converted to `bool`.

## While loops

`while` evaluates its `bool` condition before every iteration. If the initial condition is `false`, the loop body does not execute.

```cerune
mut count: i64 = 0;
while count < 3 {
    print(count);
    count = count + 1;
}
```

## For loops

The standard `for` syntax requires an initializer, a continuation condition, and an update statement.

```cerune
mut total: i64 = 0;
for (mut i: i64 = 0; i < 3; i = i + 1) {
    total = total + i;
}
print(total); // 3
```

The initializer executes once, the continuation condition before each iteration, and the update after the body completes. Bindings declared by the initializer are scoped to the loop. The initializer can also reassign an existing `mut` binding.

## Array iteration (for … in)

Both fixed-length and dynamic arrays can be iterated in element order.

```cerune
values: [i64; 3] = [4, 7, 9];
for (index: i64, value: infer in values) {
    print(index);
    print(value);
}
```

Omit the index with `for (value: infer in values)`. The subject is evaluated once and **copied at loop entry**. Changes to the original array do not affect the elements visited in that loop. Each element is copied into its iteration binding.

See [Arrays](/en/reference/arrays/) for array types and copy semantics.

## break and continue

- `break;` exits the innermost loop.
- `continue;` skips the remaining body of the current iteration.
- In `while`, `continue` proceeds to condition evaluation.
- In standard `for`, `continue` **runs the update statement before** checking the condition.
- In `for … in`, `continue` advances to the next element.

Neither statement can be used outside a loop. Labeled forms targeting an outer loop are not implemented.

## Branching on sum types (match)

`match` selects behavior for an `enum` variant. Its subject is evaluated and copied once, and arms are considered in source order.

```cerune
enum Lookup { Found { text: string }, Missing }
value: Lookup = Lookup::Found { text: "result" };

match value {
    Lookup::Found { text: text } => { print(text); },
    Lookup::Missing {} => { print("missing"); },
}
```

`match` can be used as **either a statement or an expression**. Statement arms have the form `=> { statements... }`; expression arms use `=> expression`. For an expression, every arm must produce a compatible result type.

```cerune
label: string = match value {
    Lookup::Found { text: text } => text,
    Lookup::Missing {} => "missing",
};
```

An arm may include a `bool` guard with `if condition` after its pattern. A guard runs only when the variant matches. **Every variant requires an unguarded arm**. Whole-value wildcard arms and nested patterns are not currently supported.

See [Enums and Match](/en/reference/enums-match/) for constructors, payload patterns, guards, exhaustiveness, and match expressions.

## Boolean conditions and scope

`&&` and `||` use short-circuit evaluation. When the left operand determines the result, the right operand is not evaluated.

```cerune
count: i64 = 0;
print(count != 0 && 12 / count > 2); // false
```

Each braced block creates a new scope. Bindings declared inside it are not visible outside it. See [Variables and Bindings](/en/reference/variables/) for details.

See [Operators](/en/reference/operators/) for short-circuit semantics and operator precedence.

## Examples and primary sources

- [conditional.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/conditional.ceru) — `if` / `else`
- [loop_control.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/loop_control.ceru) — `while`, `break`, and `continue`
- [array_iteration.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/array_iteration.ceru) — `for … in`
- [sum_lookup.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/sum_lookup.ceru) — `enum` and `match`
- [short_circuit.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/short_circuit.ceru) — `&&` and `||`

This page summarizes the specification. Consult the [language reference (primary source)](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md) for exact evaluation order, match exhaustiveness, and branch constraints.
