---
title: 言語リファレンス
description: Ceruneの型、構文、対応機能の概要。
---

ここではCeruneの主要な言語機能をまとめます。型の厳密な意味、評価順、停止条件は[言語リファレンス（一次資料）](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.ja.md)で定義されています。

## 型

| 分類 | 対応する型 |
| --- | --- |
| 符号付き整数 | `i8`、`i16`、`i32`、`i64` |
| 符号なし整数 | `u8`、`u16`、`u32`、`u64` |
| 浮動小数点 | `f32`、`f64` |
| 真偽値 | `bool` |
| 文字列 | `string`（UTF-8） |
| 配列 | 固定長 `[T; N]`、動的 `[T]` |
| ユーザー定義型 | 名前付き積型、`enum` |

## 主な構文と規則

- 型付きの変数宣言。既定は再代入不可で、`mut`によって再代入を許可します。
- 関数定義と呼び出し、`if`、`while`、`for`、`match`。
- 明示的な数値変換。暗黙の数値変換は行いません。
- 整数の桁あふれや配列の範囲外参照などでは実行を停止します。

## 現在の主な制限

再帰、文字列の添字参照、動的配列の伸長、汎用`Option`/`Result`、ファイル・ネットワークI/Oなどは未実装です。機能の正確な対応範囲と今後の計画は一次資料を参照してください。

## 一次資料

- [言語リファレンス](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.ja.md)
- [CLIリファレンス](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/cli.ja.md)
- [機能一覧とロードマップ](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/language-roadmap.ja.md)
