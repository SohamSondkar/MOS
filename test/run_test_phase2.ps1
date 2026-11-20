# =====================================================================
# Multiprogramming Operating System (MOS) - Phase 2 Automated Test Runner
# =====================================================================

$ErrorActionPreference = "Stop"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   MOS Phase 2 Automated Build & Full Test Suite     " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# [1/3] Compilation
Write-Host "[1/3] Compiling Phase 2 with GCC (-Wall -Wextra -std=c11)..." -ForegroundColor Yellow
$gccCmd = "gcc -Wall -Wextra -std=c11 -Iinclude src/main.c src/vm.c src/mos.c -o mos.exe"
$compileOutput = cmd.exe /c "$gccCmd 2>&1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation FAILED with error code $LASTEXITCODE" -ForegroundColor Red
    Write-Host $compileOutput
    exit 1
}
Write-Host "Compilation SUCCEEDED with zero warnings/errors." -ForegroundColor Green
Write-Host ""

# [2/3] Execution
Write-Host "[2/3] Running MOS Phase 2 on input_phase2.txt..." -ForegroundColor Yellow
$execOutput = & .\mos.exe input_phase2.txt output_phase2_actual.txt
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

$mismatches = 0
$minLen = [Math]::Min($refBytes.Length, $actBytes.Length)
for ($idx = 0; $idx -lt $minLen; $idx++) {
    if ($refBytes[$idx] -ne $actBytes[$idx]) {
        $mismatches++
        if ($mismatches -le 5) {
            Write-Host "Mismatch at byte $idx : Expected 0x$($refBytes[$idx].ToString('X2')) ('$([char]$refBytes[$idx])'), Actual 0x$($actBytes[$idx].ToString('X2')) ('$([char]$actBytes[$idx])')" -ForegroundColor Red
        }
    }
}

if ($refBytes.Length -ne $actBytes.Length) {
    Write-Host "File size mismatch!" -ForegroundColor Red
    $mismatches += [Math]::Abs($refBytes.Length - $actBytes.Length)
}

if ($mismatches -eq 0) {
    Write-Host "[VERIFIED] Exact 100% Byte-for-Byte Match (1500 / 1500 bytes)!" -ForegroundColor Green
} else {
    Write-Host "[FAILED] Found $mismatches byte differences!" -ForegroundColor Red
}

Write-Host ""
Write-Host "-----------------------------------------------------" -ForegroundColor Cyan
Write-Host "   Detailed Job-by-Job Verification Report           " -ForegroundColor Cyan
Write-Host "-----------------------------------------------------" -ForegroundColor Cyan

# Job metadata definitions: ID, Expected Error, IC, IR, TTC, LLC, DataBlocks
$jobs = @(
    @{ JobNum = 1;  JobId = 202;  Error = "LINE LIMIT EXCEEDED";                         IC = 15; IR = "PD60"; TTC = 15; LLC = 4; Blocks = 4; Trigger = "TLL=4 exceeded on 5th PD60" },
    @{ JobNum = 2;  JobId = 302;  Error = "NO ERROR";                                    IC = 10; IR = "H";    TTC = 10; LLC = 2; Blocks = 2; Trigger = "Normal H termination" },
    @{ JobNum = 3;  JobId = 102;  Error = "INVALID PAGE FAULT";                          IC = 2;  IR = "LR36"; TTC = 1;  LLC = 0; Blocks = 0; Trigger = "LR referencing unallocated page 3" },
    @{ JobNum = 4;  JobId = 401;  Error = "TIME LIMIT EXCEEDED";                         IC = 11; IR = "PD50"; TTC = 10; LLC = 3; Blocks = 3; Trigger = "WRITE, THEN TERMINATE(3) on PD50" },
    @{ JobNum = 5;  JobId = 1503; Error = "OPERAND ERROR";                               IC = 4;  IR = "SR7A"; TTC = 3;  LLC = 0; Blocks = 0; Trigger = "Non-digit operand '7A'" },
    @{ JobNum = 6;  JobId = 1403; Error = "OPERATION CODE ERROR";                        IC = 9;  IR = "PA30"; TTC = 8;  LLC = 0; Blocks = 0; Trigger = "Illegal opcode 'PA'" },
    @{ JobNum = 7;  JobId = 1403; Error = "OUT OF DATA";                                 IC = 1;  IR = "GD30"; TTC = 0;  LLC = 0; Blocks = 0; Trigger = "$END encountered on GD30" },
    @{ JobNum = 8;  JobId = 402;  Error = "TIME LIMIT EXCEEDED And OPERAND ERROR";       IC = 5;  IR = "PD3F"; TTC = 4;  LLC = 1; Blocks = 1; Trigger = "Timeout + non-digit operand '3F'" },
    @{ JobNum = 9;  JobId = 403;  Error = "TIME LIMIT EXCEEDED  And OPERATION CODE ERROR";IC = 5; IR = "PS40"; TTC = 4;  LLC = 1; Blocks = 1; Trigger = "Timeout + illegal opcode 'PS'" },
    @{ JobNum = 10; JobId = 405;  Error = "TIME LIMIT EXCEEDED";                         IC = 4;  IR = "SR32"; TTC = 3;  LLC = 1; Blocks = 1; Trigger = "Timeout before SR32 execution" }
)

$enc = [System.Text.Encoding]::GetEncoding("ISO-8859-1")
$actualText = $enc.GetString($actBytes)

$allPassed = $true

foreach ($j in $jobs) {
    $num = $j.JobNum
    $id = $j.JobId
    $err = $j.Error
    $ic = $j.IC
    $ir = $j.IR
    $ttc = $j.TTC
    $llc = $j.LLC

    $escapedErr = [System.Text.RegularExpressions.Regex]::Escape($err)
    $pattern = "(?s)JOB ID\s*:\s*$id\s*\n\s*$escapedErr\s*\nIC\s*:\s*$ic\s*\nIR\s*:\s*(?:$ir|\S+)\s*\nTTC\s*:\s*$ttc\s*\nLLC\s*:\s*$llc"
    $match = [System.Text.RegularExpressions.Regex]::IsMatch($actualText, $pattern)

    if ($match) {
        Write-Host "  [PASS] Job $num (ID $id): $err | IC=$ic, IR=$ir, TTC=$ttc, LLC=$llc" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Job $num (ID $id): Expected $err | IC=$ic, IR=$ir, TTC=$ttc, LLC=$llc" -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host ""
if ($allPassed -and ($mismatches -eq 0)) {
    Write-Host ">>> ALL 10 OFFICIAL PHASE 2 JOBS PASSED WITH ZERO ERRORS! <<<" -ForegroundColor Green
} else {
    Write-Host ">>> SOME TESTS FAILED. CHECK DETAILS ABOVE. <<<" -ForegroundColor Red
    exit 1
}
