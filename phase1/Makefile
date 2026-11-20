CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -Iinclude

SRCS = src/main.c src/vm.c src/mos.c
OBJS = $(SRCS:.c=.o)
TARGET = mos.exe

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $(OBJS)

src/%.o: src/%.c include/mos.h
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) $(TARGET) output.txt

.PHONY: all clean
