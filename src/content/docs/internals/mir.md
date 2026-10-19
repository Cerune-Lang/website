---
title: MIR
description: CeruneのMIRにおける基本ブロック、型付き値、所有操作、検証と実行。
---

**MIR**は、型と名前が解決された[Cerune IR（HIR）](/internals/ir/)から変換する、ターゲット非依存の中間表現です。HIRの構造化された制御を、**基本ブロック・明示的な分岐・型付き局所値と一時値**として表します。

## HIRからMIRへの変換

```text
Ceruneソース → HIR（意味・型の確定）
                    ↓ HIR→MIR変換・検証
             非SSA MIR
                ├─ emit-mir / run-mir
                ├─ SSA変換 → SSA直接実行 / MIRへの再変換
                └─ x86-64 LIR → ASM / Object
```

`if`や`while`、`for`はHIRでは構造として残ります。MIRでは条件、本文、更新、終了などへの制御の移動をブロック間の辺として明示します。**通常のMIRはSSAではなく、局所値への再代入を許します。**

## MIRに表れる要素

| 要素 | 役割 |
| --- | --- |
| `bbN` | 関数内の基本ブロック |
| `%N` | 型付き局所値・一時値 |
| `iN` | 関数内の命令番号 |
| `jump` / `branch` | 次に進むブロックの指定 |
| terminator | 各ブロック末尾の分岐・戻り値など |
| `hir=#N` | 元のHIRの`NodeId`との対応 |
| `source=N bytes=A..B` | 元ソースとUTF-8バイト範囲 |

これらの番号は**観測したコンパイル結果内の識別子**です。HIRのNodeId、MIRのBlockId・InstructionId、後段のLIR命令番号を同じ番号空間として扱わないでください。

MIRの値には整数・浮動小数点の型、配列や文字列などの区別が残ります。一方、CPUレジスタ、スタック配置、Windows/System V ABIは後段のLIRで決めます。

## 評価順・制御フロー・所有操作

MIRはHIRで決まった意味を保持し、各操作を実行順に並べます。

- `&&`・`||`の右辺は、必要な場合だけ実行する分岐に変換します。
- `while`の`continue`は条件へ、通常の`for`の`continue`は**更新ブロック**へ進みます。`break`はループの出口へ進みます。
- 検査付き算術、数値変換、配列の添字検査は失敗理由とソース位置を保持します。
- 配列のコピー・確保・要素の初期化や文字列・配列の保持・解放などの所有操作を、必要な順番で明示します。
- 入れ子の配列要素への代入は、各添字を先に評価・検査し、成功してから右辺を評価します。

通常の値の読取りと、所有値を独立にコピーする操作は区別されます。**一時値の参照だけで暗黙に深いコピーを追加することはありません。**

## MIRの出力と読み方

Ceruneリポジトリのルートで実行します。

```sh
cerune emit-ir examples/ir_stages/control_flow.ceru
cerune emit-mir examples/ir_stages/control_flow.ceru
cerune emit-mir examples/ir_stages/control_flow.ceru -o target/control_flow.mir.txt
```

[control_flow.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/control_flow.ceru)には短絡評価と`for`の`continue`・`break`があります。`emit-mir`で`derived=short-circuit-rhs`、`derived=for-update`、`derived=loop-exit`と分岐の行き先を確認できます。

`emit-mir`はデフォルトで**最適化なしの非SSA MIR**を出力します。SSAを並べて確認する場合の`--ssa`は別の明示オプションです。

## MIRの直接実行

```sh
cerune run examples/ir_stages/control_flow.ceru
cerune run-mir examples/ir_stages/control_flow.ceru
cerune run-vm examples/ir_stages/control_flow.ceru
```

`run-mir`はMIR命令とブロックを**独立したMIR実行器**で実行します。HIR実行器やVMに委譲しません。3経路で、出力と実行時停止の理由・出自を比較できます。

SSAへ変換した表現を直接実行する場合は`run-mir <file> --ssa`を使用します。SSA変換そのものは最適化ではありません。

## MIRの検証と制限

MIRの検証器は、命令や分岐の参照先、型、ブロック終端、使用前の確実な初期化、添字検査の先行、引数の所有区分などを検査します。

**ただし検証成功だけで、heapのalias関係、部分初期化、retain/releaseを通じた寿命の経路がすべて安全と証明されるわけではありません。** これらの完全な静的検証は未実装です。MIR実行器との比較も形式証明ではありません。

`emit-mir`の`Cerune MIR v0.1`は**観測用テキスト**であり、実行可能な配布ファイルや安定したMIR loader形式ではありません。

MIRから変換する表現については[SSA](/internals/ssa/)を参照してください。

## 一次資料とサンプル

- [HIR／MIR／LIRの段階設計](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/ir-stages.ja.md)
- [独立したMIR実行器](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/mir-executor.ja.md)
- [NativeへのMIR入力](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/native-mir.ja.md)
- [IR段階の実行例](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/README.md)
- [owned_values.ceru：所有と解放](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/owned_values.ceru)
- [CLI](/cli/overview/)
