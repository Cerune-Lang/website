---
title: VM・Bytecode
description: CeruneのBytecode命令、VMの実行、関数フレーム、所有値、実行時診断。
---

Cerune VMは、型と名前が解決された[Cerune IR（HIR）](/internals/ir/)から生成した**Bytecodeを実行するスタック型の実行器**です。MIRを実行する`run-mir`や、HIRを直接実行する`run`とは別の実行経路です。

## HIRからVMへの経路

```text
Ceruneソース → 構文・型の検査 → Cerune IR（HIR）
                                       ├─ IR Executor → run / run-ir
                                       ├─ MIR Executor → run-mir
                                       └─ Bytecode → Cerune VM → run-vm
```

`emit-bytecode`はBytecodeの**読み取り用テキスト**を出力し、`run-vm`はソースからBytecodeを作ってVMで実行します。**出力したBytecodeテキストを読み込んで実行するCLIではありません。**

## プログラムと命令

Bytecodeは、入口の命令列、関数ごとの命令列、型・スロットの情報、文字列・配列のメモリ予算を持ちます。

| 命令・要素 | 何を行うか |
| --- | --- |
| `PushInteger` / `PushString` | 値を評価スタックへ置く |
| `Load` / `Store` / `Assign` | 局所スロットからの読み取り、初期化、再代入 |
| `Call` / `Return` | 関数を呼び出し、呼び出し元へ戻る |
| `JumpIfFalse` / `Jump` | 条件分岐とループの移動先を選ぶ |
| `Add` / `Divide` など | 元の数値型を保って演算し、必要な失敗条件を検査 |
| `ArrayAllocate` / `ArrayInitialize` / `ArrayRetain` など | 動的配列の確保・初期化・所有操作 |
| `Print` / `Write` / `Flush` | 実行時の出力 |
| `Halt` | 入口の命令列を終了 |

この表は内部実装の命令名を挙げたもので、Ceruneソースで直接使う構文ではありません。

## 評価スタックと関数フレーム

VMは現在実行している**命令番号（PC）**、式の値を置く**評価スタック**、名前付き値を置く**局所スロット**を使います。

関数を呼ぶと、その関数の引数と局所値を保持するフレームが用意されます。引数は対応するスロットに配置され、`Return`で戻り値が呼び出し元へ渡されます。スロットには型と変更可能かどうかの情報があり、未初期化の読み取りや不正な再代入はエラーとして扱います。

プログラムの入口にはトップレベルの実行文か、引数なしの明示的な`main`を使います。明示的な`main`の呼び出しや最後の`Halt`は、コンパイラが補助的に生成する命令です。

## 分岐と短絡評価を観測する

公式の[control_flow.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/control_flow.ceru)は、`for`の`continue`・`break`と、不要な関数呼び出しを省く短絡評価を確認する例です。

Ceruneリポジトリのルートで実行します。

```sh
cerune emit-bytecode examples/ir_stages/control_flow.ceru
cerune run-vm examples/ir_stages/control_flow.ceru
cerune run examples/ir_stages/control_flow.ceru
cerune run-mir examples/ir_stages/control_flow.ceru
```

この例では、`accept(2)`の出力`2`、最後の合計`4`が順に表示されます。関数を呼ばずに済む条件では、呼び出し命令に進みません。

```text
2
4
```

`emit-bytecode`では、関数定義とその命令列、条件分岐のジャンプ先、局所スロットを調べられます。**命令列は実行履歴ではありません**。実際に通った分岐を調べるにはプログラムの実行結果も確認してください。

## 配列・文字列とメモリ予算

VMは配列と文字列の所有値を扱い、Bytecodeの確保・保持・解放命令に従って処理します。配列の値コピーや短絡評価など、Ceruneの既存の実行規則を保持します。

`--array-heap-limit <bytes>`は動的配列の生存要素領域、`--string-heap-limit <bytes>`は動的文字列の生存データ領域の予算です。既定はそれぞれ64 MiBで、互いに独立しています。これらはOS全体やプロセスの物理メモリ上限ではありません。

## エラーの種類とソース位置

VMはゼロ除算、整数演算の桁あふれ、配列添字の範囲外参照、メモリ予算超過などの失敗を報告します。内部的なBytecode不整合（スタックの値不足、未初期化スロットなど）も区別します。

各命令には、元のHIR要素の`NodeId`・`Span`か、**コンパイラが生成した命令**であることを示す情報が保持されます。VMの実行エラーは命令番号を記録し、CLIはそこからソース位置を表示できます。

```sh
cerune run-vm examples/runtime_failures/call_sequence.ceru --diagnostic-format runtime-v1
```

この例では、`divide(2)`が成功した後、短絡評価により別の呼び出しを省き、最後の`divide(0)`で停止します。**停止前に表示した内容は保持**され、実行されなかった後続の`print`は出力されません。停止位置は関数内の除算を指します。

`runtime-v1`は停止コード・ソース位置・NodeIdなどの機械処理用情報を出力します。Bytecode命令番号はVMの通常診断からも確認できます。なお、`emit-bytecode`のテキストには命令の内部的な出自情報は含まれません。

## Rustから関数を呼び出す場合

Rust向けには、生成済みの`BytecodeProgram`を保持して、関数へ引数を渡し、結果と出力を取得する埋め込みAPIもあります。現時点で公開されている値の型は`f64`引数と`f64`/`void`の戻り値です。VM内部の`Value`や`Frame`を安定した公開型として保証するものではありません。

埋め込みAPIは、C・LLVM・QBE・WATなどの生成物をコンパイル・リンク・実行する機能ではありません。

## 一次資料と実例

- [コンパイラの設計](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/architecture.ja.md)
- [Bytecodeの実装](https://github.com/Cerune-Lang/Cerune/blob/master/src/bytecode.rs)
- [VMの実装](https://github.com/Cerune-Lang/Cerune/blob/master/src/vm.rs)
- [VM埋め込みの設計](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/vm-embedding.ja.md)
- [control_flow.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/control_flow.ceru)
- [call_sequence.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/runtime_failures/call_sequence.ceru)
- [CLI](/cli/overview/)
