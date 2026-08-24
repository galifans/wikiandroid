# =============================================================
# scripts/sync-wikistatic.ps1
# WikiAndroid wikiStatic sync script
#
# Responsibilities:
#   1. Copy *.md from src/ content modules into wikiStatic/ (skip .vuepress, src/README.md, src/books/)
#   2. Remove orphan *.md files in wikiStatic/ module dirs (never touch wikiStatic/books/)
#   3. Auto-refresh the directory tree between the WIKISTATIC_TREE markers
#      in both the root README.md and wikiStatic/README.md
#
# Usage:
#   npm run sync:static
#   or: powershell -ExecutionPolicy Bypass -File scripts/sync-wikistatic.ps1
# =============================================================

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$srcDir = Join-Path $root "src"
$wikiDir = Join-Path $root "wikiStatic"

# Content modules mirrored from src/ (books is a site page, .vuepress is site config - both skipped)
$modules = @(
    "roadmap", "language", "android", "ui", "jetpack", "network",
    "advanced", "system", "engineering", "interview", "projects", "about"
)

# ---------- 1. Sync md files ----------
$copied = 0
foreach ($m in $modules) {
    $src = Join-Path $srcDir $m
    if (-not (Test-Path $src)) { continue }
    $dst = Join-Path $wikiDir $m
    $files = Get-ChildItem -LiteralPath $src -Recurse -File -Filter "*.md"
    foreach ($f in $files) {
        $rel = $f.FullName.Substring($src.Length).TrimStart("\", "/")
        $target = Join-Path $dst $rel
        $targetDir = Split-Path -Parent $target
        if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
        Copy-Item -LiteralPath $f.FullName -Destination $target -Force
        $copied++
    }
}

# ---------- 2. Remove orphan md files (module dirs only) ----------
$removed = 0
foreach ($m in $modules) {
    $dst = Join-Path $wikiDir $m
    if (-not (Test-Path $dst)) { continue }
    $src = Join-Path $srcDir $m
    Get-ChildItem -LiteralPath $dst -Recurse -File -Filter "*.md" | ForEach-Object {
        $rel = $_.FullName.Substring($dst.Length).TrimStart("\", "/")
        if (-not (Test-Path (Join-Path $src $rel))) {
            Remove-Item -LiteralPath $_.FullName -Force
            $removed++
        }
    }
}

Write-Host "md sync done: $copied copied, $removed removed"

# ---------- 3. Generate directory tree ----------
# Box-drawing chars are built from codepoints so the script stays
# encoding-safe when run under PowerShell 5.1 (UTF-8 w/o BOM scripts).
$cH = [string][char]0x251C + [string][char]0x2500 + [string][char]0x2500 + " "   # "├── "
$cL = [string][char]0x2514 + [string][char]0x2500 + [string][char]0x2500 + " "   # "└── "
$cV = [string][char]0x2502 + "   "                                               # "│   "
$cS = "    "                                                                     # "    "

function Get-TreeLines {
    param([string]$Dir, [string]$Prefix = "")
    $entries = Get-ChildItem -LiteralPath $Dir -Force |
        Where-Object { $_.Name -ne ".git" } |
        Sort-Object @{ Expression = { if ($_.Name -eq "README.md") { 0 } elseif ($_.PSIsContainer) { 1 } else { 2 } } },
                    @{ Expression = { $_.Name.ToLowerInvariant() } }
    $out = [System.Collections.Generic.List[string]]::new()
    for ($i = 0; $i -lt $entries.Count; $i++) {
        $e = $entries[$i]
        $isLast = ($i -eq $entries.Count - 1)
        $connector = if ($isLast) { $cL } else { $cH }
        $childPrefix = $Prefix + $(if ($isLast) { $cS } else { $cV })
        if ($e.PSIsContainer) {
            $out.Add($Prefix + $connector + $e.Name + "/")
            $sub = @(Get-TreeLines -Dir $e.FullName -Prefix $childPrefix)
            foreach ($s in $sub) { $out.Add([string]$s) }
        } else {
            $out.Add($Prefix + $connector + $e.Name)
        }
    }
    return $out.ToArray()
}

$tree = [System.Collections.Generic.List[string]]::new()
$tree.Add("wikiStatic/")
$tree.AddRange([string[]]@(Get-TreeLines -Dir $wikiDir))
$treeText = $tree -join [Environment]::NewLine

# ---------- 4. Refresh WIKISTATIC_TREE marker sections ----------
$script:beginMark = "<!-- WIKISTATIC_TREE:BEGIN -->"
$script:endMark = "<!-- WIKISTATIC_TREE:END -->"
$block = $script:beginMark + "`n" + '```text' + "`n" + $treeText + "`n" + '```' + "`n" + $script:endMark

function Update-TreeSection {
    param([string]$FilePath, [string]$Block)
    if (-not (Test-Path $FilePath)) {
        Write-Warning "File not found, skip tree refresh: $FilePath"
        return
    }
    $content = Get-Content -LiteralPath $FilePath -Raw -Encoding UTF8
    $start = $content.IndexOf($script:beginMark)
    $end = $content.IndexOf($script:endMark)
    if ($start -lt 0 -or $end -lt 0) {
        Write-Warning "WIKISTATIC_TREE markers missing, skip tree refresh: $FilePath"
        return
    }
    $newContent = $content.Substring(0, $start) + $Block + $content.Substring($end + $script:endMark.Length)
    Set-Content -LiteralPath $FilePath -Value $newContent -Encoding UTF8
    Write-Host "Tree refreshed: $FilePath"
}

Update-TreeSection -FilePath (Join-Path $root "README.md") -Block $block
Update-TreeSection -FilePath (Join-Path $wikiDir "README.md") -Block $block

Write-Host "wikiStatic sync completed"
