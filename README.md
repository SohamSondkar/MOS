# MOS — Multiprogramming Operating System

A two-phase teaching operating system implementing linear memory (Phase 1) and paged virtual memory (Phase 2) with interrupt-driven execution, PCB management, and trace-based verification.

## Overview

| Aspect | Phase 1 | Phase 2 |
|--------|---------|---------|
| **Memory** | 100-word linear (0–99) | 300-word paged (30 frames × 10 words) |
| **Addressing** | Direct | Virtual (00–99) → Real (0–299) via page table |
| **Page Table** | N/A | 10 entries per job, PTR register |
| **Frame Allocation** | N/A | First-fit across 30 frames |
| **Page Faults** | N/A | On GD/SR only (PI=3), dynamic resolution |
| **Instructions** | 7 (LR, SR, CR, BT, GD, PD, H) | Same 7 |
| **MOS Services** | 3 (READ, WRITE, TERMINATE) | Same 3 |
| **Interrupts** | SI (1,2,3) | SI + PI (1,2,3) + TI (0,2) + Combined (34, 35) |
| **PCB** | JobID, TTL, TLL, TTC, LLC | Extended with same fields |
| **Test Jobs** | 11 | 10 |
| **Verification** | String match | Byte-for-byte (1500/1500) |

## Quick Start

### Prerequisites
- GCC (C11 support) — tested with GCC 11+
- Python 3.8+ (for dashboard)
- Windows: PowerShell 5.1+ or Git Bash

### Build & Run Phase 1
```bash
cd phase1
make
./mos_phase1.exe < ../input_Phase1.txt
# Output: output.txt (compare with output_Phase1.txt)
```

### Build & Run Phase 2
```bash
cd ..
make
./mos.exe < input_phase2.txt
# Output: output_phase2_actual.txt (compare with output_phase2.txt)
```

### Run Automated Tests
```powershell
# Phase 1
.\test\run_test.ps1

# Phase 2
.\test\run_test_phase2.ps1
```

### Launch Dashboard
```powershell
# Windows
.\run_dashboard.ps1
# or
.\run_dashboard.bat

# Manual
cd dashboard\runner
python server.py
# Open http://localhost:5000
```

## Architecture

### Core Components

```
src/
├── main.c          # Loader, INIT, LOAD, execution driver
├── mos.c           # MOS services, interrupt handler, EXECUTEUSERPROGRAM
├── vm.c            # ADDRESSMAP, ALLOCATE, page fault handler
└── include/mos.h   # Data structures, registers, PCB, constants
```

### Memory Model (Phase 2)
```
Virtual Address (00–99)     Page Table (10 entries)     Real Memory (300 words)
┌──────────────┐            ┌──────────────────┐       ┌─────────────────────┐
│ p = VA / 10  │───────────▶│ PageTable[PTR+p] │──────▶│ Frame × 10 + d      │
│ d = VA % 10  │            │ frame # (0–29)   │       │ 30 frames × 10 words│
└──────────────┘            └──────────────────┘       └─────────────────────┘
        ADDRESSMAP()                                                    ALLOCATE()
```

### Interrupt Matrix (9+ Combinations)
| TI | SI | PI | Description | Action |
|----|----|----|-------------|--------|
| 0 | 1 | 0 | GD → READ | Read input card to allocated frame |
| 0 | 2 | 0 | PD → WRITE | Write frame to output |
| 0 | 3 | 0 | H → TERMINATE | Normal termination (EM=0) |
| 0 | 0 | 1 | Invalid opcode | Terminate EM=4 |
| 0 | 0 | 2 | Invalid operand | Terminate EM=5 |
| 0 | 0 | 3 | Page fault (GD/SR) | Allocate frame, update page table, retry |
| 0 | 0 | 3 | Page fault (other) | Terminate EM=6 |
| 2 | * | * | Time limit | Terminate EM=3 (or combined 34/35) |

### PCB Structure
```c
typedef struct {
    int JOBID;      // From $AMJ
    int TTL;        // Total Time Limit (max instructions)
    int TLL;        // Total Line Limit (max output lines)
    int TTC;        // Total Time Counter (instructions executed)
    int LLC;        // Line Counter (lines printed)
} PCB;
```

## Test Suite

