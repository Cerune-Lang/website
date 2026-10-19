---
title: Cerune IR (HIR)
description: The typed, backend-independent intermediate representation, direct execution, and observation.
---

**Cerune IR (HIR)** is the backend-independent intermediate representation created after parsing, semantic validation, and type resolution. It retains resolved Cerune semantics and serves as input to multiple execution and code-generation paths.

## Position in the compiler

```text
Cerune source
    ↓ Lexer / Parser
   AST
    ↓ Semantic analysis, name/type resolution, shared expansion
 Cerune IR (HIR)
    ├─ IR Executor → run / run-ir
    ├─ MIR conversion and validation → run-mir / SSA / Native LIR → ASM / Object
    ├─ Bytecode → run-vm
    └─ C / LLVM / QBE / WAT backend representations → emit-*
```

The frontend resolves language semantics once instead of requiring each backend to reinterpret the source. Native code generation consumes MIR; the C, LLVM, QBE, and WAT paths lower HIR into their respective representations.

## What HIR retains

| Information | Representation in HIR |
| --- | --- |
| Expression types | Resolved concrete types such as `i64`, `f32`, `string`, arrays, and named types |
| Inference | `infer` is resolved before HIR and does not remain a runtime-dynamic type |
| Name references | Binding IDs distinguish declarations, including shadowed names |
| Numeric conversions | Source and destination types and explicit conversion operations |
| Control flow | Structured `if`, `while`, `for`, `break`, and `continue` |
| Origins | `NodeId` for statements/expressions and source-location `Span` values |

For example, the `infer` annotation in `value: infer = 42;` resolves to a concrete type before HIR construction. Backends do not need to redo type inference.

**HIR is not SSA.** Explicit basic blocks and temporaries, target-specific ABIs, and physical storage decisions belong to later MIR, LIR, or backend stages.

## NodeId and source spans

HIR statements and expressions receive `NodeId` values that are unique within a compilation. `emit-ir` prints them as `#0`, `#1`, and so on.

A `NodeId` identifies **an HIR element**; a `Span` identifies **a range in the original source**. Spans use half-open UTF-8 byte ranges. Different HIR elements may have distinct IDs even when their source spans overlap.

IDs are not persistent across edits or compiler versions. Use them to correlate artifacts **from the same compilation**.

Later MIR operations and generated instructions can retain links to HIR IDs and source spans. Compiler-generated operations with no direct source element are identified as synthetic rather than silently losing their origins.

## Emitting HIR for inspection

From the root of the Cerune repository:

```sh
cerune emit-ir examples/ir_execution.ceru
cerune emit-ir examples/ir_stages/control_flow.ceru -o control_flow.ceir
```

`emit-ir` produces **observation text** for resolved HIR. It writes to standard output by default, or a file with `-o`.

The resulting `.ceir` text is not a loadable execution input. Reading source to construct HIR and displaying HIR are separate operations.

## Direct execution of HIR

```sh
cerune run examples/ir_execution.ceru
cerune run-ir examples/ir_execution.ceru
cerune run-vm examples/ir_execution.ceru
```

`run` and `run-ir` **directly execute HIR** using the IR Executor. They do not lower to bytecode or delegate execution to the VM. `run-vm` follows a separate path through bytecode.

The IR Executor interprets structured conditionals and loops directly, following the shared rules for evaluation order, short-circuiting, value copies, and runtime failure conditions.

Execution paths can be compared, but **`emit-ir` is not an execution trace**.

## Correlating HIR with MIR and generated code

```sh
cerune emit-ir examples/ir_stages/control_flow.ceru
cerune emit-mir examples/ir_stages/control_flow.ceru
cerune run-mir examples/ir_stages/control_flow.ceru
```

MIR makes basic blocks and branches explicit. Origin annotations such as `hir=#N` identify the corresponding HIR element. To save HIR, MIR, and annotated assembly from the same compilation, use `observe`:

```sh
cerune observe examples/ir_stages/control_flow.ceru --target x86_64-unknown-linux-gnu -o target/control-flow-observation
```

`observe` requires `--target` and an **output directory that does not exist yet**, specified with `-o`. Create the parent directory first. The bundle includes source text; it does not execute or link a program.

## Scope and primary sources

- HIR represents Cerune language semantics, not a universal machine IR or native instruction format.
- The semantic integer type in HIR is distinct from the storage width chosen by a backend.
- Internal Rust backend IR structures are not stable public serialization formats.
- Optimization is designed as an explicit, observable stage, not an implicit source-level rewrite.

For precise definitions and implementation details, see:

- [Compiler architecture and Cerune IR](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/architecture.en.md)
- [IR Executor design](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/ir-executor.en.md)
- [Observability contract](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/observability.en.md)
- [IR stage examples](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/README.en.md)
- [CLI guide](/en/cli/overview/)
