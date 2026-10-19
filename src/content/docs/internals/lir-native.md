---
title: LIR・Nativeコード生成
description: CeruneのMIRからx86-64 LIR、ASM、ELF・COFFオブジェクトを生成する処理。
---

Ceruneの**LIR（Low-level Intermediate Representation）**は、[MIR](/internals/mir/)をx86-64向けに変換した内部表現です。レジスタ操作、スタック上の値の配置、関数呼び出しに必要な情報を持ち、**ASMとObjectの両方の生成に使われます**。

## Native生成の流れ

```text
Ceruneソース → HIR → 非SSA MIR → x86-64 LIR
                     │                ├─ emit-lir（表示）
                     │                ├─ emit-asm → .s
                     │                └─ emit-obj → ELF64 / COFF
                     │
                     └─ --ssaの場合
                        MIR → scalar SSA → copy付きMIR → LIR
```

通常は非SSAのMIRからLIRへ進みます。`--ssa`を明示した場合は、SSAの値の受け渡しをMIRのcopyに戻してから同じNative生成処理を使います。**SSAを指定しただけでは最適化しません**。生成したObjectのリンクと実行は、Ceruneの`emit-*`コマンドとは別の操作です。

## 各段階が担当する処理

| 段階 | 処理内容 |
| --- | --- |
| HIR → MIR | 評価順、基本ブロック、分岐、所有操作を明示する |
| MIR → LIR | 指定したx86-64ターゲットの呼出規約、スタックフレーム、命令を選ぶ |
| LIR → ASM | レジスタ操作、関数の入口・出口、実行時検査や補助処理を展開する |
| ASM → Object | Cerune内蔵エンコーダが命令を符号化し、シンボルと再配置情報を持つELF64/COFFを作る |
| Object → 実行ファイル | 利用者が別途リンカと必要なライブラリを指定する |

CeruneのNative生成は**MIRを入力**に使います。型推論、genericの展開、言語上の値コピー規則をLIRで決め直すものではありません。

LIRには、ASM出力時に複数の機械命令へ展開される検査・配列・文字列操作も残ります。**LIRの1命令が機械語の1命令になるとは限りません**。

## ターゲットと関数の引数

Native生成の対応先は次の2種類です。

| ターゲット | 呼出規約とObject形式 |
| --- | --- |
| `x86_64-unknown-linux-gnu` | System V AMD64、ELF64（`.o`） |
| `x86_64-pc-windows-msvc` | Windows x64、COFF（`.obj`） |

引数をレジスタとスタックのどちらで渡すか、関数のスタックフレームをどう確保するかはターゲットごとに異なります。**コンパイラを実行しているOSから自動選択しません。**

公式サンプル[lir_layout.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/lir_layout.ceru)は、7個の`i64`引数から2フィールドの値を返します。

```cerune
type Pair { first: i64, last: i64, }

fn pack(a: i64, b: i64, c: i64, d: i64, e: i64, f: i64, g: i64) -> Pair {
    return Pair { first: a + b + c, last: d + e + f + g, };
}

value: Pair = pack(1, 2, 3, 4, 5, 6, 7);
print(value.first); // 6
print(value.last);  // 22
print("LIR → ASM");
```

この例の7つの整数引数は、Windowsでは**5番目以降**、System Vでは**7番目**がスタック引数になります。構造体の戻り値には、Cerune内部規約で`RAX`に保存先ポインタを渡します。**外部C ABIとの互換性を宣言するものではありません**。

## LIRとASMを確認する

Ceruneリポジトリのルートで実行します。

```sh
cerune run examples/ir_stages/lir_layout.ceru
cerune emit-lir examples/ir_stages/lir_layout.ceru --target x86_64-unknown-linux-gnu
cerune emit-lir examples/ir_stages/lir_layout.ceru --target x86_64-pc-windows-msvc
cerune emit-asm examples/ir_stages/lir_layout.ceru --target x86_64-unknown-linux-gnu --annotate-origins -o target/lir_layout.s
```

