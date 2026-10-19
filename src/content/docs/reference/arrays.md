---
title: 配列
description: Ceruneの固定長配列と動的配列、コピー、要素の更新、反復、制限事項。
---

Ceruneには**固定長配列** `[T; N]` と**動的配列** `[T]`があります。どちらも要素型を持つ値ですが、長さの扱いと生成方法が異なります。

## 固定長配列

`[i64; 3]`は、`i64`の要素を3個持つ型です。長さは型の一部なので、`[i64; 2]`と`[i64; 3]`は異なる型です。

```cerune
values: [i64; 3] = [10, 20, 30];
print(values[1]);      // 20
print(array_len(values)); // 3
```

- 添字は0から始まり、型は`i64`です。
- 要素の型や個数が宣言と合わない配列リテラルは型検査エラーです。
- 長さには正の整数リテラル、対応する整数定数名などを使えます。
- 現在、空の固定長配列リテラルはサポートしていません。

## 動的配列

`[T]`は実行時に長さが決まる配列です。**配列リテラル`[10, 20, 30]`自体は固定長**であり、動的配列へ暗黙変換されません。

```cerune
values: [i64] = array_copy([10, 20, 30]);
print(array_len(values)); // 3
```

| 操作 | 説明 |
| --- | --- |
| `array_copy(values)` | 固定長・動的配列から独立した動的配列を作る |
| `array_copy_range(values, start, end)` | 半開区間`[start, end)`をコピーする |
| `array_repeat::<T>(value, count)` | `value`の独立コピーを`count`個持つ配列を作る |
| `array_len(values)` | 最外側の要素数を`i64`で返す |

`array_copy_range`の開始・終了位置は`i64`で、`0 <= start <= end <= length`を満たす必要があります。空の動的配列は、たとえば`array_copy_range([1], 0, 0)`で作れます。

`array_repeat`は型引数を明示し、個数には非負の`i64`を指定します。負の個数は実行時に停止します。0個でも引数の式は評価されます。

## コピーと要素の更新

配列は**値としてコピー**されます。元の配列を変更しても、コピー済みの配列には影響しません。入れ子の動的配列についてもコピーは独立します。

```cerune
mut values: [i64] = array_copy([10, 20, 30]);
saved: [i64] = values;
values[1] = 99;

print(values); // [10, 99, 30]
print(saved);  // [10, 20, 30]
```

`mut`な束縛を通して要素を更新できます。不変な束縛を通した更新は型検査エラーです。動的配列は、`mut`な束縛へ**異なる長さの配列全体を再代入**することもできますが、要素を末尾に追加する操作とは異なります。

固定長・動的配列とも、負の添字や範囲外参照は実行時に停止します。入れ子の要素代入では、各添字を順に評価・検査し、すべて成功してから右辺を評価します。

## 配列の反復

`for … in`で配列の要素を順に処理できます。

```cerune
values: [i64; 3] = [4, 7, 9];
for (value: infer in values) {
    print(value);
}
```

反復の開始時に**対象の配列を一度評価してコピー**します。そのため、ループ本文で元の配列を変更しても、走査中の要素には反映されません。添字も必要なら`for (index: i64, value: infer in values)`と書きます。

`array_len`は入れ子配列の**最外側の長さ**を返します。文字列のバイト数は`array_len`ではなく`byte_len`を使います。

## 制限事項とメモリ予算

- 動的配列の伸長・要素追加、借用スライス、`const`内の動的配列は未実装です。
- 動的配列の要素領域には既定で64 MiBの予算があります。`--array-heap-limit <bytes>`で変更できます。これはプロセス全体の物理メモリ上限ではありません。
- コピー中は元とコピー先の領域が同時に必要になる場合があります。
- LLVM・QBEなどの生成経路では`--target`の明示や外部ツールが必要です。対象ごとの条件は一次資料で確認してください。

## サンプルと一次資料

以下の実行可能な例はCerune本体で管理されています。

- [array_iteration.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/array_iteration.ceru) — 固定長配列の反復とコピー
- [array_length.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/array_length.ceru) — 要素数と入れ子配列
- [constant_array_lengths.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/constant_array_lengths.ceru) — 定数による配列長
- [dynamic_arrays/copy.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/dynamic_arrays/copy.ceru) — 動的配列のコピー・更新・範囲指定
- [dynamic_arrays/repeat.ceru](https://github.com/Cerune-Lang/Cerune/blob/master/examples/dynamic_arrays/repeat.ceru) — 指定個数による配列生成
- [動的配列のサンプル一覧](https://github.com/Cerune-Lang/Cerune/blob/master/examples/dynamic_arrays/README.md)

このページは要約です。正確な評価順、所有、添字の範囲検査、停止条件は[言語リファレンス](https://github.com/Cerune-Lang/Cerune/blob/master/docs/reference/language.ja.md)と[動的配列の設計](https://github.com/Cerune-Lang/Cerune/blob/master/docs/design/owned-arrays.ja.md)を参照してください。
