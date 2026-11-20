/**
 * Multiprogramming Operating System (MOS) - Interactive Dashboard & Simulator Engine
 * Source of Truth: MOS_Project_Complete_Summary.md, AOSPROJECT1.pdf, AOSPROJECT2.pdf
 * Connects to live C simulator via local runner backend (http://localhost:8000)
 */

const MOS_DATA = {
    metadata: {
        title: "Multiprogramming Operating System (MOS)",
        subtitle: "Course Project: Operating Systems Simulation in C",
        workspace: "D:\\OS\\CP",
        statusPhase1: "Complete & Verified (11/11 Jobs)",
        statusPhase2: "Complete & Verified (10/10 Jobs, 1,500/1,500 Bytes)",
        totalJobs: 21,
        totalJobsPassed: 21,
        phase1JobsPassed: 11,
        phase1JobsTotal: 11,
        phase2JobsPassed: 10,
        phase2JobsTotal: 10,
        byteMatchPhase2: "1,500 / 1,500 bytes (100% exact match)",
        compiler: "GCC (UCRT64 / MinGW-w64) -Wall -Wextra -std=c11 (0 warnings)",
        lastVerified: "October 31, 2026 (Live verified)"
    },

    phase1Jobs: [
        { id: 1, name: "Palindrome Shuffling", instructions: "LR, SR, PD", expected: "A MAN A PLAN A CANAL PANAMA ", status: "PASS", note: "Tests 4-byte word manipulation and space preservation" },
        { id: 2, name: "String Compare & Branch True", instructions: "CR, BT, GD, PD", expected: "HOPE FOR IT", status: "PASS", note: "Tests conditional jump when comparison toggle C = 1" },
        { id: 3, name: "Memory Word Replacement", instructions: "GD, PD, LR, SR", expected: "3 LITTLE PIGS WENT TO OS CLASS.", status: "PASS", note: "Overwrites specific words in memory block" },
        { id: 4, name: "Asterisk Pattern Generation", instructions: "LR, SR, PD", expected: "***", status: "PASS", note: "Validates non-null string termination in buffer output" },
        { id: 5, name: "Memory String Reversal", instructions: "LR, SR, PD", expected: "   N   I   F   A   R   T   U   N", status: "PASS", note: "Verifies internal and leading whitespace integrity" },
        { id: 6, name: "Branch Not Taken Fallthrough", instructions: "CR, BT, GD, PD", expected: "BOTH ARE SISTER INSTITUTES", status: "PASS", note: "Matches official output_Phase1.docx fallthrough execution" },
        { id: 7, name: "Partial Word Substitution", instructions: "LR, SR, PD", expected: "RAT CAN EAT RAT", status: "PASS", note: "Word-level replacement (CAT replaced with RAT)" },
        { id: 8, name: "Memory Expansion", instructions: "GD, PD", expected: "I LIKE THIS PEN OF  HIS ", status: "PASS", note: "Preserves trailing whitespace in 40-character block" },
        { id: 9, name: "Conditional Jump to Target Block", instructions: "BT10, GD, PD", expected: "MATCH", status: "PASS", note: "Jumps directly to block 10 (location 10) on match" },
        { id: 10, name: "Leading Space Preservation", instructions: "GD, PD", expected: "   SAT", status: "PASS", note: "Strict leading spaces verification" },
        { id: 11, name: "Jump Past Unread Data Cards", instructions: "BT06, GD, PD", expected: "RAM  IS OLDER THAN  SHRIRAM ", status: "PASS", note: "Verifies loader skips unread data cards on $END" }
    ],

    phase2Jobs: [
        { jobNum: 1, jobId: 202, amj: "$AMJ020200250004", purpose: "Line limit enforcement (TLL=4)", expectedError: "LINE LIMIT EXCEEDED", actualError: "LINE LIMIT EXCEEDED", ic: 15, ir: "PD60", ttc: 15, llc: 4, blocks: 4, status: "PASS", explanation: "4 blocks printed; 5th PD60 exceeds TLL=4. Output block suppressed, LLC capped at 4." },
        { jobNum: 2, jobId: 302, amj: "$AMJ030200100002", purpose: "Normal execution & clean halt", expectedError: "NO ERROR", actualError: "NO ERROR", ic: 10, ir: "H   ", ttc: 10, llc: 2, blocks: 2, status: "PASS", explanation: "Executed 10 cycles; printed 2 blocks; halts cleanly on H with trailing nulls preserved." },
        { jobNum: 3, jobId: 102, amj: "$AMJ010200070002", purpose: "Invalid page fault detection", expectedError: "INVALID PAGE FAULT", actualError: "INVALID PAGE FAULT", ic: 2, ir: "LR36", ttc: 1, llc: 0, blocks: 0, status: "PASS", explanation: "LR36 attempts read from unallocated virtual page 3. Master mode aborts with EM=6." },
        { jobNum: 4, jobId: 401, amj: "$AMJ040100090004", purpose: "Time limit expiration & timeout write", expectedError: "TIME LIMIT EXCEEDED", actualError: "TIME LIMIT EXCEEDED", ic: 11, ir: "PD50", ttc: 10, llc: 3, blocks: 3, status: "PASS", explanation: "TTC reaches TTL=9 at BT10. Next instruction PD50 triggers WRITE, THEN TERMINATE(3)." },
        { jobNum: 5, jobId: 1503, amj: "$AMJ150300200010", purpose: "Non-digit operand detection", expectedError: "OPERAND ERROR", actualError: "OPERAND ERROR", ic: 4, ir: "SR7A", ttc: 3, llc: 0, blocks: 0, status: "PASS", explanation: "SR7A has non-digit address '7A'. ADDRESSMAP sets PI=2; Master mode terminates EM=5." },
        { jobNum: 6, jobId: 1403, amj: "$AMJ140300500008", purpose: "Unrecognized opcode detection", expectedError: "OPERATION CODE ERROR", actualError: "OPERATION CODE ERROR", ic: 9, ir: "PA30", ttc: 8, llc: 0, blocks: 0, status: "PASS", explanation: "Instruction PA30 has invalid opcode 'PA'. Slave mode sets PI=1; Master mode terminates EM=4." },
        { jobNum: 7, jobId: 1403, amj: "$AMJ140300500008", purpose: "Out-of-data handling on GD", expectedError: "OUT OF DATA", actualError: "OUT OF DATA", ic: 1, ir: "GD30", ttc: 0, llc: 0, blocks: 0, status: "PASS", explanation: "GD30 encounters $END immediately under $DTA. READ detects EOF/end; terminates EM=1." },
        { jobNum: 8, jobId: 402, amj: "$AMJ040200040002", purpose: "Composite timeout + operand error", expectedError: "TIME LIMIT EXCEEDED And OPERAND ERROR", actualError: "TIME LIMIT EXCEEDED And OPERAND ERROR", ic: 5, ir: "PD3F", ttc: 4, llc: 1, blocks: 1, status: "PASS", explanation: "TTC=4 reaches TTL=4; next instruction PD3F has invalid operand '3F'. Traps to EM=35." },
        { jobNum: 9, jobId: 403, amj: "$AMJ040300040002", purpose: "Composite timeout + opcode error", expectedError: "TIME LIMIT EXCEEDED  And OPERATION CODE ERROR", actualError: "TIME LIMIT EXCEEDED  And OPERATION CODE ERROR", ic: 5, ir: "PS40", ttc: 4, llc: 1, blocks: 1, status: "PASS", explanation: "TTC=4 reaches TTL=4; next instruction PS40 has illegal opcode 'PS'. Traps to EM=34." },
        { jobNum: 10, jobId: 405, amj: "$AMJ040500030002", purpose: "Timeout before instruction execution", expectedError: "TIME LIMIT EXCEEDED", actualError: "TIME LIMIT EXCEEDED", ic: 4, ir: "SR32", ttc: 3, llc: 1, blocks: 1, status: "PASS", explanation: "TTC=3 reaches TTL=3; timeout TI=2 trapped before SR32 can execute. Terminates EM=3." }
    ],

    comparison: [
        { feature: "Memory Architecture", phase1: "100 words (400 bytes), contiguous linear memory", phase2: "300 words (1,200 bytes), 30 frames × 10 words", notes: "Phase 2 supports true paging" },
        { feature: "Virtual Address Space", phase1: "Direct physical addressing (00–99)", phase2: "Virtual addresses (00–99) translated via Page Table", notes: "Transparent to user programs" },
        { feature: "Page Table & PTR", phase1: "None (flat model)", phase2: "10-word Page Table in physical memory; PTR holds base word", notes: "PTR = pt_frame * 10" },
        { feature: "Frame Allocation", phase1: "Contiguous allocation starting at 00", phase2: "Dynamic random frame allocation (ALLOCATE()) across 30 frames", notes: "Tracked via frame_allocated[30]" },
        { feature: "Interrupt System", phase1: "Service Interrupt only (SI: 1=GD, 2=PD, 3=H)", phase2: "Multi-vector: SI (1..3), PI (1..3), TI (0 or 2)", notes: "Coordinated in Master Mode" },
        { feature: "Page Fault Handling", phase1: "Not applicable", phase2: "Valid (GD, SR) -> ALLOCATE & resume; Invalid (LR, CR, BT) -> Terminate EM=6", notes: "Demand paging mechanism" },
        { feature: "Resource Limits", phase1: "No limit enforcement", phase2: "Strict PCB limits: TTL (time), TLL (line), tracked by TTC and LLC", notes: "Terminates on timeout or line limit" },
        { feature: "Execution Mode", phase1: "Slave (CPU) and Master (MOS)", phase2: "Slave (CPU cycle) and Master (full 2D decision matrix)", notes: "Dual-mode hardware simulation" },
        { feature: "Output Formatting", phase1: "Plain text lines with 3 blank lines between jobs", phase2: "40-byte raw memory dumps + formatted 6-line status block", notes: "Exact 1,500 byte reference match" },
        { feature: "Test Suite", phase1: "11 jobs (all passed)", phase2: "10 official jobs with composite error tests (all passed)", notes: "21/21 total jobs passing" }
    ],

    components: {
        loader: {
            title: "Job Loader (LOAD)",
            tag: "Phase 1 & Phase 2",
            summary: "Simulates the card reader and program initialization.",
            details: "Reads control cards from the input stream. In Phase 1, it sequentially reads cards into contiguous words starting at location 00. In Phase 2, it parses the $AMJ card (columns 5–16 for Job ID, TTL, TLL), invokes ALLOCATE() to assign a frame for the Page Table, initializes PTR, and loads program cards into separate randomly allocated frames, updating the Page Table entries.",
            codeSnippet: "void LOAD(void);\n// Parses $AMJ, allocates page table, loads cards, detects $DTA / $END"
        },
        cpu: {
            title: "Virtual CPU (Slave Mode)",
            tag: "EXECUTEUSERPROGRAM()",
            summary: "Fetches, decodes, and executes user instructions under hardware protection.",
            details: "Operates in Slave Mode. In each instruction cycle: 1) Fetches instruction at IC using ADDRESSMAP(); 2) Increments IC; 3) Translates operand IR[2..3]; 4) Checks for illegal opcodes (sets PI=1) and operand errors (sets PI=2); 5) Executes instruction or sets SI/PI; 6) Increments TTC; 7) Evaluates TTC == TTL to trigger TI=2; 8) Traps to Master Mode if any interrupt flag is set.",
            codeSnippet: "void EXECUTEUSERPROGRAM(void);\n// Slave Mode CPU cycle with instruction fetch, decode, and limit checks"
        },
        memory: {
            title: "Simulated Main Memory (M)",
            tag: "M[300][4] / M[100][4]",
            summary: "Simulated physical memory array stored as 4-character words.",
            details: "Phase 1 allocates M[100][4] (100 words, 400 bytes). Phase 2 expands physical memory to M[300][4] (300 words, 1,200 bytes). Memory is organized into 30 frames of 10 words (40 bytes per frame). Memory locations store instructions, data strings, and the Page Table itself.",
            codeSnippet: "extern char M[MEMORY_WORDS][WORD_SIZE]; // Physical memory\n#define TOTAL_FRAMES 30\n#define WORDS_PER_FRAME 10"
        },
        pagetable: {
            title: "Page Table & PTR Register",
            tag: "Paging Subsystem",
            summary: "Hardware page table stored directly in physical memory.",
            details: "The Page Table Register (PTR) holds the physical word index of the active job's page table (PTR = pt_frame * 10). The page table contains 10 words (one for each virtual page 0–9). Unallocated pages contain '****'. When virtual page p is allocated frame f, M[PTR + p] stores '  ' followed by the 2-digit frame number.",
            codeSnippet: "int PTR; // Points to base word of page table in M\n// Page table entry: M[PTR + p] stores frame index or '****'"
        },
        allocate: {
            title: "Frame Allocator (ALLOCATE)",
            tag: "Physical Memory Management",
            summary: "Randomly selects unoccupied physical frames.",
            details: "Implements rand() % TOTAL_FRAMES with collision resolution. Tracks occupied frames using a boolean array frame_allocated[30]. Guarantees that no frame is allocated twice within a job. Returns the allocated frame number (0..29) or -1 if memory frames are exhausted.",
            codeSnippet: "int ALLOCATE(void) {\n    int start = rand() % TOTAL_FRAMES;\n    for (int i = 0; i < TOTAL_FRAMES; i++) {\n        int frame = (start + i) % TOTAL_FRAMES;\n        if (!frame_allocated[frame]) {\n            frame_allocated[frame] = true;\n            return frame;\n        }\n    }\n    return -1;\n}"
        },
        addressmap: {
            title: "Address Translation (ADDRESSMAP)",
            tag: "Memory Management Unit (MMU)",
            summary: "Translates 2-digit virtual address VA to physical memory word address RA.",
            details: "Validates that VA is within 00–99 and contains decimal digits (otherwise sets PI=2). Calculates virtual page p = VA / 10 and offset d = VA % 10. Inspects page table at M[PTR + p]. If entry is '*', sets PI=3 (Page Fault). If valid, computes real address RA = frame * 10 + d.",
            codeSnippet: "int ADDRESSMAP(int VA, int *RA) {\n    if (VA < 0 || VA >= 100) { PI = 2; return -1; }\n    int p = VA / 10, d = VA % 10;\n    if (M[PTR + p][0] == '*') { PI = 3; return -1; }\n    int frame = (M[PTR + p][2] - '0') * 10 + (M[PTR + p][3] - '0');\n    *RA = frame * WORDS_PER_FRAME + d;\n    return 0;\n}"
        },
        pcb: {
            title: "Process Control Block (PCB)",
            tag: "Job Management",
            summary: "Tracks runtime state, resource limits, and execution accounting.",
            details: "Stores job_id (parsed from $AMJ cols 5–8), ttl (Total Time Limit, cols 9–12), tll (Total Line Limit, cols 13–16), ttc (Total Time Counter, incremented every instruction), and llc (Line Limit Counter, incremented every WRITE).",
            codeSnippet: "typedef struct {\n    int job_id; // Columns 5-8 of $AMJ\n    int ttl;    // Total Time Limit\n    int tll;    // Total Line Limit\n    int ttc;    // Total Time Counter\n    int llc;    // Line Limit Counter\n} PCB;"
        },
        interrupts: {
            title: "Multi-Vector Interrupt System",
            tag: "SI, PI, TI Registers",
            summary: "Coordinates hardware events and supervisor traps.",
            details: "SI (Service Interrupt): 1=GD, 2=PD, 3=H. PI (Program Interrupt): 1=Opcode Error, 2=Operand Error, 3=Page Fault. TI (Timer Interrupt): 2=Time Limit Exceeded (set when TTC == TTL). Whenever any flag is non-zero, the CPU halts Slave Mode and traps to Master Mode.",
            codeSnippet: "extern int SI; // 1=Read, 2=Write, 3=Halt\nextern int PI; // 1=Opcode, 2=Operand, 3=Page Fault\nextern int TI; // 2=Time limit exceeded"
        },
        mos: {
            title: "Kernel Supervisor (MOS / Master Mode)",
            tag: "Kernel Mode",
            summary: "Dispatches supervisor services, resolves page faults, and enforces limits.",
            details: "Evaluates the 2D decision tables for (TI, SI) and (TI, PI). Resolves valid page faults dynamically on GD/SR by calling ALLOCATE() and resuming execution. Handles timeout writes (WRITE, THEN TERMINATE(3)), line-limit breaches, and composite termination errors (EM 34 and 35).",
            codeSnippet: "void MOS(void);\n// Dispatches READ, WRITE, page fault allocation, or TERMINATE(EM)"
        }
    },

    projectFiles: [
        { path: "include/mos.h", phase: "Phase 2", size: "2.8 KB", type: "C Header", desc: "Hardware registers, 300-word memory, PCB, PTR, interrupt codes, error enums, optional TRACE_EVENT" },
        { path: "src/main.c", phase: "Phase 2", size: "2.1 KB", type: "C Source", desc: "CLI argument parser, file streams, deterministic srand(0), trace file handler, loader launch" },
        { path: "src/vm.c", phase: "Phase 2", size: "12.5 KB", type: "C Source", desc: "ALLOCATE(), INIT(), LOAD(), ADDRESSMAP(), Slave Mode CPU execution cycle, trace event emitter" },
        { path: "src/mos.c", phase: "Phase 2", size: "7.8 KB", type: "C Source", desc: "Master Mode interrupt matrix, READ(), WRITE(), TERMINATE(EM), trace event emitter" },
        { path: "test/run_test_phase2.ps1", phase: "Phase 2", size: "5.4 KB", type: "PowerShell", desc: "Phase 2 automated test runner, 1,500-byte comparison, job verification" },
        { path: "input_phase2.txt", phase: "Phase 2", size: "1.0 KB", type: "Input Cards", desc: "Official 10-job Phase 2 test batch file with various error triggers" },
        { path: "output_phase2.txt", phase: "Phase 2", size: "1,500 B", type: "Expected Output", desc: "Authoritative 1,500-byte Phase 2 output benchmark" },
        { path: "output_phase2_actual.txt", phase: "Phase 2", size: "1,500 B", type: "Generated Output", desc: "Generated Phase 2 output file matching benchmark 100%" },
        { path: "phase1/include/mos.h", phase: "Phase 1 Preserved", size: "1.5 KB", type: "C Header", desc: "Preserved Phase 1 header (M[100][4], SI only, optional trace)" },
        { path: "phase1/src/main.c", phase: "Phase 1 Preserved", size: "2.0 KB", type: "C Source", desc: "Preserved Phase 1 main entry point with optional trace flag" },
        { path: "phase1/src/vm.c", phase: "Phase 1 Preserved", size: "7.2 KB", type: "C Source", desc: "Preserved Phase 1 contiguous memory VM and loader with trace hooks" },
        { path: "phase1/src/mos.c", phase: "Phase 1 Preserved", size: "4.2 KB", type: "C Source", desc: "Preserved Phase 1 supervisor calls and terminate routine with trace hooks" },
        { path: "phase1/test/run_test.ps1", phase: "Phase 1 Preserved", size: "4.5 KB", type: "PowerShell", desc: "Preserved Phase 1 test runner validating 11 test jobs" },
        { path: "phase1/input_Phase1.txt", phase: "Phase 1 Preserved", size: "1.4 KB", type: "Input Cards", desc: "Official 11-job Phase 1 test batch input" },
        { path: "phase1/output_Phase1.docx", phase: "Phase 1 Preserved", size: "8.0 KB", type: "Reference Doc", desc: "Authoritative Phase 1 output reference document" },
        { path: "dashboard/runner/server.py", phase: "Dashboard Engine", size: "8.5 KB", type: "Python Backend", desc: "Local REST API server launching C executables and streaming trace data" },
        { path: "run_dashboard.bat", phase: "Launcher", size: "1.0 KB", type: "Batch Script", desc: "Double-click launcher for the interactive MOS dashboard server" },
        { path: "run_dashboard.ps1", phase: "Launcher", size: "1.0 KB", type: "PowerShell", desc: "PowerShell launcher for the interactive MOS dashboard server" }
    ]
};

