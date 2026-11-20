#include "mos.h"
#include <string.h>
#include <stdlib.h>

/*
 * MOS (Master Mode):
 * Service interrupt handler. Dispatches supervisor calls:
 * - Case 1: READ (GD)
 * - Case 2: WRITE (PD)
 * - Case 3: TERMINATE (H)
 */
void MOS(void) {
    TRACE_EVENT("INTERRUPT", "\"job_id\":%d,\"si\":%d", current_job_id, SI);
    switch (SI) {
        case 1:
            READ();
            break;
        case 2:
            WRITE();
            break;
        case 3:
            TERMINATE();
            break;
        default:
            break;
    }
}

/*
 * READ:
 * Implements the GD service request.
 * - Forces address units digit to '0' (IR[4] <- 0 in 1-based indexing)
 * - Reads next (data) card from input file into memory locations IR[3,4] through IR[3,4] + 9
 * - If M[IR[3,4]] = $END, aborts out-of-data
 */
void READ(void) {
    /* IR[4] <- 0 (In 0-indexed C: IR[3] = '0') */
    IR[3] = '0';
    int address = (IR[2] - '0') * 10;

    char buffer[BUFFER_SIZE];
    if (fgets(buffer, sizeof(buffer), fp_in) == NULL) {
        /* Unexpected EOF before data or $END card */
        fprintf(stderr, "Out-of-data error: unexpected EOF on READ\n");
        SI = 3;
        TERMINATE();
        return;
    }

    char esc_buf[BUFFER_SIZE * 2];
    escape_trace_str(buffer, esc_buf, sizeof(esc_buf));
    TRACE_EVENT("SERVICE_READ", "\"job_id\":%d,\"block\":%d,\"card\":\"%s\"", current_job_id, address, esc_buf);

    /* If next card is $END, trigger out-of-data abort */
    if (strncmp(buffer, "$END", 4) == 0) {
        fprintf(stderr, "Out-of-data error: encountered $END on READ\n");
        SI = 3;
        TERMINATE();
        return;
    }

    /* Clear target memory block (10 words) */
    for (int i = address; i < address + BLOCK_WORDS; i++) {
        for (int j = 0; j < WORD_SIZE; j++) {
            M[i][j] = '\0';
        }
    }

    /* Store card buffer in memory locations address through address + 9 */
    int word = address;
    int col = 0;
    for (int k = 0; buffer[k] != '\0' && buffer[k] != '\r' && buffer[k] != '\n' && word < address + BLOCK_WORDS; k++) {
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
    if (col > 0 && word < address + BLOCK_WORDS) {
        char word_buf[5] = { M[word][0], M[word][1], M[word][2], M[word][3], '\0' };
        char esc_w[16];
        escape_trace_str(word_buf, esc_w, sizeof(esc_w));
        TRACE_EVENT("MEM_SET", "\"word\":%d,\"content\":\"%s\"", word, esc_w);
    }
}

/*
 * WRITE:
 * Implements the PD service request.
 * - Forces address units digit to '0' (IR[4] <- 0 in 1-based indexing)
 * - Writes one block (10 words of memory) from memory locations IR[3,4] through IR[3,4] + 9
 * - Preserves all actual spaces and non-null characters
 */
void WRITE(void) {
    /* IR[4] <- 0 (In 0-indexed C: IR[3] = '0') */
    IR[3] = '0';
    int address = (IR[2] - '0') * 10;

    char line_buf[BLOCK_SIZE + 1];
    int line_len = 0;

    /* Write non-null characters from the 10-word block */
    for (int i = address; i < address + BLOCK_WORDS; i++) {
        for (int j = 0; j < WORD_SIZE; j++) {
            if (M[i][j] != '\0') {
                fputc(M[i][j], fp_out);
                if (line_len < BLOCK_SIZE) {
                    line_buf[line_len++] = M[i][j];
                }
            }
        }
    }
    line_buf[line_len] = '\0';
    char esc_out[BLOCK_SIZE * 2];
    escape_trace_str(line_buf, esc_out, sizeof(esc_out));
    TRACE_EVENT("SERVICE_WRITE", "\"job_id\":%d,\"block\":%d,\"output\":\"%s\"", current_job_id, address, esc_out);

    fputc('\n', fp_out);
    job_lines_printed++;
}

/*
 * TERMINATE:
 * Implements job termination.
 * - Writes blank lines in output file separating jobs if output was produced
 * - Does not consume cards from input stream, allowing the loader to naturally
 *   synchronize to the next $AMJ
 */
void TERMINATE(void) {
    TRACE_EVENT("TERMINATE", "\"job_id\":%d,\"ic\":%d", current_job_id, IC);
    /* Write blank line separation matching the test specification if job produced output */
    if (job_lines_printed > 0) {
        fprintf(fp_out, "\n\n\n");
    }
}
