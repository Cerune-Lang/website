---
title: 名前付き積型
description: Ceruneのtype、フィールド、既定値、構築、更新式、値コピーと制限事項。
---

Ceruneの**名前付き積型（product type）**は、複数の値を名前付きフィールドへまとめる型です。`type`で定義し、型名を使って値を構築します。

## 型の定義と値の構築

```cerune
type Task {
    title: string,
    done: bool = false,
    priority: i64 = 1,
}

task: Task = Task {
    title: "翻訳の確認",
};

print(task.title);    // 翻訳の確認
print(task.done);     // false
print(task.priority); // 1
```

フィールドの型はすべて明示します。型定義のフィールドに`infer`は使えません。

- `title`のように既定値がないフィールドは、値を作るときに必須です。
- `done`と`priority`のような既定値付きフィールドは省略できます。
- 構築式は`field: expression`で名前を指定します。型定義と異なる順序でも構いません。
- フィールドの区切りにはカンマを使い、末尾にも付けられます。
- フィールドには基本型、文字列、配列、別の名前付き積型などを使えます。

## フィールドの参照と型の区別

フィールドの参照には`.`を使います。入れ子になった値にも`group.task.title`のようにアクセスできます。

**型名が異なれば、フィールドの名前や型が同じでも別の型です。** 例えば`Task`と`ArchivedTask`は、同じフィールドを持っていても暗黙に相互変換されません。

型定義はトップレベルに置き、同じファイルであれば型名は定義順によらず参照できます。関数の引数・戻り値や配列要素にも名前付き積型を使えます。

## 新しい値を作る更新式（..base）

更新式は**元の値を保ちながら、一部のフィールドを変更した新しい値**を返します。

```cerune
initial: Task = Task {
    title: "翻訳の確認",
};

completed: Task = Task {
    ..initial,
    done: true,
};

print(initial.done);   // false
print(completed.done); // true
print(completed.title); // 翻訳の確認
```

`Task { ..initial, done: true }`では、まず`initial`を一度評価してコピーし、`done`だけを置き換えます。`title`と`priority`はコピーした値をそのまま引き継ぎ、型定義の既定値を再評価しません。

`Task { ..initial }`のように、何も変更しないコピーもできます。`..base`は**最初に一つだけ**指定できます。別の名前付き型からの更新や、末尾の`..base`はエラーです。

## 直接のフィールド代入はできない

作成後の`task.done = true;`は許可されません。`mut`な束縛であれば、**値全体を再代入**します。

```cerune
mut current: Task = Task { title: "翻訳の確認" };
before: Task = current;

current = Task { ..current, done: true };

print(before.done);  // false
print(current.done); // true
```

名前付き積型は**値として扱われます**。他の束縛へ保存した値は、元の束縛を再代入しても変わりません。内部の配列を含め、コピー後の値は独立して扱います。文字列の内容は不変のままです。

積値全体の`==`・`!=`と`print`にも対応しています。比較と表示の具体的な規則は[複合値の設計](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/aggregate-values.ja.md)を参照してください。

## 式の評価順

**通常の構築**と**元の値からの更新**では、評価する順序が異なります。

| 構文 | 評価順 |
| --- | --- |
| `Task { title: expr, ... }` | 明示したフィールドの式を記述順で評価し、次に省略したフィールドの既定値を型定義順で評価 |
| `Task { ..base, done: expr }` | `base`を一度評価・コピーしてから、変更するフィールドの式を記述順に評価 |

更新式では、省略したフィールドの既定値を再実行しません。すべてのフィールドを明示的に置き換えても、`base`の評価は行います。途中で実行時エラーが起きると、後続の式や値全体の代入は実行しません。

実際の評価順を出力で確認するには、公式の[product_update_order.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/product_update_order.ceru)が使えます。

## 現在の制限

- フィールドを一つも持たない`type Empty {}`と、空の構築式`Type {}`は未対応です。
- 値として無限に入れ子になる再帰型は型検査で診断されます。
- 存在しない・重複したフィールド、必須フィールドの不足、型不一致はコンパイルエラーです。
- フィールドへの直接代入や、フィールド単位の公開指定は未対応です。

別ファイルで公開する型には`pub type`を使います。現在は公開された型の全フィールドを参照できます。詳しくは[モジュール](/reference/modules/)を参照してください。

## サンプルと一次資料

- [product-point.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/product-point.ceru) — 定義、既定値、フィールド参照
- [product_update.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/product_update.ceru) — コピー、入れ子、配列を含む更新
- [product_update_order.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/product_update_order.ceru) — 更新式と既定値の評価順
- [product_arrays.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/product_arrays.ceru) — 名前付き型の配列
- [言語リファレンス（一次資料）](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.ja.md)
- [名前付き積型の設計](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/product-types.ja.md)
- [更新式の設計](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/product-updates.ja.md)

このページは実装済みの機能の要約です。型の検査、評価順、実行時停止の詳細は一次資料で確認してください。