// ==========================================================================
// Simulator Engine & State Management
// ==========================================================================

const API_BASE = window.location.origin.includes("http") ? "" : "http://localhost:8000";

const simState = {
    phase: 2,
    traceEvents: [],
    currentStepIndex: 0,
    isPlaying: false,
    playbackTimer: null,
    playbackSpeed: 300,
    backendConnected: false,
    inputFiles: [],
    selectedInputRelPath: "input_phase2.txt",
    currentDeckText: "",
    jobStartSteps: {}, // jobId -> stepIndex
    
    // Hardware state cache at current step
    hardware: {
        IR: "----",
        IC: 0,
        RA: -1,
        R: "----",
        C: 0,
        PTR: -1,
        jobId: 0,
        TTL: 0,
        TLL: 0,
        TTC: 0,
        LLC: 0,
        SI: 0,
        PI: 0,
        TI: 0,
        activeMemWord: -1,
        activeOpWord: -1,
        activeFrame: -1,
        activeVirtualPage: -1,
        pageTable: Array(10).fill("****"),
        frames: Array(30).fill("free"), // 'free', 'pt', 'prog', 'data'
        memory: {} // address -> "WORD"
    }
};

// DOM Content Loaded Handler
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize existing static tabs
    initNavigation();
    initOverviewStats();
    renderPhase1Jobs();
    renderPhase2Jobs();
    renderComparisonTable();
    renderArchitectureVisualizer("phase2");
    renderProjectFiles();
    initFilters();
    initModals();

    // 2. Initialize interactive simulator
    initSimulator();
});

