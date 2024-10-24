#! /usr/bin/env python3

# This script starts an http server listening on localhost:9999 and then runs
# npm test (with arguments to this script passed through).
# Requires Python 3.6 or newer.

import argparse
from collections import Counter
from http.client import HTTPConnection
from http.server import BaseHTTPRequestHandler
import threading
import socketserver
import subprocess

# IMPORTANT: The port being listened on must be the same as the port used in tests/setup.ts.
PORT = 9999

request_urls = Counter()
request_urls_lock = threading.Lock()
tcp_server = None
server_ready = threading.Event()


def main():
    args = parse_args()
    server_thread = threading.Thread(target=start_server)
    server_thread.start()

    while not server_ready.wait(.1):
        http = HTTPConnection('localhost', port=PORT, timeout=1)
        http.request('READY', '/')
        http.getresponse()

    result = subprocess.run(['./node_modules/.bin/vitest', 'run'] + args.test_args)

    tcp_server.shutdown()
    server_thread.join()

    if len(request_urls) == 0:
        exit(result.returncode)

    print('\nWARNING: Unmocked HTTP requests were '
          'sent to the following urls (<url>, <count>):')
    for url, count in request_urls.items():
        print(f'{url}, {count}')

    exit(1)


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('test_args', nargs=argparse.REMAINDER)

    return parser.parse_args()


def start_server():
    global tcp_server
    with AllowReuseAddressTCPServer(("", PORT), RequestHandler) as server:
        tcp_server = server
        server.serve_forever()


class AllowReuseAddressTCPServer(socketserver.TCPServer):
    allow_reuse_address = True


class RequestHandler(BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.record_request()

    def do_GET(self):
        self.record_request()

    def do_POST(self):
        self.record_request()

    def do_PUT(self):
        self.record_request()

    def do_PATCH(self):
        self.record_request()

    def do_DELETE(self):
        self.record_request()

    def record_request(self):
        print(self.headers)
        with request_urls_lock:
            request_urls[self.path] += 1
        self.send_error(501, 'Unmocked HTTP request detected')

    def do_READY(self):
        server_ready.set()
        self.send_response(200)
        self.end_headers()


if __name__ == '__main__':
    main()
