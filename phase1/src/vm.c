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
int  current_job_id = 0;

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
            current_job_id = 0;
            sscanf(buffer + 4, "%4d", &current_job_id);

            char esc_card[BUFFER_SIZE * 2];
            escape_trace_str(buffer, esc_card, sizeof(esc_card));
            TRACE_EVENT("JOB_START", "\"job_id\":%d,\"card\":\"%s\"", current_job_id, esc_card);

            int m = 0;

            /* Read program cards until $DTA or $END */
            while (fgets(buffer, sizeof(buffer), fp_in) != NULL) {
                if (strncmp(buffer, "$DTA", 4) == 0) {
                    /* Control card: $DTA -> begin program execution */
                    TRACE_EVENT("CARD_DTA", "\"job_id\":%d", current_job_id);
                    MOS_STARTEXECUTION();
                    /*
                     * When execution finishes (via H or abort), control returns here.
                     * We break out to the outer loop to process subsequent jobs.
                     */
                    break;
                }
                else if (strncmp(buffer, "$END", 4) == 0) {
                    /* Control card: $END without $DTA */
                    TRACE_EVENT("CARD_END", "\"job_id\":%d", current_job_id);
                    break;
                }
                else {
                    /* Program Card */
                    if (m >= MEMORY_WORDS) {
                        fprintf(stderr, "Error: Memory exceeded (m >= 100)\n");
                        TERMINATE();
                        break;
                    }

                    escape_trace_str(buffer, esc_card, sizeof(esc_card));
                    TRACE_EVENT("LOAD_PROG", "\"job_id\":%d,\"block\":%d,\"card\":\"%s\"", current_job_id, m, esc_card);

                    /* Store buffer into memory locations m through m + 9 */
                    int word = m;
                    int col = 0;
                    for (int k = 0; buffer[k] != '\0' && buffer[k] != '\r' && buffer[k] != '\n' && word < m + BLOCK_WORDS; k++) {
                        M[word][col] = buffer[k];
                        col++;
                        if (col == WORD_SIZE) {
                            char word_buf[5] = { M[word][0], M[word][1], M[word][2], M[word][3], '\0' };
                            char esc_w[16];
                            escape_trace_str(word_buf, esc_w, sizeof(esc_w));
                            TRACE_EVENT("MEM_SET", "\"word\":%d,\"content\":\"%s\"", word, esc_w);
                            col = 0;
                            word++;
                        }
                    }
                    if (col > 0 && word < m + BLOCK_WORDS) {
                        char word_buf[5] = { M[word][0], M[word][1], M[word][2], M[word][3], '\0' };
                        char esc_w[16];
                        escape_trace_str(word_buf, esc_w, sizeof(esc_w));
                        TRACE_EVENT("MEM_SET", "\"word\":%d,\"content\":\"%s\"", word, esc_w);
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
    TRACE_EVENT("START_EXEC", "\"job_id\":%d,\"ic\":0", current_job_id);
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

        int prev_ic = IC;
        /* 1. Fetch instruction into IR */
        for (int j = 0; j < WORD_SIZE; j++) {
            IR[j] = M[IC][j];
        }
        IC++;

        char raw_ir[5] = { IR[0], IR[1], IR[2], IR[3], '\0' };
        char esc_ir[16];
        escape_trace_str(raw_ir, esc_ir, sizeof(esc_ir));
        TRACE_EVENT("FETCH", "\"job_id\":%d,\"ic\":%d,\"ir\":\"%s\"", current_job_id, prev_ic, esc_ir);

        char raw_r[5] = { R[0], R[1], R[2], R[3], '\0' };
        char esc_r[16];

        /* 2. Decode and execute instruction */
        if (IR[0] == 'H') {
            /* Halt instruction */
            escape_trace_str(raw_r, esc_r, sizeof(esc_r));
            TRACE_EVENT("EXECUTE", "\"job_id\":%d,\"opcode\":\"H\",\"r\":\"%s\",\"c\":%d,\"ic\":%d", current_job_id, esc_r, C, IC);
            SI = 3;
            MOS();
            break;
        }
        else if (IR[0] == 'L' && IR[1] == 'R') {
            /* Load Register */
            int address = (IR[2] - '0') * 10 + (IR[3] - '0');
            TRACE_EVENT("DECODE", "\"job_id\":%d,\"opcode\":\"LR\",\"operand\":\"%02d\"", current_job_id, address);
            if (address >= 0 && address < MEMORY_WORDS) {
                for (int j = 0; j < WORD_SIZE; j++) {
                    R[j] = M[address][j];
                }
            }
            raw_r[0] = R[0]; raw_r[1] = R[1]; raw_r[2] = R[2]; raw_r[3] = R[3];
            escape_trace_str(raw_r, esc_r, sizeof(esc_r));
            TRACE_EVENT("EXECUTE", "\"job_id\":%d,\"opcode\":\"LR\",\"r\":\"%s\",\"c\":%d,\"ic\":%d", current_job_id, esc_r, C, IC);
        }
        else if (IR[0] == 'S' && IR[1] == 'R') {
            /* Store Register */
            int address = (IR[2] - '0') * 10 + (IR[3] - '0');
            TRACE_EVENT("DECODE", "\"job_id\":%d,\"opcode\":\"SR\",\"operand\":\"%02d\"", current_job_id, address);
            if (address >= 0 && address < MEMORY_WORDS) {
                for (int j = 0; j < WORD_SIZE; j++) {
                    M[address][j] = R[j];
                }
                char esc_content[16];
                escape_trace_str(raw_r, esc_content, sizeof(esc_content));
                TRACE_EVENT("MEM_SET", "\"word\":%d,\"content\":\"%s\"", address, esc_content);
            }
            escape_trace_str(raw_r, esc_r, sizeof(esc_r));
            TRACE_EVENT("EXECUTE", "\"job_id\":%d,\"opcode\":\"SR\",\"r\":\"%s\",\"c\":%d,\"ic\":%d", current_job_id, esc_r, C, IC);
        }
        else if (IR[0] == 'C' && IR[1] == 'R') {
            /* Compare Register with Memory */
            int address = (IR[2] - '0') * 10 + (IR[3] - '0');
            TRACE_EVENT("DECODE", "\"job_id\":%d,\"opcode\":\"CR\",\"operand\":\"%02d\"", current_job_id, address);
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
            escape_trace_str(raw_r, esc_r, sizeof(esc_r));
            TRACE_EVENT("EXECUTE", "\"job_id\":%d,\"opcode\":\"CR\",\"r\":\"%s\",\"c\":%d,\"ic\":%d", current_job_id, esc_r, C, IC);
        }
        else if (IR[0] == 'B' && IR[1] == 'T') {
            /* Branch if True */
            int address = (IR[2] - '0') * 10 + (IR[3] - '0');
            TRACE_EVENT("DECODE", "\"job_id\":%d,\"opcode\":\"BT\",\"operand\":\"%02d\"", current_job_id, address);
            if (C == 1) {
                IC = address;
            }
            escape_trace_str(raw_r, esc_r, sizeof(esc_r));
            TRACE_EVENT("EXECUTE", "\"job_id\":%d,\"opcode\":\"BT\",\"r\":\"%s\",\"c\":%d,\"ic\":%d", current_job_id, esc_r, C, IC);
        }
        else if (IR[0] == 'G' && IR[1] == 'D') {
            /* Get Data: Service Interrupt 1 */
            TRACE_EVENT("DECODE", "\"job_id\":%d,\"opcode\":\"GD\",\"operand\":\"%02d\"", current_job_id, (IR[2] - '0') * 10);
            SI = 1;
            MOS();
            escape_trace_str(raw_r, esc_r, sizeof(esc_r));
            TRACE_EVENT("EXECUTE", "\"job_id\":%d,\"opcode\":\"GD\",\"r\":\"%s\",\"c\":%d,\"ic\":%d", current_job_id, esc_r, C, IC);

            if (SI == 3) {
                /* Out-of-data abort occurred in READ */
                break;
            }

            SI = 0;
        }
        else if (IR[0] == 'P' && IR[1] == 'D') {
            /* Print Data: Service Interrupt 2 */
            TRACE_EVENT("DECODE", "\"job_id\":%d,\"opcode\":\"PD\",\"operand\":\"%02d\"", current_job_id, (IR[2] - '0') * 10);
            SI = 2;
            MOS();
            escape_trace_str(raw_r, esc_r, sizeof(esc_r));
            TRACE_EVENT("EXECUTE", "\"job_id\":%d,\"opcode\":\"PD\",\"r\":\"%s\",\"c\":%d,\"ic\":%d", current_job_id, esc_r, C, IC);
            SI = 0;
        }
        else {
            /* Empty or unrecognized instruction word; stop */
            escape_trace_str(raw_r, esc_r, sizeof(esc_r));
            TRACE_EVENT("TERMINATE", "\"job_id\":%d,\"message\":\"HALT_OR_EMPTY\",\"ic\":%d", current_job_id, IC);
            break;
        }
    }
}
