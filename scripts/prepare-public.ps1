# =============================================================
# scripts/prepare-public.ps1
# WikiAndroid prebuild script (npm run prebuild / auto before build)
#
# Responsibilities:
#   Copy wikiStatic/books/ (PDF single source of truth) into
#   src/.vuepress/public/books/ so VuePress build publishes them at
#   https://wikiandroid.com/books/*.pdf (direct download without GitHub).
#
# Notes:
#   - PDF files are ONLY stored in wikiStatic/books/ (repo);
#     src/.vuepress/public/books/ is a build-time copy and is gitignored.
#   - Cloudflare Pages single-file limit: 25 MiB. Keep books under that.
# =============================================================

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$srcPublic = Join-Path $root "src\.vuepress\public"
$booksSrc = Join-Path $root "wikiStatic\books"
$booksDst = Join-Path $srcPublic "books"

if (-not (Test-Path $booksSrc)) {
    Write-Warning "wikiStatic/books not found, skip public/books copy: $booksSrc"
    exit 0
}

# 1. Clean old copy so removed books never linger in dist
if (Test-Path $booksDst) {
    Remove-Item -LiteralPath $booksDst -Recurse -Force
}

# 2. Copy fresh
Copy-Item -LiteralPath $booksSrc -Destination $booksDst -Recurse -Force

$count = (Get-ChildItem -LiteralPath $booksDst -Recurse -File -Filter "*.pdf").Count
Write-Host "public/books prepared: $count pdf(s) -> $booksDst"
