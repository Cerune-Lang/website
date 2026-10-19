---
title: SSA
description: Cerune scalar SSA construction, block arguments, execution, Native lowering, and validation.
---

Cerune can construct **scalar SSA (Static Single Assignment)** from [MIR](/en/internals/mir/). In SSA, each value ID has a single definition. When control flow joins or loops, values are passed through **block parameters** and **edge arguments**.

SSA construction is an **explicit representation change, not an optimization**. The original non-SSA MIR is retained for comparison.

## From MIR to SSA

```text
Cerune source → HIR → non-SSA MIR
                         ├─ run-mir (default)
                         └─ construct and validate scalar SSA
                                ├─ run-mir --ssa (direct execution)
                                ├─ emit-mir --ssa (display MIR and SSA)
                                └─ SSA → non-SSA MIR → LIR → ASM / Object
```

Cerune source can continue to use `mut` and reassignment. SSA introduces a distinct `ValueId` for each new scalar definition.

Currently, eligible locals and temporaries have types `bool`, any supported integer type, `f32`, or `f64`. **Typed slots remain** for strings, arrays, named types, and other values. This is not Memory SSA for the entire heap or SSA for individual array elements.

## Block parameters and joining values

The following is **conceptual pseudocode**, not a literal dump from the compiler. It omits instructions and origin annotations for clarity.

```text
Non-SSA MIR:
  then: total = checked_add(total, 2); jump join
  else: total = checked_add(total, 4); jump join
  join: use total

SSA:
  then: v_then = checked_add(v_seed, 2); jump join(v_then)
  else: v_else = checked_add(v_seed, 4); jump join(v_else)
  join(v_total: u8): use v_total
```

The `join` block receives the value passed along **the edge that was actually taken**. This serves a similar purpose to LLVM IR's `phi` instructions, but Cerune represents merges as block parameters with incoming edge arguments.

The same representation works for loop headers. A value ID names a **static definition**, not an instruction that can execute only once at runtime.

## Edge arguments transfer together

When a control-flow edge supplies multiple arguments, **all inputs are read before the parameters are bound together**.

```text
head(left: u8, right: u8, index: u8):
  ...
  jump head(right, left, next_index)
```

This preserves the original values when exchanging `left` and `right`. When lowering SSA back to MIR, helper blocks and temporaries implement the same parallel transfer. The transfer does not silently add heap allocations or owned-value copies.

## Inspect and execute SSA

The [ssa_values.ceru example](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/ssa_values.ceru) demonstrates branch merges, loops containing `continue`, and repeated value swaps.

From the Cerune repository root:

```sh
cerune emit-mir examples/ir_stages/ssa_values.ceru --ssa -o target/ssa_values.ssa.txt
cerune run examples/ir_stages/ssa_values.ceru
cerune run-mir examples/ir_stages/ssa_values.ceru
cerune run-mir examples/ir_stages/ssa_values.ceru --ssa
cerune run-vm examples/ir_stages/ssa_values.ceru
```

`emit-mir --ssa` displays both original MIR and constructed SSA. **`run-mir --ssa` executes SSA directly** using its own control-flow and value evaluator, without delegating execution to the original MIR interpreter or VM.

All execution paths should print these four lines:

```text
14
16
20
10
```

The explicit `--ssa` option is supported by `emit-mir`, `run-mir`, `emit-lir`, `emit-asm`, `emit-obj`, and `observe`. Default `run` and `run-vm` behavior is unchanged.

## Lower SSA back to MIR for Native

The Native route validates SSA, **reconstructs non-SSA MIR**, then lowers it to x86-64 LIR, assembly, and objects.

```sh
cerune emit-asm examples/ir_stages/ssa_values.ceru --ssa --target x86_64-unknown-linux-gnu --annotate-origins -o target/ssa_values.s
```

Incoming edge arguments become parallel copies implemented with temporaries and helper blocks as needed. The result can be compared with the default non-SSA Native route, although SSA lowering may increase instruction count or stack use.

## Save representations from one compilation

```sh
cerune observe examples/ir_stages/ssa_values.ceru --ssa --target x86_64-unknown-linux-gnu -o target/ssa-observation
```

`observe --ssa` separately saves original MIR, SSA, reconstructed MIR, conversion mappings, and both default and SSA-derived assembly. `--target` and `-o` are required; the output directory must **not already exist**, and its parent must be created beforehand. This command neither executes nor links the program.

## Validation and limitations

The SSA validator checks duplicate definitions, dominance and use order, block-argument counts and types, slot initialization, index checks, and correspondence to original MIR.

- Unreachable MIR blocks are retained as **unconverted records** instead of being deleted. Not every stored block is therefore SSA-converted.
- Memory SSA for the heap and per-element array SSA are not implemented.
- Optimization passes such as constant folding are **not** run by SSA construction.
- Validation does not prove complete heap alias or lifetime safety, or establish general semantic equivalence for all possible conversions.
- `Cerune scalar SSA v0.1` is observation text, not a loadable executable or distribution format.

See [LIR and Native Code Generation](/en/internals/lir-native/) for Native output after SSA-to-MIR lowering.

## Primary sources and examples

- [MIR to SSA construction and validation](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/mir-ssa.en.md)
- [HIR, MIR, and LIR stages](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/ir-stages.en.md)
- [SSA examples](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/README.en.md)
- [ssa_values.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/ssa_values.ceru)
- [CLI guide](/en/cli/overview/)
