#include "mos.h"
#include <string.h>
#include <stdlib.h>

/* Virtual Machine State Definitions */
char M[MEMORY_WORDS][WORD_SIZE];
char IR[WORD_SIZE];
int  IC = 0;
char R[WORD_SIZE];
int  C = 0;
int  PTR = 0;
int  SI = 0;
int  PI = 0;
int  TI = 0;

PCB  current_pcb;
bool frame_allocated[TOTAL_FRAMES];
bool job_terminated = false;
int  job_count = 0;

/*
 * ALLOCATE:
 * Randomly selects an unallocated memory frame (0..29).
 * Returns the frame number, or -1 if all frames are occupied.
 */
int ALLOCATE(void) {
    int start = rand() % TOTAL_FRAMES;
    for (int i = 0; i < TOTAL_FRAMES; i++) {
        int frame = (start + i) % TOTAL_FRAMES;
        if (!frame_allocated[frame]) {
            frame_allocated[frame] = true;
            return frame;
        }
    }
    return -1;
}

/*
 * INIT:
 * Resets the simulated hardware components and job state before each job:
 * - Clears memory M (300 words x 4 bytes set to null characters)
 * - Clears registers IR, R
 * - Resets IC, C, PTR, SI, PI, TI
 * - Resets PCB fields (job_id, ttl, tll, ttc, llc)
 * - Marks all 30 frames as free
 * - Resets job_terminated flag
 */
void INIT(void) {
    for (int i = 0; i < MEMORY_WORDS; i++) {
        for (int j = 0; j < WORD_SIZE; j++) {
            M[i][j] = '\0';
        }
    }
    for (int j = 0; j < WORD_SIZE; j++) {
        IR[j] = '\0';
        R[j]  = '\0';
    }
    IC  = 0;
    C   = 0;
    PTR = 0;
    SI  = 0;
    PI  = 0;
    TI  = 0;

    current_pcb.job_id = 0;
    current_pcb.ttl    = 0;
    current_pcb.tll    = 0;
    current_pcb.ttc    = 0;
    current_pcb.llc    = 0;

    for (int i = 0; i < TOTAL_FRAMES; i++) {
        frame_allocated[i] = false;
    }
    job_terminated = false;
}

/*
 * ADDRESSMAP:
 * Translates a virtual address VA (00..99) to a real address RA (000..299).
 * - Checks page table at M[PTR + page]
 * - Returns 0 on success with *RA set
 * - Returns -1 on error and sets PI:
 *     PI = 2 (Operand Error) if VA is out of bounds
 *     PI = 3 (Page Fault) if page entry is unallocated ('*')
 */
int ADDRESSMAP(int VA, int *RA) {
    if (VA < 0 || VA >= 100) {
        PI = 2; /* Operand Error */
        return -1;
    }

    int p = VA / 10; /* Virtual page: 0..9 */
    int d = VA % 10; /* Word offset: 0..9 */

    if (p < 0 || p >= PAGE_TABLE_SIZE) {
        PI = 2;
        return -1;
    }

    /* Check page table entry */
    if (M[PTR + p][0] == '*' || M[PTR + p][2] < '0' || M[PTR + p][2] > '9' ||
        M[PTR + p][3] < '0' || M[PTR + p][3] > '9') {
        PI = 3; /* Page Fault */
        return -1;
    }

    int frame = (M[PTR + p][2] - '0') * 10 + (M[PTR + p][3] - '0');
    if (frame < 0 || frame >= TOTAL_FRAMES) {
        PI = 3;
        return -1;
    }

    *RA = frame * WORDS_PER_FRAME + d;
    return 0;
}

/*
 * PARSE_OPERAND:
 * Validates that the 2-character operand in IR[2..3] consists of decimal digits.
 * If valid, parses into *VA (00..99) and returns 0.
 * If invalid, sets PI = 2 (Operand Error) and returns -1.
 */
static int PARSE_OPERAND(const char *op, int *VA) {
    if (op[0] < '0' || op[0] > '9' || op[1] < '0' || op[1] > '9') {
        PI = 2; /* Operand Error */
        return -1;
    }
    *VA = (op[0] - '0') * 10 + (op[1] - '0');
    return 0;
}

/*
 * LOAD:
 * Simulates the paged job loader:
 * - Reads control cards: $AMJ, $DTA, $END
 * - Parses PCB from $AMJ
 * - Allocates frame for Page Table and initializes entries to '*'
 * - Reads program cards into allocated frames and updates Page Table
 * - Switches to execution upon $DTA
 */