### Phase 1 (11 Jobs — Exact String Match)
| Job | Description | Key Test |
|-----|-------------|----------|
| 102 | Palindrome | String compare |
| 201 | Multi-line output | HOPE/NO HOPE/BUT HOPE |
| 3 | Pattern printing | * ** *** ** * |
| 202 | Pattern printing | * ** *** ** * |
| 7 | Matrix transpose | NUTRAFIN/NIFARTUN |
| 301 | String compare | VIT/VIIT |
| 302 | String logic | CAT/RAT sentences |
| 101 | Time limit | TIME LIMIT EXCEEDED |
| 401 | String match | ABCD MATCH |
| 402 | Sentence construction | RAT SAT ON MAT |
| 102 | Compare | RAM OLDER THAN SHRIRAM |

### Phase 2 (10 Jobs — 1500/1500 Byte Match)
| Job | Description | Interrupt Codes |
|-----|-------------|-----------------|
| 202 | Pattern + line limit | PI=2 |
| 302 | String logic (paged) | SI=0, PI=0 |
| 102 | Invalid page fault | PI=3, EM=6 |
| 401 | Time limit | TI=2, EM=3 |
| 1503 | Operand error | PI=2, EM=5 |
| 1403 | Opcode error + Out of data | PI=1, PI=3(SI=1) |
| 402 | Time + Operand | TI=2, PI=2, EM=35 |
| 403 | Time + Opcode | TI=2, PI=1, EM=34 |
| 405 | Time limit | TI=2, EM=3 |
| 404 | Normal termination | SI=3, EM=0 |

## Dashboard

Interactive web-based trace visualizer:

- **Trace Playback** — Play/pause/step/speed controls
- **Register Panel** — IC, IR, R, C, SI, PI, TI live
- **PCB Panel** — JobID, TTL, TLL, TTC, LLC live
- **Interrupt Panel** — SI/PI/TI with descriptions
- **Page Table Visualizer** — 10 entries, valid/invalid, frame mapping
- **Frame Map** — 30 frames, allocation status, job ownership
- **Memory Grid** — 300 words (30×10), color-coded
- **Deck Editor** — Create custom $AMJ/$DTA/$END jobs

Trace format: JSON-lines with event types `INTERRUPT`, `MEM_SET`, `SERVICE_READ`, `SERVICE_WRITE`, `PAGE_FAULT_RESOLVE`, `TERMINATE`.

## Project Structure

```
.
├── src/                    # Phase 2 source
│   ├── main.c
│   ├── mos.c
│   ├── vm.c
│   └── include/mos.h
├── phase1/                 # Phase 1 source
│   ├── src/main.c
│   ├── src/mos.c
│   ├── src/vm.c
│   └── include/mos.h
├── dashboard/              # Interactive trace visualizer
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── runner/server.py
├── test/                   # Automated test scripts
│   ├── run_test.ps1
│   └── run_test_phase2.ps1
├── input_Phase1.txt        # Phase 1 test deck (11 jobs)
├── input_phase2.txt        # Phase 2 test deck (10 jobs)
├── output_Phase1.txt       # Phase 1 golden master
├── output_phase2.txt       # Phase 2 golden master (1500 bytes)
├── AOSPROJECT1.pdf         # Phase 1 specification
├── AOSPROJECT2.pdf         # Phase 2 specification
├── MOS_Project_Task_Distribution.docx
├── run_dashboard.ps1
├── run_dashboard.bat
└── Makefile
```

## Verification

All verification results documented in `Verification_Report.docx`:
- ✅ Phase 1: 11/11 jobs pass (exact string match)
- ✅ Phase 2: 10/10 jobs pass (1500/1500 byte-for-byte)
- ✅ All 12 interrupt combinations verified
- ✅ Page fault handling correct (GD/SR only)
- ✅ PCB limits enforced (TTL/TTC, TLL/LLC)
- ✅ Dashboard all 12 features working
- ✅ Build clean (0 errors, 0 warnings, GCC -Wall -Wextra -std=c11)

## Academic Context

**Course**: Digital Electronics and Microprocessor  
**Institution**: Vishwakarma Institute of Technology, Pune  
**Department**: Information Technology  
**Team**: Roll Nos. 14, 15, 16, 17

## License

MIT License — see [LICENSE](LICENSE)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## References

- Silberschatz, Galvin, Gagne — *Operating System Concepts* (10th ed.)
- Bach — *The Design of the Unix Operating System*
- Arpaci-Dusseau — *Operating Systems: Three Easy Pieces*
- Tanenbaum — *Modern Operating Systems* (4th ed.)
- Stallings — *Operating Systems: Internals and Design Principles*
- McKusick et al. — *The Design and Implementation of the FreeBSD Operating System*