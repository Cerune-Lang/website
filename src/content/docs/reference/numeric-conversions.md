---
title: 数値変換
description: Ceruneの正確な数値変換、切り捨て、丸め、飽和、型と失敗条件。
---

Ceruneでは、数値型を**暗黙に変換しません**。変換するときは、**値を正確に保つ**か、**小数部分を丸める**か、**型の値域へ飽和させる**かをソースコードに明示します。

## 変換方法の選択

| 目的 | 構文 | 値が表せない場合 |
| --- | --- | --- |
| 元の値を正確に保つ | `T(value)` / `convert<T>(value)` | 実行を停止 |
| 浮動小数点から整数へ丸める | `trunc<T>`、`floor<T>`、`ceil<T>`、`round<T>`、`round_ties_even<T>` | 範囲外・非有限値で停止 |
| 丸めて値域へ収める | `saturating_trunc<T>`など5種類 | 範囲外は最小・最大値にし、NaNは0にする |

正確な変換には**8種類の整数型と`f32`・`f64`の全組み合わせ**を指定できます。丸め・飽和の操作は**`f32`か`f64`から8種類の整数型への変換だけ**に対応します。`bool`、文字列、配列、名前付き型の数値変換はできません。

## 正確な変換：T(value)とconvert<T>

2つの書式は同じ変換です。例えば、数量を`i32`から`i64`へ広げ、元の型へ戻せます。

```cerune
items: i32 = 17;
wide: i64 = i64(items);
restored: i32 = convert<i32>(wide);

print(restored); // 17
```

変換は、**変換先で元の値を損失なく表せる場合だけ**成功します。

- `i32`から`i64`は、すべての値を表せます。
- `u32`から`i32`は、上限を超える値で失敗します。ビット幅が同じでも保証されません。
- 整数から浮動小数点への変換は、その整数を正確に表せる場合だけ成功します。
- 浮動小数点から整数は、有限・整数値・値域内で、**負のゼロでない**場合だけ成功します。
- `f32`から`f64`はNaN以外で成功します。`f64`から`f32`はNaN以外で、値を正確に保てる場合に成功します。
- 同じ型への変換は、NaNや負のゼロのビット情報も含めてそのまま保持します。

```cerune
print(i32(3.0));          // 3
// print(i32(3.7));       // 小数部分を失うため停止
// print(i32(-0.0));      // ゼロの符号を失うため停止
// print(f32(16777217));  // f32では整数を正確に表せず停止
```

リテラルが型の範囲に入らない場合は**コンパイル時**に診断されます。一方、正しく型付けされた入力が変換先に収まらない場合は、変換の**実行時**に停止します。

### 入力の計算は先に行う

```cerune
print(f64(1 / 2));       // 0 — 整数の除算が先
print(f64(1) / f64(2));  // 0.5 — 浮動小数点の除算
```

変換先の型によって、入力側の演算やリテラルの型を後から変えません。括弧内の式を**一度だけ評価**し、その結果を変換します。

## 丸め方を選んで整数にする

`trunc<T>`を含む5種類の操作は、浮動小数点を一度評価した後、**指定した方法で丸めてから**整数の値域を検査します。

| 操作 | 丸め方 | `2.5` | `-2.5` |
| --- | --- | ---: | ---: |
| `trunc<T>(x)` | ゼロ方向 | 2 | -2 |
| `floor<T>(x)` | 負の無限大方向 | 2 | -3 |
| `ceil<T>(x)` | 正の無限大方向 | 3 | -2 |
| `round<T>(x)` | 最も近い整数。同距離ならゼロから遠ざける | 3 | -3 |
| `round_ties_even<T>(x)` | 最も近い整数。同距離なら偶数を選ぶ | 2 | -2 |

例えば、**17個を1箱6個ずつ梱包する**ときは、切り上げて3箱必要です。負の座標を幅10の区画に分ける場合は、負の無限大方向への切り捨てが使えます。

