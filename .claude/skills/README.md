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
