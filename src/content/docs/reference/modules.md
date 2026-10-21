---
title: モジュール
description: Ceruneのimport、pub、名前空間、ファイルの読み込みと公開範囲。
---

Ceruneでは、`import`で別の`.ceru`ファイルにある型・関数・定数を参照できます。名前の衝突を避けるため、**別名（alias）を指定して参照**します。

## ファイルの読み込みと名前空間

`import "相対パス.ceru" as 別名;`を、関数や型の定義、実行文より前に書きます。

```cerune
// main.ceru
import "values.ceru" as values;

item: values::Reading = values::reading(7);
print(item.amount);
```

読み込む側の定義には、外部へ公開するものだけ`pub`を付けます。

```cerune
// values.ceru
pub type Reading { amount: u64, }

pub fn reading(amount: u64) -> Reading {
    return Reading { amount: amount };
}
```

`values::Reading`は型、`values::reading`は関数を参照します。**importの別名は、そのimportを書いたファイル内だけ**で有効です。利用する側の各ファイルに、必要なimportを明示します。

## 公開範囲（pub）

定義は、既定でそのファイルの内部からのみ参照できます。

| 構文 | 外部から使える定義 |
| --- | --- |
| `pub fn` | 関数 |
| `pub type` | 名前付き積型と全フィールド |
| `pub enum` | 直和型の全選択肢とフィールド |
| `pub const` | コンパイル時定数 |

公開関数から同じファイルの非公開補助関数を呼び出すことはできますが、import先からその補助関数を直接呼ぶことはできません。

公開関数の引数・戻り値、公開型のフィールドには、非公開型を含められません。フィールド単位の公開範囲は指定できません。

外部の`enum`の選択肢は`alias::Enum::Variant`、公開された配列長の定数は`alias::COUNT`の形式で参照できます。選択肢と`match`については[直和型とmatch](/reference/enums-match/)を参照してください。

## パスと読み込み順

- import先は、**importを宣言したファイルがあるディレクトリ**からの相対パスで解決します。
- パスには`/`区切りと`.ceru`拡張子が必要です。親ディレクトリを参照する`..`も使えます。
- 絶対パス、ドライブ指定、バックスラッシュは認められません。
- 循環参照、同じ別名の重複、名前の衝突はコンパイル時に診断します。

CLIを実行した作業ディレクトリや環境変数から、import先を追加検索することはありません。

## importしたファイルは実行しない

**importするだけでは初期化処理は実行されません。** 読み込まれるファイルのトップレベルに書けるのは、importと型・関数・定数の定義だけです。

トップレベルの変数宣言や`print`などの実行文は、依存ファイル内では認められません。初期化処理が必要な場合は関数として定義し、プログラムの入口から明示的に呼び出します。

import先に`main`関数があっても自動実行しません。プログラムの入口には、従来どおりトップレベル実行文か引数なしの`fn main() -> void`を使います。

## 仮想標準モジュール

ファイル以外に、`std:`形式の仮想標準モジュールをimportできます。現在は`std:io`が用意されています。

```cerune
import "std:io" as io;
```

`io::read_line(max_bytes)`は行入力を行い、`io::ReadLine`の値を返します。対応するホスト接続や実行ターゲットには制限があります。**Windowsコンソール入力は未対応**です。詳しくは[標準モジュールの設計](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/standard-modules.ja.md)を参照してください。

## 現在の制限

再export、ワイルドカードimport、複数段のモジュール参照、外部の実行時変数へのアクセス、可変なモジュール共有状態は未実装です。パッケージ配布・バージョン解決・動的ロードも対象外です。

## サンプルと一次資料

- [modules/main.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/modules/main.ceru) — `import`と公開型・公開関数の使用
- [modules/values.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/modules/values.ceru) — `pub`と非公開関数
- [modules/sum_lookup.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/modules/sum_lookup.ceru) — 別ファイルの`enum`と`match`
- [modules/constant_array_lengths.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/modules/constant_array_lengths.ceru) — 公開定数を使う配列長
- [モジュールのサンプル一覧](https://github.com/Cerune-Lang/Cerune/blob/master/examples/modules/README.md)

このページは仕様の要約です。名前解決、公開範囲、パスの検査、依存ファイルの扱いは[言語リファレンス](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.ja.md)と[モジュールの設計](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/modules.ja.md)を参照してください。
