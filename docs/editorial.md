# Cerune Docs の編集方針 / Editorial policy

## 目的 / Purpose

Cerune DocsはCeruneの言語機能、CLI、コンパイラ内部を短く説明する二次資料です。
厳密な定義は `Cerune-Lang/Cerune` の `docs/` と `examples/` に置きます。

Cerune Docs provides short, factual explanations of Cerune language features, CLI usage,
and compiler internals. The canonical specifications and runnable examples remain in
`Cerune-Lang/Cerune`.

## 日本語

1. 見出しには内容を直接書く。「ここから探す」「次に読む」ではなく「ドキュメント」「関連情報」。
2. 比喩・宣伝文句・抽象的な呼びかけを避ける。「探る」「見にいこう」「革新的」などは使わない。
3. 各ページには具体的な対象、操作例、対応状況、制限を必要に応じて記述する。
4. 未実装の機能を実装済みと断定しない。制限を省いて機能を一般化しない。
5. CLIコマンドとサンプルファイルは本体リポジトリで存在を確認する。
6. 仕様を複製しない。説明には一次資料へのリンクを添える。
7. 日本語と英語で、説明する事実と制限が一致するようにする。
8. 将来の計画は現在の機能と分け、「未実装」「予定」などと明示する。
9. リファレンスのコード例は、説明する機能が名前・入力・出力から分かるようにする。任意の計算結果だけを示す例は避ける。

## English

1. Use descriptive headings such as “CLI commands” or “Limitations” instead of vague calls to action.
2. Avoid metaphors, promotional claims, and vague invitations to “explore” or “discover”.
3. Prefer specific behavior, commands, supported features, and limitations.
4. Do not imply unsupported features are available or omit conditions that affect correctness.
5. Verify CLI commands and example paths against the core repository.
6. Link to primary specifications rather than duplicating normative text.
7. Keep Japanese and English pages consistent in their factual claims.
8. Distinguish proposals and future plans from implemented features.
9. In reference examples, choose names, inputs, and outputs that make the demonstrated behavior clear. Avoid arbitrary numeric results without context.
