# Bitcoin-Data-Labs

Bitcoin Data Labs is a non-profit focused on research and open-source projects for the Bitcoin and Lightning Network ecosystems. We provide data analytics, tools, and insights.

Live at [bitcoindatalabs.org](https://bitcoindatalabs.org). This repo serves two things:

1. **The landing site**: `index.html` (the story), `work.html` (full catalog), `support.html` (funders).
   - `styles/bdl.css` holds the landing-only styles.
   - `scripts/site.js` handles the header nav, scroll reveal, and live numbers fetched from the tracker, Lightning and TWIB JSON. Every live value ships with a dated static fallback in the HTML.
   - `scripts/projects.js` is the project registry behind `work.html`. Add new work there.
   - `deck/` is a 5-slide presentation at bitcoindatalabs.org/deck/, unlinked and set to `noindex`. Use the arrow keys or Space to move, F for full screen, and Print → Save as PDF for an offline copy. It shows the same live numbers as the homepage.
   - `screenshots/live/` holds product captures. `screenshots/reports/` holds fallback copies of report slides, which the pages otherwise hot-link from `bdl-report-assets`.
2. **The shared UI shell** used by every child app: `components/app-components.js`, `components/*.html` and `styles/styles.css`. Changes here affect all `*.bitcoindatalabs.org` sites. See `BITCOIN-DATA-LABS-INTEGRATION.md`.
