# MOS Dashboard Local Runner Backend

This directory contains the lightweight, local-only Python HTTP server that powers the interactive MOS simulator dashboard.

## Overview
- **File:** `server.py`
- **Port:** Default `8000` (auto-fallback to 8001, 8080, 8081 if occupied)
- **Protocol:** HTTP with REST API endpoints and static file serving for `dashboard/`
- **Dependencies:** Pure Python 3 standard library (`http.server`, `subprocess`, `json`, `os`, `sys`, `time`, `re`). No virtual environment or pip packages required.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | Returns project root, binary existence, and server status |
| `GET` | `/api/inputs` | Returns list of available official and custom input files |
| `GET` | `/api/reference_output?phase=1\|2` | Returns content of reference benchmark outputs |
| `POST` | `/api/load_input` | Reads text of requested input file (path-safe) |
| `POST` | `/api/save_custom_input` | Saves custom card deck to `dashboard/workspace/custom_inputs/` |
| `POST` | `/api/build` | Executes GCC compilation (`-Wall -Wextra -std=c11`) for Phase 1 or 2 |
| `POST` | `/api/run` | Executes real C binary with `--trace`, collects output & step events |
| `POST` | `/api/run_tests` | Executes official PowerShell test suite (`test/run_test_phase2.ps1`) |

## Launching Manually
```powershell
python dashboard/runner/server.py 8000
```
Or simply run `run_dashboard.bat` in the project root.
