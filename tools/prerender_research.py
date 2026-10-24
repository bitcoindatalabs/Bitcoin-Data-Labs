"""Write the static copies that crawlers read: the paper list in research.html, its JSON-LD, and llms.txt.

research.html renders its papers from scripts/papers.js in the browser. Search engines that run JavaScript see
them; most AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Common Crawl) don't, and would find an empty page. This
renders the page once, the way a browser would, and saves the result between the `prerender:` markers in
research.html. In the browser the page's own script still re-renders from papers.js, so visitors always see the
registry; the static copy only goes stale for crawlers, until this is run again.

It also writes:
  * a schema.org ScholarlyArticle list (JSON-LD) into research.html's <head>;
  * llms.txt at the site root (https://llmstxt.org): a plain-Markdown map of the papers and projects, built from
    papers.js and projects.js.

Run it whenever papers.js or projects.js changes:

    python tools/prerender_research.py          # from the repo root; needs playwright + chromium
"""
import functools
import http.server
import json
import re
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / 'research.html'
LLMS = ROOT / 'llms.txt'
SITE = 'https://bitcoindatalabs.org/'

# Author identity for the JSON-LD. Add the ORCID iD and Google Scholar profile URLs to `sameAs` once they exist:
# they are how search engines and AI tools tell this Saurabh Kumar from the many others.
AUTHOR = {
    '@type': 'Person',
    'name': 'Saurabh Kumar',
    'affiliation': {'@type': 'Organization', 'name': 'Bitcoin Data Labs', 'url': SITE},
}


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def replace_block(text: str, name: str, body: str) -> str:
    """Replace what sits between <!-- prerender:name --> and <!-- /prerender:name -->."""
    pattern = re.compile(rf'(<!-- prerender:{name} -->).*?(<!-- /prerender:{name} -->)', re.S)
    if not pattern.search(text):
        raise SystemExit(f'research.html has no prerender:{name} markers')
    return pattern.sub(lambda m: m.group(1) + body + m.group(2), text, count=1)


def json_ld(papers: list) -> str:
    items = []
    for i, p in enumerate(papers, 1):
        doi = f'10.48550/arXiv.{p["arxiv"]}'
        items.append({
            '@type': 'ListItem',
            'position': i,
            'item': {
                '@type': 'ScholarlyArticle',
                '@id': f'{SITE}research.html#{p["id"]}',
                'headline': p['title'],
                'alternativeHeadline': p['subtitle'],
                'name': f'{p["title"]} {p["subtitle"]}',
                'author': AUTHOR,
                'datePublished': p['firstDate'],
                'dateModified': p['date'],
                'description': p['finding'],
                'abstract': p['summary'],
                'url': f'https://arxiv.org/abs/{p["arxiv"]}',
                'sameAs': [f'https://doi.org/{doi}'],
                'identifier': [
                    {'@type': 'PropertyValue', 'propertyID': 'arXiv', 'value': p['arxiv']},
                    {'@type': 'PropertyValue', 'propertyID': 'DOI', 'value': doi},
                ],
                'image': SITE + p['figure']['src'],
                'isAccessibleForFree': True,
            },
        })
    data = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': 'Bitcoin Data Labs research papers',
        'itemListElement': items,
    }
    body = json.dumps(data, ensure_ascii=False, indent=2).replace('</', '<\\/')
    return f'\n    <script type="application/ld+json">\n{body}\n    </script>\n    '


def llms_txt(papers: list, series: dict, projects: list, about: str) -> str:
    absolute = lambda url: url if re.match(r'https?://', url) else SITE + url
    lines = [
        '# Bitcoin Data Labs',
        '',
        f'> {about}',
        '',
        'Every number in our papers is produced by code published with the paper, from a fixed data cutoff. Security '
        'results are aggregates only: no individual node is named, ranked or labelled. Data repositories are '
        'CC BY 4.0; credit "Source: Bitcoin Data Labs (bitcoindatalabs.org)". Contact: sorukumar@bitcoindatalabs.org.',
        '',
    ]
    for key, s in series.items():
        lines += [f'## Research papers: {s["label"]}', '', s['question'] + ' ' + s['blurb'], '']
        for p in (p for p in papers if p['series'] == key):
            lines.append(
                f'- [{p["title"]} {p["subtitle"]}](https://arxiv.org/abs/{p["arxiv"]}): {p["authors"]}, Bitcoin Data '
                f'Labs, arXiv:{p["arxiv"]} ({p["version"]}). {p["finding"]} Code and data: {p["repo"]}')
        lines.append('')
    lines += ['## Dashboards, reports and data', '']
    for x in projects:
        if x.get('status') in ('paper', 'lab'):
            continue
        lines.append(f'- [{x["name"]}]({absolute(x["url"])}): {x.get("question") or x["desc"]}')
    lines += [
        '',
        '## Optional',
        '',
        f'- [Research]({SITE}research.html): the papers, with BibTeX for each',
        f'- [All work]({SITE}work.html): the full catalog of dashboards, reports, datasets and investigations',
        '- [GitHub](https://github.com/bitcoindatalabs): code and data for everything above',
        '',
    ]
    return '\n'.join(lines)


def main() -> int:
    server = http.server.ThreadingHTTPServer(
        ('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_address[1]}/'

    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(base + 'research.html', wait_until='networkidle')
            page.add_script_tag(url=base + 'scripts/projects.js')
            if errors:
                print('page errors:', *errors, sep='\n  ')
                return 1
            head = page.inner_html('#series-head').strip()
            cards = page.inner_html('#papers').strip()
            papers = page.evaluate('window.BDL_PAPERS')
            series = page.evaluate('window.BDL_SERIES')
            projects = page.evaluate('window.BDL_PROJECTS')
            browser.close()
    finally:
        server.shutdown()

    if not papers or 'class="paper"' not in cards:
        print('papers did not render; nothing written')
        return 1

    about = re.search(r'<meta name="description" content="([^"]+)"',
                      (ROOT / 'index.html').read_text(encoding='utf-8')).group(1)

    text = PAGE.read_text(encoding='utf-8')
    text = replace_block(text, 'series-head', head)
    text = replace_block(text, 'papers', cards)
    text = replace_block(text, 'jsonld', json_ld(papers))
    PAGE.write_text(text, encoding='utf-8', newline='\n')
    LLMS.write_text(llms_txt(papers, series, projects, about), encoding='utf-8', newline='\n')

    print(f'research.html: {len(papers)} papers prerendered; wrote llms.txt ({LLMS.stat().st_size // 1024 + 1} KB)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
