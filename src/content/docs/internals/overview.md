---
title: コンパイラ内部
description: Ceruneの中間表現、実行経路、コード生成。
---

Ceruneはソースコードから中間表現を生成し、複数の方法で実行・コード生成を行います。このページでは、各経路の役割をまとめます。

## 中間表現と実行経路

| 項目 | 内容 |
| --- | --- |
| Cerune IR | 型や参照を解決した共通の中間表現 |
| MIR | 制御フローや操作を明示した中間表現 |
| SSA | MIRをSSA形式に変換する経路 |
| VM | Cerune bytecodeを使う実行経路 |
| コード生成 | C、LLVM IR、QBE IR、WAT、Native ASM、Objectなど |

## Cerune IR（HIR）

型や名前の解決結果、NodeIdとソース位置、IRの直接実行とMIRへの変換については[Cerune IR（HIR）](/internals/ir/)を参照してください。

## コマンド例

Ceruneリポジトリのルートで実行します。

```sh
cerune emit-ir examples/hello.ceru
cerune emit-mir examples/hello.ceru
cerune run-vm examples/hello.ceru
```

`observe`コマンドでは同じコンパイルからソース情報、複数の中間表現、生成物との対応情報を保存できます。`--target`と新しい出力ディレクトリの`-o`指定が必要です。詳しくは[CLIの仕様](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/cli.ja.md)を確認してください。

## 一次資料

- [コンパイラ設計文書](https://github.com/Cerune-Lang/Cerune/tree/master/docs/design)
- [CLIリファレンス](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/cli.ja.md)
- [Tint（生成結果の表示）](https://tint.hokutaka.dev/)
