#! /usr/bin/env python3

import argparse
from collections import namedtuple
import glob
import re

CallInfo = namedtuple('CallInfo', ['subject', 'filename', 'line_num'])

SUBSCRIBE_REGEX = re.compile(r'^\s*(?P<subject>[a-zA-Z]+)\.subscribe\(')
UNSUBSCRIBE_REGEX = re.compile(r'^\s*(?P<subject>[a-zA-Z]+)\.unsubscribe\(')


def main():
    args = parse_args()

    error_free = True
    for pattern in args.file_patterns:
        if args.verbose:
            print('Pattern:', pattern)

        for filename in glob.iglob(pattern, recursive=True):
            if args.verbose:
                print('File:', filename)

            error_free = error_free and check_sub_unsub_calls(filename, args.verbose)

    if not error_free:
        exit(1)

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('file_patterns', nargs='+')
    parser.add_argument('-v', '--verbose', action='store_true')

    return parser.parse_args()


# Prints info about sub/unsub mismatches.
# Returns True if no problems were found False otherwise.
def check_sub_unsub_calls(filename, verbose):
    with open(filename) as f:
        subscribe_calls = []
        unsubscribe_calls = []
        for (line_num, line) in enumerate(f.readlines(), start=1):
            match = SUBSCRIBE_REGEX.search(line)
            if match:
                subscribe_calls.append(
                    CallInfo(match.group('subject'), filename, line_num))

            match = UNSUBSCRIBE_REGEX.search(line)
            if match:
                unsubscribe_calls.append(
                    CallInfo(match.group('subject'), filename, line_num))

        sub_calls_by_subject = {call.subject: call for call in subscribe_calls}
        unsub_calls_by_subject = {call.subject: call for call in unsubscribe_calls}

        subscribed_subjects = set(sub_calls_by_subject.keys())
        unsubscribed_subjects = set(unsub_calls_by_subject.keys())

        if subscribed_subjects == unsubscribed_subjects:
            return True

        error_free = True

        no_unsub = subscribed_subjects - unsubscribed_subjects
        if no_unsub:
            error_free = False
            for subject in no_unsub:
                line_num = sub_calls_by_subject[subject].line_num
                print(f'{filename}:{line_num} "{subject}" has no unsubscribe call')

        no_sub = unsubscribed_subjects - subscribed_subjects
        if no_sub:
            error_free = False
            for subject in no_sub:
                line_num = unsub_calls_by_subject[subject].line_num
                print(f'{filename}:{line_num} "{subject}" has no subscribe call')


if __name__ == '__main__':
    main()
