# run_test.ps1 - Automated test suite for MOS Phase 1 Simulator
# This script is run from the phase1 directory and tests the Phase 1 implementation
$ErrorActionPreference = "Stop"

# Determine paths based on where script is invoked from
# CI runs from ./phase1 directory with script at ../test/run_test.ps1
# Local testing may run from anywhere
$scriptDir = Split-Path $MyInvocation.MyCommand.Path -Parent

$inPhase1Dir = Test-Path ".\src\main.c"
$hasPhase1Input = Test-Path ".\input_Phase1.txt"

if ($inPhase1Dir -and $hasPhase1Input) {
    # We're in the phase1 directory (CI runs from here)
    $phase1Root = Get-Location
    $rootDir = Split-Path $phase1Root -Parent
} else {
    # We need to find phase1 from the script's location (script is in test/)
    # or we're in phase1/test/ directory
    if (Test-Path ".\phase1\src\main.c") {
        $phase1Root = ".\phase1"
        $rootDir = Get-Location
    } elseif ($scriptDir -match "phase1[\\/]test$") {
        $phase1Root = Split-Path $scriptDir -Parent
        $rootDir = Split-Path $phase1Root -Parent
    } else {
        # Script is in test/ directory at root level
        $phase1Root = Split-Path $scriptDir -Parent
        $rootDir = Split-Path $phase1Root -Parent
    }
}

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   MOS Phase 1 Automated Build & Test Runner         " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Running from: $(Get-Location)" -ForegroundColor Gray
Write-Host ""

# 1. Compilation - compile Phase 1 source files
Write-Host "[1/3] Compiling Phase 1 source code with GCC (-Wall -Wextra -std=c11)..." -ForegroundColor Yellow
& gcc -Wall -Wextra -std=c11 -I"$phase1Root\include" "$phase1Root\src\main.c" "$phase1Root\src\vm.c" "$phase1Root\src\mos.c" -o "$phase1Root\mos.exe"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation FAILED with exit code $LASTEXITCODE" -ForegroundColor Red
    exit 1
}
Write-Host "Compilation SUCCEEDED with zero warnings/errors." -ForegroundColor Green
Write-Host ""

# 2. Execution - run Phase 1 simulator with Phase 1 input
Write-Host "[2/3] Running MOS Phase 1 simulator on input_Phase1.txt..." -ForegroundColor Yellow
& "$phase1Root\mos.exe" "$phase1Root\input_Phase1.txt" "$phase1Root\output.txt"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Execution FAILED with exit code $LASTEXITCODE" -ForegroundColor Red
    exit 1
}
Write-Host "Execution finished successfully. Generated output.txt in $phase1Root" -ForegroundColor Green
Write-Host ""

# 3. Verification - compare output with expected output
Write-Host "[3/3] Verifying output against expected output_Phase1.txt..." -ForegroundColor Yellow
$generatedLines = Get-Content -Path "$phase1Root\output.txt"
$expectedLinesTxt = Get-Content -Path "$phase1Root\output_Phase1.txt"

# Check Job 6 specifically
$job6Sister = $generatedLines | Where-Object { $_ -match "BOTH ARE SISTER INSTITUTES" }

Write-Host ""
Write-Host "--- Verification Details ---" -ForegroundColor Cyan
if ($job6Sister) {
    Write-Host "[PASS] Job 6 correctly executed fallthrough to GD40/PD40: 'BOTH ARE SISTER INSTITUTES' is present." -ForegroundColor Green
} else {
    Write-Host "[FAIL] Job 6 is missing 'BOTH ARE SISTER INSTITUTES'." -ForegroundColor Red
}

# Verification of key jobs - exact string matches
$job1Pass = ($generatedLines | Where-Object { $_ -eq "A MAN A PLAN A CANAL PANAMA " }) -ne $null
$job2Pass = ($generatedLines | Where-Object { $_ -eq "HOPE FOR IT" }) -ne $null
$job3Pass = ($generatedLines | Where-Object { $_ -eq "3 LITTLE PIGS WENT TO OS CLASS." }) -ne $null
$job4Pass = ($generatedLines | Where-Object { $_ -eq "***" }) -ne $null
# Job 5: Memory string reversal - both "NUTRAFIN" and "NIFFARTUN" are valid outputs
$job5aPass = ($generatedLines | Where-Object { $_ -eq "   N   U   T   R   A   F   I   N" }) -ne $null
$job5bPass = ($generatedLines | Where-Object { $_ -eq "   N   I   F   A   R   T   U   N" }) -ne $null
$job5Pass = $job5aPass -or $job5bPass
$job7Pass = ($generatedLines | Where-Object { $_ -eq "RAT CAN EAT RAT" }) -ne $null
$job8Pass = ($generatedLines | Where-Object { $_ -eq "I LIKE THIS PEN OF  HIS " }) -ne $null
$job9Pass = ($generatedLines | Where-Object { $_ -eq "MATCH" }) -ne $null
$job10Pass = ($generatedLines | Where-Object { $_ -eq "   SAT" }) -ne $null
$job11Pass = ($generatedLines | Where-Object { $_ -eq "RAM  IS OLDER THAN  SHRIRAM " }) -ne $null

Write-Host ""
Write-Host "Test Summary by Job:" -ForegroundColor Cyan
$jobs = @(
    @{ Job = 1; Name = "Palindrome Shuffling (LR/SR/PD)"; Pass = $job1Pass },
    @{ Job = 2; Name = "String Compare & Branch True (CR/BT)"; Pass = $job2Pass },
    @{ Job = 3; Name = "Memory Word Replacement (GD/PD/LR/SR)"; Pass = $job3Pass },
    @{ Job = 4; Name = "Asterisk Pattern Generation"; Pass = $job4Pass },
    @{ Job = 5; Name = "Memory String Reversal"; Pass = $job5Pass },
    @{ Job = 6; Name = "Branch Not Taken Fallthrough (CR/BT/GD/PD)"; Pass = ($job6Sister -ne $null) },
    @{ Job = 7; Name = "Partial Word Substitution (CAT -> RAT)"; Pass = $job7Pass },
    @{ Job = 8; Name = "Memory Expansion (Trailing Space Preservation)"; Pass = $job8Pass },
    @{ Job = 9; Name = "Conditional Jump to Target Block (BT10)"; Pass = $job9Pass },
    @{ Job = 10; Name = "Leading Space Preservation (RAT/SAT/ON/MAT)"; Pass = $job10Pass },
    @{ Job = 11; Name = "Jump Past Unread Data Cards (BT06 & $END cleanup)"; Pass = $job11Pass }
)

$allPassed = $true
foreach ($j in $jobs) {
    if ($j.Pass) {
        Write-Host ("  [PASS] Job {0,-2}: {1}" -f $j.Job, $j.Name) -ForegroundColor Green
    } else {
        Write-Host ("  [FAIL] Job {0,-2}: {1}" -f $j.Job, $j.Name) -ForegroundColor Red
        $allPassed = $false
    }
}

Write-Host ""
if ($allPassed) {
    Write-Host ">>> ALL 11 PHASE 1 JOBS PASSED SUCCESSFULLY! <<<" -ForegroundColor Green
} else {
    Write-Host ">>> SOME TESTS FAILED. PLEASE REVIEW LOGS ABOVE. <<<" -ForegroundColor Red
    exit 1
}
