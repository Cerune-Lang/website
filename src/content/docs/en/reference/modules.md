---
title: Modules
description: Cerune imports, visibility, namespaces, file resolution, and limitations.
---

Cerune uses `import` to access types, functions, and constants defined in other `.ceru` files. Every import declares an **alias** used to qualify external names.

## Imports and namespaces

Write `import "relative/path.ceru" as alias;` before definitions and executable statements.

```cerune
// main.ceru
import "values.ceru" as values;

item: values::Reading = values::reading(7);
print(item.amount);
```

Mark definitions that other files can use with `pub`:

```cerune
// values.ceru
pub type Reading { amount: u64, }

pub fn reading(amount: u64) -> Reading {
    return Reading { amount: amount };
}
```

`values::Reading` refers to an imported type; `values::reading` refers to an imported function. **An import alias is local to the file declaring it.** Every file that uses a dependency must declare its own import.

## Visibility (pub)

Definitions are private to their file by default.

| Syntax | Public definition |
| --- | --- |
| `pub fn` | Function |
| `pub type` | Named product type and all its fields |
| `pub enum` | Sum type with all its variants and fields |
| `pub const` | Compile-time constant |

A public function can call private helpers in the same file. Importers cannot call those helpers directly.

Public function parameters and return types, and public type fields, cannot expose a private type. Per-field visibility is not supported.

Use `alias::Enum::Variant` for imported enum variants and `alias::COUNT` for exported array-length constants.

## Paths and loading rules

- A relative import resolves against the **directory containing the importing file**.
- Use forward slashes (`/`) and a `.ceru` extension. Parent-directory references using `..` are supported.
- Absolute paths, drive prefixes, and backslashes are rejected.
- Cyclic imports, duplicate aliases, and alias/name collisions produce compilation errors.

Cerune does not search the process working directory or environment paths to resolve missing imports.

## Imported files do not execute initialization

**Importing a file does not run initialization code.** Imported files may contain imports and type, function, and constant definitions at the top level.

Top-level variable bindings and executable statements such as `print` are not allowed in dependencies. Put initialization inside a function and call it explicitly from the entry file.

An imported `main` function does not execute automatically. The entry file uses either top-level executable statements or a parameterless `fn main() -> void`.

## Virtual standard modules

Cerune also supports `std:` virtual module names. Currently, `std:io` is recognized:

```cerune
import "std:io" as io;
```

`io::read_line(max_bytes)` reads a line and returns an `io::ReadLine` value. Support depends on the input host and execution target; **Windows console input is not supported**. See the [standard module design](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/standard-modules.en.md).

## Current limitations

Re-exports, wildcard imports, nested module paths, importing runtime variable values, and shared mutable module state are not supported. Package distribution, version resolution, and dynamic loading are also unsupported.

## Examples and primary sources

- [modules/main.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/modules/main.ceru) — Imports and public types/functions
- [modules/values.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/modules/values.ceru) — Public definitions and private helpers
- [modules/sum_lookup.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/modules/sum_lookup.ceru) — Imported enums and `match`
- [modules/constant_array_lengths.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/modules/constant_array_lengths.ceru) — Public constants in array lengths
- [Module examples](https://github.com/Cerune-Lang/Cerune/blob/master/examples/modules/README.en.md)

This page summarizes the specification. For precise name resolution, visibility, path checks, and dependency loading behavior, consult the [language reference](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.en.md) and [module design](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/modules.en.md).
