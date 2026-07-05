---
name: research-11-paper-writing
description: 研究成果の論文化。タイトル・Abstract・Introduction・Related Work・Method・Experiments・Results・Discussion・Conclusion・References・Appendix を Markdown 論文としてまとめる。ユーザーが「論文を書きたい」「論文化したい」「原稿をまとめたい」「アブストを書きたい」と言ったとき、または research-10-reproducibility の次のステップとして使うこと。
model: opus
---

# 論文執筆(Paper Writing)

`research/` に蓄積した成果物を、一貫した主張を持つ論文(Markdown)にまとめる。

## 前提

開始時に `research/STATUS.md` と research/ 配下の全成果物を読む。特に:
objective.md(動機)、research-gap.md(位置づけ)、related-works.md(引用元)、selected-method.md・algorithm-design.md(手法)、evaluation-report.md・ablation-study.md(実験)、reproducibility.md(再現性)。
投稿先(会議/ジャーナル/なし)と分量の目安をユーザーに確認する。

## 執筆の原則(最重要)

1. **すべての主張に証拠を対応させる**: 性能の主張は experiment-results.md の数値に、新規性の主張は research-gap.md の分析に遡れること。証拠のない主張は書かない
2. **引用は検証済みのものだけ**: References に載せてよいのは related-works.md / literature-review.md に URL/DOI 付きで記録された文献のみ。**記憶から参考文献を生成しない。** 新たに引用が必要なら、先に検索して実在を確認し related-works.md に追記してから使う
3. **記法の一貫性**: 数式・記号は algorithm-design.md の記法表に従う
4. **数値の転記はソースから**: 表の数値は experiment-results.md と突き合わせ、丸め方を統一する

## 進め方

### 1. 骨子の合意

- 論文の中核主張(1 文)と、各セクションの言いたいこと(1 行ずつ)のアウトラインを先に作り、ユーザーに確認する

### 2. 本文執筆(推奨順序)

Method → Experiments → Results → Related Work → Introduction → Discussion → Conclusion → **Abstract とタイトルは最後**。

- **Introduction**: 課題の重要性 → 既存研究の限界 → 本研究の提案 → 貢献の箇条書き(3 点前後、検証済みの事実のみ)
- **Related Work**: related-works.md のカテゴリ構成を流用し、各カテゴリと自研究の差分を明示
- **Method**: 記法表 → 問題設定 → 提案手法。図(flowchart.md)を参照
- **Experiments**: 事前登録した実験計画(セットアップ、データ、ベースライン、指標、シード数)
- **Results**: 主要結果表 + アブレーション表 + 図(research/figures/)。統計的有意性と効果量を併記
- **Discussion**: 結果の解釈、限界(evaluation-report.md の限界を正直に)、将来研究
- **Abstract**: 背景 1 文、課題 1 文、提案 1〜2 文、結果(具体的数値)1〜2 文、意義 1 文

### 3. 出力

```
paper/
    paper.md    # 論文本体(References、Appendix 含む)
```

Appendix には追加実験結果・導出・再現性情報(experiment-guide.md への参照)を置く。

### 4. セルフレビュー

執筆後、別の視点で通読して確認する:
- 貢献の箇条書きと Results の証拠が 1:1 に対応しているか
- 引用がすべて related-works.md に存在するか
- 数値が experiment-results.md と一致するか
- 用語・記法のゆれがないか

### 5. 完了処理

- `research/STATUS.md` を更新
- 次のステップ `/research-12-slide-generation`(発表資料)を案内

## 品質基準

- 過大な主張をしない: 実験で示した範囲を超えて一般化しない
- 限界を隠さない: 限界の正直な記述は査読対応(research-13)で自分を守る
