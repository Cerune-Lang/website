---
title: 言語リファレンス
description: Ceruneの型、構文、対応機能の概要。
---

ここではCeruneの主要な言語機能をまとめます。型の厳密な意味、評価順、停止条件は[言語リファレンス（一次資料）](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.ja.md)で定義されています。

## 型

整数、浮動小数点、真偽値、文字列、配列、ユーザー定義型の種類と基本的な規則は[型](/reference/types/)にまとめています。

## 文字列

UTF-8、文字列の連結、バイト数、エスケープ、比較と不変性については[文字列](/reference/strings/)を参照してください。

## 束縛と再代入

宣言、`mut`による再代入、`infer`による型推論、ブロックスコープの規則は[変数と束縛](/reference/variables/)にまとめています。

## 関数

関数の定義、引数、戻り値、ジェネリクス、実行開始点については[関数](/reference/functions/)を参照してください。

## 配列

固定長配列と動的配列の生成、コピー、更新、反復、制限事項は[配列](/reference/arrays/)にまとめています。

## 制御構文

条件分岐、繰り返し、`break`・`continue`、`enum`の分岐は[制御構文](/reference/control-flow/)を参照してください。

## モジュール

ファイルの`import`、公開指定の`pub`、名前空間、依存ファイルの規則は[モジュール](/reference/modules/)を参照してください。

## 主な構文と規則
- 明示的な数値変換。暗黙の数値変換は行いません。
- 整数の桁あふれや配列の範囲外参照などでは実行を停止します。

## 現在の主な制限

再帰、文字列の添字参照、動的配列の伸長、汎用`Option`/`Result`、ファイル・ネットワークI/Oなどは未実装です。機能の正確な対応範囲と今後の計画は一次資料を参照してください。

## 一次資料

- [言語リファレンス](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.ja.md)
- [CLIリファレンス](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/cli.ja.md)
- [機能一覧とロードマップ](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/language-roadmap.ja.md)