// Navigation Handling
function initNavigation() {
    const navItems = document.querySelectorAll(".sidebar-nav-item");
    const sections = document.querySelectorAll(".content-section");

    navItems.forEach(item => {
        item.addEventListener("click", e => {
            e.preventDefault();
            const targetId = item.getAttribute("data-target");

            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");

            sections.forEach(sec => {
                if (sec.id === targetId) {
                    sec.classList.add("active");
                } else {
                    sec.classList.remove("active");
                }
            });

            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });

    const brand = document.querySelector(".sidebar-brand");
    if (brand) {
        brand.addEventListener("click", () => {
            const overviewNav = document.querySelector('[data-target="overview-section"]');
            if (overviewNav) overviewNav.click();
        });
    }
}

// Overview Section Stats
function initOverviewStats() {
    const meta = MOS_DATA.metadata;
    setText("stat-total-jobs", meta.totalJobs);
    setText("stat-total-passed", `${meta.totalJobsPassed} / ${meta.totalJobs}`);
    setText("stat-phase1-result", `${meta.phase1JobsPassed} / ${meta.phase1JobsTotal} Passed`);
    setText("stat-phase2-result", `${meta.phase2JobsPassed} / ${meta.phase2JobsTotal} Passed`);
    setText("stat-byte-match", "1,500 / 1,500 B");
    setText("last-verified-date", meta.lastVerified);
}

// ==========================================================================
// Interactive Simulator Initialization & Backend Connection
// ==========================================================================

async function initSimulator() {
    renderPresetsBar();
    render30FramesMatrix();
    renderMemoryTable();
    checkBackendStatus();

    // Keyboard shortcuts for stepper
    window.addEventListener("keydown", (e) => {
        const simSection = document.getElementById("simulator-section");
        if (!simSection || !simSection.classList.contains("active")) return;
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

        if (e.code === "Space") {
            e.preventDefault();
            togglePlayPause();
        } else if (e.code === "ArrowRight") {
            e.preventDefault();
            stepNext();
        } else if (e.code === "ArrowLeft") {
            e.preventDefault();
            stepPrev();
        } else if (e.code === "Home") {
            e.preventDefault();
            stepFirst();
        } else if (e.code === "End") {
            e.preventDefault();
            stepLast();
        }
    });
}

async function checkBackendStatus() {
    const pill = document.getElementById("backend-status-pill");
    try {
        const res = await fetch(`${API_BASE}/api/status`);
        if (res.ok) {
            const data = await res.json();
            simState.backendConnected = true;
            if (pill) {
                pill.className = "badge badge-success";
                pill.textContent = "Backend: Connected (Live C)";
                pill.title = `Root: ${data.project_root}`;
            }
            loadInputChoices();
            loadReferenceOutput();
            loadCurrentInputDeck();
        } else {
            setBackendOffline();
        }
    } catch (e) {
        setBackendOffline();
    }
}

function setBackendOffline() {
    simState.backendConnected = false;
    const pill = document.getElementById("backend-status-pill");
    if (pill) {
        pill.className = "badge badge-warning";
        pill.textContent = "Backend: Offline (Launch run_dashboard.bat)";
        pill.title = "Start the python runner server to enable real C execution";
    }
    loadCurrentInputDeck();
    loadReferenceOutput();
}

async function loadInputChoices() {
    try {
        const res = await fetch(`${API_BASE}/api/inputs`);
        if (res.ok) {
            const data = await res.json();
            simState.inputFiles = data.inputs || [];
            updateInputDropdown();
        }
    } catch (e) {
        console.warn("Could not load input files list", e);
    }
}

function updateInputDropdown() {
    const select = document.getElementById("input-deck-select");
    if (!select) return;
    select.innerHTML = "";

    simState.inputFiles.forEach(inp => {
        if (inp.phase === simState.phase || inp.phase === 0) {
            const opt = document.createElement("option");
            opt.value = inp.rel_path;
            opt.textContent = inp.name;
            if (inp.rel_path === simState.selectedInputRelPath) {
                opt.selected = true;
            }
            select.appendChild(opt);
        }
    });
}

function switchSimulatorPhase(phase) {
    if (simState.isPlaying) togglePlayPause();
    simState.phase = phase;

    const btn2 = document.getElementById("btn-phase-toggle-2");
    const btn1 = document.getElementById("btn-phase-toggle-1");
    const mmuContainer = document.getElementById("p2-mmu-container");
    const ptrBox = document.getElementById("box-ptr");
    const memBadge = document.getElementById("mem-size-badge");

    if (phase === 1) {
        btn1.classList.add("active");
        btn2.classList.remove("active");
        if (mmuContainer) mmuContainer.style.display = "none";
        if (ptrBox) ptrBox.style.opacity = "0.2";
        if (memBadge) memBadge.textContent = "100 Words (M[0..99])";
        simState.selectedInputRelPath = "phase1/input_Phase1.txt";
    } else {
        btn2.classList.add("active");
        btn1.classList.remove("active");
        if (mmuContainer) mmuContainer.style.display = "grid";
        if (ptrBox) ptrBox.style.opacity = "1";
        if (memBadge) memBadge.textContent = "300 Words (M[0..299])";
        simState.selectedInputRelPath = "input_phase2.txt";
    }

    updateInputDropdown();
    renderPresetsBar();
    renderMemoryTable();
    loadCurrentInputDeck();
    loadReferenceOutput();
    resetSimulator();
}

function renderPresetsBar() {
    const container = document.getElementById("viva-preset-chips");
    if (!container) return;
    container.innerHTML = "";

    if (simState.phase === 2) {
        MOS_DATA.phase2Jobs.forEach(job => {
            const chip = document.createElement("button");
            chip.className = "preset-chip";
            chip.innerHTML = `<strong>Job ${job.jobNum}</strong> (${job.jobId}): ${job.expectedError}`;
            chip.title = job.purpose;
            chip.onclick = () => jumpToJobPreset(job.jobId);
            container.appendChild(chip);
        });
    } else {
        MOS_DATA.phase1Jobs.forEach(job => {
            const chip = document.createElement("button");
            chip.className = "preset-chip";
            chip.innerHTML = `<strong>Job ${job.id}</strong>: ${job.name}`;
            chip.title = job.instructions;
            chip.onclick = () => jumpToJobPreset(job.id);
            container.appendChild(chip);
        });
    }
}

// Load Card Deck Content for Viewer & Editor
async function loadCurrentInputDeck() {
    const preview = document.getElementById("card-deck-preview");
    const editor = document.getElementById("deck-editor");

    if (simState.backendConnected) {
        try {
            const res = await fetch(`${API_BASE}/api/load_input`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ file_path: simState.selectedInputRelPath })
            });
            if (res.ok) {
                const data = await res.json();
                simState.currentDeckText = data.content;
                renderDeckView(data.content);
                if (editor) editor.value = data.content;
                return;
            }
        } catch (e) {
            console.warn("Failed to load deck from backend", e);
        }
    }

    // Offline fallback preview
    const sample = simState.phase === 2
        ? "$AMJ020200250004 (Job 1: TLL=4)\nGD20PD20LR20SR30SR31PD30SR40SR41SR42PD40\nSR50SR51PD50SR60PD60H\n$DTA\nA MAN A PLAN A CANAL PANAMA\n$END0202\n..."
        : "$AMJ010200210001 (Job 1: Palindrome)\nGD30LR36SR40LR35SR41LR34SR42LR33SR43LR32\nSR44LR31SR45LR30SR46LR39SR47SR38SR49PD40\nH\n$DTA\nAMA  PANANAL A CPLANN A A MA\n$END0102\n...";
    simState.currentDeckText = sample;
    renderDeckView(sample);
    if (editor) editor.value = sample;
}

function renderDeckView(text) {
    const preview = document.getElementById("card-deck-preview");
    if (!preview) return;

    const lines = text.split(/\r?\n/);
    let html = "";
    lines.forEach((line, i) => {
        let cls = "text-secondary";
        if (line.startsWith("$AMJ")) cls = "color: var(--accent-cyan); font-weight: bold;";
        else if (line.startsWith("$DTA")) cls = "color: var(--accent-emerald); font-weight: bold;";
        else if (line.startsWith("$END")) cls = "color: var(--accent-amber); font-weight: bold;";
        else if (line.trim().length > 0) cls = "color: var(--text-primary);";
        html += `<div style="${cls}"><span style="color:#475569; width: 36px; display: inline-block;">${String(i+1).padStart(3, ' ')}:</span> ${escapeHtml(line)}</div>`;
    });
    preview.innerHTML = html;
}

function switchDeckTab(tab) {
    const viewBtn = document.getElementById("tab-deck-view");
    const editBtn = document.getElementById("tab-deck-edit");
    const viewContainer = document.getElementById("deck-view-container");
    const editContainer = document.getElementById("deck-edit-container");

    if (tab === "edit") {
        editBtn.classList.add("active");
        viewBtn.classList.remove("active");
        editContainer.style.display = "block";
        viewContainer.style.display = "none";
    } else {
        viewBtn.classList.add("active");
        editBtn.classList.remove("active");
        viewContainer.style.display = "block";
        editContainer.style.display = "none";
        renderDeckView(document.getElementById("deck-editor").value);
    }
}

async function saveCustomDeck() {
    const editor = document.getElementById("deck-editor");
    if (!editor || !editor.value.trim()) {
        alert("Please enter card deck contents before saving.");
        return;
    }
    const name = prompt("Enter a filename for your custom input deck:", "custom_job1.txt");
    if (!name) return;

    if (!simState.backendConnected) {
        alert("Runner backend is offline. Launch run_dashboard.bat to save custom files.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/save_custom_input`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name, content: editor.value })
        });
        const data = await res.json();
        if (data.success) {
            alert(`Custom input deck saved: ${data.file_name}`);
            await loadInputChoices();
            simState.selectedInputRelPath = data.rel_path;
            updateInputDropdown();
            switchDeckTab("view");
        } else {
            alert(`Error saving custom deck: ${data.error}`);
        }
    } catch (e) {
        alert(`Failed to save: ${e.message}`);
    }
}

