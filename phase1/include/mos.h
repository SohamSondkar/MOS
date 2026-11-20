#ifndef MOS_H
#define MOS_H

#include <stdio.h>
#include <stdbool.h>

/* System Constants */
#define MEMORY_WORDS   100
#define WORD_SIZE      4
#define BLOCK_WORDS    10
#define BLOCK_SIZE     (BLOCK_WORDS * WORD_SIZE) /* 40 bytes per card/block */
#define BUFFER_SIZE    256

/*
 * Virtual Machine Registers and Components:
 * - M:  Memory (100 locations, each 4 bytes)
 * - IR: Instruction Register (4 bytes: 2 bytes opcode, 2 bytes operand)
 * - IC: Instruction Counter Register (00 - 99)
 * - R:  General Purpose Register (4 bytes)
 * - C:  Comparison Toggle / Condition Flag (1 byte: 1=True, 0=False)
 * - SI: Service Interrupt flag (1=Read, 2=Write, 3=Terminate)
 */
extern char M[MEMORY_WORDS][WORD_SIZE];
extern char IR[WORD_SIZE];
extern int  IC;
extern char R[WORD_SIZE];
extern int  C;
extern int  SI;
extern int  job_lines_printed;
extern int  current_job_id;

/* File pointers for simulated card reader and printer */
extern FILE *fp_in;
extern FILE *fp_out;

/* Optional JSON-lines trace file pointer and step counter */
extern FILE *fp_trace;
extern int trace_step;
void TRACE_EVENT(const char *event_type, const char *fmt, ...);
void escape_trace_str(const char *src, char *dst, size_t dst_size);

/* VM & Loader Prototypes */
void INIT(void);
void LOAD(void);
void MOS_STARTEXECUTION(void);
void EXECUTEUSERPROGRAM(void);

/* MOS (Master Mode) Supervisor Call Prototypes */
void MOS(void);
void READ(void);
void WRITE(void);
void TERMINATE(void);

#endif /* MOS_H */
