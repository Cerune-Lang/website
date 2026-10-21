---
title: 制御構文
description: Ceruneのif、while、for、break、continue、matchと評価規則。
---

Ceruneは条件分岐に`if`、繰り返しに`while`と`for`、直和型（`enum`）の分岐に`match`を使います。

## 条件分岐（if / else）

`if`の条件は`bool`型です。`else`は省略できます。

```cerune
value: i64 = 7;
if value < 10 {
    print(value);
} else {
    print(10);
}
```

**`if`は文です。** 現在は`if`全体から値を返す式としては使えません。条件に数値を直接指定することもできません。

## 繰り返し（while）

`while`は、本文の実行前に毎回`bool`の条件を評価します。最初から`false`なら本文は実行されません。

```cerune
mut count: i64 = 0;
while count < 3 {
    print(count);
    count = count + 1;
}
```

## 繰り返し（for）

通常の`for`には、初期化・継続条件・更新の3つをすべて記述します。

```cerune
mut total: i64 = 0;
for (mut i: i64 = 0; i < 3; i = i + 1) {
    total = total + i;
}
print(total); // 3
```

初期化は最初に1回、継続条件は各反復の前、更新は本文を最後まで実行した後に評価します。初期化で宣言した名前はループ内だけで有効です。初期化には既存の`mut`な束縛への代入も使えます。

## 配列の繰り返し（for … in）

固定長配列と動的配列を、先頭の要素から順に処理できます。

```cerune
values: [i64; 3] = [4, 7, 9];
for (index: i64, value: infer in values) {
    print(index);
    print(value);
}
```

添字が不要なら`for (value: infer in values)`と書けます。対象式はループ開始時に一度評価され、**配列全体がコピーされます**。元の配列の変更は、そのループで処理する要素に反映されません。各反復で取り出す要素も値コピーです。

配列の型やコピーの規則は[配列](/reference/arrays/)を参照してください。

## breakとcontinue

- `break;`は最も内側のループを終了します。
- `continue;`は現在の反復を終了し、次の反復に進みます。
- `while`の`continue`は次の条件評価へ進みます。
- 通常の`for`の`continue`は**更新文を実行した後**、条件を評価します。
- `for … in`の`continue`は次の要素へ進みます。

`break`と`continue`はループ外では使用できません。外側のループを指定するラベル付きの形式は未実装です。

## 直和型の分岐（match）

`match`は`enum`の選択肢に応じて処理を分けます。対象を一度評価・コピーし、分岐を記述順に調べます。

```cerune
enum Lookup { Found { text: string }, Missing }
value: Lookup = Lookup::Found { text: "結果" };

match value {
    Lookup::Found { text: text } => { print(text); },
    Lookup::Missing {} => { print("未登録"); },
}
```

`match`は**文と式の両方**に対応します。文の分岐は`=> { 文... }`、式の分岐は`=> 式`です。式の場合は、すべての分岐結果の型を揃えます。

```cerune
label: string = match value {
    Lookup::Found { text: text } => text,
    Lookup::Missing {} => "未登録",
};
```

パターンの後に`if 条件`を付けて、`bool`のガードを指定できます。ガードは対応する選択肢が一致した場合だけ評価されます。**すべての選択肢にガードなしの分岐が必要**です。全体ワイルドカードや入れ子パターンは現時点では未対応です。

選択肢の構築、フィールド束縛、ガード・網羅性、`match`式の詳細は[直和型とmatch](/reference/enums-match/)を参照してください。

## 条件式とスコープ

`&&`と`||`は短絡評価します。左辺だけで結果が決まる場合、右辺は評価しません。

```cerune
count: i64 = 0;
print(count != 0 && 12 / count > 2); // false
```

各ブロックは新しいスコープを作ります。ブロックの中で宣言した束縛は外から見えません。詳細は[変数と束縛](/reference/variables/)を参照してください。

## サンプルと一次資料

- [conditional.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/conditional.ceru) — `if` / `else`
- [loop_control.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/loop_control.ceru) — `while`、`break`、`continue`
- [array_iteration.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/array_iteration.ceru) — `for … in`
- [sum_lookup.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/sum_lookup.ceru) — `enum`と`match`
- [short_circuit.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/short_circuit.ceru) — `&&`と`||`

このページは仕様の要約です。正確な評価順、`match`の網羅性、各分岐の制約は[言語リファレンス（一次資料）](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.ja.md)を参照してください。
