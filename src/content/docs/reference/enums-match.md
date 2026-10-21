---
title: 直和型とmatch
description: Ceruneのenum、選択肢、フィールドの取出し、match文・式、ガード、網羅性。
---

Ceruneの**直和型（`enum`）**は、いくつかの選択肢のうち**どれか一つ**の値を表す型です。検索結果なら、内容を持つ`Found`と内容を持たない`Missing`を一つの型として扱えます。

## enumの定義と値の構築

```cerune
enum Lookup {
    Found { title: string },
    Missing,
}

found: Lookup = Lookup::Found { title: "はじめに" };
missing: Lookup = Lookup::Missing {};
```

`Enum::Variant { field: value }`で値を作ります。**フィールドのない選択肢にも`{}`が必要**です。

- `enum`の選択肢は一つ以上必要です。
- 値を持つ選択肢のフィールドには名前と型を明示します。既定値は指定できません。
- フィールドは数値、文字列、配列、名前付き積型、ほかの直和型などを保持できます。
- `enum`は名前で区別される型です。異なる名前の直和型どうしは暗黙に変換されません。
- 束縛、関数の引数・戻り値、配列、名前付き積型、`const`で使用できます。

## match式：検索結果を文字列にする

`match`は選択肢に応じて**値を返す式**として使えます。次の例はページを検索し、見つかった場合はそのタイトルを、見つからなければ案内文を返します。

```cerune
enum Lookup {
    Found { title: string },
    Missing,
}

fn lookup(key: string) -> Lookup {
    if key == "intro" {
        return Lookup::Found { title: "はじめに" };
    }
    return Lookup::Missing {};
}

fn describe(result: Lookup) -> string {
    return match result {
        Lookup::Found { title: title } if byte_len(title) > 0 => concat("見つかった: ", title),
        Lookup::Found { title: _ } => "タイトルなし",
        Lookup::Missing {} => "未登録",
    };
}

print(describe(lookup("intro")));
print(describe(lookup("other")));
```

出力：

```text
見つかった: はじめに
未登録
```

`=> 式`で書いた各分岐は、**同じ結果の型**を返す必要があります。周囲から期待する型があれば各分岐へ伝わり、なければ最初の分岐の結果から型を決めます。数値型を暗黙には変換しません。式の分岐に文のブロック`{ ... }`を使うことはできません。

## match文：選択肢ごとに処理する

戻り値ではなく処理を実行したい場合は、`=> { 文... }`という**文の分岐**を使います。

```cerune
match lookup("intro") {
    Lookup::Found { title: title } => { print(title); },
    Lookup::Missing {} => { print("未登録"); },
}
```

この例では`はじめに`を表示します。選ばれなかった分岐は実行しません。

選択肢のフィールドは`title: title`で新しい不変のローカル束縛に取り出します。使わないフィールドは`title: _`で捨てます。**パターンに対応するフィールドはそれぞれ束縛するか捨てる必要があります。** 取り出した値は元の値への参照ではなくコピーです。束縛の有効範囲はガードとその分岐内だけです。

## ガードと網羅性

パターンの後の`if 条件`は、**選択肢が一致した場合だけ**評価されます。条件は`bool`型です。偽なら次の分岐を調べます。

上の`describe`では、タイトルが空でない`Found`を先に処理し、残りの`Found`をガードなしの分岐で処理します。

**すべての選択肢に、ガードなしの分岐が必要です。** ガード付き分岐だけでは網羅したことになりません。また、ある選択肢のガードなし分岐の後に、同じ選択肢を再び書くと到達できない分岐としてコンパイル時に診断されます。

`match`は対象の式を**一度評価してコピー**し、分岐をソース記述順に調べます。選んだ分岐の処理や式だけを実行します。元の`mut`な束縛を分岐内で再代入しても、取り出した値は変わりません。

## 関数・ループでの使用

`match`の分岐内の`return`は関数から戻ります。`break`と`continue`は、`match`自身ではなく**外側にあるループ**を対象にします。全分岐で確実に`return`する`match`文は、関数の戻り値の検査にも使用できます。

構築式を`match`の対象に直接書く場合は、ブロック開始の`{`と区別するため、`match (Lookup::Missing {}) { ... }`のように丸括弧で囲みます。

別のファイルから公開された`enum`を使用する場合は`pub enum`と`alias::Enum::Variant`を使用します。詳しくは[モジュール](/reference/modules/)を参照してください。

## 回復可能な結果と実行時停止

`Found`と`Missing`、または`Success`と`Error`のように、**結果を値で表して分岐**できます。ただし`match`はゼロ除算や整数の桁あふれなどの**実行時停止を捕捉する機能ではありません**。回復可能な状態は、問題の演算を実行する前に選択肢として返す必要があります。

具体例は[sum_divide.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/sum_divide.ceru)を参照してください。

## 制限事項

- `enum`のフィールドへの直接アクセスや代入、名前付き積型の`..base`更新式は使用できません。
- パターン全体のワイルドカードと入れ子パターンは未対応です（フィールドを捨てる`field: _`は対応）。
- 選択肢のフィールドの既定値、ジェネリック`enum`、組み込みの汎用`Option`/`Result`、暗黙のエラー伝播は未実装です。
- 値として無限の大きさになる再帰的な型は使用できません。

直和型全体の`==`・`!=`と`print`には対応しています。比較・表示の規則は[複合値の設計](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/aggregate-values.ja.md)を参照してください。

## サンプルと一次資料

- [sum_lookup.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/sum_lookup.ceru) — 検索結果と不在の表現
- [match_values.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/match_values.ceru) — `match`式、ガード、戻り値と`const`
- [match_guards.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/match_guards.ceru) — ガードの評価順、コピー、ループ制御
- [sum_values.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/sum_values.ceru) — 配列・名前付き積型・直和型の値コピー
- [言語リファレンス（一次資料）](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.ja.md)
- [直和型の設計](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/sum-types.ja.md)

このページは実装済み機能の要約です。厳密な評価順、型検査、実行時停止の条件は一次資料を参照してください。