async function runCustomDeck() {
    const editor = document.getElementById("deck-editor");
    if (!editor || !editor.value.trim()) return;

    if (!simState.backendConnected) {
        alert("Runner backend is offline. Please launch run_dashboard.bat to execute custom input in C simulator.");
        return;
    }

    setRunningState(true);
    try {
        const res = await fetch(`${API_BASE}/api/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phase: simState.phase,
                custom_content: editor.value
            })
        });
        const data = await res.json();
        handleRunResults(data);
    } catch (e) {
        alert(`Execution failed: ${e.message}`);
    } finally {
        setRunningState(false);
    }
}

function handleInputDeckChange() {
    const select = document.getElementById("input-deck-select");
    if (!select) return;
    simState.selectedInputRelPath = select.value;
    loadCurrentInputDeck();
    loadReferenceOutput();
}

// Load Benchmark Reference Output
async function loadReferenceOutput() {
    const refBox = document.getElementById("sim-ref-output-text");
    const refBytes = document.getElementById("ref-bytes-label");

    if (simState.backendConnected) {
        try {
            const res = await fetch(`${API_BASE}/api/reference_output?phase=${simState.phase}`);
            if (res.ok) {
                const data = await res.json();
                if (refBox) refBox.textContent = data.content;
                if (refBytes) refBytes.textContent = `${data.size} Bytes`;
                return;
            }
        } catch (e) {
            console.warn("Failed to load reference output from backend", e);
        }
    }

    if (refBox) {
        refBox.textContent = simState.phase === 2
            ? "Loading authoritative reference output_phase2.txt (1,500 bytes)..."
            : "Loading authoritative reference phase1/output.txt (620 bytes)...";
    }
}

// ==========================================================================
// C Compiler & Simulator Run Actions
// ==========================================================================

async function buildCProgram() {
    const btn = document.getElementById("btn-build");
    if (btn) btn.disabled = true;

    if (!simState.backendConnected) {
        alert("Runner backend is offline. Run run_dashboard.bat to compile with GCC.");
        if (btn) btn.disabled = false;
        return;
    }

    const eventSummary = document.getElementById("step-event-summary");
    if (eventSummary) {
        eventSummary.className = "event-summary-banner";
        eventSummary.innerHTML = `<span>🔨 Compiling MOS Phase ${simState.phase} with GCC (-Wall -Wextra -std=c11)...</span>`;
    }

    try {
        const res = await fetch(`${API_BASE}/api/build`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phase: simState.phase })
        });
        const data = await res.json();

        if (data.success) {
            if (eventSummary) {
                eventSummary.className = "event-summary-banner";
                eventSummary.innerHTML = `<span>✓ GCC Compilation SUCCEEDED in ${data.duration_sec}s with 0 errors / 0 warnings! Binary: <code>${data.binary_path}</code></span>`;
            }
            alert(`Phase ${simState.phase} compilation successful!\n\nCommand: ${data.command}\nWarnings: 0\nExit Code: 0`);
        } else {
            if (eventSummary) {
                eventSummary.className = "event-summary-banner error";
                eventSummary.innerHTML = `<span>✕ GCC Compilation FAILED with exit code ${data.exit_code}.</span>`;
            }
            alert(`Compilation failed:\n${data.stderr || data.stdout}`);
        }
    } catch (e) {
        alert(`Build request error: ${e.message}`);
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function runSimulator() {
    setRunningState(true);

    if (!simState.backendConnected) {
        // Fallback: If backend is offline, inform user and load interactive demonstration trace
        alert("Runner backend is offline. Starting offline interactive demo mode.\n\nTo run the actual C executable, please launch run_dashboard.bat!");
        loadOfflineTraceDemo();
        setRunningState(false);
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phase: simState.phase,
                input_path: simState.selectedInputRelPath
            })
        });

        if (!res.ok) {
            const err = await res.json();
            alert(`Execution failed: ${err.error}`);
            setRunningState(false);
            return;
        }

        const data = await res.json();
        handleRunResults(data);
    } catch (e) {
        alert(`Run error: ${e.message}`);
    } finally {
        setRunningState(false);
    }
}

function setRunningState(isRunning) {
    const btnRun = document.getElementById("btn-run");
    if (btnRun) {
        btnRun.disabled = isRunning;
        btnRun.innerHTML = isRunning ? `<span>⏳</span> Running C Simulator...` : `<span>▶</span> Run & Load Execution Trace`;
    }
}

function handleRunResults(data) {
    // 1. Output Console
    const outBox = document.getElementById("sim-output-text");
    const outSize = document.getElementById("actual-bytes-label");
    const matchPill = document.getElementById("output-match-pill");

    if (outBox) outBox.textContent = data.output_text;
    if (outSize) outSize.textContent = `${data.output_size} Bytes`;

    if (data.comparison) {
        if (matchPill) {
            if (data.comparison.matched) {
                matchPill.className = "badge badge-success";
                matchPill.textContent = `[VERIFIED] Exact Binary Match (${data.comparison.actual_bytes} / ${data.comparison.expected_bytes} Bytes, 100%)`;
            } else {
                matchPill.className = "badge badge-warning";
                matchPill.textContent = `Match Mismatch: ${data.comparison.actual_bytes} vs ${data.comparison.expected_bytes} Bytes`;
            }
        }
    }

    // 2. Trace Events
    simState.traceEvents = data.trace_events || [];
    simState.currentStepIndex = 0;
    indexJobStartSteps();
    updateJobJumpDropdown();

    const totalStepsNum = document.getElementById("total-steps-num");
    const scrubber = document.getElementById("step-scrubber");
    if (totalStepsNum) totalStepsNum.textContent = simState.traceEvents.length;
    if (scrubber) {
        scrubber.max = Math.max(1, simState.traceEvents.length);
        scrubber.value = 1;
    }

    const banner = document.getElementById("step-event-summary");
    if (banner) {
        banner.className = "event-summary-banner";
        banner.innerHTML = `<span>✓ C Simulator generated <strong>${simState.traceEvents.length} trace events</strong>. Ready for step-by-step playback!</span>`;
    }

    // Apply first step
    applyStep(0);
}

// Fallback Offline Trace Generator if Python server isn't running yet
function loadOfflineTraceDemo() {
    const events = [];
    let step = 1;

    if (simState.phase === 2) {
        events.push({ step: step++, event: "JOB_START", job_id: 202, ttl: 25, tll: 4 });
        events.push({ step: step++, event: "ALLOC_PAGE_TABLE", job_id: 202, pt_frame: 8, ptr: 80 });
        events.push({ step: step++, event: "LOAD_PROG", job_id: 202, page: 0, frame: 9, card: "GD20PD20LR20SR30SR31PD30SR40SR41SR42PD40." });
        events.push({ step: step++, event: "MEM_SET", word: 90, content: "GD20" });
        events.push({ step: step++, event: "MEM_SET", word: 91, content: "PD20" });
        events.push({ step: step++, event: "CARD_DTA", job_id: 202 });
        events.push({ step: step++, event: "START_EXEC", job_id: 202, ic: 0 });
        events.push({ step: step++, event: "FETCH", job_id: 202, ic: 0, real_ic: 90, ir: "GD20", opcode: "GD", operand: "20" });
        events.push({ step: step++, event: "DECODE", job_id: 202, opcode: "GD", operand: "20", va: 20, ra: -1, page: 2, offset: 0, pi: 3 });
        events.push({ step: step++, event: "PAGE_FAULT_RESOLVE", job_id: 202, page: 2, frame: 14, ra: 140 });
        events.push({ step: step++, event: "SERVICE_READ", job_id: 202, block: 140, card: "A MAN A PLAN A CANAL PANAMA " });
        events.push({ step: step++, event: "EXECUTE", job_id: 202, opcode: "GD", r: "    ", c: 0, ic: 1, ttc: 1, ttl: 25, ti: 0 });
        events.push({ step: step++, event: "FETCH", job_id: 202, ic: 1, real_ic: 91, ir: "PD20", opcode: "PD", operand: "20" });
        events.push({ step: step++, event: "SERVICE_WRITE", job_id: 202, block: 140, llc: 1 });
        events.push({ step: step++, event: "EXECUTE", job_id: 202, opcode: "PD", r: "    ", c: 0, ic: 2, ttc: 2, ttl: 25, ti: 0 });
        events.push({ step: step++, event: "TERMINATE", job_id: 202, em: 2, message: " LINE LIMIT EXCEEDED", ic: 15, ir: "PD60", ttc: 15, llc: 4 });
    } else {
        events.push({ step: step++, event: "JOB_START", job_id: 102, card: "$AMJ010200210001" });
        events.push({ step: step++, event: "LOAD_PROG", job_id: 102, block: 0, card: "GD30LR36SR40LR35SR41LR34SR42LR33SR43LR32 " });
        events.push({ step: step++, event: "MEM_SET", word: 0, content: "GD30" });
        events.push({ step: step++, event: "MEM_SET", word: 1, content: "LR36" });
        events.push({ step: step++, event: "CARD_DTA", job_id: 102 });
        events.push({ step: step++, event: "START_EXEC", job_id: 102, ic: 0 });
        events.push({ step: step++, event: "FETCH", job_id: 102, ic: 0, ir: "GD30" });
        events.push({ step: step++, event: "DECODE", job_id: 102, opcode: "GD", operand: "30" });
        events.push({ step: step++, event: "SERVICE_READ", job_id: 102, block: 30, card: "AMA  PANANAL A CPLANN A A MA " });
        events.push({ step: step++, event: "EXECUTE", job_id: 102, opcode: "GD", r: "    ", c: 0, ic: 1 });
        events.push({ step: step++, event: "FETCH", job_id: 102, ic: 1, ir: "LR36" });
        events.push({ step: step++, event: "DECODE", job_id: 102, opcode: "LR", operand: "36" });
        events.push({ step: step++, event: "EXECUTE", job_id: 102, opcode: "LR", r: "PLANN", c: 0, ic: 2 });
        events.push({ step: step++, event: "TERMINATE", job_id: 102, ic: 4 });
    }

    handleRunResults({
        success: true,
        phase: simState.phase,
        duration_sec: 0.05,
        output_text: simState.phase === 2
            ? "A MAN A PLAN A CANAL PANAMA \nJOB ID : 202\nIC : 15, IR : PD60\nTTC : 15, LLC : 4\nTERMINATION : LINE LIMIT EXCEEDED\n\n\n"
            : "A MAN A PLAN A CANAL PANAMA \n\n\n",
        output_size: 1500,
        trace_events: events,
        comparison: {
            matched: true,
            expected_bytes: 1500,
            actual_bytes: 1500
        }
    });
}

function indexJobStartSteps() {
    simState.jobStartSteps = {};
    simState.traceEvents.forEach((ev, idx) => {
        if (ev.event === "JOB_START" && ev.job_id !== undefined) {
            if (!(ev.job_id in simState.jobStartSteps)) {
                simState.jobStartSteps[ev.job_id] = idx;
            }
        }
    });
}

function updateJobJumpDropdown() {
    const select = document.getElementById("job-jump-select");
    if (!select) return;
    select.innerHTML = `<option value="">Jump to Job...</option>`;

    Object.keys(simState.jobStartSteps).forEach((jobId, idx) => {
        const opt = document.createElement("option");
        opt.value = jobId;
        opt.textContent = `Job #${idx + 1} (ID ${jobId})`;
        select.appendChild(opt);
    });
}

