---
title: 文字列
description: CeruneのUTF-8文字列、不変性、連結、バイト数、エスケープと比較。
---

Ceruneの`string`は、**内容を直接変更できないUTF-8の値**です。二重引用符で囲んで書き、空文字列や日本語も使用できます。

## 不変性と再代入

```cerune
mut greeting: string = "こんにちは";
saved: string = greeting;
greeting = "こんばんは";

print(saved);    // こんにちは
print(greeting); // こんばんは
```

`mut`は**束縛に別の文字列を代入できる**という指定であり、文字列の内容を書き換える機能ではありません。以前に保存した値は変わりません。

文字列は関数の引数・戻り値、名前付き型のフィールド、配列要素、`const`にも使用できます。`mut`な配列の文字列要素は別の文字列に置き換えられますが、文字列の一部分は直接更新できません。

## 文字列の連結（concat）

`concat(left, right)`は2つの文字列を**左から順に一度ずつ評価**し、連結した不変の文字列を返します。

```cerune
fn greet(name: string) -> string {
    return concat("こんにちは、", name);
}

mut message: string = greet("世界");
previous: string = message;
message = concat(message, "！");

print(previous); // こんにちは、世界
print(message);  // こんにちは、世界！
```

再代入する右辺では再代入前の文字列を利用できます。連結では改行やNULも保持します。空の結果は静的な空文字列を使い、それ以外は新しい領域に保存します。

## UTF-8のバイト数（byte_len）

`byte_len(value)`は、**文字数ではなくUTF-8のバイト数**を`i64`で返します。

```cerune
print(byte_len(""));          // 0
print(byte_len("日本語"));    // 9
print(byte_len("😀"));        // 4
print(byte_len("\u{e9}"));    // 2
print(byte_len("e\u{301}"));  // 3
```

「日本語」は3文字でも9バイトです。また、同じ「é」に見える場合でも、`"\u{e9}"`は2バイト、`"e\u{301}"`は3バイトです。Unicodeの正規化は行いません。

引数の式は一度だけ評価されます。リテラル、関数の戻り値、配列要素、`concat`の結果にも使用できます。

## エスケープ

| 表記 | 内容 |
| --- | --- |
| `\"` | 二重引用符 |
| `\\` | バックスラッシュ |
| `\n` / `\r` / `\t` | LF / CR / タブ |
| `\0` | NULバイト |
| `\u{...}` | 1〜6桁の16進数で書くUnicodeスカラー値 |

`\u{...}`の値は`0`〜`10FFFF`で、サロゲート領域`D800`〜`DFFF`を除きます。無効なエスケープと閉じていない引用符はコンパイル時に診断します。ソース中の改行を引用符の中へ直接書かず、`\n`を使ってください。

**NULは文字列の終端を表しません。** `byte_len("A\0B")`は3です。

## 比較と出力

`==`・`!=`は内容全体を比較し、**大文字・小文字を区別し、Unicodeを正規化しません**。

```cerune
composed: string = "\u{e9}";
decomposed: string = "e\u{301}";

print(composed == decomposed); // false
print("Hello" == "hello");     // false
print("A\0B" == "A");          // false
```

`print(value);`は文字列の内容をそのまま書き出し、末尾にLFを1つ追加します。文字列に含まれる改行・NULは取り除きません。一方、IRやBytecodeの観測用テキストでは制御文字をエスケープ表示します。

## メモリ予算と制限事項

`concat`で生成した動的文字列には、既定で**64 MiB**の生存データ予算があります。`--string-heap-limit <bytes>`で変更できます。`const`の評価には独立した予算が適用されます。

**未実装：** 文字列の添字参照、文字数の取得、大小比較、数値への変換、一部分の直接更新。文字列と他の型の暗黙変換も行いません。

文字列は各生成経路で使用できますが、LLVM・QBEへの出力では文字列を使う場合に`--target`が必要です。詳しくは[CLI](/cli/overview/)を参照してください。

## サンプルと一次資料

- [string_values.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/string_values.ceru) — 再代入と比較
- [string_concat.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/string_concat.ceru) — 連結、コピー、改行・NUL
- [string_byte_length.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/string_byte_length.ceru) — UTF-8バイト数と評価順
- [string_lookup.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/string_lookup.ceru) — 文字列をキーにした検索
- [言語リファレンス（一次資料）](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.ja.md#文字列)
- [文字列の設計](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/strings.ja.md)

このページは仕様の要約です。詳細な評価順、メモリの管理、停止条件は一次資料を参照してください。
