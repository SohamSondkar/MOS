# MOS Architecture Documentation

## System Overview

MOS (Multiprogramming Operating System) is a two-phase teaching OS demonstrating the evolution from linear memory management to paged virtual memory with interrupt-driven execution.

### Phase 1: Linear Memory (100 words)
- Direct addressing: addresses 0–99 map 1:1 to memory
- 7 instructions, 3 MOS services
- Simple loader with control cards ($AMJ, $DTA, $END)
- PCB with time/line limits

### Phase 2: Paged Virtual Memory (300 words)
- 30 frames × 10 words = 300 words physical memory
- 10-entry page table per job (PTR register points to page table frame)
- Virtual addresses 00–99 → Real addresses 0–299 via ADDRESSMAP()
- First-fit frame allocation via ALLOCATE()
- Page faults on GD/SR only (PI=3)
- Full SI/PI/TI interrupt matrix with combined codes 34, 35

---

## Core Data Structures

### Memory (Phase 2)
```c
#define MEMORY_SIZE 300
#define FRAME_SIZE 10
#define NUM_FRAMES 30

MemoryWord Memory[MEMORY_SIZE];     // Physical memory: 300 words
int frame_allocated[NUM_FRAMES];    // Frame allocation bitmap (0=free, 1=allocated)
```

### Page Table
```c
#define PAGE_TABLE_SIZE 10

int PageTable[PAGE_TABLE_SIZE];     // 10 entries per job
int PTR;                            // Page Table Register: frame # containing page table
```

### Registers
```c
int IC;         // Instruction Counter (0-99 virtual)
char IR[4];     // Instruction Register (opcode + operand)
int R;          // General Purpose Register
int C;          // Comparison Flag (0=equal, 1=not equal)
int SI;         // Supervisor Interrupt (1=Read, 2=Write, 3=Terminate)
int PI;         // Program Interrupt (1=Opcode, 2=Operand, 3=Page Fault)
int TI;         // Timer Interrupt (0=None, 2=Time Limit)
```

### PCB (Process Control Block)
```c
typedef struct {
    int JOBID;      // From $AMJ card
    int TTL;        // Total Time Limit (max instructions)
    int TLL;        // Total Line Limit (max output lines)
    int TTC;        // Total Time Counter (instructions executed)
    int LLC;        // Line Counter (lines printed)
} PCB;
```

---

## Virtual Address Translation

```
Virtual Address (VA): 00–99 (2 digits)
    p = VA / 10        // Page number (0–9)
    d = VA % 10        // Displacement within page (0–9)

Page Table Lookup:
    frame = PageTable[PTR + p]    // PTR points to page table frame
                                  // PageTable is in memory at frame PTR

Real Address (RA):
    RA = frame * FRAME_SIZE + d   // frame × 10 + displacement
    RA range: 0–299
```

### ADDRESSMAP() Function
```c
// Returns 1 if translation successful, 0 if page fault (invalid page)
int ADDRESSMAP(int VA, int *RA) {
    int p = VA / 10;
    int d = VA % 10;
    int frame = Memory[PTR * FRAME_SIZE + p].value;  // Page table entry
    if (frame == -1) return 0;  // Page fault
    *RA = frame * FRAME_SIZE + d;
    return 1;
}
```

---

## Frame Allocation

### ALLOCATE() Function
```c
// First-fit allocation across 30 frames
// Returns frame number (0–29) or -1 if full
int ALLOCATE() {
    for (int i = 0; i < NUM_FRAMES; i++) {
        if (!frame_allocated[i]) {
            frame_allocated[i] = 1;
            return i;
        }
    }
    return -1;  // Out of frames
}
```

- Deterministic: `srand(0)` in START() ensures reproducible allocation
- Used for: page table frame, code frames, data frames
- Page table entries updated on each ALLOCATE() call

---

## Interrupt Handling

### Interrupt Codes

| Type | Code | Meaning |
|------|------|---------|
| **SI** (Supervisor) | 1 | READ (GD instruction) |
| | 2 | WRITE (PD instruction) |
| | 3 | TERMINATE (H instruction) |
| **PI** (Program) | 1 | Invalid Opcode |
| | 2 | Invalid Operand (address > 99) |
| | 3 | Page Fault |
| **TI** (Timer) | 0 | No time limit exceeded |
| | 2 | Time Limit Exceeded (TTC == TTL) |

### Combined Codes (TI=2 + PI≠0)
| Combined | Meaning |
|----------|---------|
| 34 | Time Limit + Opcode Error (EM=34) |
| 35 | Time Limit + Operand Error (EM=35) |

### MOS Decision Matrix (simplified)
```
MOS():
  if TI == 2:
    if PI == 1: TERMINATE(EM=34)
    else if PI == 2: TERMINATE(EM=35)
    else: TERMINATE(EM=3)
  else if PI == 1: TERMINATE(EM=4)
  else if PI == 2: TERMINATE(EM=5)
  else if PI == 3:
    if SI == 1 (GD) or (SI == 0 and opcode is SR):
      // Page fault on GD/SR — resolve
      ALLOCATE frame, update page table, retry instruction
    else:
      TERMINATE(EM=6)  // Invalid page fault
  else:
    switch SI:
      case 1: READ(); break
      case 2: WRITE(); break
      case 3: TERMINATE(EM=0); break
```

---

## Instruction Set (7 Instructions)

