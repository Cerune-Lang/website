---
title: Cerune IR（HIR）
description: 型と参照が解決されたCeruneの共通中間表現と、その実行・観測方法。
---

**Cerune IR（HIR）**は、構文解析・意味検証・型解決の後に作られる、バックエンドに依存しない中間表現です。ソースコードの意味を確定した状態で保持し、複数の実行経路とコード生成経路の入力になります。

## コンパイラ内での位置

```text
Ceruneソース
    ↓ Lexer / Parser
   AST
    ↓ 意味解析・名前解決・型解決・共通展開
 Cerune IR (HIR)
    ├─ IR Executor → run / run-ir
    ├─ MIR変換・検証 → run-mir / SSA / Native LIR → ASM・Object
    ├─ Bytecode → run-vm
    └─ C / LLVM / QBE / WAT向けの内部表現 → emit-*
```

各バックエンドが個別に言語の意味を決め直すのではなく、フロントエンドで解決した情報を使って対象の表現に変換します。Nativeの生成はMIR経由ですが、C・LLVM・QBE・WATなどはHIRからそれぞれの経路へ変換します。

## HIRに保持される情報

| 情報 | HIRでの扱い |
| --- | --- |
| 式の型 | `i64`、`f32`、`string`、配列や名前付き型などの具体的な型に解決済み |
| 型推論 | `infer`は解決済みで、実行時の動的型として残らない |
| 名前の参照 | 束縛を識別するIDで区別し、同名のシャドーイングも区別 |
| 数値変換 | 変換元・変換先の型を保持し、明示変換であることを区別 |
| 制御構文 | `if`、`while`、`for`、`break`、`continue`を構造として保持 |
| 出自 | 文・式の`NodeId`と、ソース位置を示す`Span`を保持 |

例えば、`value: infer = 42;`の`infer`はHIRを作る前に具体的な型へ解決されます。バックエンドが独自に再推論する必要はありません。

**HIRはSSA形式ではありません。** 制御フローの基本ブロックや明示的な一時値、Native固有のABI・格納位置などは、後続のMIR・LIRやバックエンドの段階で扱います。

## NodeIdとソース位置

HIRの文と式には、同じコンパイル内で一意な`NodeId`を割り当てます。`emit-ir`では`#0`、`#1`のように表示されます。

`NodeId`は**どのHIR要素か**を示し、`Span`は**元ソースのどの範囲か**を示します。`Span`はUTF-8のバイト位置で、開始位置を含み終了位置を含みません。同じ範囲に対応する複数の要素でも、別のNodeIdを持てます。

これらのIDは編集をまたいで永続するものではありません。**同じ入力とコンパイラ版の、同じコンパイル結果の中で**対応を調べるために使います。

後続のMIRや生成命令は、元のHIR要素とソース範囲への対応情報を保持できます。生成した命令がソースに直接対応しない場合は、コンパイラ生成であることを区別します。

## IRを出力して確認する

Ceruneリポジトリのルートで、次のコマンドを実行します。

```sh
cerune emit-ir examples/ir_execution.ceru
cerune emit-ir examples/ir_stages/control_flow.ceru -o control_flow.ceir
```

`emit-ir`は型や参照を解決したHIRの**観測テキスト**を出力します。省略時は標準出力へ表示され、`-o`でファイルに保存できます。

ただし、保存した`.ceir`を読み込んで実行するCLIではありません。ソースを読み込んでHIRを構築する処理と、観測テキストの出力を区別してください。

## HIRの直接実行

```sh
cerune run examples/ir_execution.ceru
cerune run-ir examples/ir_execution.ceru
cerune run-vm examples/ir_execution.ceru
```

`run`と`run-ir`は、構築済みHIRの文・式を**IR Executorで直接実行**します。Bytecodeへの変換も、VMへの実行委譲も行いません。`run-vm`はBytecodeへ変換してVMで実行する別経路です。

IR Executorは構造化された分岐・ループをそのまま実行し、式の評価順、短絡評価、配列の値コピー、停止条件などについて共通の言語規則に従います。

実行結果の比較はできますが、**`emit-ir`は実行履歴を記録するコマンドではありません**。

## MIRや生成物との対応を調べる

```sh
cerune emit-ir examples/ir_stages/control_flow.ceru
cerune emit-mir examples/ir_stages/control_flow.ceru
cerune run-mir examples/ir_stages/control_flow.ceru
```

MIRでは基本ブロックや分岐を明示し、操作ごとの`hir=#N`などから元のHIR要素へ戻れます。生成ASMとの対応を同じコンパイルで保存したい場合は`observe`を使います。

```sh
cerune observe examples/ir_stages/control_flow.ceru --target x86_64-unknown-linux-gnu -o target/control-flow-observation
```

`observe`は`--target`と**まだ存在しない**出力ディレクトリを指定する`-o`が必要です。親ディレクトリは事前に作成してください。観測結果にはソース本文も含まれますが、プログラムの実行やリンクは行いません。

## 実装上の境界と一次資料

- HIRは機械語や汎用マシンIRの代わりではなく、Ceruneの意味を表現するための中間表現です。
- HIRの意味上の整数型と、バックエンドで選ぶ物理的な格納幅を混同しないでください。
- 内部のRustバックエンドIRは、安定した公開シリアライズ形式ではありません。
- 最適化は暗黙の変換として追加するのではなく、明示的に選択・観測できる段階として設計されています。

仕様・実装の詳細は次を参照してください。

- [コンパイラ構成とCerune IR](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/architecture.ja.md)
- [IR Executorの設計](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/ir-executor.ja.md)
- [可観測性の契約](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/observability.ja.md)
- [IR段階のサンプル](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/README.md)
- [CLIの使い方](/cli/overview/)
