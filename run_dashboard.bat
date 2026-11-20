@echo off
setlocal

echo ===================================================
echo    Starting MOS Interactive Simulator Dashboard    
echo ===================================================

cd /d "%~dp0"

set PYTHON_CMD=

where python >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set PYTHON_CMD=python
) else (
    where py >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        set PYTHON_CMD=py -3
    ) else if exist "D:\msys64\ucrt64\bin\python.exe" (
        set PYTHON_CMD=D:\msys64\ucrt64\bin\python.exe
    )
)

if "%PYTHON_CMD%"=="" (
    echo [ERROR] Python not found in PATH or standard locations.
    echo Please install Python 3 or add it to PATH.
    pause
    exit /b 1
)

echo Using Python: %PYTHON_CMD%
echo Launching server at http://localhost:8000 ...

start "" http://localhost:8000
%PYTHON_CMD% dashboard\runner\server.py 8000

pause
