// =============================================================
// scripts/sync-wikistatic.mjs
// WikiAndroid wikiStatic sync script (cross-platform Node.js)
//
// Replaces the old PowerShell version so it works on local Windows
// AND Cloudflare Pages Linux build environment.
//
// Responsibilities:
//   1. Copy *.md from src/ content modules into wikiStatic/ (skip .vuepress, src/README.md, src/books/)
//   2. Remove orphan *.md files in wikiStatic/ module dirs (never touch wikiStatic/books/)
//   3. Auto-refresh the directory tree between the WIKISTATIC_TREE markers
//      in both the root README.md and wikiStatic/README.md
//
// Usage:
//   npm run sync:static
// =============================================================

import {
    copyFileSync,
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src");
const wikiDir = path.join(root, "wikiStatic");

// Content modules mirrored from src/ (books is a site page, .vuepress is site config - both skipped)
const modules = [
    "roadmap",
    "language",
    "android",
    "ui",
    "jetpack",
    "network",
    "advanced",
    "system",
    "engineering",
    "interview",
    "projects",
    "about",
];

// ---------- helpers ----------
function listMdFiles(dir) {
    const out = [];
    const walk = (d) => {
        for (const e of readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) {
                walk(p);
            } else if (e.name.toLowerCase().endsWith(".md")) {
                out.push(p);
            }
        }
    };
    walk(dir);
    return out;
}

// ---------- 1. Sync md files ----------
let copied = 0;
for (const m of modules) {
    const src = path.join(srcDir, m);
    if (!existsSync(src)) continue;
    const dst = path.join(wikiDir, m);
    for (const f of listMdFiles(src)) {
        const rel = path.relative(src, f);
        const target = path.join(dst, rel);
        mkdirSync(path.dirname(target), { recursive: true });
        copyFileSync(f, target);
        copied++;
    }
}

// ---------- 2. Remove orphan md files (module dirs only) ----------
let removed = 0;
for (const m of modules) {
    const dst = path.join(wikiDir, m);
    if (!existsSync(dst)) continue;
    const src = path.join(srcDir, m);
    for (const f of listMdFiles(dst)) {
        const rel = path.relative(dst, f);
        if (!existsSync(path.join(src, rel))) {
            rmSync(f, { force: true });
            removed++;
        }
    }
}

console.log(`md sync done: ${copied} copied, ${removed} removed`);

// ---------- 3. Generate directory tree ----------
// Box-drawing chars built from codepoints (encoding-safe on every platform)
const cH = "\u251C\u2500\u2500 "; // "├── "
const cL = "\u2514\u2500\u2500 "; // "└── "
const cV = "\u2502   "; // "│   "
const cS = "    "; // "    "

// README.md first, then dirs, then files; each group sorted by lowercase name
function sortEntries(a, b) {
    const rank = (n) => (n === "README.md" ? 0 : n.endsWith("/") ? 1 : 2);
    const ra = rank(a.display);
    const rb = rank(b.display);
    if (ra !== rb) return ra - rb;
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
}

function getTreeLines(dir, prefix = "") {
    const lines = [];
    const entries = readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.name !== ".git")
        .map((e) => ({ name: e.name, display: e.name + (e.isDirectory() ? "/" : ""), isDir: e.isDirectory() }))
        .sort(sortEntries);
    entries.forEach((e, i) => {
        const isLast = i === entries.length - 1;
        const connector = isLast ? cL : cH;
        const childPrefix = prefix + (isLast ? cS : cV);
        if (e.isDir) {
            lines.push(prefix + connector + e.name + "/");
            lines.push(...getTreeLines(path.join(dir, e.name), childPrefix));
        } else {
            lines.push(prefix + connector + e.name);
        }
    });
    return lines;
}

const treeText = ["wikiStatic/", ...getTreeLines(wikiDir)].join("\n");

// ---------- 4. Refresh WIKISTATIC_TREE marker sections ----------
const beginMark = "<!-- WIKISTATIC_TREE:BEGIN -->";
const endMark = "<!-- WIKISTATIC_TREE:END -->";
const block = `${beginMark}\n\`\`\`text\n${treeText}\n\`\`\`\n${endMark}`;

function updateTreeSection(filePath) {
    if (!existsSync(filePath)) {
        console.warn(`File not found, skip tree refresh: ${filePath}`);
        return;
    }
    let content = readFileSync(filePath, "utf8");
    const start = content.indexOf(beginMark);
    const end = content.indexOf(endMark);
    if (start < 0 || end < 0) {
        console.warn(`WIKISTATIC_TREE markers missing, skip tree refresh: ${filePath}`);
        return;
    }
    const newContent = content.slice(0, start) + block + content.slice(end + endMark.length);
    writeFileSync(filePath, newContent, "utf8");
    console.log(`Tree refreshed: ${filePath}`);
}

updateTreeSection(path.join(root, "README.md"));
updateTreeSection(path.join(wikiDir, "README.md"));

console.log("wikiStatic sync completed");
