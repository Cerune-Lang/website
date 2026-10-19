---
title: SSA
description: Ceruneのscalar SSAへの変換、ブロック引数、直接実行、Native生成と検証。
---

Ceruneは、[MIR](/internals/mir/)から**scalar SSA（Static Single Assignment）**を構築できます。SSAでは値番号ごとの定義を一つにし、分岐やループで値が合流するときは**ブロック引数**と**辺の実引数**で受け渡します。

SSA化は**明示的に選択する表現変換**であり、最適化ではありません。元の非SSA MIRも保持し、変換前後を比較できます。

## MIRからSSAへの変換

```text
Ceruneソース → HIR → 非SSA MIR
                         ├─ run-mir（通常）
                         └─ scalar SSAを構築・検証
                                ├─ run-mir --ssa（直接実行）
                                ├─ emit-mir --ssa（MIRとSSAを表示）
                                └─ SSA→非SSA MIR→LIR→ASM / Object
```

元のCeruneソースでは`mut`による再代入を引き続き使えます。SSAでは、再代入ごとに別の`ValueId`を使います。

SSAに変換するのは、現在は`bool`、各整数型、`f32`、`f64`の局所値と一時値です。文字列、配列、名前付き型などは**型付きslotを残します**。動的配列の要素やheap全体をSSA化する仕組みではありません。

## ブロック引数と値の合流

次は値の合流を説明する**概念的な略記**です。実際のCeruneの出力をそのまま転載したものではなく、命令や出自の表示を省いています。

```text
非SSA MIR:
  then: total = checked_add(total, 2); jump join
  else: total = checked_add(total, 4); jump join
  join: use total

SSA:
  then: v_then = checked_add(v_seed, 2); jump join(v_then)
  else: v_else = checked_add(v_seed, 4); jump join(v_else)
  join(v_total: u8): use v_total
```

`join`に入るとき、**実際に通った辺の値**が`v_total`へ渡されます。この方式はLLVM IRの`phi`命令と役割が似ていますが、Ceruneはブロック引数と辺の引数で表します。

ループにも同じ仕組みを使います。値番号はプログラム内の**定義位置**を示します。ループの命令が実行時に一度しか実行できないという意味ではありません。

## 辺の値はまとめて渡す

複数のブロック引数は、**すべての入力を先に読み、その後まとめて束縛**します。

```text
head(left: u8, right: u8, index: u8):
  ...
  jump head(right, left, next_index)
```

この例では`left`と`right`を入れ替えても、古い値を失いません。SSAから通常のMIRへ戻すときも、補助ブロックと一時値を使って同じ動作を再現します。引数の受け渡しに、不要な所有コピーや確保を追加しません。

## SSAの観測と直接実行

[Cerune本体のssa_values.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/ssa_values.ceru)では、条件分岐での値の合流、`continue`を含むループ、2つの値の入れ替えを確認できます。

Ceruneリポジトリのルートで実行します。

```sh
cerune emit-mir examples/ir_stages/ssa_values.ceru --ssa -o target/ssa_values.ssa.txt
cerune run examples/ir_stages/ssa_values.ceru
cerune run-mir examples/ir_stages/ssa_values.ceru
cerune run-mir examples/ir_stages/ssa_values.ceru --ssa
cerune run-vm examples/ir_stages/ssa_values.ceru
```

`emit-mir --ssa`は元のMIRとSSAを並べて出力します。`run-mir --ssa`は**SSA専用の実行器で直接実行**し、元MIRやVMの実行器に処理を任せません。

いずれの実行経路でも、この例の期待出力は次の4行です。

```text
14
16
20
10
```

`--ssa`は`emit-mir`、`run-mir`、`emit-lir`、`emit-asm`、`emit-obj`、`observe`で明示的に指定できます。`run`と`run-vm`の動作は変わりません。

## SSAからMIRへ戻してNativeを生成

Native生成では、SSAを検証して**非SSAのMIRへ再変換**し、そこからx86-64 LIR、ASM、Objectへ進みます。

```sh
cerune emit-asm examples/ir_stages/ssa_values.ceru --ssa --target x86_64-unknown-linux-gnu --annotate-origins -o target/ssa_values.s
```

SSAの辺の実引数は、必要に応じて補助ブロック内の一時値とcopyへ変換されます。通常の非SSA MIRから生成した結果と比較できますが、SSA経由の方が命令数やスタック使用量が増える場合もあります。

## 同じコンパイル結果を保存

```sh
cerune observe examples/ir_stages/ssa_values.ceru --ssa --target x86_64-unknown-linux-gnu -o target/ssa-observation
```

`observe --ssa`は、元MIR・SSA・再変換したMIR・変換の対応記録・通常経路とSSA経由のASMを**別々に保存**します。`--target`と`-o`が必須で、出力先は存在しない新しいディレクトリにしてください。親ディレクトリは事前に作成します。プログラムの実行やリンクは行いません。

## 検証する項目と制限

SSAの検証器は、値の二重定義、使用前の定義、支配関係、ブロック引数の数と型、slotの初期化、添字検査、元MIRとの対応などを確認します。

- 到達できないMIRブロックは、削除せず**未変換の記録**として保持します。したがって、保存した全ブロックがSSA化されるわけではありません。
- heap全体をSSAにするMemory SSAや、配列要素ごとのSSAは未実装です。
- 定数畳み込みなどの最適化passは、この変換では実行されません。
- 検証成功は、heapの参照関係や値の寿命が完全に安全であること、変換一般の意味が正しいことの形式証明ではありません。
- 出力される`Cerune scalar SSA v0.1`は観測テキストであり、読み込んで実行する配布形式ではありません。

SSAからMIRへ戻した後のNative生成は[LIR・Nativeコード生成](/internals/lir-native/)を参照してください。

## 一次資料と実行例

- [MIRのSSA変換（実装と検証）](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/mir-ssa.ja.md)
- [MIRと他の中間表現](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/ir-stages.ja.md)
- [SSAの実行例](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/README.md)
- [ssa_values.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/ssa_values.ceru)
- [CLIの使い方](/cli/overview/)