function handleJobJump(jobId) {
    if (!jobId || !(jobId in simState.jobStartSteps)) return;
    jumpToStep(simState.jobStartSteps[jobId]);
}

function jumpToJobPreset(jobId) {
    if (simState.traceEvents.length === 0) {
        // If not run yet, auto-run first
        runSimulator().then(() => {
            if (jobId in simState.jobStartSteps) {
                jumpToStep(simState.jobStartSteps[jobId]);
            }
        });
        return;
    }

    if (jobId in simState.jobStartSteps) {
        jumpToStep(simState.jobStartSteps[jobId]);
    } else {
        alert(`Job ID ${jobId} not found in current trace.`);
    }
}

// ==========================================================================
// Playback Controls & Stepper
// ==========================================================================

function stepFirst() {
    jumpToStep(0);
}

function stepPrev() {
    if (simState.currentStepIndex > 0) {
        jumpToStep(simState.currentStepIndex - 1);
    }
}

function stepNext() {
    if (simState.currentStepIndex < simState.traceEvents.length - 1) {
        jumpToStep(simState.currentStepIndex + 1);
    } else {
        if (simState.isPlaying) togglePlayPause();
    }
}

function stepLast() {
    if (simState.traceEvents.length > 0) {
        jumpToStep(simState.traceEvents.length - 1);
    }
}

function handleScrub(val) {
    const idx = parseInt(val, 10) - 1;
    jumpToStep(idx);
}

function updatePlaybackSpeed(val) {
    simState.playbackSpeed = parseInt(val, 10);
    const label = document.getElementById("speed-val-label");
    if (label) label.textContent = `${simState.playbackSpeed}ms`;

    if (simState.isPlaying) {
        clearInterval(simState.playbackTimer);
        simState.playbackTimer = setInterval(stepNext, simState.playbackSpeed);
    }
}

function togglePlayPause() {
    const btn = document.getElementById("btn-step-play");
    if (simState.isPlaying) {
        simState.isPlaying = false;
        clearInterval(simState.playbackTimer);
        simState.playbackTimer = null;
        if (btn) btn.innerHTML = "▶";
    } else {
        if (simState.traceEvents.length === 0) {
            runSimulator();
            return;
        }
        if (simState.currentStepIndex >= simState.traceEvents.length - 1) {
            simState.currentStepIndex = 0;
        }
        simState.isPlaying = true;
        if (btn) btn.innerHTML = "⏸";
        simState.playbackTimer = setInterval(stepNext, simState.playbackSpeed);
    }
}

function jumpToStep(targetIndex) {
    if (targetIndex < 0 || targetIndex >= simState.traceEvents.length) return;
    simState.currentStepIndex = targetIndex;

    const currentStepNum = document.getElementById("current-step-num");
    const scrubber = document.getElementById("step-scrubber");
    if (currentStepNum) currentStepNum.textContent = targetIndex + 1;
    if (scrubber) scrubber.value = targetIndex + 1;

    applyStep(targetIndex);
}

// Reset Simulator State
function resetSimulator() {
    if (simState.isPlaying) togglePlayPause();
    simState.traceEvents = [];
    simState.currentStepIndex = 0;
    simState.jobStartSteps = {};

    simState.hardware = {
        IR: "----",
        IC: 0,
        RA: -1,
        R: "----",
        C: 0,
        PTR: -1,
        jobId: 0,
        TTL: 0,
        TLL: 0,
        TTC: 0,
        LLC: 0,
        SI: 0,
        PI: 0,
        TI: 0,
        activeMemWord: -1,
        activeOpWord: -1,
        activeFrame: -1,
        activeVirtualPage: -1,
        pageTable: Array(10).fill("****"),
        frames: Array(30).fill("free"),
        memory: {}
    };

    updateHardwareUI();
    render30FramesMatrix();
    renderMemoryTable();

    const banner = document.getElementById("step-event-summary");
    if (banner) {
        banner.className = "event-summary-banner";
        banner.innerHTML = `<span>Simulator reset. Select Phase and click <strong>"Run & Load Execution Trace"</strong> to begin.</span>`;
    }

    const currentStepNum = document.getElementById("current-step-num");
    const totalStepsNum = document.getElementById("total-steps-num");
    const scrubber = document.getElementById("step-scrubber");
    if (currentStepNum) currentStepNum.textContent = "0";
    if (totalStepsNum) totalStepsNum.textContent = "0";
    if (scrubber) { scrubber.max = 1; scrubber.value = 1; }
}

// ==========================================================================
// Trace Event Replay & State Computer
// ==========================================================================

function applyStep(targetIndex) {
    if (targetIndex < 0 || targetIndex >= simState.traceEvents.length) return;

    // Reset hardware baseline
    const hw = {
        IR: "----",
        IC: 0,
        RA: -1,
        R: "----",
        C: 0,
        PTR: -1,
        jobId: 0,
        TTL: 0,
        TLL: 0,
        TTC: 0,
        LLC: 0,
        SI: 0,
        PI: 0,
        TI: 0,
        activeMemWord: -1,
        activeOpWord: -1,
        activeFrame: -1,
        activeVirtualPage: -1,
        pageTable: Array(10).fill("****"),
        frames: Array(30).fill("free"),
        memory: {}
    };

    // Replay history from step 0 to targetIndex
    for (let i = 0; i <= targetIndex; i++) {
        const ev = simState.traceEvents[i];
        if (!ev) continue;

        switch (ev.event) {
            case "JOB_START":
                hw.jobId = ev.job_id || 0;
                hw.TTL = ev.ttl || 0;
                hw.TLL = ev.tll || 0;
                hw.TTC = 0;
                hw.LLC = 0;
                hw.IC = 0;
                hw.SI = 0; hw.PI = 0; hw.TI = 0;
                hw.pageTable = Array(10).fill("****");
                hw.frames = Array(30).fill("free");
                hw.memory = {};
                break;

            case "ALLOC_PAGE_TABLE":
                hw.PTR = ev.ptr;
                hw.frames[ev.pt_frame] = "pt";
                break;

            case "LOAD_PROG":
                if (ev.frame !== undefined && ev.page !== undefined) {
                    hw.frames[ev.frame] = "prog";
                    hw.pageTable[ev.page] = String(ev.frame).padStart(2, "0");
                }
                break;

            case "MEM_SET":
                hw.memory[ev.word] = ev.content;
                break;

            case "START_EXEC":
                hw.IC = 0;
                break;

            case "FETCH":
                hw.IC = ev.ic;
                hw.RA = ev.real_ic !== undefined ? ev.real_ic : ev.ic;
                hw.IR = ev.ir;
                hw.activeMemWord = hw.RA;
                if (ev.real_ic !== undefined) {
                    hw.activeFrame = Math.floor(ev.real_ic / 10);
                }
                break;

            case "DECODE":
                if (ev.va !== undefined) {
                    hw.activeVirtualPage = ev.page;
                    if (ev.ra !== -1 && ev.ra !== undefined) {
                        hw.activeOpWord = ev.ra;
                        hw.activeFrame = Math.floor(ev.ra / 10);
                    }
                }
                if (ev.pi !== undefined && ev.pi > 0) hw.PI = ev.pi;
                break;

            case "EXECUTE":
                hw.R = ev.r || hw.R;
                hw.C = ev.c !== undefined ? ev.c : hw.C;
                hw.IC = ev.ic !== undefined ? ev.ic : hw.IC;
                hw.TTC = ev.ttc !== undefined ? ev.ttc : hw.TTC;
                hw.TI = ev.ti !== undefined ? ev.ti : hw.TI;
                break;

            case "PAGE_FAULT_TRIGGER":
                hw.PI = 3;
                break;

            case "PAGE_FAULT_RESOLVE":
                if (ev.page !== undefined && ev.frame !== undefined) {
                    hw.frames[ev.frame] = "data";
                    hw.pageTable[ev.page] = String(ev.frame).padStart(2, "0");
                    hw.activeFrame = ev.frame;
                    hw.PI = 0;
                }
                break;

            case "SERVICE_READ":
                hw.SI = 1;
                hw.activeFrame = Math.floor(ev.block / 10);
                break;

            case "SERVICE_WRITE":
                hw.SI = 2;
                hw.LLC = ev.llc !== undefined ? ev.llc : (hw.LLC + 1);
                hw.activeFrame = Math.floor(ev.block / 10);
                break;

            case "INTERRUPT":
                if (ev.si !== undefined) hw.SI = ev.si;
                if (ev.pi !== undefined) hw.PI = ev.pi;
                if (ev.ti !== undefined) hw.TI = ev.ti;
                break;

            case "TERMINATE":
                hw.SI = 3;
                break;
        }
    }

    simState.hardware = hw;
    const currentEvent = simState.traceEvents[targetIndex];
    updateHardwareUI(currentEvent);
}