void LOAD(void) {
    char buffer[BUFFER_SIZE];

    while (fgets(buffer, sizeof(buffer), fp_in) != NULL) {
        if (strncmp(buffer, "$AMJ", 4) == 0) {
            if (job_count > 0) {
                /* Add separating newline between jobs */
                fputc('\n', fp_out);
            }
            job_count++;

            INIT();

            /* Parse Job ID (cols 5-8), TTL (cols 9-12), TLL (cols 13-16) */
            char temp[5];
            memcpy(temp, buffer + 4, 4);
            temp[4] = '\0';
            current_pcb.job_id = atoi(temp);

            memcpy(temp, buffer + 8, 4);
            temp[4] = '\0';
            current_pcb.ttl = atoi(temp);

            memcpy(temp, buffer + 12, 4);
            temp[4] = '\0';
            current_pcb.tll = atoi(temp);

            current_pcb.ttc = 0;
            current_pcb.llc = 0;

            /* Allocate frame for Page Table */
            int pt_frame = ALLOCATE();
            if (pt_frame == -1) {
                fprintf(stderr, "Error: Unable to allocate frame for page table\n");
                TERMINATE(EM_INVALID_PAGE_FAULT);
                continue;
            }
            PTR = pt_frame * WORDS_PER_FRAME;

            /* Initialize Page Table entries to '*' */
            for (int i = 0; i < PAGE_TABLE_SIZE; i++) {
                for (int j = 0; j < WORD_SIZE; j++) {
                    M[PTR + i][j] = '*';
                }
            }

            /* Read program cards into allocated memory frames */
            int prog_page = 0;
            while (fgets(buffer, sizeof(buffer), fp_in) != NULL) {
                if (strncmp(buffer, "$DTA", 4) == 0) {
                    /* Control card: $DTA -> begin program execution */
                    MOS_STARTEXECUTION();
                    break;
                } else if (strncmp(buffer, "$END", 4) == 0) {
                    /* Control card: $END without $DTA */
                    break;
                } else {
                    /* Program Card */
                    if (prog_page >= PAGE_TABLE_SIZE) {
                        fprintf(stderr, "Error: Program exceeds virtual page limit\n");
                        TERMINATE(EM_INVALID_PAGE_FAULT);
                        break;
                    }

                    int prog_frame = ALLOCATE();
                    if (prog_frame == -1) {
                        fprintf(stderr, "Error: Memory frames exhausted\n");
                        TERMINATE(EM_INVALID_PAGE_FAULT);
                        break;
                    }

                    /* Record frame in Page Table */
                    M[PTR + prog_page][0] = ' ';
                    M[PTR + prog_page][1] = ' ';
                    M[PTR + prog_page][2] = '0' + (prog_frame / 10);
                    M[PTR + prog_page][3] = '0' + (prog_frame % 10);

                    /* Load up to 10 words (40 bytes) into the allocated frame */
                    int word = prog_frame * WORDS_PER_FRAME;
                    int col = 0;
                    for (int k = 0; buffer[k] != '\0' && buffer[k] != '\r' && buffer[k] != '\n' &&
                                    word < prog_frame * WORDS_PER_FRAME + WORDS_PER_FRAME; k++) {
                        M[word][col] = buffer[k];
                        col++;
                        if (col == WORD_SIZE) {
                            col = 0;
                            word++;
                        }
                    }
                    prog_page++;
                }
            }
        }
    }
}

/*
 * MOS_STARTEXECUTION:
 * Resets the Instruction Counter (IC <- 00) and switches to Slave Mode
 * to execute the user program.
 */
void MOS_STARTEXECUTION(void) {
    IC = 0;
    EXECUTEUSERPROGRAM();
}

/*
 * EXECUTEUSERPROGRAM (Slave Mode):
 * Main virtual CPU execution cycle.
 */
