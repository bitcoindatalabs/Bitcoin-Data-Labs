document.addEventListener('DOMContentLoaded', () => {
    if (typeof BitcoinLabsApp !== 'undefined') {
        BitcoinLabsApp.init({
            isApp: true,
            appName: 'orange-funding-explorer',
            appHomeUrl: 'index.html',
            navLinks: [
                { name: 'Grantees', url: 'index.html' },
                { name: 'Sponsors', url: 'funders.html' },
                { name: 'Ecosystem Overview', url: 'dashboard.html' }
            ],
            footerLinks: [],
            suiteLinks: [
                { name: 'orange-dev-tracker', url: 'https://tracker.bitcoindatalabs.org', icon: 'fas fa-chart-line' },
                { name: 'this-week-in-bitcoin', url: 'https://twib.bitcoindatalabs.org', icon: 'fas fa-newspaper' }
            ]
        });
    }
});
