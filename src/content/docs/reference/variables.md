---
title: 変数と束縛
description: Ceruneの束縛宣言、mut、infer、再代入、スコープ。
---

Ceruneでは、名前と値を**束縛**します。宣言時に型を指定し、既定ではその名前へ再代入できません。`mut`を付けると、同じ型の新しい値を代入できます。

## 宣言と再代入

初期在庫5個から2個取り出し、残り3個を表示する例です。

```cerune
initial_stock: i64 = 5;
mut remaining: i64 = initial_stock;
remaining = remaining - 2;
print(remaining); // 3
```

| 記法 | 意味 |
| --- | --- |
| `name: T = value;` | `T`型の再代入できない束縛を宣言 |
| `mut name: T = value;` | `T`型の再代入できる束縛を宣言 |
| `name = value;` | 宣言済みの`mut`な束縛へ再代入 |

代入の左側には型を再指定しません。宣言で`mut`を付けていない名前へ代入すると型検査エラーになります。

## 型推論（infer）

`infer`を指定すると、宣言時の式から型を決定します。`infer`は実行時に型が変わる仕組みではありません。

```cerune
mut value: infer = 1; // i64
value = 2;            // OK
// value = 0.5;       // 型エラー: f64は代入できない
```

手掛かりのない整数リテラルは通常`i64`、浮動小数点リテラルは通常`f64`として扱います。明示された型や周囲の式によって、リテラルの型が決まる場合もあります。

数値型の暗黙変換は行いません。詳しくは[型](/reference/types/)と[一次資料の数値リテラルの規則](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.ja.md#数値リテラル)を参照してください。

## 配列と文字列の更新

`mut`な配列の束縛を通して、要素を更新できます。配列は値としてコピーされるため、コピー元の要素は変更されません。

文字列`string`の内容は不変です。`mut`な文字列の束縛には別の文字列を再代入できますが、文字列内の一部だけを書き換えることはできません。例は[文字列](/reference/strings/)を参照してください。

名前付き積型のフィールドも直接代入はできず、新しい値を構築して束縛全体を再代入します。例は[名前付き積型](/reference/product-types/)を参照してください。

## ブロックスコープ

`if`やループの本文など、波括弧で囲まれたブロックは新しいスコープを作ります。

- ブロック内で宣言した束縛は、そのブロックの外から参照できません。
- 内側から外側の束縛を参照できます。外側が`mut`なら再代入できます。
- 内側のブロックでは、外側と同じ名前の別の束縛を宣言できます（シャドーイング）。
- `for`の初期化で宣言した名前は条件・更新・本文で使えますが、ループ終了後は参照できません。

## 関連するサンプル・一次資料

- [conditional.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/conditional.ceru) — 外側の束縛への再代入と、条件分岐内の束縛
- [loop_control.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/loop_control.ceru) — `mut`とループ内での更新
- [owned_arguments.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/owned_arguments.ceru) — 配列のコピーと更新
- [言語リファレンス（一次資料）](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.ja.md) — 「可変な束縛と再代入」「条件分岐、繰り返し、ブロックスコープ」

このページは要約です。正確な評価順や代入・スコープの規則は一次資料を参照してください。