`run`の期待出力は`6`、`22`、`LIR → ASM`の3行です。LIRを比較すると、ターゲットに応じた引数位置、スタックフレーム、関数と命令の情報を確認できます。

`emit-lir`は**明示的な`--target`が必須**です。`emit-asm`は指定を省略するとWindows x64向けになるため、Linux用の例では必ず指定してください。

LIRの観測テキストは`cerune-lir-observation-v1`として、ターゲット、フレームサイズ、命令、MIR・HIRとソース位置の対応などを記録します。表示形式は内部Rust型の変更で変わる可能性があり、読み込んで実行するファイル形式ではありません。

## ASMとObjectから読み取れる情報

`--annotate-origins`を付けると、ASMのコメントとラベルにHIRの`NodeId`、ソース位置、MIRのブロック・命令とLIR命令番号の対応を残します。

- **HIRのNodeId**：元の文・式を指す。
- **MIRのID**：基本ブロックと操作を指す。
- **LIRの命令番号**：関数内の命令順を指す。
- **ASMの命令とObjectのバイト位置**：LIR命令を展開・符号化した結果。

同じ数字でも段階ごとに指すものが違います。ソースに直接対応しないABI準備などは、コンパイラ生成の操作として記録します。注釈付きASMとLIRテキストから、どのMIR操作がどのNative処理になったか確認できます。

## Objectの生成とリンク

```sh
cerune emit-obj examples/ir_stages/lir_layout.ceru --target x86_64-unknown-linux-gnu --annotate-origins -o target/lir_layout.o
```

`emit-obj`は**`--target`と`-o`の両方が必須**です。Cerune自身が対応するx86-64命令を符号化し、Linux向けELF64またはWindows向けCOFFオブジェクトを生成します。この操作に外部アセンブラは必要ありません。

ただしObjectは完成した実行ファイルではなく、外部シンボルや再配置が残る場合があります。リンク、必要な実行時ライブラリの指定、生成物の実行は別途行います。Ceruneのエンコーダは任意のx86-64アセンブリを受け取る汎用アセンブラではありません。

## 同じコンパイルのLIRとASMを保存する

```sh
cerune observe examples/ir_stages/lir_layout.ceru --ssa --lir --target x86_64-unknown-linux-gnu -o target/lir-observation
```

`observe --lir`は既存のHIR・MIR・ASM等にLIRテキストを追加し、**同じLIRから生成したASM**を保存します。`--ssa --lir`では通常経路とSSA経由のLIRを分けて保存できます。manifestはLIRを含む形式v4を使います。

`observe`は`--target`と`-o`が必須で、保存先は**まだ存在しないディレクトリ**にします。親ディレクトリは先に作成してください。元ソースの本文も保存されるため、共有前に内容を確認してください。プログラムの実行・リンクは行いません。

## 構造検証と現在の制限

LIRの検証器は、ブロックの参照先、関数・定数のID、フレームの整列と領域、ターゲットごとの引数配置、必要な実行時設定、命令の出自情報などを検査します。

- 検証成功だけでポインタの有効性、所有値の寿命、実際のABIの動作、機械命令への展開がすべて正しいと証明されるわけではありません。
- **`run-lir`は未実装**です。LIRは表示・検証・Native生成に使い、直接実行しません。
- レジスタ割当・スタック領域の再利用・暗黙の最適化は現段階で行いません。
- CeruneはObjectのリンクや実行を`emit-obj`の中で自動実行しません。

## 一次資料とサンプル

- [LIRの観測・構造検証](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/lir-observation.ja.md)
- [MIRからNativeへの変換](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/native-mir.ja.md)
- [ASMから機械語までの観測](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/native-code.ja.md)
- [自前のx86-64エンコーダ](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/native-encoder.ja.md)
- [lir_layout.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/lir_layout.ceru)
- [native_calls.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_stages/native_calls.ceru)
- [CLI](/cli/overview/)
