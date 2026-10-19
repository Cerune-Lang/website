---
title: VM and Bytecode
description: Cerune bytecode instructions, VM execution, function frames, owned values, and runtime diagnostics.
---

The Cerune VM is a **stack-based executor** for bytecode generated from typed and resolved [Cerune IR (HIR)](/en/internals/ir/). This is distinct from `run`, which directly executes HIR, and `run-mir`, which executes MIR.

## From HIR to VM

```text
Cerune source → parsing and type checking → Cerune IR (HIR)
                                                 ├─ IR Executor → run / run-ir
                                                 ├─ MIR Executor → run-mir
                                                 └─ Bytecode → Cerune VM → run-vm
```

`emit-bytecode` emits **human-readable observation text**, while `run-vm` compiles source to bytecode and executes it. The CLI does **not** load previously emitted bytecode text for execution.

## Programs and instructions

Bytecode holds entry instructions, per-function instruction sequences, type and slot information, and string/array memory budgets.

| Instruction / element | Purpose |
| --- | --- |
| `PushInteger` / `PushString` | Place values on the evaluation stack |
| `Load` / `Store` / `Assign` | Read, initialize, or reassign a local slot |
| `Call` / `Return` | Invoke a function and return to the caller |
| `JumpIfFalse` / `Jump` | Select control-flow destinations for branches and loops |
| `Add` / `Divide` etc. | Perform typed arithmetic with the required checks |
| `ArrayAllocate` / `ArrayInitialize` / `ArrayRetain` etc. | Allocate, initialize, and manage owned dynamic arrays |
| `Print` / `Write` / `Flush` | Produce runtime output |
| `Halt` | End the entry instruction sequence |

These are internal implementation names, not syntax to use in Cerune source code.

## The stack and function frames

The VM maintains a **program counter (PC)**, an **evaluation stack** for expression values, and **local slots** for bindings.

Calling a function creates a frame containing its parameters and local values. Arguments are placed into parameter slots, and `Return` passes the result back to the caller. Slot definitions retain type and mutability information; invalid assignments and reads before initialization are errors.

A program starts with top-level executable statements or an explicit parameterless `main`. The compiler inserts the call to an explicit `main` and the final `Halt` as synthetic instructions.

## Inspect branches and short-circuiting

The official [control_flow.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/control_flow.ceru) demonstrates `continue` and `break` in a `for` loop, as well as short-circuit evaluation that avoids unnecessary function calls.

Run these commands from the core Cerune repository root:

```sh
cerune emit-bytecode examples/ir_stages/control_flow.ceru
cerune run-vm examples/ir_stages/control_flow.ceru
cerune run examples/ir_stages/control_flow.ceru
cerune run-mir examples/ir_stages/control_flow.ceru
```

The program prints `2` from `accept(2)`, followed by the final total `4`. It does not enter the function-call branch when the left operand already determines the result.

```text
2
4
```

The `emit-bytecode` output lets you inspect function instruction sequences, conditional jumps, their destinations, and local slots. **An instruction listing is not an execution trace**; compare execution output to understand which branches were taken.

## Arrays, strings, and memory budgets

The VM handles owned string and array values according to bytecode allocation, retain, and release instructions. It preserves Cerune's value-copy and short-circuit semantics.

`--array-heap-limit <bytes>` budgets live dynamic array element storage, and `--string-heap-limit <bytes>` budgets live dynamic string payloads. Both default to 64 MiB independently. Neither is a total OS or process physical memory cap.

## Runtime failures and source positions

The VM reports division by zero, integer overflow, invalid array indices, and memory budget exhaustion. It also distinguishes inconsistent bytecode operations, such as stack underflow or uninitialized local reads.

Each internal instruction retains either an originating HIR `NodeId` and source `Span`, or a marker identifying a **compiler-generated instruction**. VM failures record an instruction index, and the CLI can associate that instruction with a source location.

```sh
cerune run-vm examples/runtime_failures/call_sequence.ceru --diagnostic-format runtime-v1
```

This example first executes `divide(2)`, skips another call through short-circuit evaluation, and then stops at `divide(0)`. **Previous output is preserved**, and the later `print` does not execute. The reported source position points to the division inside the function.

`runtime-v1` provides machine-readable failure codes, source locations, and NodeIds. Normal VM diagnostics can also include the bytecode instruction index. The `emit-bytecode` text does not expose the instructions' internal origin metadata.

## Calling functions from Rust

The Rust embedding API can retain a compiled `BytecodeProgram`, call a selected function with arguments, and collect its result and output. The currently implemented public value support includes `f64` arguments and `f64`/`void` results. Internal VM `Value` and `Frame` types are not stable public interfaces.

The embedding API does not compile, link, or run emitted C, LLVM, QBE, or WAT artifacts.

## Primary sources and examples

- [Compiler architecture](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/architecture.en.md)
- [Bytecode implementation](https://github.com/Cerune-Lang/Cerune/blob/master/src/bytecode.rs)
- [VM implementation](https://github.com/Cerune-Lang/Cerune/blob/master/src/vm.rs)
- [VM embedding design](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/vm-embedding.en.md)
- [control_flow.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/control_flow.ceru)
- [call_sequence.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/runtime_failures/call_sequence.ceru)
- [CLI](/en/cli/overview/)
