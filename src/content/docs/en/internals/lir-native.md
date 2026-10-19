---
title: LIR and Native Code Generation
description: Lowering Cerune MIR to x86-64 LIR, assembly, and ELF or COFF object files.
---

Cerune's **LIR (Low-level Intermediate Representation)** is the x86-64-specific representation lowered from [MIR](/en/internals/mir/). It describes register operations, stack storage, and function-call information. **Both assembly and object generation use this LIR.**

## Native generation paths

```text
Cerune source → HIR → non-SSA MIR → x86-64 LIR
                       │                 ├─ emit-lir (inspection)
                       │                 ├─ emit-asm → .s
                       │                 └─ emit-obj → ELF64 / COFF
                       │
                       └─ with --ssa
                          MIR → scalar SSA → MIR with copies → LIR
```

The default route lowers non-SSA MIR directly. When `--ssa` is specified, Cerune first converts SSA transfers back into MIR copies and uses the same Native generation machinery. **Selecting SSA does not enable optimization.** Linking and running an object file are separate operations, not part of `emit-*`.

## What each stage does

| Stage | Responsibility |
| --- | --- |
| HIR → MIR | Make evaluation order, basic blocks, branches, and ownership operations explicit |
| MIR → LIR | Choose x86-64 operations, stack-frame layout, and the selected target's calling convention |
| LIR → ASM | Expand register operations, prologues, epilogues, runtime checks, and helpers |
| ASM → Object | Cerune's built-in encoder produces instruction bytes, symbols, and relocations in ELF64/COFF |
| Object → executable | The caller supplies a separate linker and the required libraries |

The Native route **takes MIR as input**. LIR does not redo type inference, generic expansion, or Cerune's value-copy semantics.

Some LIR operations, including checks and string or array helpers, expand into multiple assembly instructions. **One LIR instruction does not necessarily correspond to one machine instruction.**

## Targets and calling conventions

Native generation supports two targets:

| Target | Calling convention and object format |
| --- | --- |
| `x86_64-unknown-linux-gnu` | System V AMD64, ELF64 (`.o`) |
| `x86_64-pc-windows-msvc` | Windows x64, COFF (`.obj`) |

Argument register/stack placement and frame setup depend on the selected target. Cerune **does not infer a target from the OS running the compiler**.

The official [lir_layout.ceru example](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/lir_layout.ceru) takes seven `i64` arguments and returns a two-field value:

```cerune
type Pair { first: i64, last: i64, }

fn pack(a: i64, b: i64, c: i64, d: i64, e: i64, f: i64, g: i64) -> Pair {
    return Pair { first: a + b + c, last: d + e + f + g, };
}

value: Pair = pack(1, 2, 3, 4, 5, 6, 7);
print(value.first); // 6
print(value.last);  // 22
print("LIR → ASM");
```

For these seven integer arguments, **the fifth and later** use the stack on Windows, while **the seventh** uses the stack with System V. Cerune's internal aggregate-return convention passes a return-storage pointer through `RAX`. **This does not declare compatibility with an external C ABI.**

## Inspect LIR and assembly

Run from the Cerune repository root:

```sh
cerune run examples/ir_stages/lir_layout.ceru
cerune emit-lir examples/ir_stages/lir_layout.ceru --target x86_64-unknown-linux-gnu
cerune emit-lir examples/ir_stages/lir_layout.ceru --target x86_64-pc-windows-msvc
cerune emit-asm examples/ir_stages/lir_layout.ceru --target x86_64-unknown-linux-gnu --annotate-origins -o target/lir_layout.s
```

The program prints `6`, `22`, and `LIR → ASM` on separate lines. Compare LIR output for the two targets to inspect argument locations, frame layout, and instruction records.

`emit-lir` **requires an explicit `--target`**. Without one, `emit-asm` defaults to Windows x64, so Linux generation should always name the target.

LIR observation text starts with `cerune-lir-observation-v1` and records the target, frame sizes, instructions, and MIR/HIR/source origins. The presentation may change with internal Rust types; it is not a loadable executable format.

## Tracking source operations into machine code

`--annotate-origins` adds comments and labels to assembly to correlate HIR `NodeId` values, source positions, MIR blocks/instructions, and LIR instruction indices.

- **HIR NodeId** identifies the original statement or expression.
- **MIR IDs** identify control-flow blocks and operations.
- **LIR instruction indices** identify positions within a function.
- **Assembly and object positions** show the result of expansion and encoding.

Identifiers from different stages must not be treated as one numbering system. ABI setup and other operations not directly derived from source are recorded as compiler-generated. Compare LIR text with annotated assembly to see which Native instructions implement a MIR operation.

## Generate an object and link separately

```sh
cerune emit-obj examples/ir_stages/lir_layout.ceru --target x86_64-unknown-linux-gnu --annotate-origins -o target/lir_layout.o
```

`emit-obj` **requires both `--target` and `-o`**. Cerune encodes the supported x86-64 instructions itself and produces an ELF64 object for Linux or COFF for Windows, without invoking an external assembler.

An object is not a finished executable and may contain unresolved symbols and relocations. Linking, providing runtime libraries, and execution remain separate steps. Cerune's encoder is not a general assembler accepting arbitrary x86-64 source.

## Observe LIR and ASM from one compilation

```sh
cerune observe examples/ir_stages/lir_layout.ceru --ssa --lir --target x86_64-unknown-linux-gnu -o target/lir-observation
```

`observe --lir` adds LIR text to the existing HIR/MIR/ASM outputs and records assembly derived from **the same LIR**. With `--ssa --lir`, original-route and SSA-route LIR are saved separately. Bundles containing LIR use manifest schema v4.

`observe` requires `--target` and `-o` naming **an output directory that does not already exist**. Create its parent directory beforehand. The bundle includes full source contents; inspect them before sharing. This command does not execute or link the program.

## Validation and current limitations

The LIR validator checks block targets, function/constant references, frame alignment and storage extents, target-specific argument placement, runtime configuration, and instruction origin records.

- Successful validation does not prove pointer validity, ownership lifetimes, ABI behavior on real hardware, or correctness of machine-code emission.
- **`run-lir` is not implemented.** LIR supports observation, validation, and Native generation, not direct execution.
- Register allocation, stack-slot reuse, and implicit optimization are not performed at this stage.
- `emit-obj` does not automatically link or execute generated objects.

## Primary sources and examples

- [LIR observation and structural validation](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/lir-observation.en.md)
- [Native lowering from MIR](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/native-mir.en.md)
- [Inspecting assembly and machine code](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/native-code.en.md)
- [Built-in x86-64 encoder](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/native-encoder.en.md)
- [lir_layout.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/lir_layout.ceru)
- [native_calls.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/native_calls.ceru)
- [CLI](/en/cli/overview/)
