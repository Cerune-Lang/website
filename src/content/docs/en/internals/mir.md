---
title: MIR
description: Cerune MIR basic blocks, typed values, ownership operations, validation, and execution.
---

**MIR** is a target-independent intermediate representation lowered from [Cerune IR (HIR)](/en/internals/ir/) after type and name resolution. It represents structured HIR control flow using **basic blocks, explicit branches, and typed locals and temporaries**.

## From HIR to MIR

```text
Cerune source → HIR (resolved semantics and types)
                    ↓ HIR-to-MIR lowering and validation
               Non-SSA MIR
                  ├─ emit-mir / run-mir
                  ├─ SSA construction → direct SSA execution / lowering to MIR
                  └─ x86-64 LIR → ASM / Object
```

HIR retains structured constructs such as `if`, `while`, and `for`. MIR converts these into blocks and control-flow edges for conditions, bodies, updates, and exits. **The ordinary MIR is not SSA** and allows assignments to locals.

## MIR elements

| Element | Meaning |
| --- | --- |
| `bbN` | A basic block within a function |
| `%N` | A typed local or temporary |
| `iN` | An instruction index within a function |
| `jump` / `branch` | Explicit control-flow destinations |
| Terminator | Branch, return, or another block-ending operation |
| `hir=#N` | Corresponding HIR `NodeId` |
| `source=N bytes=A..B` | Source identity and UTF-8 byte range |

These numbers identify elements **within an observed compilation**. HIR NodeIds, MIR block/instruction IDs, and LIR instruction IDs are separate namespaces.

MIR preserves language-level types, including integer widths, floats, strings, and arrays. CPU registers, stack layout, and Windows/System V ABI decisions belong to later LIR lowering.

## Evaluation order, control flow, and ownership

MIR preserves resolved HIR semantics while making the order of operations explicit.

- The right operand of `&&` or `||` executes only when required by a branch.
- A `while` `continue` returns to the condition; a standard `for` `continue` enters the **update block**. `break` enters the loop exit.
- Checked arithmetic, conversions, and array bounds checks retain failure reasons and source origins.
- Array copying and allocation, element initialization, and string/array retain and release operations remain explicitly ordered.
- Indexed assignments check each index before evaluating the right-hand side.

Reading a local and making an independent owned-value copy are separate operations. **A temporary read does not silently trigger a deep copy.**

## Inspecting MIR

From the Cerune repository root:

```sh
cerune emit-ir examples/ir_stages/control_flow.ceru
cerune emit-mir examples/ir_stages/control_flow.ceru
cerune emit-mir examples/ir_stages/control_flow.ceru -o target/control_flow.mir.txt
```

The [control_flow.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/control_flow.ceru) example includes short-circuit logic and `for` loops with `continue` and `break`. In the output, inspect `derived=short-circuit-rhs`, `derived=for-update`, `derived=loop-exit`, and branch destinations.

By default, `emit-mir` produces **unoptimized non-SSA MIR**. SSA output can be requested separately with an explicit `--ssa` option.

## Direct MIR execution

```sh
cerune run examples/ir_stages/control_flow.ceru
cerune run-mir examples/ir_stages/control_flow.ceru
cerune run-vm examples/ir_stages/control_flow.ceru
```

`run-mir` executes MIR instructions and blocks using an **independent MIR executor**, without delegating control flow to the HIR executor or VM. Compare output, runtime failure reasons, and source origins across these routes.

To execute the constructed SSA representation directly, use `run-mir <file> --ssa`. SSA construction is not itself an optimization.

## Validation and limits

The MIR validator checks references, types, terminators, definite initialization before reads, prior index checks, and argument ownership categories.

**Successful validation does not prove complete safety of heap aliases, partial initialization, or lifetime paths through retain/release operations.** Full static lifetime verification is not implemented. Comparing executions against other routes is not a formal proof.

The `Cerune MIR v0.1` output of `emit-mir` is **observation text**, not a distributable executable format or stable loadable MIR image.

See [SSA](/en/internals/ssa/) for the optional conversion from MIR.

## Primary sources and examples

- [HIR / MIR / LIR stage design](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/ir-stages.en.md)
- [Independent MIR executor](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/mir-executor.en.md)
- [MIR input for Native](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/native-mir.en.md)
- [IR stage examples](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/README.en.md)
- [owned_values.ceru: ownership and cleanup](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/owned_values.ceru)
- [CLI](/en/cli/overview/)