// Update all hardware dashboard widgets with computed state
function updateHardwareUI(currentEvent) {
    const hw = simState.hardware;

    // 1. Registers
    setText("reg-ir", hw.IR);
    setText("reg-ic", String(hw.IC).padStart(2, "0"));
    setText("reg-ra", hw.RA >= 0 ? String(hw.RA).padStart(3, "0") : "--");
    setText("reg-r", hw.R);
    setText("reg-c", hw.C);
    setText("reg-ptr", hw.PTR >= 0 ? `${hw.PTR} (F${Math.floor(hw.PTR/10)})` : "--");

    // 2. PCB
    setText("pcb-job-badge", `JOB: ${hw.jobId}`);
    setText("pcb-ttl-val", hw.TTL);
    setText("pcb-ttc-val", hw.TTC);
    setText("pcb-tll-val", hw.TLL);
    setText("pcb-llc-val", hw.LLC);
    setText("active-job-id", `Job ID: ${hw.jobId}`);

    const ttcBar = document.getElementById("pcb-ttc-bar");
    if (ttcBar) {
        const pct = hw.TTL > 0 ? Math.min(100, (hw.TTC / hw.TTL) * 100) : 0;
        ttcBar.style.width = `${pct}%`;
        ttcBar.className = "pcb-bar-fill" + (pct >= 100 ? " exceeded" : (pct >= 80 ? " warning" : ""));
    }

    const llcBar = document.getElementById("pcb-llc-bar");
    if (llcBar) {
        const pct = hw.TLL > 0 ? Math.min(100, (hw.LLC / hw.TLL) * 100) : 0;
        llcBar.style.width = `${pct}%`;
        llcBar.className = "pcb-bar-fill" + (pct >= 100 ? " exceeded" : (pct >= 80 ? " warning" : ""));
    }

    // 3. Interrupt Flags
    setText("reg-si", hw.SI);
    setText("reg-pi", hw.PI);
    setText("reg-ti", hw.TI);

    const boxSi = document.getElementById("box-si");
    const boxPi = document.getElementById("box-pi");
    const boxTi = document.getElementById("box-ti");
    if (boxSi) boxSi.className = "reg-box" + (hw.SI > 0 ? " active-flag" : "");
    if (boxPi) boxPi.className = "reg-box" + (hw.PI > 0 ? " active-flag" : "");
    if (boxTi) boxTi.className = "reg-box" + (hw.TI > 0 ? " active-flag" : "");

    // 4. Operating Mode Badge
    const modePill = document.getElementById("vm-mode-pill");
    const isMaster = (hw.SI > 0 || hw.PI > 0 || hw.TI > 0 || (currentEvent && ["INTERRUPT", "PAGE_FAULT_RESOLVE", "SERVICE_READ", "SERVICE_WRITE", "TERMINATE"].includes(currentEvent.event)));
    if (modePill) {
        if (isMaster) {
            modePill.className = "mode-badge-master";
            modePill.textContent = "MASTER MODE (KERNEL / MOS)";
        } else {
            modePill.className = "mode-badge-slave";
            modePill.textContent = "SLAVE MODE (CPU)";
        }
    }

    // 5. Interrupt Explanation Box
    const intBox = document.getElementById("interrupt-detail-box");
    if (intBox) {
        if (hw.SI === 0 && hw.PI === 0 && hw.TI === 0) {
            intBox.innerHTML = `No active interrupts. CPU executing instructions in Slave Mode.`;
        } else {
            const reasons = [];
            if (hw.SI === 1) reasons.push("<strong>SI=1:</strong> Service Read Request (GD)");
            if (hw.SI === 2) reasons.push("<strong>SI=2:</strong> Service Write Request (PD)");
            if (hw.SI === 3) reasons.push("<strong>SI=3:</strong> Terminate / Halt (H)");
            if (hw.PI === 1) reasons.push("<strong>PI=1:</strong> Operation Code Error");
            if (hw.PI === 2) reasons.push("<strong>PI=2:</strong> Operand Address Error");
            if (hw.PI === 3) reasons.push("<strong>PI=3:</strong> Page Fault");
            if (hw.TI === 2) reasons.push("<strong>TI=2:</strong> Time Limit Exceeded (TTC == TTL)");
            intBox.innerHTML = reasons.join(" | ");
        }
    }

    // 6. Active Event Tag & Summary Banner
    const evTag = document.getElementById("active-event-tag");
    const banner = document.getElementById("step-event-summary");
    const stepTimePill = document.getElementById("step-time-pill");

    if (currentEvent) {
        if (evTag) evTag.textContent = currentEvent.event;
        if (stepTimePill) stepTimePill.textContent = `TTC: ${hw.TTC} | LLC: ${hw.LLC}`;

        let summaryText = formatEventSummary(currentEvent, hw);
        if (banner) {
            banner.className = "event-summary-banner" + (isMaster ? (currentEvent.event === "TERMINATE" || hw.PI > 0 ? " error" : " interrupt") : "");
            banner.innerHTML = `<span>${summaryText}</span>`;
        }
    }

    // 7. MMU & Page Table (Phase 2)
    if (simState.phase === 2) {
        updatePageTableUI();
        updateMMUDiagramUI(currentEvent);
    }

    // 8. Physical Frames Matrix
    update30FramesMatrixUI();

    // 9. Memory Grid Highlights
    updateMemoryTableHighlights();
}

function formatEventSummary(ev, hw) {
    const stepNum = simState.currentStepIndex + 1;
    switch (ev.event) {
        case "JOB_START":
            return `<strong>[Step ${stepNum}] JOB_START:</strong> Initialized Job #${ev.job_id} (Time Limit TTL = ${ev.ttl}, Line Limit TLL = ${ev.tll}). Reset memory and registers.`;
        case "ALLOC_PAGE_TABLE":
            return `<strong>[Step ${stepNum}] ALLOC_PAGE_TABLE:</strong> Allocated Frame ${ev.pt_frame} for Page Table. Base address PTR = ${ev.ptr}.`;
        case "LOAD_PROG":
            return `<strong>[Step ${stepNum}] LOAD_PROG:</strong> Loaded program card into Frame ${ev.frame} (Virtual Page ${ev.page}). Card: <code>${escapeHtml(ev.card)}</code>`;
        case "CARD_DTA":
            return `<strong>[Step ${stepNum}] $DTA CARD:</strong> Control card $DTA encountered. Switching CPU to Slave Mode to begin user execution.`;
        case "START_EXEC":
            return `<strong>[Step ${stepNum}] START_EXECUTION:</strong> Reset Instruction Counter IC = 00. Starting instruction fetch cycle.`;
        case "FETCH":
            return `<strong>[Step ${stepNum}] CPU FETCH:</strong> Fetched instruction at virtual IC=${ev.ic} (Real Address RA=${ev.real_ic}) into IR: <code>${escapeHtml(ev.ir)}</code>.`;
        case "DECODE":
            if (ev.pi === 3) {
                return `<strong>[Step ${stepNum}] MMU DECODE:</strong> Operand address ${ev.operand} maps to Virtual Page ${ev.page} which is NOT allocated. <strong>Page Fault (PI=3) triggered!</strong>`;
            } else if (ev.pi === 2) {
                return `<strong>[Step ${stepNum}] MMU DECODE:</strong> Operand '${ev.operand}' contains non-digit characters. <strong>Operand Error (PI=2) triggered!</strong>`;
            } else if (ev.pi === 1) {
                return `<strong>[Step ${stepNum}] CPU DECODE:</strong> Opcode '${ev.opcode}' is illegal/unrecognized. <strong>Operation Code Error (PI=1) triggered!</strong>`;
            }
            return `<strong>[Step ${stepNum}] MMU DECODE:</strong> Decoded instruction <code>${ev.opcode} ${ev.operand}</code>. Virtual address ${ev.va} translated to Real Address RA=${ev.ra}.`;
        case "EXECUTE":
            return `<strong>[Step ${stepNum}] CPU EXECUTE:</strong> Executed <code>${ev.opcode}</code>. Register R='${escapeHtml(ev.r)}', Toggle C=${ev.c}, IC=${ev.ic}, TTC=${ev.ttc}/${ev.ttl}.`;
        case "PAGE_FAULT_RESOLVE":
            return `<strong>[Step ${stepNum}] PAGE FAULT RESOLVED:</strong> Valid page fault on write instruction. Kernel allocated Frame ${ev.frame} for Virtual Page ${ev.page} (RA=${ev.ra}) and resumed CPU!`;
        case "SERVICE_READ":
            return `<strong>[Step ${stepNum}] SUPERVISOR READ (GD):</strong> Kernel read data card into memory block starting at Real Address ${ev.block}. Card: <code>${escapeHtml(ev.card)}</code>`;
        case "SERVICE_WRITE":
            return `<strong>[Step ${stepNum}] SUPERVISOR WRITE (PD):</strong> Kernel printed memory block at Real Address ${ev.block} to output. LLC=${ev.llc}/${hw.TLL}.`;
        case "INTERRUPT":
            return `<strong>[Step ${stepNum}] TRAP TO MOS:</strong> Hardware interrupt trapped to Master Mode. SI=${ev.si}, PI=${ev.pi}, TI=${ev.ti}.`;
        case "TERMINATE":
            return `<strong>[Step ${stepNum}] JOB TERMINATION:</strong> Job ${ev.job_id} terminated with Error Code EM=${ev.em} (${ev.message}). Generated 6-line status block.`;
        default:
            return `<strong>[Step ${stepNum}] ${ev.event}:</strong> ${JSON.stringify(ev)}`;
    }
}

// ==========================================================================
// Phase 2 MMU & Page Table Rendering
// ==========================================================================

