#ifndef MOS_H
#define MOS_H

#include <stdio.h>
#include <stdbool.h>

/* System Constants for Phase 2 */
#define TOTAL_FRAMES    30
#define WORDS_PER_FRAME 10
#define MEMORY_WORDS    (TOTAL_FRAMES * WORDS_PER_FRAME) /* 300 words */
#define WORD_SIZE       4                                /* 4 bytes per word */
#define BLOCK_SIZE      (WORDS_PER_FRAME * WORD_SIZE)    /* 40 bytes per card/page */
#define PAGE_TABLE_SIZE 10                               /* 10 virtual pages per job */
#define BUFFER_SIZE     256

/* Process Control Block (PCB) */
typedef struct {
    int job_id; /* Columns 5-8 of $AMJ */
    int ttl;    /* Total Time Limit: Columns 9-12 */
    int tll;    /* Total Line Limit: Columns 13-16 */
    int ttc;    /* Total Time Counter: starts at 0 */
    int llc;    /* Line Limit Counter: starts at 0 */
} PCB;

extern PCB current_pcb;

/*
 * Virtual Machine Registers and Components:
 * - M:   Main Memory (300 locations, each 4 bytes)
 * - IR:  Instruction Register (4 bytes: 2 bytes opcode, 2 bytes operand)
 * - IC:  Instruction Counter Register (00 - 99)
 * - R:   General Purpose Register (4 bytes)
 * - C:   Comparison Toggle / Condition Flag (1 byte: 1=True, 0=False)
 * - PTR: Page Table Register (points to real memory word of the page table)
 * - SI:  Service Interrupt flag (1=Read, 2=Write, 3=Terminate)
 * - PI:  Program Interrupt flag (1=Operation Error, 2=Operand Error, 3=Page Fault)
 * - TI:  Time Interrupt flag (0=None, 2=Time Limit Exceeded)
 */
extern char M[MEMORY_WORDS][WORD_SIZE];
extern char IR[WORD_SIZE];
extern int  IC;
extern char R[WORD_SIZE];
extern int  C;
extern int  PTR;
extern int  SI;
extern int  PI;
extern int  TI;

/* Error Message (EM) Codes */
typedef enum {
    EM_NO_ERROR            = 0,
    EM_OUT_OF_DATA         = 1,
    EM_LINE_LIMIT          = 2,
    EM_TIME_LIMIT          = 3,
    EM_OPCODE_ERROR        = 4,
    EM_OPERAND_ERROR       = 5,
    EM_INVALID_PAGE_FAULT  = 6,
    EM_TIME_AND_OPCODE     = 34,
    EM_TIME_AND_OPERAND    = 35
} ErrorMessageCode;

/* Frame Allocation Tracking */
extern bool frame_allocated[TOTAL_FRAMES];

/* Global flags */
extern bool job_terminated;
extern int  job_count;

/* File pointers for simulated card reader, printer, and optional tracer */
extern FILE *fp_in;
extern FILE *fp_out;
extern FILE *fp_trace;
extern int  trace_step;

/* Execution Tracing Helpers */
void TRACE_EVENT(const char *event_type, const char *fmt, ...);
void escape_trace_str(char *dest, const char *src, int len);

/* VM, Paging, and Loader Prototypes */
void INIT(void);
void LOAD(void);
int  ALLOCATE(void);
int  ADDRESSMAP(int VA, int *RA);
void MOS_STARTEXECUTION(void);
void EXECUTEUSERPROGRAM(void);

/* MOS (Master Mode) Supervisor Call Prototypes */
void MOS(void);
void READ(int real_address);
void WRITE(int real_address);
void TERMINATE(int EM);

#endif /* MOS_H */
