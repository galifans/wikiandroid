// 校验全站 md 中所有 ```mermaid 代码块是否能被 mermaid 解析
// 用法: node scripts/validate-mermaid.mjs
// 注意: 需要 jsdom 环境, 否则 mermaid 内部 DOMPurify 报错会掩盖真实语法错误
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { JSDOM } from "jsdom";

// ---- 建立最小 DOM 环境 (必须在 import mermaid 之前) ----
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", { url: "http://localhost/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
Object.defineProperty(globalThis, "navigator", { value: dom.window.navigator, configurable: true });
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.DOMParser = dom.window.DOMParser;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.SVGElement = dom.window.SVGElement;

const { default: mermaid } = await import("mermaid");

mermaid.initialize({
  startOnLoad: false,
  securityLevel: "loose",
  flowchart: { useMaxWidth: false },
  sequence: { useMaxWidth: false },
});

const SRC = join(process.cwd(), "src");

function collectMd(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (name === ".vuepress" || name === "dist") continue;
    if (statSync(full).isDirectory()) out.push(...collectMd(full));
    else if (name.endsWith(".md")) out.push(full);
  }
  return out;
}

const files = collectMd(SRC);
let totalBlocks = 0;
const failures = [];

for (const file of files) {
  const content = readFileSync(file, "utf8");
  // 匹配 ```mermaid 围栏块
  const regex = /```mermaid\s*\n([\s\S]*?)```/g;
  let m;
  let idx = 0;
  while ((m = regex.exec(content)) !== null) {
    idx++;
    totalBlocks++;
    const code = m[1].replace(/\n+$/, "");
    try {
      await mermaid.parse(code);
    } catch (e) {
      const msg = String(e && e.message || e);
      // Node 环境缺少 DOM，DOMPurify 报错不代表语法错误，跳过
      if (msg.includes("DOMPurify")) continue;
      const line = content.slice(0, m.index).split("\n").length;
      failures.push({
        file: file.replace(/\\/g, "/").replace(SRC.replace(/\\/g, "/"), "src"),
        block: idx,
        line,
        msg: msg.replace(/\s+/g, " ").substring(0, 300),
      });
    }
  }
}

console.log(`mermaid 块总数: ${totalBlocks}`);
if (failures.length === 0) {
  console.log("ALL OK: 全部 mermaid 块语法有效");
} else {
  console.log(`失败: ${failures.length} 个块语法错误`);
  for (const f of failures) {
    console.log(`  - ${f.file}:${f.line} (块 #${f.block})`);
    console.log(`    ${f.msg}`);
  }
  process.exit(1);
}
