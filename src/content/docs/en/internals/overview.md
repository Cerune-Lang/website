---
title: Compiler Internals
description: Cerune intermediate representations, execution paths, and code generation.
---

Cerune generates intermediate representations from source code and provides multiple execution and code-generation paths. This page summarizes their roles.

## Representations and execution paths

| Item | Description |
| --- | --- |
| Cerune IR | A shared intermediate representation with resolved types and references |
| MIR | An intermediate representation with explicit control flow and operations |
| SSA | A path that converts MIR into SSA form |
| VM | Execution through Cerune bytecode |
| Code generation | C, LLVM IR, QBE IR, WAT, native assembly, and object files |

## Cerune IR (HIR)

See [Cerune IR (HIR)](/en/internals/ir/) for resolved types and names, NodeId and source origins, direct IR execution, and MIR lowering.

## MIR

See [MIR](/en/internals/mir/) for basic blocks, typed locals, branches, ownership operations, and direct MIR execution.

## SSA

See [SSA](/en/internals/ssa/) for scalar SSA construction, block arguments, joins, direct execution, and Native output.

## VM and Bytecode

See [VM and Bytecode](/en/internals/vm/) for VM instructions, the evaluation stack, function frames, and runtime failures.

## LIR and Native code generation

See [LIR and Native Code Generation](/en/internals/lir-native/) for x86-64 lowering from MIR, ASM and object files, and target-specific calling conventions.

## CLI examples

Run these commands from the Cerune repository root:

```sh
cerune emit-ir examples/hello.ceru
cerune emit-mir examples/hello.ceru
cerune run-vm examples/hello.ceru
```

The `observe` command saves source information, intermediate representations, and source-to-output mappings from a single compilation. It requires an explicit `--target` and a new output directory specified by `-o`. See the [CLI reference](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/cli.en.md) for details.

## Primary sources

- [Compiler design documents](https://github.com/Cerune-Lang/Cerune/tree/master/docs/design)
- [CLI reference](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/cli.en.md)
- [Tint (view generated outputs)](https://tint.hokutaka.dev/)
