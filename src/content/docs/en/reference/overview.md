---
title: Language Reference
description: Overview of Cerune types, syntax, and supported language features.
---

This page summarizes the main language features. For precise type semantics, evaluation order, and runtime failure conditions, consult the [language reference (primary source)](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md).

## Types

| Category | Supported types |
| --- | --- |
| Signed integers | `i8`, `i16`, `i32`, `i64` |
| Unsigned integers | `u8`, `u16`, `u32`, `u64` |
| Floating point | `f32`, `f64` |
| Boolean | `bool` |
| Strings | `string` (UTF-8) |
| Arrays | Fixed-length `[T; N]`, dynamic `[T]` |
| User-defined types | Named product types and `enum` |

## Syntax and behavior

- Typed variable declarations. Bindings are immutable by default; use `mut` to allow reassignment.
- Functions, `if`, `while`, `for`, and `match`.
- Explicit numeric conversions; no implicit numeric conversions.
- Integer overflow and out-of-bounds array access cause runtime failures.

## Current limitations

Recursion, string indexing, dynamic array growth, generic `Option`/`Result`, and file/network I/O are not implemented. Refer to the primary sources for the exact support boundaries and planned work.

## Primary sources

- [Language reference](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md)
- [CLI reference](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/cli.en.md)
- [Feature status and roadmap](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/language-roadmap.en.md)