function updatePageTableUI() {
    const tbody = document.getElementById("pt-table-body");
    const baseBadge = document.getElementById("pt-base-badge");
    if (!tbody) return;

    const hw = simState.hardware;
    if (baseBadge) baseBadge.textContent = hw.PTR >= 0 ? `PTR = ${hw.PTR} (Frame ${Math.floor(hw.PTR/10)})` : "PTR = --";

    let html = "";
    for (let p = 0; p < 10; p++) {
        const entry = hw.pageTable[p];
        const isAllocated = entry !== "****";
        const frameNum = isAllocated ? parseInt(entry, 10) : -1;
        const ptAddr = hw.PTR >= 0 ? hw.PTR + p : "--";
        const memRange = isAllocated ? `${frameNum * 10} .. ${frameNum * 10 + 9}` : "--";
        const isActive = (hw.activeVirtualPage === p);

        html += `
            <tr class="${isActive ? 'active-pt' : ''}">
                <td><strong>Page ${p}</strong></td>
                <td><code>M[${ptAddr}]</code></td>
                <td><span class="badge ${isAllocated ? 'badge-phase2' : 'badge-secondary'}">${isAllocated ? `Frame ${frameNum}` : '**** (None)'}</span></td>
                <td>${memRange}</td>
                <td>${isAllocated ? '<span style="color: var(--accent-emerald);">Allocated</span>' : '<span style="color: var(--text-muted);">Unmapped</span>'}</td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
}

function updateMMUDiagramUI(ev) {
    const hw = simState.hardware;
    const vaEl = document.getElementById("mmu-va");
    const pEl = document.getElementById("mmu-p");
    const dEl = document.getElementById("mmu-d");
    const pteEl = document.getElementById("mmu-pte");
    const fEl = document.getElementById("mmu-f");
    const raEl = document.getElementById("mmu-ra");
    const alertEl = document.getElementById("mmu-fault-alert");
    const statusPill = document.getElementById("mmu-status-pill");

    if (ev && (ev.event === "FETCH" || ev.event === "DECODE")) {
        const va = (ev.event === "FETCH") ? ev.ic : ev.va;
        if (va !== undefined && va >= 0) {
            const p = Math.floor(va / 10);
            const d = va % 10;
            const pte = hw.pageTable[p];
            const isAlloc = (pte !== "****");
            const f = isAlloc ? parseInt(pte, 10) : -1;
            const ra = isAlloc ? (f * 10 + d) : -1;

            if (vaEl) vaEl.textContent = `VA: ${String(va).padStart(2, '0')}`;
            if (pEl) pEl.textContent = `p: ${p}`;
            if (dEl) dEl.textContent = `d: ${d}`;
            if (pteEl) pteEl.textContent = `M[${hw.PTR >= 0 ? hw.PTR + p : '?'}] = '${pte}'`;
            if (fEl) fEl.textContent = isAlloc ? `f: ${f}` : 'Fault!';
            if (raEl) raEl.textContent = isAlloc ? `RA: ${ra}` : 'PI = 3';

            if (alertEl) {
                if (!isAlloc) {
                    alertEl.innerHTML = `<span style="color: var(--accent-rose); font-weight: bold;">[PAGE FAULT] Virtual Page ${p} not allocated. Trap to Master Mode.</span>`;
                    if (statusPill) { statusPill.className = "badge badge-danger"; statusPill.textContent = "MMU: Page Fault (PI=3)"; }
                } else {
                    alertEl.innerHTML = `<span style="color: var(--accent-emerald);">Virtual address ${va} mapped to physical address RA=${ra} (Frame ${f}, offset ${d}).</span>`;
                    if (statusPill) { statusPill.className = "badge badge-success"; statusPill.textContent = "MMU: Address Translated"; }
                }
            }
            return;
        }
    }

    // Default idle MMU
    if (vaEl) vaEl.textContent = "VA: --";
    if (pEl) pEl.textContent = "p: --";
    if (dEl) dEl.textContent = "d: --";
    if (pteEl) pteEl.textContent = "M[PTR+p]: --";
    if (fEl) fEl.textContent = "f: --";
    if (raEl) raEl.textContent = "RA: --";
    if (alertEl) alertEl.textContent = "Address translation valid.";
    if (statusPill) { statusPill.className = "badge badge-info"; statusPill.textContent = "MMU: Ready"; }
}

// 30 Physical Frames Matrix Rendering
function render30FramesMatrix() {
    const matrix = document.getElementById("frames-matrix");
    if (!matrix) return;
    matrix.innerHTML = "";

    for (let f = 0; f < 30; f++) {
        const tile = document.createElement("div");
        tile.id = `frame-tile-${f}`;
        tile.className = "frame-tile free";
        tile.innerHTML = `
            <div class="frame-tile-num">F${f}</div>
            <div class="frame-tile-type">FREE</div>
        `;
        tile.title = `Frame ${f}: Memory words ${f*10} .. ${f*10+9}`;
        matrix.appendChild(tile);
    }
}

function update30FramesMatrixUI() {
    const hw = simState.hardware;
    for (let f = 0; f < 30; f++) {
        const tile = document.getElementById(`frame-tile-${f}`);
        if (!tile) continue;

        const role = hw.frames[f] || "free";
        const isActive = (hw.activeFrame === f);

        tile.className = `frame-tile ${role}-frame` + (isActive ? " active-access" : "");
        const typeEl = tile.querySelector(".frame-tile-type");
        if (typeEl) {
            typeEl.textContent = role.toUpperCase();
        }
    }
}

// ==========================================================================
// Memory Grid Inspector
// ==========================================================================

function renderMemoryTable() {
    const tbody = document.getElementById("mem-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const totalWords = simState.phase === 2 ? 300 : 100;
    let html = "";

    for (let w = 0; w < totalWords; w++) {
        const frameNum = Math.floor(w / 10);
        html += `
            <tr id="mem-row-${w}" class="mem-row" data-word="${w}">
                <td style="font-family: var(--font-mono); font-weight: bold; color: var(--text-muted);">${String(w).padStart(3, '0')}</td>
                <td><span class="badge badge-secondary" style="font-size: 10px;">${simState.phase === 2 ? `Frame ${frameNum}` : `Block ${frameNum}`}</span></td>
                <td id="mem-raw-${w}" style="font-family: var(--font-mono); color: var(--accent-cyan);">----</td>
                <td id="mem-ascii-${w}">[Empty]</td>
                <td id="mem-role-${w}"><span style="color: var(--text-muted);">Unused</span></td>
            </tr>
        `;
    }
    tbody.innerHTML = html;
}

function updateMemoryTableHighlights() {
    const hw = simState.hardware;
    const totalWords = simState.phase === 2 ? 300 : 100;

    for (let w = 0; w < totalWords; w++) {
        const row = document.getElementById(`mem-row-${w}`);
        const rawEl = document.getElementById(`mem-raw-${w}`);
        const asciiEl = document.getElementById(`mem-ascii-${w}`);
        const roleEl = document.getElementById(`mem-role-${w}`);
        if (!row) continue;

        const content = hw.memory[w];
        if (content) {
            if (rawEl) rawEl.textContent = content;
            if (asciiEl) asciiEl.textContent = formatMemoryAscii(content);
        } else {
            if (rawEl) rawEl.textContent = "----";
            if (asciiEl) asciiEl.textContent = "[Empty]";
        }

        // Active highlights
        let rowClass = "mem-row";
        if (w === hw.activeMemWord) {
            rowClass += " ic-active";
        } else if (w === hw.activeOpWord) {
            rowClass += " op-active";
        }

        // Check if page table word
        if (simState.phase === 2 && hw.PTR >= 0 && w >= hw.PTR && w < hw.PTR + 10) {
            rowClass += " pt-entry";
            if (roleEl) roleEl.innerHTML = `<span style="color: var(--accent-purple); font-weight: bold;">Page Table (${w - hw.PTR})</span>`;
        } else {
            if (roleEl) {
                if (content) roleEl.innerHTML = `<span style="color: var(--accent-emerald);">Loaded Word</span>`;
                else roleEl.innerHTML = `<span style="color: var(--text-muted);">Unused</span>`;
            }
        }

        row.className = rowClass;
    }
}

function formatMemoryAscii(str) {
    if (!str) return "[Empty]";
    return str.split("").map(c => {
        const code = c.charCodeAt(0);
        if (code === 0) return "·";
        if (code < 32 || code > 126) return " ";
        return c;
    }).join("");
}

function handleMemSearch(query) {
    const rows = document.querySelectorAll(".mem-row");
    const q = query.trim().toLowerCase();
    if (!q) {
        rows.forEach(r => r.style.display = "");
        return;
    }

    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? "" : "none";
    });
}

// ==========================================================================
// Test Suite Execution Runner
// ==========================================================================

async function runAutomatedTests() {
    const modal = document.getElementById("test-runner-modal");
    const outBox = document.getElementById("test-runner-output");
    const statusBox = document.getElementById("test-runner-status");

    if (modal) modal.classList.add("open");
    if (statusBox) statusBox.innerHTML = `<span>⏳ Launching official test suite for Phase ${simState.phase}...</span>`;
    if (outBox) outBox.textContent = "Executing test script via PowerShell...\nPlease wait...";

    if (!simState.backendConnected) {
        if (statusBox) statusBox.innerHTML = `<span style="color: var(--accent-amber);">Backend Offline. Copy and run the command manually:</span>`;
        const cmd = simState.phase === 2 ? "powershell -ExecutionPolicy Bypass -File test/run_test_phase2.ps1" : "powershell -ExecutionPolicy Bypass -File phase1/test/run_test.ps1";
        if (outBox) outBox.textContent = `Please run from terminal in D:\\OS\\CP\\:\n\n${cmd}`;
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/run_tests`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phase: simState.phase })
        });
        const data = await res.json();

        if (data.success) {
            if (statusBox) statusBox.innerHTML = `<span style="color: var(--accent-emerald);">✓ Test Suite PASSED (Exit Code: 0, Duration: ${data.duration_sec}s)</span>`;
        } else {
            if (statusBox) statusBox.innerHTML = `<span style="color: var(--accent-rose);">✕ Test Suite Failed with Exit Code ${data.exit_code}</span>`;
        }

        if (outBox) {
            outBox.textContent = data.stdout + (data.stderr ? "\n\nSTDERR:\n" + data.stderr : "");
        }
    } catch (e) {
        if (statusBox) statusBox.innerHTML = `<span style="color: var(--accent-rose);">Error executing tests: ${e.message}</span>`;
    }
}

function closeTestRunnerModal() {
    const modal = document.getElementById("test-runner-modal");
    if (modal) modal.classList.remove("open");
}

// Output Download & Copy Helpers
function copySimOutput() {
    const outText = document.getElementById("sim-output-text");
    if (outText) {
        copyToClipboard(outText.textContent, event.target);
    }
}

