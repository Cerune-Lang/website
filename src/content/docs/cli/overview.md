---
title: CLI
description: Ceruneの検査、実行、生成、観測コマンド。
---

CeruneのCLIはソースの検査、各中間表現による実行、コード生成に使用します。正確なオプションと制限は[本体のCLIリファレンス](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/cli.ja.md)を参照してください。

## 検査と実行

| コマンド | 用途 |
| --- | --- |
| `check` | 構文・意味・型の検査。実行はしない |
| `run` / `run-ir` | Cerune IRを直接実行 |
| `run-mir` | MIRを独立に実行 |
| `run-vm` | Bytecodeに変換してVMで実行 |
| `--version` | バージョン表示 |

```sh
cerune check examples/hello.ceru
cerune run examples/hello.ceru
cerune run-vm examples/hello.ceru
```

**`run`はVM実行ではありません。** `run-ir`は`run`の別名です。`check`に成功してもすべての生成経路で実行可能とは限りません。

## 中間表現とソースの出力

| コマンド | 出力 |
| --- | --- |
| `emit-sources` | 依存ファイル名とソース本文のJSON一覧 |
| `emit-ir` | 型・参照を解決したCerune IR |
| `emit-mir` | MIRの観測テキスト |
| `emit-lir` | Native LIRの観測テキスト（`--target`必須） |
| `emit-bytecode` | Bytecodeテキスト |

```sh
cerune emit-ir examples/hello.ceru
cerune emit-mir examples/hello.ceru -o hello.mir.txt
cerune emit-sources examples/modules/main.ceru -o sources.json
```

テキストを出す`emit-*`は通常stdoutへ出力し、`-o`で保存できます。`emit-sources`にはソース本文が含まれるため共有前に確認してください。生成したIRテキストは`run`の入力形式ではありません。

## SSAを明示的に選ぶ

`emit-mir --ssa`は元MIRとSSAを表示し、`run-mir --ssa`はSSAを直接実行します。Native生成の`emit-lir`・`emit-asm`・`emit-obj`、一括観測の`observe`にも`--ssa`を指定できます。**SSAへの変換だけでは最適化されません。** 詳しくは[SSA](/internals/ssa/)を参照してください。

## コード生成

| コマンド | 形式 |
| --- | --- |
| `emit-c` | C（`.c`） |
| `emit-llvm` | LLVM IR（`.ll`） |
| `emit-qbe` | QBE IR（`.ssa`） |
| `emit-wat` | WebAssembly Text（`.wat`） |
| `emit-asm` | x86-64アセンブリ（`.s`） |
| `emit-obj` | ネイティブオブジェクト（`.o` / `.obj`） |

```sh
cerune emit-c examples/hello.ceru -o hello.c
cerune emit-llvm examples/hello.ceru --target x86_64-unknown-linux-gnu -o hello.ll
```

**生成はリンクや実行を行いません。** C、LLVM IR、QBE IR、アセンブリ、オブジェクトの実行には外部ツールが必要です。WATの実行には必要なhost関数を持つ環境が必要です。

LLVMとQBEの`--target`は文字列、動的配列、標準出力、検査付き演算などで必要です。対象は`x86_64-unknown-linux-gnu`と`x86_64-pc-windows-msvc`です。`emit-obj`では`--target`と`-o`が必須です。`emit-asm`のターゲット省略時はホストOSに関係なくWindows向けになります。

## コンパイルの観測（observe）

`observe`は同一コンパイルのsources、HIR、MIR、注釈付きASM、manifestをまとめて保存します。

```sh
cerune observe examples/hello.ceru --target x86_64-unknown-linux-gnu -o target/hello-observe
```

`--target`と`-o`が必須です。出力先には**存在しないディレクトリ**を指定し、親ディレクトリを先に作成してください。`--ssa`、`--lir`も選択できます。ソース本文が記録されますが、プログラム実行・外部ツール起動・リンクは行いません。

## 診断と予算

```sh
cerune run-vm examples/hello.ceru --diagnostic-format runtime-v1
cerune run examples/dynamic_arrays/copy.ceru --array-heap-limit 1024
```

`--diagnostic-format runtime-v1`は停止理由、NodeId、ソース位置を記録します。`--string-heap-limit <bytes>`と`--array-heap-limit <bytes>`は、それぞれ既定64 MiBの独立した予算です。プロセス全体のメモリ上限ではなく、`check`と`emit-sources`には指定できません。

## 未対応のコマンドと関連情報

統合された`build`/`release`、`run-lir`は現行CLIにありません。

- [CLI仕様（一次資料）](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/cli.ja.md)
- [Getting Started](/guide/getting-started/)
- [コンパイラ内部](/internals/overview/)
- [Tint](https://tint.hokutaka.dev/)
