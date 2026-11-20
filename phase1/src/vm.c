#include "mos.h"
#include <string.h>
#include <stdlib.h>

/* Virtual Machine State Definitions */
char M[MEMORY_WORDS][WORD_SIZE];
char IR[WORD_SIZE];
int  IC = 0;
char R[WORD_SIZE];
int  C = 0;
int  SI = 0;
int  job_lines_printed = 0;

/*
 * INIT:
 * Resets the simulated hardware components before loading and running each job:
 * - Clears memory M (all 100 words x 4 bytes set to null characters)
 * - Clears registers IR and R
 * - Resets IC to 0, toggle C to 0 (False), SI to 0, and job_lines_printed to 0
 */
void INIT(void) {
    for (int i = 0; i < MEMORY_WORDS; i++) {
        for (int j = 0; j < WORD_SIZE; j++) {
            M[i][j] = '\0';
        }
    }
    for (int j = 0; j < WORD_SIZE; j++) {
        IR[j] = '\0';
        R[j] = '\0';
    }
    IC = 0;
    C = 0;
    SI = 0;
    job_lines_printed = 0;
}

/*
 * LOAD:
 * Simulates the job loader.
 * Reads the input file line-by-line:
 * - Detects $AMJ to start and initialize a new job
 * - Loads program cards into memory in 10-word blocks (locations m to m + 9)
 * - Detects $DTA to trigger MOS/STARTEXECUTION
 * - Handles $END cards
 */
void LOAD(void) {
    char buffer[BUFFER_SIZE];

    while (fgets(buffer, sizeof(buffer), fp_in) != NULL) {
        /* Check for Start of Job control card: $AMJ */
        if (strncmp(buffer, "$AMJ", 4) == 0) {
            INIT();
            int m = 0;

            /* Read program cards until $DTA or $END */
            while (fgets(buffer, sizeof(buffer), fp_in) != NULL) {
                if (strncmp(buffer, "$DTA", 4) == 0) {
                    /* Control card: $DTA -> begin program execution */
                    MOS_STARTEXECUTION();
                    /*
                     * When execution finishes (via H or abort), control returns here.
                     * We break out to the outer loop to process subsequent jobs.
                     */
                    break;
                }
                else if (strncmp(buffer, "$END", 4) == 0) {
                    /* Control card: $END without $DTA */
                    break;
                }
                else {
                    /* Program Card */
                    if (m >= MEMORY_WORDS) {
                        fprintf(stderr, "Error: Memory exceeded (m >= 100)\n");
                        TERMINATE();
                        break;
                    }

                    /* Store buffer into memory locations m through m + 9 */
                    int word = m;
                    int col = 0;
                    for (int k = 0; buffer[k] != '\0' && buffer[k] != '\r' && buffer[k] != '\n' && word < m + BLOCK_WORDS; k++) {
                        M[word][col] = buffer[k];
                        col++;
                        if (col == WORD_SIZE) {
                            col = 0;
                            word++;
                        }
                    }
                    m += BLOCK_WORDS;
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
 * Fetches instructions pointed to by IC, increments IC, and decodes:
 * - LR: Load Register (R <- M[address])
 * - SR: Store Register (M[address] <- R)
 * - CR: Compare Register (C <- (R == M[address]))
 * - BT: Branch on True (If C == 1, IC <- address)
 * - GD: Get Data (SI = 1, trap to MOS)
 * - PD: Print Data (SI = 2, trap to MOS)
 * - H:  Halt (SI = 3, trap to MOS, terminate)
 */
void EXECUTEUSERPROGRAM(void) {
    while (1) {
        if (IC < 0 || IC >= MEMORY_WORDS) {
            SI = 3;
            MOS();
            break;
        }

        /* 1. Fetch instruction into IR */
        for (int j = 0; j < WORD_SIZE; j++) {
            IR[j] = M[IC][j];
        }
        IC++;

        /* 2. Decode and execute instruction */
        if (IR[0] == 'H') {
            /* Halt instruction */
            SI = 3;
            MOS();
            break;
        }
        else if (IR[0] == 'L' && IR[1] == 'R') {
            /* Load Register */
            int address = (IR[2] - '0') * 10 + (IR[3] - '0');
            if (address >= 0 && address < MEMORY_WORDS) {
                for (int j = 0; j < WORD_SIZE; j++) {
                    R[j] = M[address][j];
                }
            }
        }
        else if (IR[0] == 'S' && IR[1] == 'R') {
            /* Store Register */
            int address = (IR[2] - '0') * 10 + (IR[3] - '0');
            if (address >= 0 && address < MEMORY_WORDS) {
                for (int j = 0; j < WORD_SIZE; j++) {
                    M[address][j] = R[j];
                }
            }
        }
        else if (IR[0] == 'C' && IR[1] == 'R') {
            /* Compare Register with Memory */
            int address = (IR[2] - '0') * 10 + (IR[3] - '0');
            if (address >= 0 && address < MEMORY_WORDS) {
                int match = 1;
                for (int j = 0; j < WORD_SIZE; j++) {
                    if (R[j] != M[address][j]) {
                        match = 0;
                        break;
                    }
                }
                C = match;
            }
        }
        else if (IR[0] == 'B' && IR[1] == 'T') {
            /* Branch if True */
            int address = (IR[2] - '0') * 10 + (IR[3] - '0');
            if (C == 1) {
                IC = address;
            }
        }
        else if (IR[0] == 'G' && IR[1] == 'D') {
    /* Get Data: Service Interrupt 1 */
    SI = 1;
    MOS();

    if (SI == 3) {
        /* Out-of-data abort occurred in READ */
        break;
    }

    SI = 0;
}
        else if (IR[0] == 'P' && IR[1] == 'D') {
            /* Print Data: Service Interrupt 2 */
            SI = 2;
            MOS();
            SI = 0;
        }
        else {
            /* Empty or unrecognized instruction word; stop */
            break;
        }
    }
}
