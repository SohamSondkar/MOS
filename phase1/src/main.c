#include "mos.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>

/* Global file pointers used by VM and MOS services */
FILE *fp_in  = NULL;
FILE *fp_out = NULL;
FILE *fp_trace = NULL;
int trace_step = 0;

void escape_trace_str(const char *src, char *dst, size_t dst_size) {
    if (!src || !dst || dst_size == 0) return;
    size_t d = 0;
    for (size_t s = 0; src[s] != '\0' && d + 4 < dst_size; s++) {
        unsigned char c = (unsigned char)src[s];
        if (c == '"') { dst[d++] = '\\'; dst[d++] = '"'; }
        else if (c == '\\') { dst[d++] = '\\'; dst[d++] = '\\'; }
        else if (c == '\n') { dst[d++] = '\\'; dst[d++] = 'n'; }
        else if (c == '\r') { dst[d++] = '\\'; dst[d++] = 'r'; }
        else if (c == '\t') { dst[d++] = '\\'; dst[d++] = 't'; }
        else if (c < 32 || c > 126) { dst[d++] = ' '; }
        else { dst[d++] = (char)c; }
    }
    dst[d] = '\0';
}

void TRACE_EVENT(const char *event_type, const char *fmt, ...) {
    if (fp_trace == NULL) return;
    trace_step++;
    fprintf(fp_trace, "{\"step\":%d,\"event\":\"%s\"", trace_step, event_type);
    if (fmt && fmt[0] != '\0') {
        char buf[1024];
        va_list args;
        va_start(args, fmt);
        vsnprintf(buf, sizeof(buf), fmt, args);
        va_end(args);
        fprintf(fp_trace, ",%s", buf);
    }
    fprintf(fp_trace, "}\n");
    fflush(fp_trace);
}

int main(int argc, char *argv[]) {
    const char *input_path  = "input_Phase1.txt";
    const char *output_path = "output.txt";
    const char *trace_path  = NULL;

    int pos = 0;
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "--trace") == 0 && i + 1 < argc) {
            trace_path = argv[++i];
        } else {
            if (pos == 0) input_path = argv[i];
            else if (pos == 1) output_path = argv[i];
            pos++;
        }
    }

    printf("===================================================\n");
    printf("   Multiprogramming Operating System (MOS) - Phase 1\n");
    printf("===================================================\n");
    printf("Input file:  %s\n", input_path);
    printf("Output file: %s\n", output_path);
    if (trace_path) {
        printf("Trace file:  %s\n", trace_path);
    }
    printf("\n");

    fp_in = fopen(input_path, "r");
    if (fp_in == NULL) {
        perror("Failed to open input file");
        return EXIT_FAILURE;
    }

    fp_out = fopen(output_path, "w");
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

    /* Start the MOS Loader */
    printf("[MOS] Starting Loader...\n");
    LOAD();
    printf("[MOS] All jobs processed successfully.\n");

    fclose(fp_in);
    fclose(fp_out);
    if (fp_trace != NULL) {
        fclose(fp_trace);
    }

    return EXIT_SUCCESS;
}