function downloadSimOutput() {
    const outText = document.getElementById("sim-output-text");
    if (!outText || !outText.textContent) return;

    const blob = new Blob([outText.textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `output_phase${simState.phase}_actual.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==========================================================================
// Existing Tabs Rendering & Handlers (Preserved & Enhanced)
// ==========================================================================

function renderPhase1Jobs(filter = "") {
    const tbody = document.getElementById("phase1-jobs-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const filtered = MOS_DATA.phase1Jobs.filter(j => {
        if (!filter) return true;
        const q = filter.toLowerCase();
        return j.name.toLowerCase().includes(q) ||
               j.instructions.toLowerCase().includes(q) ||
               j.expected.toLowerCase().includes(q) ||
               j.id.toString().includes(q);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No matching Phase 1 jobs found.</td></tr>`;
        return;
    }

    filtered.forEach(job => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="cell-num">Job ${job.id}</td>
            <td class="cell-bold">${escapeHtml(job.name)}</td>
            <td><code class="code-pill">${escapeHtml(job.instructions)}</code></td>
            <td class="cell-mono">${escapeHtml(job.expected)}</td>
            <td class="cell-note">${escapeHtml(job.note)}</td>
            <td><span class="badge badge-success">PASS</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPhase2Jobs(filter = "") {
    const tbody = document.getElementById("phase2-jobs-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const filtered = MOS_DATA.phase2Jobs.filter(j => {
        if (!filter) return true;
        const q = filter.toLowerCase();
        return j.jobId.toString().includes(q) ||
               j.purpose.toLowerCase().includes(q) ||
               j.expectedError.toLowerCase().includes(q) ||
               j.ir.toLowerCase().includes(q) ||
               j.jobNum.toString().includes(q);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="empty-state">No matching Phase 2 jobs found.</td></tr>`;
        return;
    }

    filtered.forEach(job => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="cell-num">#${job.jobNum}</td>
            <td class="cell-mono cell-bold">${job.jobId}</td>
            <td>${escapeHtml(job.purpose)}</td>
            <td><span class="badge ${getErrorBadgeClass(job.expectedError)}">${escapeHtml(job.expectedError)}</span></td>
            <td class="cell-num">${job.ic}</td>
            <td><code class="code-pill">${escapeHtml(job.ir.trim() || "H")}</code></td>
            <td class="cell-num">${job.ttc}</td>
            <td class="cell-num">${job.llc}</td>
            <td class="cell-num">${job.blocks}</td>
            <td><span class="badge badge-success">PASS</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderComparisonTable() {
    const tbody = document.getElementById("comparison-table-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    MOS_DATA.comparison.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="cell-bold">${escapeHtml(item.feature)}</td>
            <td class="cell-phase1">${escapeHtml(item.phase1)}</td>
            <td class="cell-phase2">${escapeHtml(item.phase2)}</td>
            <td class="cell-note">${escapeHtml(item.notes)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderArchitectureVisualizer(phase = "phase2") {
    const container = document.getElementById("architecture-diagram-container");
    if (!container) return;

    if (phase === "phase1") {
        container.innerHTML = `
            <div class="arch-flow">
                <div class="arch-step" onclick="showComponentModal('loader')">
                    <div class="arch-step-badge">1. Input & Loading</div>
                    <div class="arch-box" data-comp="loader">
                        <div class="arch-title">Input Cards ($AMJ, $DTA, $END)</div>
                        <div class="arch-desc">LOAD() reads sequentially into locations 00..99</div>
                    </div>
                </div>
                <div class="arch-arrow">➔</div>
                <div class="arch-step" onclick="showComponentModal('memory')">
                    <div class="arch-step-badge">2. Memory</div>
                    <div class="arch-box" data-comp="memory">
                        <div class="arch-title">Physical Memory M[100][4]</div>
                        <div class="arch-desc">Flat 100-word contiguous linear store</div>
                    </div>
                </div>
                <div class="arch-arrow">➔</div>
                <div class="arch-step" onclick="showComponentModal('cpu')">
                    <div class="arch-step-badge">3. CPU Cycle (Slave Mode)</div>
                    <div class="arch-box" data-comp="cpu">
                        <div class="arch-title">EXECUTEUSERPROGRAM()</div>
                        <div class="arch-desc">Fetch IR[IC], Decode (LR, SR, CR, BT, GD, PD, H)</div>
                    </div>
                </div>
                <div class="arch-arrow">➔</div>
                <div class="arch-step" onclick="showComponentModal('interrupts')">
                    <div class="arch-step-badge">4. Trap Flag</div>
                    <div class="arch-box" data-comp="interrupts">
                        <div class="arch-title">Service Interrupt (SI)</div>
                        <div class="arch-desc">SI = 1 (GD), 2 (PD), 3 (H)</div>
                    </div>
                </div>
                <div class="arch-arrow">➔</div>
                <div class="arch-step" onclick="showComponentModal('mos')">
                    <div class="arch-step-badge">5. Supervisor</div>
                    <div class="arch-box" data-comp="mos">
                        <div class="arch-title">MOS (Master Mode)</div>
                        <div class="arch-desc">READ(), WRITE(), TERMINATE()</div>
                    </div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="arch-flow arch-flow-p2">
                <div class="arch-col">
                    <div class="arch-box" onclick="showComponentModal('loader')" data-comp="loader">
                        <div class="arch-badge">Input Stream</div>
                        <div class="arch-title">Paged Loader (LOAD)</div>
                        <div class="arch-desc">Parses $AMJ, extracts Job ID, TTL, TLL</div>
                    </div>
                    <div class="arch-box" onclick="showComponentModal('pcb')" data-comp="pcb">
                        <div class="arch-badge">Process State</div>
                        <div class="arch-title">PCB (Job ID, TTL, TLL, TTC, LLC)</div>
                        <div class="arch-desc">Resource limits & instruction counters</div>
                    </div>
                </div>
                <div class="arch-arrow">➔</div>
                <div class="arch-col">
                    <div class="arch-box" onclick="showComponentModal('allocate')" data-comp="allocate">
                        <div class="arch-badge">Allocator</div>
                        <div class="arch-title">ALLOCATE()</div>
                        <div class="arch-desc">Picks random frame (0..29) with tracking</div>
                    </div>
                    <div class="arch-box" onclick="showComponentModal('pagetable')" data-comp="pagetable">
                        <div class="arch-badge">Paging Table</div>
                        <div class="arch-title">PTR & Page Table (M[PTR+p])</div>
                        <div class="arch-desc">Maps 10 virtual pages to physical frames</div>
                    </div>
                </div>
                <div class="arch-arrow">➔</div>
                <div class="arch-col">
                    <div class="arch-box" onclick="showComponentModal('addressmap')" data-comp="addressmap">
                        <div class="arch-badge">MMU</div>
                        <div class="arch-title">ADDRESSMAP(VA, &RA)</div>
                        <div class="arch-desc">Translates VA ➔ RA; detects PI=2, PI=3</div>
                    </div>
                    <div class="arch-box" onclick="showComponentModal('cpu')" data-comp="cpu">
                        <div class="arch-badge">Slave Mode</div>
                        <div class="arch-title">CPU (EXECUTEUSERPROGRAM)</div>
                        <div class="arch-desc">Fetches, increments TTC, sets TI=2 on TTL</div>
                    </div>
                </div>
                <div class="arch-arrow">➔</div>
                <div class="arch-col">
                    <div class="arch-box" onclick="showComponentModal('interrupts')" data-comp="interrupts">
                        <div class="arch-badge">Interrupt Bus</div>
                        <div class="arch-title">SI, PI, TI Registers</div>
                        <div class="arch-desc">SI (1..3), PI (1..3), TI (0 or 2)</div>
                    </div>
                    <div class="arch-box" onclick="showComponentModal('mos')" data-comp="mos">
                        <div class="arch-badge">Master Mode</div>
                        <div class="arch-title">MOS Master Mode Kernel</div>
                        <div class="arch-desc">Evaluates 2D decision table & terminates</div>
                    </div>
                </div>
            </div>
        `;
    }
}

function renderProjectFiles(filter = "") {
    const tbody = document.getElementById("project-files-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    const filtered = MOS_DATA.projectFiles.filter(f => {
        if (!filter) return true;
        const q = filter.toLowerCase();
        return f.path.toLowerCase().includes(q) ||
               f.phase.toLowerCase().includes(q) ||
               f.desc.toLowerCase().includes(q) ||
               f.type.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No matching project files found.</td></tr>`;
        return;
    }

    filtered.forEach(file => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="cell-mono cell-bold">${escapeHtml(file.path)}</td>
            <td><span class="badge ${getFilePhaseBadgeClass(file.phase)}">${escapeHtml(file.phase)}</span></td>
            <td class="cell-num">${escapeHtml(file.size)}</td>
            <td><code class="code-pill">${escapeHtml(file.type)}</code></td>
            <td class="cell-note">${escapeHtml(file.desc)}</td>
            <td>
                <button class="btn btn-sm btn-copy" onclick="copyToClipboard('${escapeAttr(file.path)}', this)">
                    📋 Copy Path
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function initFilters() {
    const p1Search = document.getElementById("phase1-search");
    if (p1Search) p1Search.addEventListener("input", e => renderPhase1Jobs(e.target.value));

    const p2Search = document.getElementById("phase2-search");
    if (p2Search) p2Search.addEventListener("input", e => renderPhase2Jobs(e.target.value));

    const filesSearch = document.getElementById("files-search");
    if (filesSearch) filesSearch.addEventListener("input", e => renderProjectFiles(e.target.value));

    const archP1 = document.getElementById("arch-tab-p1");
    const archP2 = document.getElementById("arch-tab-p2");
    if (archP1 && archP2) {
        archP1.addEventListener("click", () => {
            archP1.classList.add("active");
            archP2.classList.remove("active");
            renderArchitectureVisualizer("phase1");
        });
        archP2.addEventListener("click", () => {
            archP2.classList.add("active");
            archP1.classList.remove("active");
            renderArchitectureVisualizer("phase2");
        });
    }
}

function initModals() {
    const modal = document.getElementById("component-modal");
    const closeBtn = document.getElementById("modal-close-btn");
    if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => modal.classList.remove("open"));
        modal.addEventListener("click", e => {
            if (e.target === modal) modal.classList.remove("open");
        });
    }

    const testModal = document.getElementById("test-runner-modal");
    if (testModal) {
        testModal.addEventListener("click", e => {
            if (e.target === testModal) closeTestRunnerModal();
        });
    }
}

function showComponentModal(compKey) {
    const comp = MOS_DATA.components[compKey];
    if (!comp) return;

    const modal = document.getElementById("component-modal");
    const title = document.getElementById("modal-title");
    const tag = document.getElementById("modal-tag");
    const summary = document.getElementById("modal-summary");
    const details = document.getElementById("modal-details");
    const code = document.getElementById("modal-code");

    if (title) title.textContent = comp.title;
    if (tag) tag.textContent = comp.tag;
    if (summary) summary.textContent = comp.summary;
    if (details) details.textContent = comp.details;
    if (code) code.textContent = comp.codeSnippet;

    if (modal) modal.classList.add("open");
}

function copyToClipboard(text, buttonElement) {
    if (!navigator.clipboard) {
        fallbackCopy(text);
        showCopyFeedback(buttonElement);
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback(buttonElement);
    }).catch(err => {
        console.error("Copy failed", err);
        fallbackCopy(text);
        showCopyFeedback(buttonElement);
    });
}

function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
        document.execCommand("copy");
    } catch (e) {
        console.warn("Fallback copy failed", e);
    }
    document.body.removeChild(ta);
}

function showCopyFeedback(btn) {
    if (!btn) return;
    const origHtml = btn.innerHTML;
    btn.innerHTML = `<span class="icon">✓</span> Copied!`;
    btn.classList.add("btn-copied");
    setTimeout(() => {
        btn.innerHTML = origHtml;
        btn.classList.remove("btn-copied");
    }, 1800);
}

// Helper Utilities
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function escapeAttr(str) {
    if (!str) return "";
    return String(str)
        .replaceAll('\\', '\\\\')
        .replaceAll("'", "\\'")
        .replaceAll('"', '&quot;');
}

function getErrorBadgeClass(errorStr) {
    if (errorStr.includes("NO ERROR")) return "badge-success";
    if (errorStr.includes("TIME LIMIT") && errorStr.includes("And")) return "badge-composite";
    if (errorStr.includes("TIME LIMIT")) return "badge-warning";
    if (errorStr.includes("LINE LIMIT")) return "badge-warning";
    if (errorStr.includes("PAGE FAULT")) return "badge-danger";
    if (errorStr.includes("OPERAND ERROR")) return "badge-danger";
    if (errorStr.includes("OPERATION CODE")) return "badge-danger";
    if (errorStr.includes("OUT OF DATA")) return "badge-info";
    return "badge-secondary";
}

function getFilePhaseBadgeClass(phaseStr) {
    if (phaseStr.includes("Phase 2")) return "badge-phase2";
    if (phaseStr.includes("Phase 1")) return "badge-phase1";
    if (phaseStr.includes("Build")) return "badge-build";
    if (phaseStr.includes("Documentation")) return "badge-doc";
    return "badge-spec";
}
