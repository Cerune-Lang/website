---
title: Language Reference
description: Overview of Cerune types, syntax, and supported language features.
---

This page summarizes the main language features. For precise type semantics, evaluation order, and runtime failure conditions, consult the [language reference (primary source)](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md).

## Types

The [Types](/en/reference/types/) page summarizes integer and floating-point types, booleans, strings, arrays, user-defined types, and their basic rules.

## Bindings and reassignment

The [Variables and Bindings](/en/reference/variables/) page covers declarations, reassignment with `mut`, type inference with `infer`, and block scope.

## Functions

The [Functions](/en/reference/functions/) page covers definitions, parameters, return values, generics, and program entrypoints.

## Arrays

The [Arrays](/en/reference/arrays/) page covers fixed-length and dynamic arrays, copying, updates, iteration, and limitations.

## Control Flow

See [Control Flow](/en/reference/control-flow/) for conditional statements, loops, `break` and `continue`, and branching on `enum` variants.

## Modules

See [Modules](/en/reference/modules/) for file imports, `pub` visibility, namespaces, and dependency rules.

## Syntax and behavior
- Explicit numeric conversions; no implicit numeric conversions.
- Integer overflow and out-of-bounds array access cause runtime failures.

## Current limitations

Recursion, string indexing, dynamic array growth, generic `Option`/`Result`, and file/network I/O are not implemented. Refer to the primary sources for the exact support boundaries and planned work.

## Primary sources

- [Language reference](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md)
- [CLI reference](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/cli.en.md)
- [Feature status and roadmap](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/language-roadmap.en.md)
