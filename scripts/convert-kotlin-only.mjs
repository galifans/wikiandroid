// 转换"仅 Kotlin"的 code-tabs 块：
// Java tab 无真实代码（仅注释说明"无 Java 等价写法"）→ 清空 Java tab 内容，
// 由自定义 CodeTabs 组件识别空 tab → 灰化禁用 + 默认激活 Kotlin。
// 用法: node scripts/convert-kotlin-only.mjs [--dry-run]
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");

// "仅 Kotlin"标记：作者在 Java tab 注释中声明 Java 无等价写法
const MARK = /无 ?Java ?等价写法|仅支持 ?Kotlin|仅 Kotlin|Kotlin 专属|无 Java 版本|Java 中无等价写法|只能由 Kotlin|仅支持 Kotlin DSL/;

const ROOT = "src";
const files = [];
(function walk(dir) {
  for (const ent of readdirSync(dir)) {
    const p = join(dir, ent);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".md")) files.push(p);
  }
})(ROOT);

let totalBlocks = 0;
let convertedBlocks = 0;
let convertedLines = 0;
const perFile = [];

for (const f of files) {
  const src = readFileSync(f, "utf8");
  const lines = src.split("\n");
  let changed = false;
  let fileConv = 0;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim().startsWith("::: code-tabs")) continue;
    totalBlocks++;
    let j = i + 1;
    const blockStart = i;
    let depth = 1;
    let blockEnd = -1;
    for (; j < lines.length; j++) {
      const t = lines[j].trim();
      if (t.startsWith(":::")) depth--;
      if (depth === 0) { blockEnd = j; break; }
    }
    if (blockEnd === -1) continue;
    const javaIdx = -1;
    const findTab = (from, name) => {
      for (let k = from; k < blockEnd; k++) {
        if (lines[k].trim().match(new RegExp(`^@tab(?:\\:\\w+)?\\s+${name}`))) return k;
      }
      return -1;
    };
    const jIdx = findTab(blockStart + 1, "Java");
    const kIdx = findTab(blockStart + 1, "Kotlin");
    if (jIdx === -1 || kIdx === -1 || kIdx < jIdx) continue;
    // Java tab 内容 = jIdx+1 .. kIdx-1
    const javaLines = lines.slice(jIdx + 1, kIdx);
    const javaText = javaLines.join("\n");
    const hasMark = MARK.test(javaText);
    const realCode = javaLines
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith("```") && !l.startsWith("//") && !l.startsWith("/*") && !l.startsWith("*") && !l.startsWith("*/"));
    if (!hasMark || realCode.length > 0) continue; // 非"仅 Kotlin"块（无标记 / Java 有真实代码）
    // 清空 Java tab 内容：保留一个空行
    const removed = javaLines.length;
    const replacement = [""];
    lines.splice(jIdx + 1, removed, ...replacement);
    changed = true;
    fileConv++;
    convertedBlocks++;
    convertedLines += removed;
    i = kIdx; // 跳过已处理的块（外层 for 会 i++）
  }
  if (changed) {
    if (DRY_RUN) {
      perFile.push({ file: f, blocks: fileConv });
    } else {
      writeFileSync(f, lines.join("\n"), "utf8");
      perFile.push({ file: f, blocks: fileConv });
    }
  }
}

console.log(`code-tabs blocks scanned: ${totalBlocks}`);
console.log(`kotlin-only blocks converted: ${convertedBlocks} (${convertedLines} lines removed)${DRY_RUN ? " [DRY-RUN]" : ""}`);
for (const p of perFile) console.log(`  ${p.file}: ${p.blocks} blocks`);
