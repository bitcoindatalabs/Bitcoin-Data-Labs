# Bitcoin-Data-Labs

Bitcoin Data Labs is a non-profit focused on research and open-source projects for the Bitcoin and Lightning Network ecosystems. We provide data analytics, tools, and insights.

Live at [bitcoindatalabs.org](https://bitcoindatalabs.org). This repo serves two things:

1. **The landing site**: `index.html` (the story), `work.html` (full catalog), `research.html` (papers), `support.html` (funders).
   - `styles/bdl.css` holds the landing-only styles.
   - `scripts/site.js` handles the header nav, scroll reveal, and live numbers fetched from the tracker, Lightning and TWIB JSON. Every live value ships with a dated static fallback in the HTML.
   - `scripts/projects.js` is the project registry behind `work.html`. Add new work there.
   - `scripts/papers.js` is the paper registry behind `research.html`, the brief and the deck. Each new paper also needs
     its cover and key figure in `assets/research/`, a card in `index.html#research` and an entry in `projects.js`.
     Its numbers must match the paper.
   - **After any change to `papers.js` or `projects.js`, run `python tools/prerender_research.py`.** Most AI crawlers
     don't run JavaScript, so without it they see an empty research page. It saves the rendered paper list into
     `research.html` (between the `prerender:` markers), writes the papers' schema.org JSON-LD into its `<head>`, and
     regenerates `llms.txt`. `robots.txt` welcomes all crawlers and points to `sitemap.xml`; add new top-level pages
     there.
   - `deck/` is a 6-slide presentation at bitcoindatalabs.org/deck/, unlinked and set to `noindex`. Use the arrow keys or Space to move, F for full screen, and Print → Save as PDF for an offline copy. It shows the same live numbers as the homepage.
   - `brief/` is a two-page lab brief for journalists and funders at bitcoindatalabs.org/brief/, unlinked and set to
     `noindex`. The page is the master copy; `python tools/build_brief_pdf.py` prints it to
     `brief/bitcoin-data-labs-brief.pdf` (US Letter, live numbers of the day) and fails if a page overflows. Rebuild the
     PDF whenever the page or a paper changes.
   - `screenshots/live/` holds product captures. `screenshots/reports/` holds fallback copies of report slides, which the pages otherwise hot-link from `bdl-report-assets`.
2. **The shared UI shell** used by every child app: `components/app-components.js`, `components/*.html` and `styles/styles.css`. Changes here affect all `*.bitcoindatalabs.org` sites. See `BITCOIN-DATA-LABS-INTEGRATION.md`.
