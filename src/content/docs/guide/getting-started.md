---
title: はじめに
description: Ceruneの入手方法と基本的なCLI操作。
---

このページでは、Ceruneの入手方法、ソースコードの検査、実行方法を説明します。

## インストール

Windows・Linux・macOS向けの配布物は[GitHub Releases](https://github.com/Cerune-Lang/Cerune/releases)から入手できます。バージョンごとの配布物とインストール手順は[本体README](https://github.com/Cerune-Lang/Cerune/blob/master/README.md)を参照してください。

RustとCargoがインストールされている場合は、ソースから実行できます。

```sh
git clone https://github.com/Cerune-Lang/Cerune.git
cd Cerune
cargo run --quiet -- run examples/hello.ceru
```

この例では `42` が出力されます。

## CLIから実行する

`cerune` をインストールした場合は、Ceruneリポジトリのルートで以下を実行します。

```sh
cerune check examples/hello.ceru
cerune run examples/hello.ceru
cerune emit-ir examples/hello.ceru
```

| コマンド | 処理 |
| --- | --- |
| `check` | 構文・意味・型を検査します。プログラムは実行しません。 |
| `run` | Cerune IRを直接実行します。 |
| `emit-ir` | 型や名前を解決したCerune IRを出力します。 |
| `run-vm` | Cerune VMで実行します。 |

:::note
`check` に成功しても、すべてのコード生成経路で実行できるとは限りません。対応状況は使用するCeruneのバージョンで確認してください。
:::

## 詳細

- [CLIの使い方](/cli/overview/)
- [CLIリファレンス（一次資料）](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/cli.ja.md)
- [hello.ceru（一次資料）](https://github.com/Cerune-Lang/Cerune/blob/master/examples/hello.ceru)
- [言語リファレンス](/reference/overview/)
- [Tint](https://tint.hokutaka.dev/)
