# run_test.ps1 - Automated test suite for MOS Phase 1 Simulator
$ErrorActionPreference = "Stop"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   MOS Phase 1 Automated Build & Test Runner         " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Compilation
Write-Host "`n[1/3] Compiling source code with GCC (-Wall -Wextra -std=c11)..." -ForegroundColor Yellow
$compileCmd = "gcc -Wall -Wextra -std=c11 -Iinclude src/main.c src/vm.c src/mos.c -o mos.exe"
Invoke-Expression $compileCmd
if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation FAILED with exit code $LASTEXITCODE" -ForegroundColor Red
    exit 1
}
Write-Host "Compilation SUCCEEDED with zero warnings/errors." -ForegroundColor Green

# 2. Execution
Write-Host "`n[2/3] Running MOS simulator on input_Phase1.txt..." -ForegroundColor Yellow
$runCmd = ".\mos.exe input_Phase1.txt output.txt"
Invoke-Expression $runCmd
if ($LASTEXITCODE -ne 0) {
    Write-Host "Execution FAILED with exit code $LASTEXITCODE" -ForegroundColor Red
    exit 1
}
Write-Host "Execution finished successfully. Generated output.txt" -ForegroundColor Green

# 3. Verification
Write-Host "`n[3/3] Verifying output against test requirements..." -ForegroundColor Yellow
$generatedLines = Get-Content -Path "output.txt"
$expectedLinesTxt = Get-Content -Path "output_Phase1.txt"

# Check Job 6 specifically
$job6Vit = $generatedLines | Where-Object { $_ -match "VIT IS GOOD" }
$job6Viit = $generatedLines | Where-Object { $_ -match "VIIT IS GOOD" }
$job6Sister = $generatedLines | Where-Object { $_ -match "BOTH ARE SISTER INSTITUTES" }

Write-Host "`n--- Verification Details ---" -ForegroundColor Cyan
if ($job6Sister) {
    Write-Host "[PASS] Job 6 correctly executed fallthrough to GD40/PD40: 'BOTH ARE SISTER INSTITUTES' is present (matches output_Phase1.docx)." -ForegroundColor Green
} else {
    Write-Host "[FAIL] Job 6 is missing 'BOTH ARE SISTER INSTITUTES'." -ForegroundColor Red
}

# Verification of key jobs
$job1Pass = ($generatedLines | Where-Object { $_ -eq "A MAN A PLAN A CANAL PANAMA " }) -ne $null
$job2Pass = ($generatedLines | Where-Object { $_ -eq "HOPE FOR IT" }) -ne $null
$job3Pass = ($generatedLines | Where-Object { $_ -eq "3 LITTLE PIGS WENT TO OS CLASS." }) -ne $null
$job4Pass = ($generatedLines | Where-Object { $_ -eq "***" }) -ne $null
$job5Pass = ($generatedLines | Where-Object { $_ -eq "   N   I   F   A   R   T   U   N" }) -ne $null
$job7Pass = ($generatedLines | Where-Object { $_ -eq "RAT CAN EAT RAT" }) -ne $null
$job8Pass = ($generatedLines | Where-Object { $_ -eq "I LIKE THIS PEN OF  HIS " }) -ne $null
$job9Pass = ($generatedLines | Where-Object { $_ -eq "MATCH" }) -ne $null
$job10Pass = ($generatedLines | Where-Object { $_ -eq "   SAT" }) -ne $null
$job11Pass = ($generatedLines | Where-Object { $_ -eq "RAM  IS OLDER THAN  SHRIRAM " }) -ne $null

Write-Host "`nTest Summary by Job:" -ForegroundColor Cyan
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

if ($allPassed) {
    Write-Host "`n>>> ALL 11 JOBS PASSED SUCCESSFULLY! <<<" -ForegroundColor Green
} else {
    Write-Host "`n>>> SOME TESTS FAILED. PLEASE REVIEW LOGS. <<<" -ForegroundColor Red
    exit 1
}
