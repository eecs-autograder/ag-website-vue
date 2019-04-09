#! /usr/bin/env python3

import argparse
import glob

def main():
    args = parse_args()

    too_long_lines = []

    for pattern in args.file_patterns:
        if args.verbose:
            print('Pattern:', pattern)

        for filename in glob.iglob(pattern, recursive=True):
            if args.verbose:
                print('File:', filename)

            with open(filename) as f:
                for line_num, line in enumerate(f, start=1):
                    if ignore_line(line, args.ignore_startswith):
                        continue

                    if len(line) > args.max_line_length:
                        too_long_lines.append((filename, line_num, len(line)))

    for filename, line_num, line_len in too_long_lines:
        print('In file "{}", line {} exceeds max length ({} > {})'.format(
            filename, line_num, line_len, args.max_line_length))

    if too_long_lines:
        exit(1)


def ignore_line(line, ignore_strings):
    for ignore_string in ignore_strings:
        if line.startswith(ignore_string):
            return True

    return False


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('max_line_length', type=int)
    parser.add_argument('file_patterns', nargs='+')
    parser.add_argument('-v', '--verbose', action='store_true')
    parser.add_argument('-i', '--ignore_startswith', action='append', 
                        help='Ignore lines that start with this string')

    return parser.parse_args()


if __name__ == '__main__':
    main()
