# 研究ワークフロー用スキル群

研究の企画から成果公開までを 15 のスキルで段階的に進めるためのスキル群。
各スキルは `/research-01-planning` のようにスラッシュコマンドとして呼び出せる。

## パイプライン

```text
Phase 1. Planning     research-01-planning
Phase 2. Survey       research-02-literature-review → research-03-gap-analysis
Phase 3. Design       research-04-method-design → research-05-patent-search → research-06-algorithm-design
Phase 4. Development  research-07-implementation-plan → research-08-implementation-execution
Phase 5. Validation   research-09-evaluation → research-10-ablation-study → research-11-reproducibility
Phase 6. Publication  research-12-paper-writing → research-13-slide-generation / research-14-review-response
Phase 7. Release      research-15-release-preparation
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
  (該当箇所: `research-02-literature-review`、`research-09-evaluation`、`research-10-ablation-study`)。
- **ソースコード自体の独立レビューは `research-08-implementation-execution` が一手に引き受け、
  他スキルで重複させない。** 実装者本人の見直しでは、指標の定義ミスやデータリークのように
  実行時エラーにならない不具合を見落としやすい。過去の会話コンテキストを渡さない独立した
  サブエージェントに、(1) 設計適合・境界チェック(担当外モジュールへの越境がないか)、
  (2) RED→GREEN でのダミーデータ妥当性検証、の2段階でレビューさせ、指摘があれば直して
  同じ段階をやり直してから先に進む。手順は `research-08-implementation-execution/references/code-review.md`
  を参照。対象は結果を左右するコアロジックの新規作成・変更時に限り、瑣末な変更にまでフルの
  レビューを毎回回さない(サブエージェント起動のコストと引き換えになるため)。`git diff`・
  TODO の grep・テスト実行など機械的に確認できることは読解より先にコマンドで確認する。
- **`research-09-evaluation`・`research-10-ablation-study` はソースレビューを重複させず、
  実データで結果が出た後の「結果の妥当性レビュー」だけを独立サブエージェントに行わせる。**
  「うまくいかなかった」結果は、**「1. 実装 → 2. テストデータ → 3. 環境 → 4. 先行研究に対する
  認識齟齬 → 5. 手法そのもの」の順で原因分析する。** 先行研究や妥当性の高い仮説に基づいて
  いる以上、手法そのものが原因で「全く使い物にならない」結果になることは通常考えにくく、
  手法そのものを疑うのは1〜4を消してからの最後の手段とする: (1) 最も単純な(差が最大に出る
  ケースではなく、手計算・目視で正解が分かる規模の)ケースで妥当な結果が出るか再評価する、
  (2) 複数データソースを組み合わせている場合は座標系・単位・時間軸の不整合を疑う、
  (3) 速度・メモリ等の指標は他プロセスや熱スロットリングなど環境要因を疑う、
  (4) 参考にした先行研究を読み直し理解のズレがないか確認する。統計指標だけでなく、代表的な
  出力サンプル(画像・生成物など)を独立レビューさせて、目的を実際に達成しているように見えるかも
  確認する。**コードの問題が疑われた場合は、この場で Stage を巻き戻すのではなく前工程(実装)に
  戻って直し、再実行してからこのレビューをやり直す。** 手順は各スキルの `references/code-review.md`
  を参照。
- 上記いずれのレビューも、レビュー用サブエージェントには実装者と同格以上のモデルを明示的に
  指定する(同格モデルは同種の見落としを再生産しやすいため。結果解釈を扱うレビューは既定で
  `opus`)。指摘が解消しない場合や見解が割れる場合にレビューを無限に繰り返さないよう、
  同じ指摘で2回連続 reject されたら「デバッガー」役の独立サブエージェント(root cause 調査、
  最大2ラウンド)を挟んでから直し、それでも解消しなければユーザーに判断を仰いで打ち切る、
  という基準を各 `code-review.md` に定めている。「直った」「うまくいった」は記憶や以前の
  実行結果ではなく、その場で再実行した新しい証拠で宣言する。
- **複数ステップからなる実装は一括で仕上げてから通しで確認しない。** `research-07-implementation-plan`
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
- **実装(`research-08-implementation-execution`)では、できる限り単純なダミーデータで
  RED→GREEN を確認してから次のタスクに進む。** 同じダミーケースが実装を直しても繰り返し
  失敗する場合は、実装のバグではなく手法自体の論理(アルゴリズム設計)に問題がある可能性を
  疑い、`research-04-method-design`・`research-06-algorithm-design` への差し戻しを検討する。
- **設計時、仕様のあいまいさ・矛盾を自分の判断で決め打ちしない。** `research-06-algorithm-design`・
  `research-07-implementation-plan` は、詳細化に落とし込む前に参照する仕様書間(または同じ仕様書内)
  にあいまいな記述や矛盾がないかを確認する。見つかった場合は具体的な選択肢とトレードオフを提示し、
  `AskUserQuestion` でユーザーにどの方針で進めるか確認してから先に進む。放置すると後工程
  (実装実行・評価)でようやく発覚し、手戻りが大きくなる。

## 使用モデル(コスト最適化)

| スキル | モデル | 理由 |
|---|---|---|
| research-01-planning | sonnet | 構造化ヒアリングと文書化が中心 |
| research-02-literature-review | sonnet | 検索と整理が中心(並列検索は haiku サブエージェント) |
| research-03-gap-analysis | opus | 文献横断の深い統合・推論が品質を左右する |
| research-04-method-design | opus | 新手法の創出は最も知能感度が高い工程 |
| research-05-patent-search | sonnet | 検索とクレーム比較の構造化作業 |
| research-06-algorithm-design | opus | 数学的定式化・計算量解析の厳密さが必要 |
| research-07-implementation-plan | sonnet | 設計文書の作成が中心 |
| research-08-implementation-execution | sonnet | タスク実装の実行・レビュー委譲が中心 |
| research-09-evaluation | sonnet | 実験実行・統計処理・レポート作成 |
| research-10-ablation-study | sonnet | 同上 |
| research-11-reproducibility | haiku | 環境・依存関係の機械的な棚卸し |
| research-12-paper-writing | opus | 論文の文章品質・論理構成が成果物の価値そのもの |
| research-13-slide-generation | sonnet | 論文からの再構成作業 |
| research-14-review-response | sonnet | コメント分類と回答文作成 |
| research-15-release-preparation | haiku | README・カード類のテンプレート的整備 |

特定の実行だけモデルを変えたい場合は `claude --model opus` のようにセッションモデル側で調整するか、
SKILL.md の `model:` フロントマターを編集する。
