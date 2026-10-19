---
title: コンパイラ内部
description: Ceruneの変換過程と複数の実行経路を理解する。
---

Ceruneの特徴の一つは、ソースコードがどのように変換されるかを **観測** できることです。

## 何を観測するのか

ソースコードから各種中間表現への変換、複数の実行経路、生成コードと元のソース位置の対応を調べます。

IR、MIR、SSAなどの用語や各経路の扱いは、実装に合わせて更新される一次資料を参照してください。

## 一次資料とツール

- [設計ドキュメント一覧](https://github.com/Cerune-Lang/Cerune/tree/master/docs/design)
- [本体のREADME](https://github.com/Cerune-Lang/Cerune/blob/master/README.md)
- [Tint — 変換の可視化](https://tint.hokutaka.dev/)

今後は実際に生成された変換例を使って、各段階を図解する予定です。
