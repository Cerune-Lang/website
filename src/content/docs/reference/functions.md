---
title: 関数
description: Ceruneの関数定義、引数、戻り値、ジェネリクス、実行開始点。
---

Ceruneでは`fn`で関数を定義します。**引数と戻り値の型を明示**し、関数名で呼び出します。

## 関数の定義と呼び出し

```cerune
fn add(left: i64, right: i64) -> i64 {
    return left + right;
}

result: i64 = add(20, 22);
print(result); // 42
```

| 構文 | 内容 |
| --- | --- |
| `fn name(parameters) -> T { ... }` | 戻り値の型が`T`の関数を定義 |
| `name(arguments)` | 関数を呼び出す |
| `return value;` | 値を返して関数を終了 |
| `-> void` | 値を返さない関数の戻り値型 |
| `return;` | `void`関数を途中で終了 |

値を返す関数では、すべての実行経路で値を返す必要があります。**最後に式を書くだけでは戻り値になりません**。

## 戻り値がない関数

```cerune
fn show(value: i64) -> void {
    print(value);
}

show(42);
```

`void`関数は末尾まで実行するか、`return;`で終了できます。`void`関数は呼び出し文として使い、値を返す関数の呼び出しは式として使います。

## 引数と値の受け渡し

引数の式は**左から順に、一度ずつ**評価されます。型が異なる引数を暗黙に変換しません。

配列や名前付き積型は値として渡します。関数内で受け取った値を変更しても、呼び出し元の値は変わりません。引数の個数に、言語仕様上の固定された上限はありません。

引数と関数内の束縛は、その関数内でのみ参照できます。関数からトップレベルの実行時の束縛を直接読むことはできません。

## プログラムの実行開始点

Ceruneは、トップレベルの実行文を使う形式と、`fn main() -> void`を明示する形式に対応します。

```cerune
fn main() -> void {
    print(42);
}
```

**トップレベルの実行文と明示的な`main`は併用できません。** `main`は引数を受け取りません。

## 型・配列長を引数にする関数

型パラメーター`T`と、固定長配列の長さパラメーター`const N: i64`を指定できます。

```cerune
fn first<T, const N: i64>(values: [T; N]) -> T {
    return values[0];
}

print(first::<string, 2>(["先頭", "次"]));
```

`::<...>`に型と長さを**宣言順で明示**します。長さは正の整数リテラル、整数定数名、外側の長さパラメーターを使えます。

**現在の制限：** 型引数の推論、trait、汎用の型定義、再帰呼び出しは未対応です。ジェネリック関数の本体は使用した具体型ごとに検査されるため、未使用の具体化まで検査されるとは限りません。

## モジュールと公開範囲

他のモジュールから関数を利用する場合は、`pub fn`で公開し、importした名前空間を通して呼び出します。詳しい構文は[言語リファレンス](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.ja.md)にあります。

## サンプルと一次資料

以下のコード例はCerune本体で管理されています。

- [functions.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/functions.ceru) — 引数、戻り値、`void`
- [function_arguments.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/function_arguments.ceru) — 引数の評価順と値渡し
- [function_values.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/function_values.ceru) — 配列・積型の引数と戻り値
- [generic_functions.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/generic_functions.ceru) — 型・長さパラメーター
- [ir_execution.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/ir_execution.ceru) — 明示的な`main`

このページは仕様の要約です。評価順、型検査、関数の呼び出し規則については[言語リファレンス（一次資料）](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.ja.md)と[関数の設計](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/functions.ja.md)を参照してください。