void EXECUTEUSERPROGRAM(void) {
    while (!job_terminated) {
        /*
         * If TI == 2 at entry, time limit has already expired.
         * Fetch current instruction to populate IR/IC, validate opcode/operand,
         * and trap to Master Mode.
         */
        if (TI == 2) {
            int real_ic = 0;
            if (ADDRESSMAP(IC, &real_ic) != 0) {
                MOS();
                break;
            }
            for (int j = 0; j < WORD_SIZE; j++) {
                IR[j] = M[real_ic][j];
            }
            IC++;

            /* Check for Operation Code Error */
            if (!(IR[0] == 'G' && IR[1] == 'D') &&
                !(IR[0] == 'P' && IR[1] == 'D') &&
                !(IR[0] == 'L' && IR[1] == 'R') &&
                !(IR[0] == 'S' && IR[1] == 'R') &&
                !(IR[0] == 'C' && IR[1] == 'R') &&
                !(IR[0] == 'B' && IR[1] == 'T') &&
                (IR[0] != 'H')) {
                PI = 1;
                MOS();
                break;
            }

            /* Check for Operand Error */
            if (IR[0] != 'H') {
                int va = 0;
                if (PARSE_OPERAND(&IR[2], &va) != 0) {
                    MOS();
                    break;
                }
            }

            /* If instruction is H: Normal termination takes precedence */
            if (IR[0] == 'H') {
                SI = 3;
                MOS();
                break;
            }

            /* If instruction is PD: WRITE, THEN TERMINATE(3) */
            if (IR[0] == 'P' && IR[1] == 'D') {
                int va = (IR[2] - '0') * 10;
                int real_op = 0;
                if (ADDRESSMAP(va, &real_op) != 0) {
                    /* Invalid page fault under TI == 2 */
                    MOS();
                    break;
                }
                SI = 2;
                current_pcb.ttc++;
                MOS();
                break;
            }

            /* For GD or other instructions: TI == 2 triggers TERMINATE(3) */
            if (IR[0] == 'G' && IR[1] == 'D') {
                SI = 1;
            }
            MOS();
            break;
        }

        /* 1. Instruction Fetch */
        int real_ic = 0;
        if (ADDRESSMAP(IC, &real_ic) != 0) {
            MOS();
            break;
        }
        for (int j = 0; j < WORD_SIZE; j++) {
            IR[j] = M[real_ic][j];
        }
        IC++;

        /* 2. Decode and Execute */
        if (IR[0] == 'H') {
            SI = 3;
            current_pcb.ttc++;
            if (current_pcb.ttc == current_pcb.ttl) {
                TI = 2;
            }
            MOS();
            break;
        } else if (IR[0] == 'G' && IR[1] == 'D') {
            int va = 0;
            if (PARSE_OPERAND(&IR[2], &va) != 0) {
                MOS();
                break;
            }
            int real_op = 0;
            if (ADDRESSMAP(va, &real_op) != 0) {
                /* Valid page fault for GD: allocate frame in Master Mode */
                MOS();
                if (job_terminated) break;
                ADDRESSMAP(va, &real_op);
            }
            SI = 1;
            MOS();
            if (job_terminated) break;
        } else if (IR[0] == 'P' && IR[1] == 'D') {
            int va = 0;
            if (PARSE_OPERAND(&IR[2], &va) != 0) {
                MOS();
                break;
            }
            int real_op = 0;
            if (ADDRESSMAP(va, &real_op) != 0) {
                /* Page fault on PD is invalid */
                MOS();
                break;
            }
            SI = 2;
            current_pcb.ttc++;
            if (current_pcb.ttc == current_pcb.ttl) {
                TI = 2;
            }
            MOS();
            if (job_terminated) break;
        } else if (IR[0] == 'L' && IR[1] == 'R') {
            int va = 0;
            if (PARSE_OPERAND(&IR[2], &va) != 0) {
                MOS();
                break;
            }
            int real_op = 0;
            if (ADDRESSMAP(va, &real_op) != 0) {
                /* Invalid page fault */
                MOS();
                break;
            }
            for (int j = 0; j < WORD_SIZE; j++) {
                R[j] = M[real_op][j];
            }
            current_pcb.ttc++;
            if (current_pcb.ttc == current_pcb.ttl) {
                TI = 2;
            }
        } else if (IR[0] == 'S' && IR[1] == 'R') {
            int va = 0;
            if (PARSE_OPERAND(&IR[2], &va) != 0) {
                MOS();
                break;
            }
            int real_op = 0;
            if (ADDRESSMAP(va, &real_op) != 0) {
                /* Valid page fault for SR: allocate frame in Master Mode */
                MOS();
                if (job_terminated) break;
                ADDRESSMAP(va, &real_op);
            }
            for (int j = 0; j < WORD_SIZE; j++) {
                M[real_op][j] = R[j];
            }
            current_pcb.ttc++;
            if (current_pcb.ttc == current_pcb.ttl) {
                TI = 2;
            }
        } else if (IR[0] == 'C' && IR[1] == 'R') {
            int va = 0;
            if (PARSE_OPERAND(&IR[2], &va) != 0) {
                MOS();
                break;
            }
            int real_op = 0;
            if (ADDRESSMAP(va, &real_op) != 0) {
                /* Invalid page fault */
                MOS();
                break;
            }
            int match = 1;
            for (int j = 0; j < WORD_SIZE; j++) {
                if (R[j] != M[real_op][j]) {
                    match = 0;
                    break;
                }
            }
            C = match;
            current_pcb.ttc++;
            if (current_pcb.ttc == current_pcb.ttl) {
                TI = 2;
            }
        } else if (IR[0] == 'B' && IR[1] == 'T') {
            int va = 0;
            if (PARSE_OPERAND(&IR[2], &va) != 0) {
                MOS();
                break;
            }
            if (C == 1) {
                IC = va;
            }
            current_pcb.ttc++;
            if (current_pcb.ttc == current_pcb.ttl) {
                TI = 2;
            }
        } else {
            /* Unknown Operation Code */
            PI = 1;
            MOS();
            break;
        }
    }
}
