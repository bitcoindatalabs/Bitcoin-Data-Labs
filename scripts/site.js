/**
 * Bitcoin Data Labs — landing site behaviour (index, work, support).
 *  1. Site header, footer and partner strips. The landing site has its own
 *     shell; the shared components/ shell is for the child apps.
 *  2. Scroll reveal
 *  3. Live numbers from the public JSON our automation publishes.
 *     Every [data-live] element ships with a dated static value in the HTML;
 *     a successful fetch replaces it, a failed fetch leaves it untouched.
 */
(function () {
    'use strict';

    const SOURCES = {
        core: 'https://orange-dev.bitcoindatalabs.org/data/monthly_snapshots/latest.json',
        lightning: 'https://lightning.bitcoindatalabs.org/data/weekly_snapshots/latest.json',
        meetings: 'https://twib.bitcoindatalabs.org/data/meetings.json',
    };
    const ASSETS = 'https://raw.githubusercontent.com/bitcoindatalabs/bdl-report-assets/main';


    // ── 1. Header / footer / partners ───────────────────────────────
    const NAV = [
        { name: 'Work', url: 'work.html', match: 'work.html' },
        { name: 'Reports', url: 'index.html#reports' },
        { name: 'Open Data', url: 'index.html#data' },
        { name: 'About', url: 'index.html#about' },
    ];
    const CONTACT = 'contact@bitcoindatalabs.org';

    // Supporters & partners. Logos are single-color masks (white on
    // transparent PNG/SVG) so they tint to the theme; add new ones here.
    const PARTNERS = [
        { name: 'PlebLab', role: 'Community partner', url: 'https://www.pleblab.dev/', logo: 'assets/partners/pleblab.png', ratio: 480 / 301 },
    ];

    const page = () => (location.pathname.split('/').pop() || 'index.html');

    function renderHeader() {
        const el = document.getElementById('site-header');
        if (!el) return;
        const current = page();
        const links = NAV.map(l =>
            `<a href="${l.url}"${l.match === current ? ' aria-current="page"' : ''}>${l.name}</a>`
        ).join('');
        el.innerHTML = `
            <div class="sh-inner">
                <a class="sh-logo" href="index.html" aria-label="Bitcoin Data Labs home">
                    <img src="assets/brand/bdl-logo-tight.svg" alt="Bitcoin Data Labs" width="148" height="33">
                </a>
                <nav class="sh-nav" id="sh-nav" aria-label="Main">${links}</nav>
                <div class="sh-actions">
                    <a class="sh-icon" href="https://github.com/bitcoindatalabs" aria-label="Bitcoin Data Labs on GitHub"><i class="fa-brands fa-github"></i></a>
                    <a class="btn btn-primary sh-cta" href="support.html"${current === 'support.html' ? ' aria-current="page"' : ''}>Support</a>
                    <button class="sh-menu" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="sh-nav"><i class="fas fa-bars"></i></button>
                </div>
            </div>`;

        const btn = el.querySelector('.sh-menu');
        const setOpen = open => {
            el.classList.toggle('open', open);
            btn.setAttribute('aria-expanded', String(open));
            btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            btn.innerHTML = `<i class="fas fa-${open ? 'xmark' : 'bars'}"></i>`;
        };
        btn.addEventListener('click', () => setOpen(!el.classList.contains('open')));
        el.querySelectorAll('.sh-nav a').forEach(a => a.addEventListener('click', () => setOpen(false)));
        document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });

        const onScroll = () => el.classList.toggle('scrolled', window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    function partnerLogos() {
        return PARTNERS.map(p => `
            <a class="partner" href="${p.url}" target="_blank" rel="noopener noreferrer" title="${p.name}">
                <span class="partner-logo" role="img" aria-label="${p.name}"
                    style="-webkit-mask-image:url('${p.logo}'); mask-image:url('${p.logo}'); aspect-ratio:${p.ratio}"></span>
                ${p.role ? `<span class="partner-role">${p.role}</span>` : ''}
            </a>`).join('');
    }

    function renderPartners() {
        document.querySelectorAll('[data-partners]').forEach(el => { el.innerHTML = partnerLogos(); });
    }

    function renderFooter() {
        const el = document.getElementById('site-footer');
        if (!el) return;
        el.innerHTML = `
            <div class="wrap">
                <div class="sf-grid">
                    <div class="sf-brand">
                        <a href="index.html" aria-label="Bitcoin Data Labs home"><img src="assets/brand/bdl-logo-tight.svg" alt="Bitcoin Data Labs" width="170" height="38"></a>
                        <p>An open-source non-profit measuring Bitcoin in public: development, the Lightning Network and the chain. Austin, Texas.</p>
                        <div class="sf-social">
                            <a href="https://x.com/Bitcoindatalabs" aria-label="X"><i class="fa-brands fa-x-twitter"></i></a>
                            <a href="https://www.linkedin.com/company/bitcoin-data-labs" aria-label="LinkedIn"><i class="fa-brands fa-linkedin"></i></a>
                            <a href="https://github.com/bitcoindatalabs" aria-label="GitHub"><i class="fa-brands fa-github"></i></a>
                            <a href="mailto:${CONTACT}" aria-label="Email"><i class="fas fa-envelope"></i></a>
                        </div>
                    </div>
                    <div class="sf-col">
                        <h4>Programs</h4>
                        <a href="https://orange-dev.bitcoindatalabs.org/">Orange Dev</a>
                        <a href="https://lightning.bitcoindatalabs.org/">Lightning</a>
                        <a href="https://bitcoindatalabs.github.io/l2-watch/">L2 Watch</a>
                        <a href="index.html#research">Forensics &amp; Research</a>
                        <a href="work.html">All work</a>
                    </div>
                    <div class="sf-col">
                        <h4>Read</h4>
                        <a href="https://orange-dev.bitcoindatalabs.org/reports.html">State of Bitcoin Core</a>
                        <a href="https://twib.bitcoindatalabs.org/">This Week in Bitcoin</a>
                        <a href="https://bitcoindatalabs.github.io/deep-dives/">Deep Dives</a>
                        <a href="index.html#data">Open data</a>
                    </div>
                    <div class="sf-col">
                        <h4>Organization</h4>
                        <a href="index.html#about">About</a>
                        <a href="support.html">Support the lab</a>
                        <a href="mailto:${CONTACT}">Contact</a>
                    </div>
                </div>
                <div class="sf-partners">
                    <span>Partners</span>
                    <div class="partners partners-sm">${partnerLogos()}</div>
                </div>
                <div class="sf-base">
                    <span>© ${new Date().getFullYear()} Bitcoin Data Labs · Non-profit · Code and data are open source.</span>
                    <span><a href="mailto:${CONTACT}">${CONTACT}</a></span>
                </div>
            </div>`;
    }

    // Anything that leaves bitcoindatalabs.org (the apps, reports, GitHub)
    // opens in a new tab so the story page stays where the visitor left it.
    function externalLinksInNewTab() {
        document.querySelectorAll('a[href^="http"]').forEach(a => {
            let url;
            try { url = new URL(a.href); } catch (e) { return; }
            if (url.hostname === location.hostname || url.hostname === 'bitcoindatalabs.org') return;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
        });
    }

    function initShell() {
        renderHeader();
        renderPartners();
        renderFooter();
    }

    // ── 2. Reveal ───────────────────────────────────────────────────
    function initReveal() {
        const els = document.querySelectorAll('.reveal');
        if (!('IntersectionObserver' in window)) {
            els.forEach(el => el.classList.add('in'));
            return;
        }
        const io = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('in');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        els.forEach(el => io.observe(el));
    }

    // ── 3. Live data ────────────────────────────────────────────────
    const fmt = n => Number(n).toLocaleString('en-US');
    const fmtDate = iso => {
        const d = new Date(iso + (iso.length === 10 ? 'T12:00:00Z' : ''));
        return isNaN(d) ? iso : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    };

    function set(key, value, html) {
        document.querySelectorAll(`[data-live="${key}"]`).forEach(el => {
            if (html) el.innerHTML = value; else el.textContent = value;
        });
    }
    function setAttr(key, attr, value) {
        document.querySelectorAll(`[data-live-${attr}="${key}"]`).forEach(el => el.setAttribute(attr, value));
    }

    async function getJSON(url) {
        const res = await fetch(url, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`${res.status} ${url}`);
        return res.json();
    }

    function pct(cur, prev) {
        if (!prev) return null;
        return Math.round(((cur - prev) / prev) * 100);
    }

    async function loadCore() {
        const d = await getJSON(SOURCES.core);
        const m = d.metrics && d.metrics.current;
        if (!m || !d.target_month) return;
        const ym = d.target_month.replace('-', '');
        const monthShort = d.target_month_formatted || d.target_month;

        set('core-month', monthShort);
        set('core-headline', d.headline && d.headline.title ? d.headline.title : '');
        set('core-merged', fmt(m.merged));
        set('core-reviewers', fmt(m.reviewers));
        set('core-through', fmtDate(d.data_through));
        setAttr('core-report', 'href', `https://orange-dev.bitcoindatalabs.org/reports.html?month=${d.target_month}`);
        setAttr('core-slide', 'src', `${ASSETS}/bitcoin/state_of_bitcoin_core_${ym}_slide_1.png`);

        const kpi = Array.isArray(d.kpis) ? d.kpis.find(k => k.key === 'merged') : null;
        const yoy = kpi && kpi.yoy_pct != null ? Math.round(kpi.yoy_pct) : null;
        if (yoy != null) set('core-merged-yoy', `${yoy >= 0 ? '+' : ''}${yoy}% YoY`);
    }

    async function loadLightning() {
        const d = await getJSON(SOURCES.lightning);
        const m = d.metrics;
        if (!m) return;
        const btc = m.total_capacity_sats / 1e8;
        set('ln-nodes', fmt(m.active_nodes));
        set('ln-channels', fmt(m.active_channels));
        set('ln-capacity', fmt(Math.round(btc)));
        set('ln-tor', `${m.tor_pct}%`);
        set('ln-opened', fmt(m.new_channels_7d));
        set('ln-closed', fmt(m.closed_channels_7d));
        set('ln-week', `${d.date_range.start_formatted} – ${d.date_range.end_formatted}`);
        if (m.delta_capacity_btc_7d != null) {
            const v = m.delta_capacity_btc_7d;
            set('ln-capacity-delta', `<span class="delta ${v >= 0 ? 'up' : 'down'}">${v >= 0 ? '+' : ''}${v.toFixed(1)} BTC</span>`, true);
        }
        if (m.delta_nodes_7d != null) {
            const v = m.delta_nodes_7d;
            set('ln-nodes-delta', `<span class="delta ${v >= 0 ? 'up' : 'down'}">${v >= 0 ? '+' : ''}${fmt(v)}</span>`, true);
        }
    }

    async function loadMeetings() {
        const list = await getJSON(SOURCES.meetings);
        if (!Array.isArray(list) || !list.length) return;
        const dates = list.map(x => x.date).filter(Boolean).sort();
        const latest = dates[dates.length - 1];
        set('meetings-count', fmt(list.length));
        set('meetings-latest', fmtDate(latest));
        setAttr('meeting-link', 'href', `https://twib.bitcoindatalabs.org/meetings.html?date=${latest}`);    }

    function initLive() {
        if (!document.querySelector('[data-live], [data-live-href], [data-live-src]')) return;
        [loadCore, loadLightning, loadMeetings].forEach(fn =>
            fn().catch(err => console.info('BDL live data unavailable, keeping published values:', err.message))
        );
    }

    // Hot-linked report images carry an inline onerror that swaps in the
    // bundled copy (data-fallback), so a missing asset never shows broken.
    document.addEventListener('DOMContentLoaded', () => {
        initShell();
        externalLinksInNewTab();
        initReveal();
        initLive();
    });
})();
