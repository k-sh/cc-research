#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const args = { force: false, dryRun: false, dir: process.cwd(), help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--force" || arg === "-f") {
      args.force = true;
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--dir") {
      args.dir = argv[++i];
      if (!args.dir) {
        throw new Error("--dir にはパスを指定してください");
      }
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`不明なオプション: ${arg}`);
    }
  }
  return args;
}

function printHelp() {
  console.log(`cc-research — Claude Code の研究ワークフロー用スキルをインストールします

使い方:
  npx github:k-sh/cc-research [オプション]

オプション:
  --dir <path>   インストール先のプロジェクトディレクトリ(既定: カレントディレクトリ)
  --force, -f    既に存在するスキルディレクトリも上書きする(既定: 既存はスキップ)
  --dry-run      実際には書き込まず、行われる操作だけを表示する
  --help, -h     このヘルプを表示する

インストール後は Claude Code で以下のように呼び出せます:
  /research-01-planning <研究テーマの概要>

詳細: https://github.com/k-sh/cc-research`);
}

function copySkills({ dir, force, dryRun }) {
  const sourceRoot = path.join(__dirname, "..", ".claude", "skills");
  const targetRoot = path.join(dir, ".claude", "skills");

  if (!fs.existsSync(sourceRoot)) {
    throw new Error(
      `インストール元のスキルディレクトリが見つかりません: ${sourceRoot}\n` +
        "パッケージの取得が壊れている可能性があります。"
    );
  }

  const skillNames = fs
    .readdirSync(sourceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  if (skillNames.length === 0) {
    throw new Error(`インストール元にスキルが見つかりませんでした: ${sourceRoot}`);
  }

  if (!dryRun) {
    fs.mkdirSync(targetRoot, { recursive: true });
  }

  const installed = [];
  const skipped = [];

  for (const name of skillNames) {
    const source = path.join(sourceRoot, name);
    const target = path.join(targetRoot, name);
    const exists = fs.existsSync(target);

    if (exists && !force) {
      skipped.push(name);
      continue;
    }

    if (!dryRun) {
      fs.cpSync(source, target, { recursive: true });
    }
    installed.push(name);
  }

  return { installed, skipped, targetRoot };
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`エラー: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  if (args.help) {
    printHelp();
    return;
  }

  const targetDir = path.resolve(args.dir);

  let result;
  try {
    result = copySkills({ dir: targetDir, force: args.force, dryRun: args.dryRun });
  } catch (err) {
    console.error(`エラー: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const { installed, skipped, targetRoot } = result;
  const verb = args.dryRun ? "インストールされる予定" : "インストールしました";

  console.log(
    `cc-research: ${installed.length} 個のスキルを ${targetRoot} に${verb}${
      args.dryRun ? "" : "。"
    }`
  );
  for (const name of installed) {
    console.log(`  + ${name}`);
  }
  if (skipped.length > 0) {
    console.log(
      `\n${skipped.length} 個は既に存在するためスキップしました(--force で上書き):`
    );
    for (const name of skipped) {
      console.log(`  - ${name}`);
    }
  }

  if (!args.dryRun && installed.length > 0) {
    console.log(
      `\nClaude Code でこのプロジェクトを開き、/research-01-planning <研究テーマの概要> から始めてください。`
    );
  }
}

main();
