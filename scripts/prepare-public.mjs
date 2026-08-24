// =============================================================
// scripts/prepare-public.mjs
// WikiAndroid prebuild script (npm run prebuild / auto before build)
//
// Responsibilities:
//   Copy wikiStatic/books/ (PDF single source of truth) into
//   src/.vuepress/public/books/ so VuePress build publishes them at
//   https://wikiandroid.com/books/*.pdf (direct download, Cloudflare CDN).
//
// Notes:
//   - Cross-platform (Node.js): works on local Windows AND Cloudflare Pages
//     Linux build environment (DO NOT use PowerShell here - CI has no `powershell`).
//   - PDF files are ONLY stored in wikiStatic/books/ (repo);
//     src/.vuepress/public/books/ is a build-time copy and is gitignored.
//   - Cloudflare Pages single-file limit: 25 MiB. Keep books under that.
// =============================================================

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const booksSrc = path.join(root, "wikiStatic", "books");
const booksDst = path.join(root, "src", ".vuepress", "public", "books");

if (!existsSync(booksSrc)) {
    console.warn(`[prepare-public] wikiStatic/books not found, skip: ${booksSrc}`);
    process.exit(0);
}

// 1. Clean old copy so removed books never linger in dist
if (existsSync(booksDst)) {
    rmSync(booksDst, { recursive: true, force: true });
}

// 2. Copy fresh
mkdirSync(path.dirname(booksDst), { recursive: true });
cpSync(booksSrc, booksDst, { recursive: true });

// 3. Count pdfs for the log line
function countPdf(dir) {
    let n = 0;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            n += countPdf(p);
        } else if (e.name.toLowerCase().endsWith(".pdf")) {
            n++;
        }
    }
    return n;
}

console.log(`[prepare-public] public/books prepared: ${countPdf(booksDst)} pdf(s) -> ${booksDst}`);
