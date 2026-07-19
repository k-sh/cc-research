# 研究ワークフロー用スキル群

研究の企画から成果公開までを 14 のスキルで段階的に進めるためのスキル群。
各スキルは `/research-01-planning` のようにスラッシュコマンドとして呼び出せる。

## パイプライン

```text
Phase 1. Planning     research-01-planning
Phase 2. Survey       research-02-literature-review → research-03-gap-analysis
Phase 3. Design       research-04-method-design → research-05-patent-search → research-06-algorithm-design
Phase 4. Development  research-07-implementation
Phase 5. Validation   research-08-evaluation → research-09-ablation-study → research-10-reproducibility
Phase 6. Publication  research-11-paper-writing → research-12-slide-generation / research-13-review-response
Phase 7. Release      research-14-release-preparation
```

順番どおりに使うのが基本だが、各スキルは前段の成果物が無い場合でも
必要な情報をユーザーに質問して単独実行できるように作られている。

## スキル間の受け渡し規約

- 成果物はリポジトリ直下の `research/` `paper/` `presentation/` `release/` に Markdown で保存する。
- 進行状況は `research/STATUS.md` に集約する(各スキルが完了時に追記)。
- 後段のスキルは開始時に `research/STATUS.md` と前段の成果物を読んでから作業する。
- **サブエージェント・並列ジョブに成果物ファイルを直接書き込ませない。** 複数の書き手が同一ファイルへ
  同時に書き込むと、互いの変更を上書きして内容が消失・破損する(競合)。サブエージェントには
  調査・実行結果を回答テキスト(またはジョブごとに独立したログファイル)として返させ、
  `research/` 等へのファイル書き込みは常にスキルの実行主体が単独・逐次で行う
  (該当箇所: `research-02-literature-review`、`research-08-evaluation`、`research-09-ablation-study`)。
- **実験用に書いたコードは自己レビューだけで先に進めない。** 実装者本人の見直しでは、指標の
  定義ミスやデータリークのように実行時エラーにならない不具合を見落としやすい。過去の会話
  コンテキストを渡さない独立したサブエージェントに、(1) 実装中の設計適合・バグレビュー、
  (2) 完成時のダミーデータ(成功するはずのケース/絶対に失敗するはずのケース)での妥当性検証、
  (3) 実データ適用後の結果妥当性レビュー、の3段階でレビューさせ、指摘があれば直して同じ段階を
  やり直してから先に進む(該当箇所: `research-08-evaluation`、`research-09-ablation-study`。
  手順は各スキルの `references/code-review.md` を参照。`research-07-implementation` の設計に
  基づき実装に着手する場合や、他スキルの過程で結果に影響する実行可能なコードを書く場合も
  同様の考え方を適用する)。対象は結果を左右するコアロジックの新規作成・変更時に限り、瑣末な
  変更にまでフルの3段階を毎回回さない(実験1回あたり最大で数回分のサブエージェント起動が
  追加されるため、コストと引き換えになる)。レビュー用サブエージェントには実装者と同格以上の
  モデルを明示的に指定する(同格モデルは同種の見落としを再生産しやすいため)。指摘が解消しない
  場合や見解が割れる場合にレビューを無限に繰り返さないよう、打ち切り基準も各 `code-review.md` に
  定めている。設計との対応関係(設計書の項目とコードの対応漏れ、担当外モジュールへの越境が
  ないか)も Stage 1 で確認し、`git diff`・TODO の grep・テスト実行など機械的に確認できる
  ことは読解より先にコマンドで確認する。「うまくいかなかった」結果は統計の解釈に入る前に
  まず実装バグを疑い、最も単純な(差が最大に出るケースではなく、手計算・目視で正解が分かる
  規模の)ケースで妥当な結果が出るか再評価する。統計指標だけでなく、代表的な出力サンプル
  (画像・生成物など)を独立レビューさせて、目的を実際に達成しているように見えるかも確認する。
  同じ指摘で2回連続 reject されたら、3回目の場当たり的な修正の前に「デバッガー」役の独立
  サブエージェント(root cause 調査、最大2ラウンド)を挟んでから直す。「直った」「うまく
  いった」は記憶や以前の実行結果ではなく、その場で再実行した新しい証拠で宣言する。
- **複数ステップからなる実装は一括で仕上げてから通しで確認しない。** `research-07-implementation`
  でマイルストーンを `research/tasks.md` の具体的なタスク(ID・内容・Boundary・Depends・
  完了条件)にまで分解し、`## Implementation Notes` に横断的な学びを積み上げていく。各タスクは
  過去の会話コンテキストを持たない独立した実装者サブエージェントに委譲してよい(TDD の
  RED→GREEN で実装、レビューア・デバッガーは上記と同じ仕組みを使う)。全タスク完了後は
  統合検証(GO/NO-GO/MANUAL_VERIFY_REQUIRED)を経てから次のステップへ進む。マイルストーン
  ごとにダミーデータで軽く動作確認し、ユーザーと合意のサイクルで進める。実装は専用ブランチで
  進め、段階ごとにコミットし、品質に問題ないことをユーザーと合意できてから元のブランチに
  マージする。
- **ユーザーに結果の確認を依頼する際、図(グラフ・出力サンプルなど)がある場合はテキストの
  羅列だけで済ませない。** 図を埋め込んだ HTML を作成して提示する(Artifact tool が使える
  環境ならそれで公開し、無ければファイルに保存してパスを案内する)。

## 使用モデル(コスト最適化)

| スキル | モデル | 理由 |
|---|---|---|
| research-01-planning | sonnet | 構造化ヒアリングと文書化が中心 |
| research-02-literature-review | sonnet | 検索と整理が中心(並列検索は haiku サブエージェント) |
| research-03-gap-analysis | opus | 文献横断の深い統合・推論が品質を左右する |
| research-04-method-design | opus | 新手法の創出は最も知能感度が高い工程 |
| research-05-patent-search | sonnet | 検索とクレーム比較の構造化作業 |
| research-06-algorithm-design | opus | 数学的定式化・計算量解析の厳密さが必要 |
| research-07-implementation | sonnet | 設計文書の作成が中心 |
| research-08-evaluation | sonnet | 実験実行・統計処理・レポート作成 |
| research-09-ablation-study | sonnet | 同上 |
| research-10-reproducibility | haiku | 環境・依存関係の機械的な棚卸し |
| research-11-paper-writing | opus | 論文の文章品質・論理構成が成果物の価値そのもの |
| research-12-slide-generation | sonnet | 論文からの再構成作業 |
| research-13-review-response | sonnet | コメント分類と回答文作成 |
| research-14-release-preparation | haiku | README・カード類のテンプレート的整備 |

特定の実行だけモデルを変えたい場合は `claude --model opus` のようにセッションモデル側で調整するか、
SKILL.md の `model:` フロントマターを編集する。
