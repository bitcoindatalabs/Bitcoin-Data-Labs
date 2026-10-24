/**
 * Bitcoin Data Labs — research paper registry.
 * Single source for research.html and the unlisted brief (brief/) and deck (deck/).
 * Every number here must match the paper's abstract or its generated
 * numbers file; update both together when a new version goes up.
 *
 * Add a paper: append an entry, render its cover (page 1, top) and one
 * key figure into assets/research/, and add a card to index.html #research.
 */
window.BDL_SERIES = {
    'lightning-security': {
        label: 'Lightning security',
        question: 'How does the Lightning Network hold up when its software fails?',
        blurb: 'Lightning is a payment network built on Bitcoin, run by thousands of independent operators on four '
            + 'open-source implementations. In 2026 every implementation disclosed security vulnerabilities. This '
            + 'series measures, from public gossip and the chain, how the network held up and how operators responded.',
    },
};

window.BDL_PAPERS = [
    {
        id: 'ln-client-diversity',
        series: 'lightning-security',
        num: '01',
        question: 'Who fails?',
        title: 'Does Client Diversity Protect the Lightning Network?',
        subtitle: 'Evidence from the 2026 Core Lightning Shutdown',
        authors: 'Saurabh Kumar',
        arxiv: '2610.20952', version: 'v2', category: 'cs.CR', cross: 'cs.NI',
        date: '2026-10-21', firstDate: '2026-10-14',
        repo: 'https://github.com/bitcoindatalabs/ln-client-diversity',
        finding: 'The damage from a software failure depends on whether it reaches the network\'s hubs, not on how '
            + 'many nodes run the failing software.',
        summary: 'LND runs 80% of public Lightning nodes and 84% of public channel capacity. When Core Lightning\'s '
            + 'maintainers told operators who could not upgrade to disconnect on 26 August 2026, 22% of its nodes went '
            + 'dark overnight, yet reachability across the network fell by 7.8 percentage points, half the drop during a Tor '
            + 'denial-of-service wave that July. Diversity statistics that count nodes mislead; the number to track is '
            + 'which software the hubs run.',
        stats: [
            { value: '84%', label: 'of public channel capacity runs on one implementation, LND' },
            { value: '22%', label: 'of Core Lightning nodes went dark overnight, ten times the usual rate' },
            { value: '4×', label: 'more reachability lost if ACINQ\'s Eclair node fails alone than if all 619 routable CLN nodes do' },
        ],
        figure: {
            src: 'assets/research/ln-client-diversity-fig.png', width: 1540, height: 572,
            alt: 'Two stacked area charts, 2023 to 2026: LND holds about 84% of public nodes and 85% of node capacity throughout.',
            caption: 'Share of public nodes (a) and of node capacity (b) by implementation, 2023–2026. LND\'s share has barely moved.',
        },
        cover: 'assets/research/ln-client-diversity-cover.jpg',
        related: [
            { name: 'The Summer Lightning Broke (a Little)', note: 'plain-language deep dive', url: 'https://bitcoindatalabs.github.io/deep-dives/analyses/2026-10-lightning-network-analysis/' },
            { name: 'Lightning Dashboard', note: 'the live network', url: 'https://lightning.bitcoindatalabs.org/' },
        ],
    },
    {
        id: 'ln-upgrade-dynamics',
        series: 'lightning-security',
        num: '02',
        question: 'Who patches?',
        title: 'Who Patches the Lightning Network?',
        subtitle: 'Evidence from Release Lines in Gossip, 2023–2026',
        authors: 'Saurabh Kumar',
        arxiv: '2610.30350', version: 'v1', category: 'cs.CR', cross: 'cs.NI',
        date: '2026-10-21', firstDate: '2026-10-21',
        repo: 'https://github.com/bitcoindatalabs/ln-upgrade-dynamics',
        finding: 'Lightning operators upgrade when their platforms ship a release, not when a security advisory is '
            + 'published.',
        summary: 'Gossip carries no software version, so whether operators act on advisories had never been measured. '
            + 'Matching the feature bits each node announces against every LND, Core Lightning, Eclair and LDK release '
            + 'reveals its release line. Across 814 daily snapshots from 2023 to 2026, the three largest LND upgrade '
            + 'waves came about a day after the Umbrel app store shipped a new version. For maintainers, the lever on '
            + 'the nodes that lag is the platforms that package their releases.',
        stats: [
            { value: '88 days', label: 'for half of LND nodes on an older line to upgrade after a release' },
            { value: '1 of 12', label: 'security disclosures we could test measurably sped up upgrades' },
            { value: '71%', label: 'of LND nodes exposed by Lightning Labs\' August 2026 disclosures still ran an affected release two months later' },
        ],
        figure: {
            src: 'assets/research/ln-upgrade-dynamics-fig.png', width: 1540, height: 704,
            alt: 'Daily upgrade counts for LND and Core Lightning nodes, 2024 to 2026, with spikes that follow Umbrel app-store releases.',
            caption: 'Upgrades per day, LND (top) and Core Lightning (bottom). Dashed lines mark upstream releases, triangles Umbrel app-store releases; the largest LND waves follow Umbrel.',
        },
        cover: 'assets/research/ln-upgrade-dynamics-cover.jpg',
        related: [
            { name: 'Does Client Diversity Protect the Lightning Network?', note: 'paper 01, the client labels this paper builds on', url: '#ln-client-diversity' },
            { name: 'OSS App Stats', note: 'release cadence of Lightning implementations', url: 'https://bitcoindatalabs.github.io/oss-app-stats/' },
        ],
    },
];

// arXiv-style BibTeX, built from the entry so the citation can't drift from the registry.
window.BDL_BIBTEX = function (p) {
    const key = 'kumar' + p.date.slice(0, 4) + p.id.replace(/^ln-/, '').replace(/-/g, '');
    return [
        `@misc{${key},`,
        `  title         = {${p.title} ${p.subtitle.replace('–', '--')}},`,
        `  author        = {${p.authors}},`,
        `  year          = {${p.date.slice(0, 4)}},`,
        `  eprint        = {${p.arxiv}},`,
        `  archivePrefix = {arXiv},`,
        `  primaryClass  = {${p.category}},`,
        `  url           = {https://arxiv.org/abs/${p.arxiv}}`,
        `}`,
    ].join('\n');
};
