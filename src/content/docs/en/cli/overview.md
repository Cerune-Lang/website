---
title: CLI
description: Cerune validation, execution, code emission, and observation commands.
---

The Cerune CLI validates source, executes intermediate representations, and generates code. For exact syntax and limitations see the [authoritative CLI reference](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/cli.en.md).

## Validation and execution

| Command | Purpose |
| --- | --- |
| `check` | Parse, validate semantics, and type-check without running |
| `run` / `run-ir` | Execute Cerune IR directly |
| `run-mir` | Execute MIR independently |
| `run-vm` | Lower to bytecode and execute in the VM |
| `--version` | Show the version |

```sh
cerune check examples/hello.ceru
cerune run examples/hello.ceru
cerune run-vm examples/hello.ceru
```

**`run` does not use the VM.** `run-ir` is an alias for `run`. Passing `check` does not imply every backend can generate the program.

## Intermediate representations and sources

| Command | Output |
| --- | --- |
| `emit-sources` | JSON inventory of dependency filenames and source contents |
| `emit-ir` | Cerune IR with resolved types and references |
| `emit-mir` | MIR observation text |
| `emit-lir` | Native LIR observation text (requires `--target`) |
| `emit-bytecode` | Bytecode text |

```sh
cerune emit-ir examples/hello.ceru
cerune emit-mir examples/hello.ceru -o hello.mir.txt
cerune emit-sources examples/modules/main.ceru -o sources.json
```

Text-producing `emit-*` commands normally write to stdout and accept `-o`. `emit-sources` includes full source contents, so review before sharing. Previously emitted IR text is not accepted as input to `run`.

## Explicit SSA selection

`emit-mir --ssa` displays original MIR and SSA; `run-mir --ssa` executes SSA directly. `--ssa` is also available for Native output with `emit-lir`, `emit-asm`, and `emit-obj`, and for `observe` bundles. **Constructing SSA does not itself optimize the program.** See [SSA](/en/internals/ssa/).

## Code generation

| Command | Artifact |
| --- | --- |
| `emit-c` | C (`.c`) |
| `emit-llvm` | LLVM IR (`.ll`) |
| `emit-qbe` | QBE IR (`.ssa`) |
| `emit-wat` | WebAssembly Text (`.wat`) |
| `emit-asm` | x86-64 assembly (`.s`) |
| `emit-obj` | Native object (`.o` / `.obj`) |

```sh
cerune emit-c examples/hello.ceru -o hello.c
cerune emit-llvm examples/hello.ceru --target x86_64-unknown-linux-gnu -o hello.ll
```

**Emission does not link or run the generated program.** Generated C, LLVM, QBE, assembly, and object files require external tooling; WAT requires a host with suitable imports.

LLVM and QBE require explicit `--target` for strings, dynamic arrays, output, checked operations, and similar features. Supported values are `x86_64-unknown-linux-gnu` and `x86_64-pc-windows-msvc`. `emit-obj` requires both `--target` and `-o`. Without `--target`, `emit-asm` produces Windows assembly regardless of the host OS.

## Compiler observations (observe)

`observe` saves sources, HIR, MIR, annotated assembly, and a manifest from the same compilation.

```sh
cerune observe examples/hello.ceru --target x86_64-unknown-linux-gnu -o target/hello-observe
```

Both `--target` and `-o` are required. The output directory must **not already exist**; create its parent first. Optional `--ssa` and `--lir` flags are supported. Source text is included, but program execution, external tools, and linking are not performed.

## Diagnostics and budgets

```sh
cerune run-vm examples/hello.ceru --diagnostic-format runtime-v1
cerune run examples/dynamic_arrays/copy.ceru --array-heap-limit 1024
```

`--diagnostic-format runtime-v1` records runtime reasons, NodeIds, and source ranges. `--string-heap-limit <bytes>` and `--array-heap-limit <bytes>` independently default to 64 MiB. These are not process-wide memory caps; `check` and `emit-sources` reject them.

## Unsupported commands and related pages

Integrated `build`/`release` and `run-lir` are not part of the current CLI.

- [CLI specification (primary source)](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/cli.en.md)
- [Getting Started](/en/guide/getting-started/)
- [Compiler Internals](/en/internals/overview/)
- [Tint](https://tint.hokutaka.dev/)
