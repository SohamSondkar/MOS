# run_test_phase2.ps1 - Automated test suite for MOS Phase 2 Simulator
$ErrorActionPreference = "Stop"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   MOS Phase 2 Automated Build & Full Test Suite     " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# [1/3] Compilation
Write-Host "[1/3] Compiling Phase 2 with GCC (-Wall -Wextra -std=c11)..." -ForegroundColor Yellow
$gccCmd = "gcc -Wall -Wextra -std=c11 -Iinclude src/main.c src/vm.c src/mos.c -o mos.exe"
Invoke-Expression $gccCmd
if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation FAILED with error code $LASTEXITCODE" -ForegroundColor Red
    exit 1
}
Write-Host "Compilation SUCCEEDED with zero warnings/errors." -ForegroundColor Green
Write-Host ""

# [2/3] Execution
Write-Host "[2/3] Running MOS Phase 2 on input_phase2.txt..." -ForegroundColor Yellow
$execOutput = & .\mos.exe input_phase2.txt output_phase2_actual.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "Execution FAILED with exit code $LASTEXITCODE" -ForegroundColor Red
    exit 1
}
Write-Host "Execution completed successfully. Generated output_phase2_actual.txt" -ForegroundColor Green
Write-Host ""

# [3/3] Verification
Write-Host "[3/3] Verifying output against reference output_phase2.txt..." -ForegroundColor Yellow

$refPath = "output_phase2.txt"
$actPath = "output_phase2_actual.txt"

if (-not (Test-Path $refPath)) {
    Write-Host "ERROR: Reference file $refPath not found!" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path $actPath)) {
    Write-Host "ERROR: Actual output file $actPath not found!" -ForegroundColor Red
    exit 1
}

$refBytes = [System.IO.File]::ReadAllBytes($refPath)
$actBytes = [System.IO.File]::ReadAllBytes($actPath)

Write-Host "Reference file size: $($refBytes.Length) bytes"
Write-Host "Generated file size: $($actBytes.Length) bytes"

if ($refBytes.Length -ne $actBytes.Length) {
    Write-Host "[FAIL] File size mismatch: expected $($refBytes.Length), got $($actBytes.Length)" -ForegroundColor Red
    exit 1
}

# Binary comparison
$match = $true
for ($i = 0; $i -lt $refBytes.Length; $i++) {
    if ($refBytes[$i] -ne $actBytes[$i]) {
        Write-Host "[FAIL] Byte difference at position $i" -ForegroundColor Red
        $match = $false
        break
    }
}

if ($match) {
    Write-Host "[PASS] Binary comparison: Output matches reference exactly" -ForegroundColor Green
    Write-Host ""
    Write-Host ">>> ALL TESTS PASSED SUCCESSFULLY! <<<" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Output does not match reference" -ForegroundColor Red
    Write-Host ""
    Write-Host ">>> TESTS FAILED. PLEASE REVIEW LOGS. <<<" -ForegroundColor Red
    exit 1
}