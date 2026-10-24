"""Render the unlisted lab brief (brief/index.html) to brief/bitcoin-data-labs-brief.pdf.

The page is the master copy; this prints it the way a browser would, after the
live numbers have loaded, so the PDF carries the numbers of the day it was built.
It fails instead of writing a PDF if a page's content overflows its US Letter
sheet (print CSS clips overflow, so the text would silently disappear).

    python tools/build_brief_pdf.py          # from the repo root; needs playwright + chromium
"""
import functools
import http.server
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'brief' / 'bitcoin-data-labs-brief.pdf'


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def main() -> int:
    # Served over http, not file://, so the page can fetch papers.js and the live JSON.
    server = http.server.ThreadingHTTPServer(
        ('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_address[1]}/brief/'

    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(url, wait_until='networkidle')
            page.evaluate('document.fonts.ready')
            page.emulate_media(media='print')

            if errors:
                print('page errors:', *errors, sep='\n  ')
                return 1
            overflow = page.evaluate("""() => [...document.querySelectorAll('.sheet')]
                .map((s, i) => ({ page: i + 1, over: s.scrollHeight - s.clientHeight }))
                .filter(x => x.over > 0)""")
            if overflow:
                for o in overflow:
                    print(f'page {o["page"]} overflows its sheet by {o["over"]}px; shorten it')
                return 1

            page.pdf(path=str(OUT), prefer_css_page_size=True, print_background=True)
            browser.close()
    finally:
        server.shutdown()

    print(f'wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
