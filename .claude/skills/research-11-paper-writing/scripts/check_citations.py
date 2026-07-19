#!/usr/bin/env python3
"""paper/paper.md の References を research/related-works.md と突き合わせる。

「記憶から参考文献を生成しない」原則を機械的に確認するためのスクリプト。
References 内の URL/DOI が related-works.md に実在確認済みとして記録されて
いない場合、記憶から書かれた(=検証していない)引用の可能性が高い。

Usage:
    python scripts/check_citations.py [related-works.md] [paper.md]

引数省略時は research/related-works.md と paper/paper.md を対象にする。
終了コード: 問題なしなら 0、問題ありなら 1。
"""
import re
import sys
from pathlib import Path

URL_RE = re.compile(r'https?://[^\s\)\]>,"\']+')
DOI_RE = re.compile(r'\b10\.\d{4,9}/[^\s\)\]>,"\']+')


def extract_refs(text: str) -> set[str]:
    found = URL_RE.findall(text) + DOI_RE.findall(text)
    return {u.rstrip('.').rstrip('/') for u in found}


def references_section(paper_text: str) -> str:
    m = re.search(r'^#+\s*References\b.*$', paper_text, re.IGNORECASE | re.MULTILINE)
    if not m:
        # References 見出しが見つからない場合は全文を対象にする(フォールバック)
        return paper_text
    rest = paper_text[m.end():]
    m2 = re.search(r'^#+\s+\S', rest, re.MULTILINE)
    return rest[:m2.start()] if m2 else rest


def main() -> int:
    related_path = Path(sys.argv[1] if len(sys.argv) > 1 else "research/related-works.md")
    paper_path = Path(sys.argv[2] if len(sys.argv) > 2 else "paper/paper.md")

    for p in (related_path, paper_path):
        if not p.exists():
            print(f"ERROR: {p} が見つかりません")
            return 1

    verified = extract_refs(related_path.read_text(encoding="utf-8"))
    ref_section = references_section(paper_path.read_text(encoding="utf-8"))
    cited = extract_refs(ref_section)

    unverified = sorted(cited - verified)

    seen: dict[str, int] = {}
    for line in ref_section.splitlines():
        for url in extract_refs(line):
            seen[url] = seen.get(url, 0) + 1
    duplicates = sorted(u for u, c in seen.items() if c > 1)

    ok = True

    if unverified:
        ok = False
        print(f"[NG] related-works.md に存在しない URL/DOI が References に {len(unverified)} 件:")
        print("     (記憶から書かれた引用の可能性。related-works.md で実在確認してから追記すること)")
        for u in unverified:
            print(f"  - {u}")

    if duplicates:
        ok = False
        print(f"[NG] References 内で重複している URL/DOI が {len(duplicates)} 件:")
        for u in duplicates:
            print(f"  - {u}")

    if not cited:
        print("[WARN] References から URL/DOI が 1 件も抽出できませんでした。"
              "見出し名が 'References' か、各エントリに URL/DOI が含まれているか確認してください。")

    if ok and cited:
        print(f"[OK] References の URL/DOI {len(cited)} 件すべてが related-works.md で確認済みです(重複なし)")

    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
