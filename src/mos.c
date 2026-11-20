#include "mos.h"
#include <string.h>
#include <stdlib.h>

/*
 * MOS (Master Mode):
 * Service, program, and timer interrupt dispatcher implementing
 * the Phase 2 master mode decision matrix.
 */
void MOS(void) {
    TRACE_EVENT("INTERRUPT", "\"job_id\":%d,\"ti\":%d,\"si\":%d,\"pi\":%d,\"ttc\":%d,\"llc\":%d",
                current_pcb.job_id, TI, SI, PI, current_pcb.ttc, current_pcb.llc);

    if (TI == 0) {
        if (PI != 0) {
            switch (PI) {
                case 1:
                    TERMINATE(EM_OPCODE_ERROR);
                    break;
                case 2:
                    TERMINATE(EM_OPERAND_ERROR);
                    break;
                case 3: {
                    /*
                     * Page Fault handling:
                     * Valid only for GD (input) and SR (store register).
                     */
                    if ((IR[0] == 'G' && IR[1] == 'D') || (IR[0] == 'S' && IR[1] == 'R')) {
                        int va = (IR[2] - '0') * 10 + (IR[3] - '0');
                        int p = va / 10;
                        int new_frame = ALLOCATE();
                        if (new_frame == -1) {
                            TERMINATE(EM_INVALID_PAGE_FAULT);
                            return;
                        }
                        M[PTR + p][0] = ' ';
                        M[PTR + p][1] = ' ';
                        M[PTR + p][2] = '0' + (new_frame / 10);
                        M[PTR + p][3] = '0' + (new_frame % 10);
                        TRACE_EVENT("PAGE_FAULT_RESOLVE", "\"job_id\":%d,\"page\":%d,\"new_frame\":%d",
                                    current_pcb.job_id, p, new_frame);
                        PI = 0;
                    } else {
                        TERMINATE(EM_INVALID_PAGE_FAULT);
                    }
                    break;
                }
                default:
                    break;
            }
            return;
        }

        switch (SI) {
            case 1: {
                int va = (IR[2] - '0') * 10;
                int ra = 0;
                ADDRESSMAP(va, &ra);
                READ(ra);
                SI = 0;
                break;
            }
            case 2: {
                int va = (IR[2] - '0') * 10;
                int ra = 0;
                ADDRESSMAP(va, &ra);
                WRITE(ra);
                SI = 0;
                break;
            }
            case 3:
                TERMINATE(EM_NO_ERROR);
                break;
            default:
                break;
        }
    } else if (TI == 2) {
        if (PI != 0) {
            switch (PI) {
                case 1:
                    TERMINATE(EM_TIME_AND_OPCODE);
                    break;
                case 2:
                    TERMINATE(EM_TIME_AND_OPERAND);
                    break;
                case 3:
                    TERMINATE(EM_TIME_LIMIT);
                    break;
                default:
                    TERMINATE(EM_TIME_LIMIT);
                    break;
            }
            return;
        }

        switch (SI) {
            case 1:
                TERMINATE(EM_TIME_LIMIT);
                break;
            case 2: {
                int va = (IR[2] - '0') * 10;
                int ra = 0;
                ADDRESSMAP(va, &ra);
                WRITE(ra);
                if (!job_terminated) {
                    TERMINATE(EM_TIME_LIMIT);
                }
                break;
            }
            case 3:
                TERMINATE(EM_NO_ERROR);
                break;
            default:
                TERMINATE(EM_TIME_LIMIT);
                break;
        }
    }
}

/*
 * READ:
 * Implements the GD service request.
 * - Forces address units digit to '0'
 * - Reads next (data) card into real memory locations real_address through real_address + 9
 * - If buffer is $END, triggers OUT OF DATA termination (EM = 1)
 */
void READ(int real_address) {
    IR[3] = '0';
    char buffer[BUFFER_SIZE];

    if (fgets(buffer, sizeof(buffer), fp_in) == NULL) {
        TERMINATE(EM_OUT_OF_DATA);
        return;
    }

    if (strncmp(buffer, "$END", 4) == 0) {
        TERMINATE(EM_OUT_OF_DATA);
        return;
    }

    int base_word = (real_address / WORDS_PER_FRAME) * WORDS_PER_FRAME;

    char esc_buf[BUFFER_SIZE * 2];
    escape_trace_str(esc_buf, buffer, (int)strlen(buffer));
    TRACE_EVENT("SERVICE_READ", "\"job_id\":%d,\"real_address\":%d,\"card\":\"%s\"",
                current_pcb.job_id, real_address, esc_buf);

    /* Clear target frame memory block */
    for (int i = 0; i < WORDS_PER_FRAME; i++) {
        for (int j = 0; j < WORD_SIZE; j++) {
            M[base_word + i][j] = '\0';
        }
    }

    /* Store up to 40 characters from card into real memory */
    int word = base_word;
    int col = 0;
    for (int k = 0; buffer[k] != '\0' && buffer[k] != '\r' && buffer[k] != '\n' &&
                    word < base_word + WORDS_PER_FRAME; k++) {
        M[word][col] = buffer[k];
        col++;
        if (col == WORD_SIZE) {
            col = 0;
            word++;
        }
    }

    for (int w = 0; w < WORDS_PER_FRAME; w++) {
        char esc_w[16];
        escape_trace_str(esc_w, M[base_word + w], WORD_SIZE);
        TRACE_EVENT("MEM_SET", "\"word\":%d,\"content\":\"%s\"",
                    base_word + w, esc_w);
    }

    current_pcb.ttc++;
    if (current_pcb.ttc == current_pcb.ttl) {
        TI = 2;
    }
}

