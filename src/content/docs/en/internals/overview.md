---
title: Compiler Internals
description: Understand Cerune's transformation pipeline and execution paths.
---

One of Cerune's defining goals is to make compiler transformations **observable**.

## What can you observe?

Explore how source code moves through intermediate representations, how multiple execution paths relate, and how generated results retain source provenance.

For precise contracts and current implementation details concerning IR, MIR, SSA, and backends, see the primary documents.

## Primary sources and tools

- [Compiler design documents](https://github.com/Cerune-Lang/Cerune/tree/master/docs/design)
- [Core README](https://github.com/Cerune-Lang/Cerune/blob/master/README.md)
- [Tint — Visualize transformations](https://tint.hokutaka.dev/)

Future pages will illustrate the pipeline with real compiler-generated examples.