| Mnemonic | Opcode | Operand | Description |
|----------|--------|---------|-------------|
| LR | `LR` | 2-digit address | Load Register: R ← Memory[VA] |
| SR | `SR` | 2-digit address | Store Register: Memory[VA] ← R |
| CR | `CR` | 2-digit address | Compare Register: C ← (R == Memory[VA]) |
| BT | `BT` | 2-digit address | Branch if True: if C==0, IC ← VA |
| GD | `GD` | 2-digit address | Get Data: SI=1 (READ service) |
| PD | `PD` | 2-digit address | Put Data: SI=2 (WRITE service) |
| H | `H` | (none) | Halt: SI=3 (TERMINATE service) |

### Execution Flow (EXECUTEUSERPROGRAM)
```c
while (1) {
    // FETCH
    ADDRESSMAP(IC, &RA);
    IR = Memory[RA];
    IC++;
    
    // DECODE
    opcode = IR[0..1];
    operand = IR[2..3];
    ADDRESSMAP(operand, &RA);  // May set PI=3
    
    // EXECUTE
    switch(opcode) { ... }
    
    // CHECK LIMITS
    TTC++;
    if (TTC == TTL) { TI = 2; MOS(); }
    if (LLC > TLL) { TERMINATE(EM=2); }
}
```

---

## Loader (Phase 2)

### Control Cards
```
$AMJ<JOBID><TTL><TLL>     // Job header: JobID(4), TTL(4), TLL(4)
$DTA                      // Program/data start
...program cards...       // Instructions/data (10 words per card)
$END                      // Job end
```

### LOAD() Process
1. Read $AMJ → populate PCB (JOBID, TTL, TLL, TTC=0, LLC=0)
2. ALLOCATE page table frame → PTR = frame
3. Initialize page table entries to -1 (invalid)
4. For each program card until $END:
   - ALLOCATE frame for code page
   - Update page table entry
   - Copy 10 words to allocated frame
5. Call MOS_STARTEXECUTION()

---

## MOS Services

### READ() — SI=1 (GD instruction)
- Reads next input card (after $DTA)
- Stores 10 words in allocated frame (from GD operand)
- Advances input pointer

### WRITE() — SI=2 (PD instruction)
- Reads 10 words from frame (from PD operand)
- Writes to output buffer
- Increments LLC
- Checks line limit (LLC > TLL → EM=2)

### TERMINATE() — SI=3 (H instruction) or error
- Prints 6-line status block:
  ```
  JOB ID   : <JOBID>
  <ERROR MESSAGE>
  IC       : <IC>
  IR       : <IR>
  TTC      : <TTC>
  LLC      : <LLC>
  ```
- Error messages by EM code:
  - 0: NO ERROR
  - 1: OUT OF DATA
  - 2: LINE LIMIT EXCEEDED
  - 3: TIME LIMIT EXCEEDED
  - 4: OPERATION CODE ERROR
  - 5: OPERAND ERROR
  - 6: INVALID PAGE FAULT
  - 34: TIME LIMIT EXCEEDED And OPERATION CODE ERROR
  - 35: TIME LIMIT EXCEEDED And OPERAND ERROR

---

## Trace Format (JSON Lines)

Each trace event is one JSON object per line:
```json
{"event_type":"MEM_SET","timestamp":123,"job_id":102,"address":45,"value":1234,"description":"..."}
{"event_type":"SERVICE_READ","timestamp":124,"job_id":102,"frame":3,"data":"INPUT DATA"}
{"event_type":"SERVICE_WRITE","timestamp":125,"job_id":102,"frame":5,"output":"OUTPUT DATA"}
{"event_type":"PAGE_FAULT_RESOLVE","timestamp":126,"job_id":102,"virtual_address":23,"allocated_frame":7}
{"event_type":"INTERRUPT","timestamp":127,"job_id":102,"SI":1,"PI":0,"TI":0,"description":"GD instruction"}
{"event_type":"TERMINATE","timestamp":128,"job_id":102,"EM":0,"IC":21,"TTC":21,"LLC":1}
```

Event types: `MEM_SET`, `SERVICE_READ`, `SERVICE_WRITE`, `PAGE_FAULT_RESOLVE`, `INTERRUPT`, `TERMINATE`

---

## Build System

### Phase 1
```makefile
# phase1/Makefile
CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -Iinclude
TARGET = mos_phase1.exe
SRCS = src/main.c src/mos.c src/vm.c
```

### Phase 2
```makefile
# Makefile
CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -Iinclude
TARGET = mos.exe
SRCS = src/main.c src/mos.c src/vm.c
```

Both compile with zero warnings.

---

## Test Verification

### Phase 1
- 11 official test jobs
- Verification: exact string match against `output_Phase1.txt`
- Run: `.\test\run_test.ps1`

### Phase 2
- 10 official test jobs
- Verification: byte-for-byte match (1500/1500 bytes) against `output_phase2.txt`
- Run: `.\test\run_test_phase2.ps1`

---

## Dashboard Architecture

- **Frontend**: Vanilla HTML5/ES6 (`index.html`, `script.js`, `style.css`)
- **Backend**: Python Flask (`dashboard/runner/server.py`)
- **Communication**: REST API + Server-Sent Events for trace streaming
- **Trace Source**: MOS executable stdout (JSON-lines)

### Panels
1. Register Panel (IC, IR, R, C, SI, PI, TI)
2. PCB Panel (JOBID, TTL, TLL, TTC, LLC)
3. Interrupt Panel (SI/PI/TI with descriptions)
4. Page Table Visualizer (10 entries)
5. Frame Map (30 frames)
6. Memory Grid (300 words, 30×10)
7. Deck Editor (custom job creation)
8. Trace Playback Controls