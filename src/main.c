#include "mos.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>

/* Global file pointers used by VM, MOS services, and optional tracer */
FILE *fp_in    = NULL;
FILE *fp_out   = NULL;
FILE *fp_trace = NULL;
int  trace_step = 0;

void escape_trace_str(char *dest, const char *src, int len) {
    int pos = 0;
    for (int i = 0; i < len; i++) {
        unsigned char c = (unsigned char)src[i];
        if (c >= 32 && c <= 126 && c != '"' && c != '\\') {
            dest[pos++] = (char)c;
        } else if (c == '"' || c == '\\') {
            dest[pos++] = '\\';
            dest[pos++] = (char)c;
        } else if (c == '\0') {
            dest[pos++] = ' ';
        } else {
            dest[pos++] = '.';
        }
    }
    dest[pos] = '\0';
}

void TRACE_EVENT(const char *event_type, const char *fmt, ...) {
    if (fp_trace == NULL) return;
    trace_step++;
    char payload[1024];
    va_list args;
    va_start(args, fmt);
    vsnprintf(payload, sizeof(payload), fmt, args);
    va_end(args);

    fprintf(fp_trace, "{\"step\":%d,\"event\":\"%s\",%s}\n", trace_step, event_type, payload);
    fflush(fp_trace);
}

int main(int argc, char *argv[]) {
    const char *input_path  = "input_phase2.txt";
    const char *output_path = "output.txt";
    const char *trace_path  = NULL;
    int pos_idx = 0;

    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--trace") == 0 && i + 1 < argc) {
            trace_path = argv[i + 1];
            i++;
        } else if (argv[i][0] != '-') {
            if (pos_idx == 0) {
                input_path = argv[i];
                pos_idx++;
            } else if (pos_idx == 1) {
                output_path = argv[i];
                pos_idx++;
            }
        }
    }

    printf("===================================================\n");
    printf("   Multiprogramming Operating System (MOS) - Phase 2\n");
    printf("===================================================\n");
    printf("Input file:  %s\n", input_path);
    printf("Output file: %s\n", output_path);
    if (trace_path != NULL) {
        printf("Trace file:  %s\n", trace_path);
    }
    printf("\n");

    /* Initialize pseudo-random number generator for frame allocation */
    srand(0);

    fp_in = fopen(input_path, "r");
    if (fp_in == NULL) {
        perror("Failed to open input file");
        return EXIT_FAILURE;
    }

    fp_out = fopen(output_path, "wb");
    if (fp_out == NULL) {
        perror("Failed to open output file");
        fclose(fp_in);
        return EXIT_FAILURE;
    }

    if (trace_path != NULL) {
        fp_trace = fopen(trace_path, "w");
        if (fp_trace == NULL) {
            perror("Warning: Failed to open trace file");
        }
    }

    /*
     * output_phase2.txt begins with a single leading newline byte before
     * the first job's output blocks.
     */
    fputc('\n', fp_out);

    /* Start the MOS Loader */
    printf("[MOS] Starting Paged Loader...\n");
    LOAD();
    printf("[MOS] All batch jobs processed successfully.\n");

    fclose(fp_in);
    fclose(fp_out);

    if (fp_trace != NULL) {
        fclose(fp_trace);
    }

    return EXIT_SUCCESS;
}