/*
 * WRITE:
 * Implements the PD service request.
 * - Forces address units digit to '0'
 * - Increments line limit counter (LLC)
 * - If LLC > TLL, triggers LINE LIMIT EXCEEDED termination (EM = 2) without writing
 * - Otherwise writes one full block (40 bytes) to output file, followed by '\n'
 */
void WRITE(int real_address) {
    IR[3] = '0';
    current_pcb.llc++;
    int base_word = (real_address / WORDS_PER_FRAME) * WORDS_PER_FRAME;

    char esc_block[BLOCK_SIZE * 2 + 1];
    escape_trace_str(esc_block, &M[base_word][0], BLOCK_SIZE);
    TRACE_EVENT("SERVICE_WRITE", "\"job_id\":%d,\"real_address\":%d,\"llc\":%d,\"tll\":%d,\"suppressed\":%s,\"block\":\"%s\"",
                current_pcb.job_id, real_address, current_pcb.llc, current_pcb.tll,
                current_pcb.llc > current_pcb.tll ? "true" : "false", esc_block);

    if (current_pcb.llc > current_pcb.tll) {
        TERMINATE(EM_LINE_LIMIT);
        return;
    }

    /* Write 40 raw memory bytes (including padding nulls) to output file */
    for (int i = 0; i < WORDS_PER_FRAME; i++) {
        for (int j = 0; j < WORD_SIZE; j++) {
            fputc(M[base_word + i][j], fp_out);
        }
    }
    fputc('\n', fp_out);
}

/*
 * TERMINATE:
 * Implements job termination:
 * - Emits formatted 6-line status block followed by job separation newlines
 * - Sets job_terminated flag to stop execution of current job
 */
void TERMINATE(int EM) {
    job_terminated = true;

    const char *msg = "";
    switch (EM) {
        case EM_NO_ERROR:
            msg = " NO ERROR";
            break;
        case EM_OUT_OF_DATA:
            msg = " OUT OF DATA";
            break;
        case EM_LINE_LIMIT:
            msg = " LINE LIMIT EXCEEDED";
            break;
        case EM_TIME_LIMIT:
            msg = " TIME LIMIT EXCEEDED";
            break;
        case EM_OPCODE_ERROR:
            msg = " OPERATION CODE ERROR";
            break;
        case EM_OPERAND_ERROR:
            msg = " OPERAND ERROR";
            break;
        case EM_INVALID_PAGE_FAULT:
            msg = " INVALID PAGE FAULT";
            break;
        case EM_TIME_AND_OPCODE:
            msg = " TIME LIMIT EXCEEDED  And OPERATION CODE ERROR";
            break;
        case EM_TIME_AND_OPERAND:
            msg = " TIME LIMIT EXCEEDED And OPERAND ERROR";
            break;
        default:
            msg = " UNKNOWN ERROR";
            break;
    }

    int reported_llc = current_pcb.llc;
    if (EM == EM_LINE_LIMIT && reported_llc > current_pcb.tll) {
        reported_llc = current_pcb.tll;
    }

    char esc_ir[16];
    escape_trace_str(esc_ir, IR, 4);
    TRACE_EVENT("TERMINATE", "\"job_id\":%d,\"em\":%d,\"message\":\"%s\",\"ic\":%d,\"ir\":\"%s\",\"ttc\":%d,\"llc\":%d",
                current_pcb.job_id, EM, msg, IC, esc_ir, current_pcb.ttc, reported_llc);

    fprintf(fp_out, "JOB ID   :  %d\n", current_pcb.job_id);
    fprintf(fp_out, "%s\n", msg);
    fprintf(fp_out, "IC       :  %d\n", IC);
    fprintf(fp_out, "IR       :  ");
    fwrite(IR, 1, WORD_SIZE, fp_out);
    fputc('\n', fp_out);
    fprintf(fp_out, "TTC      :  %d\n", current_pcb.ttc);
    fprintf(fp_out, "LLC      :  %d\n\n", reported_llc);
}
