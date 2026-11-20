#include "mos.h"
#include <stdio.h>
#include <stdlib.h>

/* Global file pointers used by VM and MOS services */
FILE *fp_in  = NULL;
FILE *fp_out = NULL;

int main(int argc, char *argv[]) {
    const char *input_path  = "input_phase2.txt";
    const char *output_path = "output.txt";

    if (argc >= 2) {
        input_path = argv[1];
    }
    if (argc >= 3) {
        output_path = argv[2];
    }

    printf("===================================================\n");
    printf("   Multiprogramming Operating System (MOS) - Phase 2\n");
    printf("===================================================\n");
    printf("Input file:  %s\n", input_path);
    printf("Output file: %s\n\n", output_path);

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

    return EXIT_SUCCESS;
}
