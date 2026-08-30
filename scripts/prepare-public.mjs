// =============================================================
// scripts/prepare-public.mjs
// WikiAndroid prebuild script (npm run prebuild / auto before build)
//
// Historical note: used to copy wikiStatic/books/ into
// src/.vuepress/public/books/ for direct site downloads.
// Since all books now live in the top-level books/ (GitHub only),
// this script only performs a safety check and exits.
// =============================================================

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const booksSrc = path.join(root, "wikiStatic", "books");

if (!existsSync(booksSrc)) {
    console.warn(`[prepare-public] wikiStatic/books not found (books moved to top-level books/), skip: ${booksSrc}`);
    process.exit(0);
}

// Legacy copy logic kept for safety (e.g. if wikiStatic/books is re-created someday)
import { cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";

const booksDst = path.join(root, "src", ".vuepress", "public", "books");

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
