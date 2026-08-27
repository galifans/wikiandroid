// 调试：打印含"无等价写法"标记的 code-tabs 块的 Java tab 分析
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src";
const files = [];
(function walk(dir) {
  for (const ent of readdirSync(dir)) {
    const p = join(dir, ent);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".md")) files.push(p);
  }
})(ROOT);

const MARK = /无 ?Java ?等价写法|仅支持 ?Kotlin|仅 Kotlin|Kotlin 专属|无 Java 版本|Java 中无等价写法/;

for (const f of files) {
  const src = readFileSync(f, "utf8");
  const lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim().startsWith("::: code-tabs")) continue;
    let j = i + 1;
    const block = [];
    let depth = 1;
    for (; j < lines.length; j++) {
      const t = lines[j].trim();
      if (t.startsWith(":::")) depth--;
      if (depth === 0) break;
      block.push(lines[j]);
    }
    const javaIdx = block.findIndex(l => l.trim().match(/^@tab(:\w+)?\s+Java/));
    const kotlinIdx = block.findIndex(l => l.trim().match(/^@tab(:\w+)?\s+Kotlin/));
    if (javaIdx === -1 || kotlinIdx === -1) continue;
    const javaContent = block.slice(javaIdx + 1, kotlinIdx).join("\n");
    if (!MARK.test(javaContent)) continue;
    const codeLines = javaContent
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith("```") && !l.startsWith("//") && !l.startsWith("/*") && !l.startsWith("*") && !l.startsWith("*/"));
    console.log(`\n=== ${f} line ${i + 1} ===`);
    console.log(`real-code-lines: ${codeLines.length}`);
    console.log(javaContent.split("\n").slice(0, 8).join("\n"));
  }
}
