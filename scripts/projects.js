/**
 * Bitcoin Data Labs — project registry.
 * Single source for the catalog on work.html. Add new work here.
 *
 * program: 'orange-dev' | 'lightning' | 'research' | 'tools'
 * status:  'live' (refreshed by automation) | 'published' (finished piece) | 'lab' (experimental)
 */
window.BDL_PROJECTS = [
    // ── Orange Dev: Bitcoin Core, measured ───────────────────────────
    {
        program: 'orange-dev', key: 'What', name: 'Orange Dev Tracker',
        url: 'https://orange-dev.bitcoindatalabs.org/', shot: 'screenshots/live/tracker.jpg',
        question: 'What is shipping in Bitcoin Core, and is the project healthy?',
        desc: 'Engineering throughput, review rigor, releases, active initiatives, and project health: bus factor, talent inflow, institutionalization.',
        status: 'live', cadence: 'Weekly',
    },
    {
        program: 'orange-dev', key: 'Monthly', name: 'State of Bitcoin Core',
        url: 'https://orange-dev.bitcoindatalabs.org/reports.html', shot: 'screenshots/live/tracker-reports.jpg',
        question: 'How did Bitcoin Core development go this month?',
        desc: 'A six-slide intelligence report on the 1st of every month: what shipped, review health, governance, backlog, and the protocol frontier, each against a 12-month band.',
        status: 'live', cadence: 'Monthly',
    },
    {
        program: 'orange-dev', key: 'Who', name: 'Orange Dev Network',
        url: 'https://network.bitcoindatalabs.org/', shot: 'screenshots/live/network.jpg',
        question: 'Who builds Bitcoin, and how do they work together?',
        desc: 'The human layer of Bitcoin R&D: contributor profiles, maintainers, a builder directory, and a technical influence graph across code, review, research and BIPs.',
        status: 'live', cadence: 'Weekly',
    },
    {
        program: 'orange-dev', key: 'Now', name: 'This Week in Bitcoin',
        url: 'https://twib.bitcoindatalabs.org/', shot: 'screenshots/live/twib.jpg',
        question: 'What happened in Bitcoin Core this week?',
        desc: 'An automated weekly digest of merged PRs, review activity and protocol discussion, plus a searchable archive of every weekly Core dev meeting.',
        status: 'live', cadence: 'Weekly',
    },
    {
        program: 'orange-dev', key: 'Money', name: 'Funding Explorer',
        url: 'https://bitcoindatalabs.github.io/orange-funding-explorer/dashboard.html', shot: 'screenshots/live/funding.jpg',
        question: 'Who funds Bitcoin developers, and which work do they fund?',
        desc: 'Funders, sponsored developers and the projects they support, in one explorer with funder and grantee profiles.',
        status: 'published',
    },
    {
        program: 'orange-dev', key: 'Beyond Core', name: 'Ecosystem Map',
        url: 'https://bitcoindatalabs.github.io/orange-ecosystem-map/', shot: 'screenshots/live/ecosystem-map.jpg',
        question: 'What else is being built on Bitcoin, and by whom?',
        desc: '955 open-source repositories and 55,000+ developers clustered into the communities that build wallets, Lightning, libraries, mining and more.',
        status: 'published',
    },
    {
        program: 'orange-dev', key: 'Lab', name: 'Code Topology',
        url: 'https://bitcoindatalabs.github.io/orange-code-topology/', shot: 'screenshots/live/code-topology.jpg',
        question: 'How does the Bitcoin Core codebase fit together?',
        desc: 'A WebGL map of bitcoin/src built from #include dependencies, so you can see the subsystems and the files that bridge them.',
        status: 'lab',
    },

    // ── Lightning Intelligence ───────────────────────────────────────
    {
        program: 'lightning', key: 'Network', name: 'Lightning Dashboard',
        url: 'https://lightning.bitcoindatalabs.org/', shot: 'screenshots/live/lightning.jpg',
        question: 'Which nodes matter, and where is liquidity moving?',
        desc: 'PlebRank leaderboards, node and channel explorers, per-node profiles, node comparison, and a daily node spotlight.',
        status: 'live', cadence: 'Daily',
    },
    {
        program: 'lightning', key: 'Graph', name: 'LN Graph Viz',
        url: 'https://bitcoindatalabs.github.io/ln-graph-viz/', shot: 'screenshots/live/ln-graph-viz.jpg',
        question: 'What does the Lightning Network actually look like?',
        desc: 'An interactive graph of the network with Highway (>5M sats) and Freeway (>1 BTC) views, PlebRank and bridge-node filters.',
        status: 'live', cadence: 'Daily',
    },

    {
        program: 'lightning', key: 'Sidechains', name: 'L2 Watch',
        url: 'https://bitcoindatalabs.github.io/l2-watch/', shot: 'screenshots/live/l2-watch.jpg',
        question: 'How much Bitcoin lives on sidechains, and how are they run?',
        desc: 'An audit dashboard for layer 2s and sidechains, starting with Liquid: activity, reserve proof, federation signers, confidential-transaction adoption and assets.',
        status: 'published',
    },

    // ── Forensics & research ─────────────────────────────────────────
    {
        program: 'research', key: 'Forensics', name: 'Coldcard RNG Investigation',
        url: 'https://bitcoindatalabs.github.io/coldcard-rng-tracker/', shot: 'screenshots/live/coldcard.jpg',
        question: '1,983 BTC swept in 22 hours. What happened on-chain?',
        desc: 'A wave-by-wave reconstruction of a weak-RNG sweep: 4,925 drained addresses, attacker evolution, fund-flow graph, and full methodology.',
        status: 'published',
    },
    {
        program: 'research', key: 'Mining', name: 'Mining Pool Profiler',
        url: 'https://bitcoindatalabs.github.io/bitcoin-mining-pools/', shot: 'screenshots/live/mining-pools.jpg',
        question: 'How centralized is Bitcoin mining, and how has that changed?',
        desc: 'Every block since genesis attributed to its pool: market share, HHI concentration, top-3 dominance and 160+ pool profiles.',
        status: 'published',
    },
    {
        program: 'research', key: 'Deep Dive', name: 'Deep Dives',
        url: 'https://bitcoindatalabs.github.io/deep-dives/', shot: 'screenshots/live/deep-dives.jpg',
        question: 'When something breaks or shifts, what does the data say?',
        desc: 'Measured write-ups with the numbers, the caveats and the code to reproduce them. Latest: "The Summer Lightning Broke (a Little)".',
        status: 'published',
    },
    {
        program: 'research', key: 'Open Source', name: 'OSS App Stats',
        url: 'https://bitcoindatalabs.github.io/oss-app-stats/', shot: 'screenshots/live/oss-app-stats.jpg',
        question: 'Which Bitcoin open-source apps are people actually using?',
        desc: 'Downloads, release cadence and freshness for Bitcoin Core, LND, CLN, Sparrow, BDK and 30+ other projects.',
        status: 'published',
    },

    // ── Tools & learning ─────────────────────────────────────────────
    {
        program: 'tools', key: 'Learn', name: 'Bitcoin & Lightning Tools',
        url: 'https://bitcoindatalabs.github.io/Tools/', shot: 'screenshots/live/tools.jpg',
        question: 'How do payments route, and how is a transaction built?',
        desc: 'Interactive simulators and decoders: Lightning routing simulator, channel-ID decoder, witness-data decoder, mining simulator, HD address tool.',
        status: 'published',
    },
    {
        program: 'tools', key: 'Book', name: 'The Bitcoin Express',
        url: 'https://bitcoindatalabs.github.io/TheBitcoinExpress/', shot: 'screenshots/live/bitcoin-express.jpg',
        question: 'New to Bitcoin? Where do I start?',
        desc: 'A short open book that takes you from novice to knowledgeable in hours: digital money, transactions, mining and wallets.',
        status: 'published',
    },
    {
        program: 'tools', key: 'Book', name: 'The Cryptography Express',
        url: 'https://bitcoindatalabs.github.io/TheCryptographyExpress/', shot: 'screenshots/live/cryptography-express.jpg',
        question: 'What cryptography do I need to understand Bitcoin?',
        desc: 'A fast, open introduction to cryptography: symmetric and public-key systems, hash functions, real-world practice, and a closing deep dive on the algorithms inside Bitcoin.',
        status: 'published',
    },
];

window.BDL_PROGRAMS = {
    'orange-dev': { label: 'Orange Dev', blurb: 'Bitcoin Core, measured' },
    lightning: { label: 'Lightning & L2s', blurb: 'Second layers, measured' },
    research: { label: 'Forensics & Research', blurb: 'One question, answered rigorously' },
    tools: { label: 'Learn', blurb: 'Tools and open books' },
};
