---
title: 型
description: Ceruneの基本型、配列、ユーザー定義型と型に関する規則。
---

Ceruneは静的型付け言語です。型はソースコードの検査時に決定され、暗黙の数値型変換は行いません。

## 基本型

| 分類 | 型 | 主な操作・規則 |
| --- | --- | --- |
| 符号付き整数 | `i8`、`i16`、`i32`、`i64` | 算術、比較、ビット演算。範囲外の演算は停止 |
| 符号なし整数 | `u8`、`u16`、`u32`、`u64` | 非負整数。範囲外の演算は停止 |
| 浮動小数点 | `f32`、`f64` | 型の精度で丸める浮動小数点演算 |
| 真偽値 | `bool` | `true`、`false`、論理演算、比較 |
| 文字列 | `string` | 不変のUTF-8文字列。表示、等値比較、連結 |

`string`は`concat`で連結し、`byte_len`でUTF-8の**バイト数**を取得できます。文字数の取得や添字参照は未実装です。詳しくは[文字列](/reference/strings/)を参照してください。

:::note
整数型の値の範囲と、生成コードでの格納幅は別です。現行の実装では小さい整数型も64ビットの領域に格納するため、`i64`を`i8`に変更してもメモリ使用量が減るとは限りません。
:::

## 配列とユーザー定義型

| 分類 | 表記 | 主な操作・規則 |
| --- | --- | --- |
| 固定長配列 | `[T; N]` | 長さが型の一部。要素参照・反復・値コピー |
| 動的配列 | `[T]` | 実行時の長さ。明示コピー・範囲コピー・反復 |
| 名前付き積型 | `type` | 名前付きフィールド、既定値、値全体の更新 |
| 直和型 | `enum` | 選択肢と付随する値。`match`による分岐 |

`array_len`は固定長・動的配列の要素数を`i64`で返します。配列のコピー後の変更は元の配列へ影響しません。

**現在の制限：** 動的配列への要素追加・伸長、借用スライスは未実装です。名前付き積型のフィールドは直接代入できず、新しい値を作って束縛全体を再代入します。汎用`Option`/`Result`型も未実装です。

固定長・動的配列の操作は[配列](/reference/arrays/)、`type`の定義・更新は[名前付き積型](/reference/product-types/)、`enum`の値と`match`は[直和型とmatch](/reference/enums-match/)を参照してください。

## 型注釈と数値変換

`count: i64 = 40;`のように束縛へ型を書きます。`count: infer = 40;`のような`infer`は、宣言時の型推論を指定する構文であり、実行時に型が変わる型ではありません。

数値型どうしは暗黙には変換されません。`T(value)`や`convert<T>(value)`による**値を保持する変換**を明示できます。値を正確に保持できない変換は停止します。丸めや飽和を伴う変換の詳しい使い方は[数値変換](/reference/numeric-conversions/)を参照してください。

算術・比較・論理・ビット演算の一覧と評価順は[演算子](/reference/operators/)を参照してください。

整数演算はオーバーフローを暗黙に折り返しません。範囲外の結果や0による整数除算は実行時に停止します。浮動小数点演算は`f32`と`f64`で精度が異なります。

関数が結果を返さない場合は、戻り値に`void`を指定できます。

## サンプル

以下の実行可能なコードはすべてCerune本体で管理されています。

- [hello.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/hello.ceru) — 整数の束縛と加算
- [floating_point.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/floating_point.ceru) — `f32`と`f64`
- [string_byte_length.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/string_byte_length.ceru) — 文字列のバイト数
- [array_iteration.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/array_iteration.ceru) — 固定長配列の反復
- [product-point.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/product-point.ceru) — 名前付き積型
- [sum_lookup.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/sum_lookup.ceru) — `enum`と`match`

## 一次資料

このページは仕様を要約した二次資料です。型の値域、変換条件、評価順、停止条件の定義は次を参照してください。

- [言語リファレンス](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.ja.md)
- [機能と実装状況](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/language-roadmap.ja.md)
