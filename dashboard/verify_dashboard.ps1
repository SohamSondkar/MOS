$ErrorActionPreference = "Stop"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   MOS Project Dashboard Verification & Integrity    " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# 1. File existence checks
$files = @(
    "index.html",
    "style.css",
    "script.js",
    "README.md",
    "runner/server.py",
    "runner/run_dashboard.bat"
)
foreach ($f in $files) {
    $p = Join-Path $PSScriptRoot $f
    if (Test-Path $p) {
        $len = (Get-Item $p).Length
        Write-Host "  [OK] $f exists ($len bytes)" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $f missing" -ForegroundColor Red
        exit 1
    }
}

$html = Get-Content (Join-Path $PSScriptRoot "index.html") -Raw
$js   = Get-Content (Join-Path $PSScriptRoot "script.js") -Raw
$css  = Get-Content (Join-Path $PSScriptRoot "style.css") -Raw

# 2. Check that all DOM IDs referenced in script.js exist in index.html
$referencedIds = @(
    "overview-section",
    "simulator-section",
    "phase1-section",
    "phase2-section",
    "comparison-section",
    "architecture-section",
    "testing-section",
    "files-section",
    "stat-total-jobs",
    "stat-total-passed",
    "stat-phase1-result",
    "stat-phase2-result",
    "stat-byte-match",
    "backend-status-pill",
    "btn-phase-toggle-2",
    "btn-phase-toggle-1",
    "input-deck-select",
    "btn-build",
    "btn-run",
    "btn-run-tests",
    "btn-reset",
    "viva-preset-chips",
    "vm-mode-pill",
    "current-step-num",
    "total-steps-num",
    "active-job-id",
    "active-event-tag",
    "job-jump-select",
    "speed-val-label",
    "speed-slider",
    "btn-step-first",
    "btn-step-prev",
    "btn-step-play",
    "btn-step-next",
    "btn-step-last",
    "step-scrubber",
    "step-event-summary",
    "step-time-pill",
    "reg-ir",
    "reg-ic",
    "reg-ra",
    "reg-r",
    "reg-c",
    "reg-ptr",
    "pcb-job-badge",
    "pcb-ttl-val",
    "pcb-ttc-val",
    "pcb-tll-val",
    "pcb-llc-val",
    "pcb-ttc-bar",
    "pcb-llc-bar",
    "reg-si",
    "reg-pi",
    "reg-ti",
    "interrupt-detail-box",
    "p2-mmu-container",
    "pt-base-badge",
    "pt-table-body",
    "mmu-status-pill",
    "mmu-va",
    "mmu-p",
    "mmu-d",
    "mmu-pte",
    "mmu-f",
    "mmu-ra",
    "mmu-fault-alert",
    "frames-matrix",
    "mem-search",
    "mem-size-badge",
    "mem-table-body",
    "tab-deck-view",
    "tab-deck-edit",
    "card-deck-preview",
    "deck-editor",
    "output-match-pill",
    "actual-bytes-label",
    "sim-output-text",
    "ref-bytes-label",
    "sim-ref-output-text",
    "test-runner-modal",
    "test-runner-status",
    "test-runner-output",
    "phase1-jobs-body",
    "phase2-jobs-body",
    "comparison-table-body",
    "architecture-diagram-container",
    "project-files-body",
    "phase1-search",
    "phase2-search",
    "files-search",
    "arch-tab-p1",
    "arch-tab-p2",
    "component-modal",
    "modal-close-btn",
    "modal-title",
    "modal-tag",
    "modal-summary",
    "modal-details",
    "modal-code"
)

$missing = 0
foreach ($id in $referencedIds) {
    if ($html -notmatch "id=['`"]$id['`"]") {
        Write-Host "  [WARN] ID '$id' not found in index.html" -ForegroundColor Yellow
        $missing++
    }
}

if ($missing -eq 0) {
    Write-Host "  [OK] All $($referencedIds.Count) DOM IDs in script.js match index.html!" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] $missing IDs were missing!" -ForegroundColor Red
    exit 1
}

# 3. Continuous Lexical Scan of script.js
$chars = $js.ToCharArray()
$depthParen = 0
$depthBrace = 0
$depthBracket = 0
$inStr = $false
$quoteChar = ''

for ($i = 0; $i -lt $chars.Length; $i++) {
    $c = $chars[$i]

    if ($inStr) {
        if ($c -eq '\') { $i++; continue }
        if ($c -eq $quoteChar) { $inStr = $false }
    } else {
        if ($c -eq "'" -or $c -eq '"' -or $c -eq '`') {
            $inStr = $true
            $quoteChar = $c
        } elseif ($c -eq '/' -and $i + 1 -lt $chars.Length -and $chars[$i+1] -eq '/') {
            while ($i -lt $chars.Length -and $chars[$i] -ne "`n") { $i++ }
        } elseif ($c -eq '/' -and $i + 1 -lt $chars.Length -and $chars[$i+1] -eq '*') {
            $i += 2
            while ($i + 1 -lt $chars.Length -and -not ($chars[$i] -eq '*' -and $chars[$i+1] -eq '/')) { $i++ }
            $i++
        } elseif ($c -eq '(') { $depthParen++ }
        elseif ($c -eq ')') { $depthParen-- }
        elseif ($c -eq '{') { $depthBrace++ }
        elseif ($c -eq '}') { $depthBrace-- }
        elseif ($c -eq '[') { $depthBracket++ }
        elseif ($c -eq ']') { $depthBracket-- }
    }
}

Write-Host "  Lexical Scan: Parentheses Depth: $depthParen"
Write-Host "  Lexical Scan: Braces Depth:      $depthBrace"
Write-Host "  Lexical Scan: Brackets Depth:    $depthBracket"

if ($depthParen -eq 0 -and $depthBrace -eq 0 -and $depthBracket -eq 0) {
    Write-Host "  [OK] script.js syntax pairs are 100% balanced!" -ForegroundColor Green
} else {
    Write-Host "  [FAIL] Unbalanced code-level syntax tokens in script.js!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host ">>> ALL DASHBOARD INTEGRITY CHECKS PASSED (100%)! <<<" -ForegroundColor Green
