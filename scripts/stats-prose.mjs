// 统计各板块 md 文件的指标：文本行数、mermaid 块数、code-tabs 块数、简单表格数
// 用法：node scripts/stats-prose.mjs [板块目录]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(process.cwd(), 'src');
const SECTIONS = ['android', 'ui', 'network', 'language', 'advanced', 'system', 'engineering', 'interview', 'projects', 'roadmap', 'books', 'about'];

function walk(dir) {
    const out = [];
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) {
            if (name === '.vuepress') continue;
            out.push(...walk(p));
        } else if (name.endsWith('.md') && name !== 'README.md') {
            out.push(p);
        }
    }
    return out;
}

function analyze(file) {
    const src = readFileSync(file, 'utf8');
    const lines = src.split('\n');
    let textLines = 0;
    let mermaid = 0;
    let codeTabs = 0;
    let inCode = false;
    let inMermaid = false;
    let inTable = false;
    let tableRows = 0;
    const simpleTables = []; // { line, rows }

    for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        if (l.trim().startsWith('```')) {
            if (inCode && inMermaid) mermaid++;
            inCode = !inCode;
            inMermaid = inCode && l.includes('mermaid');
            continue;
        }
        if (inCode) continue;
        if (l.trim() === '::: code-tabs' || l.trim().startsWith('::: code-tabs')) { codeTabs++; continue; }
        if (l.trim().startsWith(':::') && !l.trim().startsWith(':::')) continue;
        // 表格检测
        if (l.trim().startsWith('|') && l.trim().endsWith('|')) {
            if (!inTable) { inTable = true; tableRows = 0; }
            tableRows++;
            // 分隔行不算
            if (/^\|[\s\-:|]+\|$/.test(l.trim())) tableRows--;
            continue;
        } else if (inTable) {
            if (tableRows >= 1 && tableRows <= 3) simpleTables.push({ line: i, rows: tableRows });
            inTable = false;
            tableRows = 0;
        }
        const t = l.trim();
        if (t && !t.startsWith('#') && !t.startsWith('>') && !t.startsWith('-') && !t.startsWith('*') && !t.startsWith('|') && !t.startsWith(':::') && !t.startsWith('![') && !t.startsWith('<') && t !== '---') {
            textLines++;
        }
    }
    return { file, textLines, mermaid, codeTabs, simpleTables };
}

const target = process.argv[2];
const sections = target ? [target] : SECTIONS;
let grandTotal = { textLines: 0, mermaid: 0, codeTabs: 0, simpleTables: 0 };

for (const sec of sections) {
    const dir = join(ROOT, sec);
    if (!statSync(dir).isDirectory()) continue;
    const files = walk(dir);
    const rows = files.map(analyze).sort((a, b) => a.textLines - b.textLines);
    const total = rows.reduce((acc, r) => {
        acc.textLines += r.textLines;
        acc.mermaid += r.mermaid;
        acc.codeTabs += r.codeTabs;
        acc.simpleTables += r.simpleTables.length;
        return acc;
    }, { textLines: 0, mermaid: 0, codeTabs: 0, simpleTables: 0 });
    grandTotal.textLines += total.textLines;
    grandTotal.mermaid += total.mermaid;
    grandTotal.codeTabs += total.codeTabs;
    grandTotal.simpleTables += total.simpleTables;

    console.log(`\n=== ${sec} === 文件 ${rows.length} | 文本行 ${total.textLines} | mermaid ${total.mermaid} | codeTabs ${total.codeTabs} | 简单表格 ${total.simpleTables}`);
    for (const r of rows) {
        console.log(`  ${relative(ROOT, r.file).padEnd(52)} text=${String(r.textLines).padStart(4)} mermaid=${r.mermaid} tabs=${r.codeTabs} simpleTables=${r.simpleTables.length}`);
    }
}
console.log(`\n===== 总计 ===== 文本行 ${grandTotal.textLines} | mermaid ${grandTotal.mermaid} | codeTabs ${grandTotal.codeTabs} | 简单表格 ${grandTotal.simpleTables}`);
