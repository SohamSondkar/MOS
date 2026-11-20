# MOS Phase 1 & Phase 2 Interactive Simulator Dashboard

This is a comprehensive, interactive web-based simulator dashboard for the **Multiprogramming Operating System (MOS)** project located at `D:\OS\CP`.

It controls, builds, and visualizes the **actual compiled C programs** (`mos.exe` for Phase 2 and `mos_phase1.exe` for Phase 1) with real-time execution trace playback, hardware register inspection, paging and frame allocation visualization, output diffing, and official automated test suite execution.

---

## 🚀 Quick Start (One-Click Launch)

### Option 1: Double-Click Launcher (Recommended)
1. In the project root (`D:\OS\CP\`), double-click **`run_dashboard.bat`** (or `run_dashboard.ps1`).
2. This launches the local Python runner server at `http://localhost:8000` and automatically opens the dashboard in your default web browser.

### Option 2: Command Line (PowerShell)
```powershell
cd D:\OS\CP
.\run_dashboard.ps1
```

### Option 3: Direct Static File (Offline Fallback Mode)
If Python is not running, double-click `dashboard/index.html`. The dashboard will load in offline presentation mode with preloaded simulation trace data so you can still step through and demonstrate the simulator.

---

## 🏛️ Architecture & How It Works

```
[ Frontend: HTML/CSS/JS Dashboard ] (http://localhost:8000)
                │  ▲
    REST API    │  │  Trace Events & Output JSON
    (localhost) ▼  │
[ Backend: Python HTTP Runner ] (dashboard/runner/server.py)
                │  ▲
    Subprocess  │  │  stdout, stderr, --trace .jsonl
                ▼  │
[ Real C Executable ] (mos.exe / mos_phase1.exe)
```

1. **Invocation:** The dashboard sends a request to the local runner (`/api/run` or `/api/build`). The runner launches the real C executable (`mos.exe` or `mos_phase1.exe`) with fixed arguments and an optional `--trace <path>` flag.
2. **Safe Input Passing:** The runner safely passes inputs from allowlisted paths or writes temporary custom decks to `dashboard/workspace/custom_inputs/`.
3. **Trace Extraction:** When `--trace` is passed, the C simulator logs structured JSON lines representing real machine events (`JOB_START`, `ALLOC_PAGE_TABLE`, `LOAD_PROG`, `MEM_SET`, `FETCH`, `DECODE`, `EXECUTE`, `PAGE_FAULT_RESOLVE`, `SERVICE_READ`, `SERVICE_WRITE`, `TERMINATE`).
4. **Zero Overhead on Normal Mode:** When `--trace` is not passed (such as during official grading or automated test scripts `test/run_test_phase2.ps1`), tracing is completely bypassed with zero performance overhead and 100% byte fidelity.

---

## 🖥️ Key Dashboard Features

### 1. Main Control Panel
- **Phase Toggle:** Seamlessly switch between **Phase 2 (Paged 300 words / 30 frames)** and **Phase 1 (Linear 100 words)**.
- **Input Deck Picker:** Choose official test inputs (`input_phase2.txt`, `phase1/input_Phase1.txt`) or custom saved decks.
- **Action Buttons:**
  - `🔨 Build C Program`: Compiles modular C code using `gcc -Wall -Wextra -std=c11` (0 warnings).
  - `▶ Run & Load Execution Trace`: Runs the C simulator and loads step events.
  - `🧪 Run Official Tests`: Runs the official PowerShell test runner and displays live output.
  - `🔄 Reset`: Clears execution state back to initial state.
- **1-Click Viva Demo Presets:** Instant buttons to jump to Job 1 (Line Limit), Job 2 (Normal Halt), Job 3 (Invalid Page Fault), Job 4 (Time Limit), Job 5 (Operand Error), Job 6 (Opcode Error), Job 7 (Out of Data), Job 8 (TI+PI2), Job 9 (TI+PI1), Job 10 (TI+PI3).

### 2. Live Execution Timeline & Playback Controller
- **Hardware Mode Pill:** Shows whether the system is in `SLAVE MODE (CPU)` or `MASTER MODE (KERNEL / MOS)`.
- **Playback Controls:** First (`⏮`), Previous (`◀`), Play/Pause (`▶`), Next (`▶`), Last (`⏭`).
- **Scrubber Bar & Speed Slider:** Jump to any step instantly or adjust auto-play speed (50ms to 1000ms).
- **Keyboard Shortcuts:** `Space` (Play/Pause), `Arrow Right` (Next), `Arrow Left` (Prev), `Home` (First), `End` (Last).

### 3. Hardware Registers & Virtual Machine Inspector
- **CPU Registers:** `IR` (with opcode and operand), `IC` (virtual address and real physical address), `R` (4-byte general register), `C` (comparison toggle), `PTR` (page table base).
- **Process Control Block (PCB):** Real-time execution tracking of `TTC / TTL` and `LLC / TLL` with animated progress bars.
- **Interrupt Vector Flags:** `SI` (1=Read, 2=Write, 3=Halt), `PI` (1=Opcode, 2=Operand, 3=Page Fault), `TI` (2=Timer). Active flags glow red.

### 4. Phase 2 MMU, Page Table & 30-Frame Allocator
- **Page Table Inspector:** 10-row table showing virtual pages (0..9) &rarr; allocated physical frames with active row highlight.
- **MMU Translation Flow:** Visual formula `VA ➔ p, d ➔ M[PTR+p] ➔ Frame f ➔ Real Address RA`.
- **30 Physical Frames Matrix:** Visual grid of all 30 memory frames color-coded by type (🟣 PTR, 🟢 Program, 🔵 Data, ⚪ Free).

### 5. Interactive Memory Grid
- **Word-Level Inspection:** Full 300 words (Phase 2) or 100 words (Phase 1) displayed with word addresses, frames, raw text, and ASCII preview.
- **Real-Time Glowing Highlights:** Amber highlight for Instruction Counter (`IC`), Blue highlight for Operand Word address.
- **Search & Filter:** Search words by address or text.

### 6. Card Deck Viewer & Custom Editor
- **Syntax-Highlighted Deck View:** Colorizes `$AMJ`, `$DTA`, `$END`, instructions, and data cards.
- **Custom Deck Editor:** Type custom test decks, click **Save Deck**, or click **Run Custom in C Simulator** to test custom edge cases.

### 7. Output Console & Benchmark Diff
- **Actual C Output:** Displays exact output stream generated by `mos.exe`.
- **Reference Output:** Displays authoritative benchmark output side-by-side.
- **Binary Match Badge:** Verifies 100% byte-for-byte binary match (`1,500 / 1,500 Bytes`).
- **Download / Copy:** One-click output text file download and clipboard copy.

### 8. Official Test Runner Modal
- Runs `test/run_test_phase2.ps1` or `phase1/test/run_test.ps1` and displays live terminal logs confirming 10/10 PASS or 11/11 PASS.

---

## 🔒 Security & Localhost Isolation
- **Localhost Only:** Server binds exclusively to `127.0.0.1`.
- **Safe Subprocess Execution:** Fixed allowlisted commands (`gcc`, `mos.exe`, `mos_phase1.exe`, PowerShell test scripts). No arbitrary shell execution.
- **Safe Path Traversal Checks:** File operations are strictly locked to `D:\OS\CP\`.
- **Protected Baseline:** Official test inputs (`input_phase2.txt`, `phase1/input_Phase1.txt`) and expected outputs (`output_phase2.txt`) are read-only.
