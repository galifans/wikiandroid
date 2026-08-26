/**
 * 全站 emoji 清理脚本（2026-08-26）
 * 规则：
 *  1. H1-H6 标题前缀 emoji 去除：# 🏗️ Title -> # Title
 *  2. 引用块前缀 emoji 去除：> 📖 进阶阅读 -> > 进阶阅读
 *  3. 面试高频指数星级 -> 文字：⭐⭐⭐⭐⭐ -> 极高（5极高/4高/3中/2较低/1低）
 *  4. 表格/代码/列表 ✅ -> ✓、❌ -> ✗（保留语义，去 emoji 化）
 *  5. ⚠️/⚠ 直接移除（上下文文字已足够表达语义）
 *  6. 表格 ★ 星级 -> 文字（同上映射）
 */
import fs from "node:fs";
import path from "node:path";

const PICT = "(?:\\p{Extended_Pictographic}|[\\u{FE0F}\\u{200D}\\u{2B00}-\\u{2BFF}])";
const headingRe = new RegExp(`^(#{1,6})\\s+(${PICT}+)\\s+(.*)$`, "u");
const quoteRe = new RegExp(`^(>)\\s+(${PICT}+)\\s*(.*)$`, "u");

// 校验正则可用
const reTest = new RegExp(`^#{1,6}\\s+${PICT}+\\s+`, "u");
console.log("regex test # 🏗️ x:", reTest.test("# 🏗️ MVC → MVP"));
console.log("regex test # ☕ x:", reTest.test("# ☕ 语言基础"));
console.log("regex test > 📖 x:", new RegExp(`^>\\s+${PICT}+`, "u").test("> 📖 进阶阅读：x"));

function starToText(starStr) {
  const n = [...starStr].filter((c) => c === "⭐" || c === "★").length;
  if (n >= 5) return "极高";
  if (n === 4) return "高";
  if (n === 3) return "中";
  if (n === 2) return "较低";
  return "低";
}

const stats = { files: 0, heading: 0, quote: 0, stars: 0, starTable: 0, check: 0, warn: 0, title: 0 };

function processMd(file) {
  let content = fs.readFileSync(file, "utf8");
  const crlf = content.includes("\r\n");
  const lines = content.split(/\r?\n/);
  let changed = false;
  const out = [];

  // 检查 frontmatter title 是否含 emoji
  const titleMatch = content.match(/^title:\s*(.+)$/m);
  if (titleMatch && /[\p{Extended_Pictographic}\u{FE0F}]/u.test(titleMatch[1])) {
    stats.title++;
    console.log(`  [title-emoji] ${file} -> ${titleMatch[1].slice(0, 60)}`);
  }

  for (const line of lines) {
    let l = line;

    // 1. 标题前缀 emoji
    const hm = l.match(headingRe);
    if (hm && hm[2].trim().length > 0) {
      l = `${hm[1]} ${hm[3]}`;
      stats.heading++;
      changed = true;
    } else {
      // 2. 引用块前缀 emoji
      const qm = l.match(quoteRe);
      if (qm && qm[2].trim().length > 0) {
        l = `> ${qm[3]}`.replace(/\s+$/, "");
        stats.quote++;
        changed = true;
      }
    }

    // 3. 面试高频指数星级
    const sm = l.match(/(面试高频指数：)([⭐]{1,6})/);
    if (sm) {
      l = l.replace(sm[0], `${sm[1]}${starToText(sm[2])}`);
      stats.stars++;
      changed = true;
    }

    // 4. ✅/❌ -> ✓/✗
    if (l.includes("✅") || l.includes("❌")) {
      const cnt = (l.match(/[✅❌]/g) || []).length;
      l = l.replace(/✅/g, "✓").replace(/❌/g, "✗");
      stats.check += cnt;
      changed = true;
    }

    // 5. ⚠️/⚠ 移除
    if (l.includes("⚠")) {
      const cnt = (l.match(/⚠[\u{FE0F}]?/gu) || []).length;
      l = l.replace(/⚠[\u{FE0F}]?/gu, "");
      // 清理可能产生的双空格
      l = l.replace(/：\s+：/g, "：").replace(/\(\s+\)/g, "()");
      stats.warn += cnt;
      changed = true;
    }

    // 6. 表格 ★ 星级
    if (l.includes("★") && l.trim().startsWith("|")) {
      const starCells = l.match(/[★]{1,6}/g);
      if (starCells) {
        for (const sc of starCells) l = l.replace(sc, starToText(sc));
        stats.starTable++;
        changed = true;
      }
    }

    out.push(l);
  }

  if (changed) {
    fs.writeFileSync(file, out.join(crlf ? "\r\n" : "\n"));
    stats.files++;
  }
}

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (["node_modules", "dist", ".git", "wikiStatic"].includes(f) || f.startsWith(".")) continue;
      walk(p);
    } else if (/\.md$/.test(f)) {
      processMd(p);
    }
  }
}

walk("src");
console.log("\n=== 统计 ===");
console.log(JSON.stringify(stats, null, 2));
