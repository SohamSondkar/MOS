CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -Iinclude

SRCS = src/main.c src/vm.c src/mos.c
OBJS = $(SRCS:.c=.o)
TARGET = mos.exe

PHASE1_SRCS = phase1/src/main.c phase1/src/vm.c phase1/src/mos.c
PHASE1_TARGET = mos_phase1.exe

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $(OBJS)

src/%.o: src/%.c include/mos.h
	$(CC) $(CFLAGS) -c $< -o $@

phase1: $(PHASE1_TARGET)

$(PHASE1_TARGET): $(PHASE1_SRCS)
	$(CC) -Wall -Wextra -std=c11 -Iphase1/include -o $@ $(PHASE1_SRCS)

clean:
	rm -f $(OBJS) $(TARGET) $(PHASE1_TARGET) output.txt output_phase2_actual.txt

.PHONY: all clean phase1
