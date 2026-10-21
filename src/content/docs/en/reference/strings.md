---
title: Strings
description: Cerune UTF-8 strings, immutability, concatenation, byte lengths, escapes, and equality.
---

Cerune's `string` is an **immutable UTF-8 value**. String literals use double quotes; empty strings and Japanese text are supported.

## Immutability and reassignment

```cerune
mut greeting: string = "こんにちは";
saved: string = greeting;
greeting = "こんばんは";

print(saved);    // こんにちは
print(greeting); // こんばんは
```

`mut` lets you **reassign a binding to a different string**; it does not modify the original string's contents. A previously saved value stays unchanged.

Strings can be function arguments and results, named-type fields, array elements, and `const` values. A `mut` array element can be replaced with a new string, but part of a string cannot be updated in place.

## Concatenation (concat)

`concat(left, right)` evaluates both strings **once each, from left to right**, and returns the concatenated immutable value.

```cerune
fn greet(name: string) -> string {
    return concat("Hello, ", name);
}

mut message: string = greet("Cerune");
previous: string = message;
message = concat(message, "!");

print(previous); // Hello, Cerune
print(message);  // Hello, Cerune!
```

Reassignment can use the old value on its right-hand side. Concatenation preserves line breaks and NUL. An empty result uses static empty-string storage; a nonempty result uses a new allocation.

## UTF-8 byte length (byte_len)

`byte_len(value)` returns an `i64` counting **UTF-8 bytes, not characters**.

```cerune
print(byte_len(""));          // 0
print(byte_len("日本語"));    // 9
print(byte_len("😀"));        // 4
print(byte_len("\u{e9}"));    // 2
print(byte_len("e\u{301}"));  // 3
```

"日本語" has three characters but takes nine bytes. Two spellings that may both look like "é" also have different lengths: `"\u{e9}"` is two bytes, while `"e\u{301}"` is three. Unicode is not normalized.

The argument expression is evaluated once. The operation works with literals, function results, array elements, and concatenated strings.

## Escape sequences

| Syntax | Meaning |
| --- | --- |
| `\"` | Double quote |
| `\\` | Backslash |
| `\n` / `\r` / `\t` | LF / CR / tab |
| `\0` | NUL byte |
| `\u{...}` | Unicode scalar value in 1–6 hexadecimal digits |

The `\u{...}` value ranges from `0` through `10FFFF`, excluding surrogates `D800`–`DFFF`. Invalid escapes and unclosed quotes are compilation errors. Use `\n` instead of placing a physical line break inside a string literal.

**NUL does not terminate a string.** `byte_len("A\0B")` returns 3.

## Equality and output

`==` and `!=` compare entire string contents. Comparison is **case-sensitive and does not normalize Unicode**.

```cerune
composed: string = "\u{e9}";
decomposed: string = "e\u{301}";

print(composed == decomposed); // false
print("Hello" == "hello");     // false
print("A\0B" == "A");          // false
```

`print(value);` writes the string contents unchanged and appends one LF. Existing line breaks and NUL bytes are preserved. By contrast, observation text for IR and bytecode escapes control characters.

## Memory budgets and limitations

Dynamic strings created with `concat` have a default **64 MiB** live-data budget, configurable with `--string-heap-limit <bytes>`. Compile-time `const` evaluation uses a separate budget.

**Not implemented:** String indexing, character counts, ordering comparisons, numeric conversions, and in-place substring updates. Strings do not implicitly convert to other types.

Strings are supported across generation routes, but LLVM and QBE emission require `--target` when strings are used. See the [CLI guide](/en/cli/overview/).

## Examples and primary sources

- [string_values.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/string_values.ceru) — Reassignment and equality
- [string_concat.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/string_concat.ceru) — Concatenation, copies, line breaks, and NUL
- [string_byte_length.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/string_byte_length.ceru) — UTF-8 byte length and evaluation order
- [string_lookup.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/string_lookup.ceru) — String-based lookup
- [Language reference (primary source)](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md#strings)
- [String design](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/strings.en.md)

This page summarizes implemented behavior. See the primary sources for exact evaluation order, memory management, and runtime failure conditions.
