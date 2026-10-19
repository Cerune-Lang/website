---
title: サンプル
description: Cerune本体で管理するサンプルプログラムと実行方法。
---

Ceruneの実行可能なサンプルは、本体リポジトリの[examples/](https://github.com/Cerune-Lang/Cerune/tree/master/examples)で管理されています。このサイトではコードを複製せず、用途と実行方法を説明します。

## サンプル一覧

| サンプル | 内容 |
| --- | --- |
| [hello.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/hello.ceru) | 変数と整数の加算。出力は`42` |
| [functions.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/functions.ceru) | 引数、戻り値、関数呼び出し |
| [array_iteration.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/array_iteration.ceru) | 配列の反復 |
| [floating_point.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/floating_point.ceru) | `f32`と`f64`の計算 |

## 実行方法

Ceruneリポジトリのルートで、インストール済みのCLIを使います。

```sh
cerune run examples/hello.ceru
cerune run examples/functions.ceru
```

- [サンプル全件](https://github.com/Cerune-Lang/Cerune/tree/master/examples)
- [CLIリファレンス](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/cli.ja.md)
- [Tint](https://tint.hokutaka.dev/)
