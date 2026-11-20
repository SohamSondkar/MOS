# run_dashboard.ps1 - Launcher for MOS Interactive Dashboard
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   Starting MOS Interactive Simulator Dashboard    " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$pythonExe = $null
if (Get-Command "python" -ErrorAction SilentlyContinue) {
    $pythonExe = "python"
} elseif (Get-Command "py" -ErrorAction SilentlyContinue) {
    $pythonExe = "py"
} elseif (Test-Path "D:\msys64\ucrt64\bin\python.exe") {
    $pythonExe = "D:\msys64\ucrt64\bin\python.exe"
}

if (-not $pythonExe) {
    Write-Host "[ERROR] Python 3 was not found in PATH or standard paths." -ForegroundColor Red
    exit 1
}

Write-Host "Using Python: $pythonExe" -ForegroundColor Green
Write-Host "Opening browser at http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process "http://localhost:8000"

& $pythonExe "$ScriptDir\dashboard\runner\server.py" 8000