```cerune
print("必要な箱数");
print(ceil<i64>(17.0 / 6.0)); // 3

print("負の座標の区画番号");
print(floor<i32>(-0.1 / 10.0)); // -1
```

`trunc<u8>(255.9)`は255として成功しますが、`trunc<u8>(256.0)`は範囲外で停止します。負の小数も、丸めた結果が0であれば符号なし型に変換できます。例えば`ceil<u8>(-0.9)`は0です。

**NaN・正負の無限大**は、通常の丸め変換では`conversion-not-finite`で停止します。有限でも丸め後に型の値域を超えれば`conversion-out-of-range`で停止します。

## 飽和変換：値域へ収める

5種類の丸め操作に`saturating_`を付けると、丸めた値が変換先の値域を超えた場合に、**その型の最小値か最大値**を返します。

```cerune
print("8ビットの画素値");
print(saturating_round<u8>(300.5)); // 255
print(saturating_floor<u8>(-0.1));  // 0
print(saturating_round<u8>(127.5)); // 128
```

これは色の成分などを`u8`の0〜255に収めたい場合の処理です。

| 入力 | 通常の丸め変換 | `saturating_`付き |
| --- | --- | --- |
| 丸めた値が範囲内 | その整数 | その整数 |
| 丸めた値が範囲外 | 実行を停止 | 型の最小・最大値 |
| NaN | 実行を停止 | 0 |
| 正・負の無限大 | 実行を停止 | 最大値・最小値 |
| 正・負のゼロ | 0 | 0 |

飽和変換は**入力式自体の失敗は捕捉しません**。例えば、引数を計算する途中で整数の0除算が起これば、その演算で停止します。

## 評価順、定数、型引数

すべての変換は引数式を**一度だけ評価**します。失敗の位置も元の式に対応します。`const`の評価や、型引数を持つ関数からの呼び出しにも使用できます。

```cerune
const BOX_COUNT: i64 = ceil<i64>(17.0 / 6.0);
boxes: [i64; BOX_COUNT] = [10, 20, 30];
print(array_len(boxes)); // 3
```

`trunc`・`floor`などは予約語ではありません。組み込みの`floor<i64>(x)`とユーザー定義の型引数付き関数`floor::<i64>(x)`は構文で区別されます。

## 変換を観測する

```sh
cerune run examples/rounding_quantities.ceru
cerune emit-ir examples/rounding_quantities.ceru
cerune emit-bytecode examples/rounding_conversions.ceru
```

IRとBytecodeには**変換元・変換先の型、正確な変換か丸め・飽和か、NodeIdとソース位置**が保持されます。`convert.exact`、`convert.floor`、`convert.saturating_floor`などの表記で区別できます。`emit-ir`は観測テキストを出力するコマンドで、実行履歴を記録するものではありません。

## 制限事項と一次資料

暗黙の数値変換、整数のビット切り詰め、型の値域からの暗黙の折り返しには対応していません。通常の`f32`・`f64`演算で起きた丸めを、変換操作によって取り消すこともできません。

- [integer_conversions.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/integer_conversions.ceru) — 値を保つ変換
- [rounding_quantities.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/rounding_quantities.ceru) — 区画番号と必要な箱数
- [rounding_conversions.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/rounding_conversions.ceru) — 5種類の丸め
- [saturating_conversions.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/saturating_conversions.ceru) — 画素値などの飽和
- [rounding_evaluation_order.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/rounding_evaluation_order.ceru) — 評価順と短絡評価
- [言語リファレンス（一次資料）](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.ja.md)
- [丸め・飽和変換の設計](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/rounding-conversions.ja.md)
- [切り捨て変換の設計](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/truncating-conversions.ja.md)

このページは実装済み機能の要約です。正確な変換条件、特殊値、停止理由と生成コードの処理は一次資料を参照してください。
