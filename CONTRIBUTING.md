# Contributing to MOS

Thank you for your interest in contributing to the Multiprogramming Operating System (MOS) project!

## Code of Conduct

This project follows a standard open-source code of conduct. Be respectful, inclusive, and constructive in all interactions.

## How to Contribute

### Reporting Issues

1. Check existing issues first
2. Use the issue template
3. Include:
   - Phase (1 or 2)
   - Job ID if applicable
   - Expected vs actual behavior
   - Steps to reproduce
   - Build environment (OS, GCC version)

### Submitting Changes

1. **Fork** the repository
2. **Create a branch** from `main`: `git checkout -b feature/your-feature-name`
3. **Make changes** following the coding standards below
4. **Test thoroughly**:
   - Both phases compile clean (`make` in root and `phase1/`)
   - All 11 Phase 1 jobs pass (`.\test\run_test.ps1`)
   - All 10 Phase 2 jobs pass (`.\test\run_test_phase2.ps1`)
   - Byte-for-byte match on Phase 2 (1500/1500 bytes)
5. **Commit** with clear messages
6. **Push** and open a Pull Request

### Coding Standards

#### C Code Style
- **Standard**: C11 (`-std=c11`)
- **Warnings**: `-Wall -Wextra` — zero warnings required
- **Indentation**: 4 spaces (no tabs)
- **Braces**: K&R style (opening brace on same line)
- **Line length**: ≤ 100 characters
- **Naming**:
  - Functions: `PascalCase` (e.g., `ADDRESSMAP`, `ALLOCATE`, `EXECUTEUSERPROGRAM`)
  - Variables: `camelCase` (e.g., `virtualAddress`, `frameAllocated`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `MEMORY_SIZE`, `FRAME_SIZE`)
  - Structs: `PascalCase` with typedef (e.g., `PCB`, `MemoryWord`)

#### File Organization
```
src/
├── main.c          # Loader, initialization, execution driver
├── mos.c           # MOS services, interrupt handling, instruction execution
├── vm.c            # Virtual memory: ADDRESSMAP, ALLOCATE, page faults
└── include/mos.h   # All shared declarations, structs, constants
```

#### Phase 1 vs Phase 2
- **Phase 1** (`phase1/`): Linear memory only — no virtual memory, no page tables
- **Phase 2** (`src/`): Full paged virtual memory — all Phase 1 features plus paging

Changes to one phase may need corresponding updates in the other.

### Testing Requirements

#### Phase 1
```powershell
cd phase1
make
.\..\test\run_test.ps1
# All 11 jobs must PASS with exact string match to output_Phase1.txt
```

#### Phase 2
```powershell
make
.\test\run_test_phase2.ps1
# All 10 jobs must PASS with 1500/1500 byte-for-byte match to output_phase2.txt
```

#### Dashboard
```powershell
.\run_dashboard.ps1
# Verify: trace loads, playback works, all panels update
```

### Commit Message Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `build`, `ci`

Examples:
- `feat(vm): add LRU page replacement algorithm`
- `fix(mos): correct combined interrupt code 35 handling`
- `test(phase2): add job 406 for operand error edge case`
- `docs: update README with dashboard keyboard shortcuts`

### Pull Request Checklist

- [ ] Code compiles with `-Wall -Wextra -std=c11` (0 warnings)
- [ ] All Phase 1 tests pass (11/11)
- [ ] All Phase 2 tests pass (10/10, 1500/1500 bytes)
- [ ] New tests added for new functionality
- [ ] Documentation updated (README, comments)
- [ ] No PPT/DOCX generation files committed (see .gitignore)
- [ ] No build artifacts committed (*.exe, *.o, output*.txt)

### Architecture Notes for Contributors

#### Adding a New Instruction
1. Add opcode to `mos.h` instruction enum
2. Implement in `EXECUTEUSERPROGRAM()` in `mos.c`
3. Update FETCH/DECODE logic if operand format changes
4. Add test job to input deck
5. Update expected output

#### Adding a New Interrupt Combination
1. Add case to MOS decision matrix in `mos.c`
2. Define error code in `mos.h` (EM values)
3. Implement termination logic in `TERMINATE()`
4. Add test job exercising the combination
5. Verify combined codes (34, 35) work correctly

#### Extending PCB
1. Add field to `PCB` struct in `mos.h`
2. Initialize in `INIT()` / `LOAD()` in `main.c`
3. Update in relevant MOS services
4. Display in termination block
5. Update dashboard PCB panel

#### Dashboard Extensions
- Trace event types: add to `script.js` event handlers
- New panels: add HTML structure in `index.html`, styles in `style.css`, logic in `script.js`
- Maintain JSON-lines trace compatibility

## Review Process

1. Automated CI checks run on PR (build + tests)
2. At least one maintainer review required
3. All checks must pass before merge
4. Squash and merge to `main`

## Questions?

Open a discussion or issue — we're happy to help!

---

**Team MOS** — VIT Pune, Dept of IT  
Roll Nos. 14, 15, 16, 17