---
title: Getting Started
description: Install Cerune and use the basic CLI commands.
---

This page covers installation, source validation, and program execution.

## Installation

Download a distribution for Windows, Linux, or macOS from [GitHub Releases](https://github.com/Cerune-Lang/Cerune/releases). See the [core README](https://github.com/Cerune-Lang/Cerune/blob/master/README.md) for version-specific packages and installation instructions.

With Rust and Cargo installed, you can run Cerune from source:

```sh
git clone https://github.com/Cerune-Lang/Cerune.git
cd Cerune
cargo run --quiet -- run examples/hello.ceru
```

The example prints `42`.

## CLI commands

If `cerune` is installed, run these commands from the Cerune repository root:

```sh
cerune check examples/hello.ceru
cerune run examples/hello.ceru
cerune emit-ir examples/hello.ceru
```

| Command | Behavior |
| --- | --- |
| `check` | Checks syntax, semantics, and types without running the program. |
| `run` | Executes Cerune IR directly. |
| `emit-ir` | Outputs Cerune IR after type and name resolution. |
| `run-vm` | Executes the program using Cerune VM. |

:::note
Passing `check` does not guarantee support in every code-generation path. Confirm compatibility with the Cerune version you use.
:::

## Details

- [CLI guide](/en/cli/overview/)
- [CLI reference (primary source)](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/cli.en.md)
- [hello.ceru (primary source)](https://github.com/Cerune-Lang/Cerune/blob/master/examples/hello.ceru)
- [Language Reference](/en/reference/overview/)
- [Tint](https://tint.hokutaka.dev/)
