document.addEventListener('DOMContentLoaded', () => {
    initCharts();
});

let chartAggregate, chartMegaRadar;

async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (e) {
        console.error("Error fetching " + url, e);
        return null;
    }
}

async function initCharts() {
    const domRadar = document.getElementById('chart-mega-radar');
    const domAggregate = document.getElementById('chart-aggregate');
    
    if (domRadar || domAggregate) {
        const data = await fetchJSON('funding-data/enriched/explorer/megasponsors.json');
        if (data) {
            if (domRadar) {
                chartMegaRadar = echarts.init(domRadar);
                
                const layers = data.indicator.map(ind => ind.name);
                const sponsors = data.data.map(d => d.name).reverse();
                
                const series = layers.map((layer, index) => {
                    const layerData = data.data.map(d => {
                        const total = d.value.reduce((a, b) => a + b, 0);
                        return total > 0 ? (d.value[index] / total) * 100 : 0;
                    }).reverse();
                    
                    return {
                        name: layer,
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true,
                            formatter: (params) => params.value > 5 ? Math.round(params.value) + '%' : ''
                        },
                        emphasis: { focus: 'series' },
                        data: layerData
                    };
                });
                
                chartMegaRadar.setOption({
                    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (value) => Math.round(value) + '%' },
                    legend: { data: layers },
                    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                    xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
                    yAxis: { type: 'category', data: sponsors },
                    series: series
                });
            }
            
            if (domAggregate && data.aggregate) {
                chartAggregate = echarts.init(domAggregate);
                const aggKeys = Object.keys(data.aggregate).sort((a, b) => data.aggregate[a] - data.aggregate[b]);
                
                chartAggregate.setOption({
                    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                    xAxis: { type: 'value' },
                    yAxis: { type: 'category', data: aggKeys },
                    series: [{
                        type: 'bar',
                        itemStyle: { color: 'var(--primary)' },
                        data: aggKeys.map(k => data.aggregate[k])
                    }]
                });
            }
        }
    }

    const domKpiFunders = document.getElementById('kpi-funders');
    if (domKpiFunders) {
        const roster = await fetchJSON('funding-data/enriched/explorer/roster.json');
        if (roster) {
            const sponsors = new Set();
            let devCount = 0;
            let projectCount = 0;
            const sponsorDevCounts = {};

            roster.forEach(d => {
                if (d.github) devCount++;
                else projectCount++;
                
                if (d.sponsors && d.sponsors !== "None (Alumni)") {
                    d.sponsors.split(', ').forEach(s => {
                        const sp = s.trim();
                        sponsors.add(sp);
                        if (!sponsorDevCounts[sp]) sponsorDevCounts[sp] = 0;
                        sponsorDevCounts[sp]++;
                    });
                }
            });

            domKpiFunders.textContent = sponsors.size;
            const domKpiDevs = document.getElementById('kpi-devs');
            if (domKpiDevs) domKpiDevs.textContent = devCount;
            const domKpiProjects = document.getElementById('kpi-projects');
            if (domKpiProjects) domKpiProjects.textContent = projectCount;

            const domChartFunderStats = document.getElementById('chart-funder-stats');
            if (domChartFunderStats) {
                const chartFunderStats = echarts.init(domChartFunderStats);
                const sortedSponsors = Object.keys(sponsorDevCounts)
                    .map(k => ({ name: k, value: sponsorDevCounts[k] }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 15);

                chartFunderStats.setOption({
                    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                    xAxis: { type: 'value' },
                    yAxis: { type: 'category', data: sortedSponsors.map(s => s.name).reverse() },
                    series: [{
                        name: 'Developers Funded',
                        type: 'bar',
                        itemStyle: { color: 'var(--primary)' },
                        data: sortedSponsors.map(s => s.value).reverse()
                    }]
                });
                window.addEventListener('resize', () => chartFunderStats.resize());
            }
        }
    }

    if (document.getElementById('roster-grid')) {
        const rosterDataRaw = await fetchJSON('funding-data/enriched/explorer/roster.json');
        if (rosterDataRaw) {
            const isFunderPage = window.location.pathname.includes('funders.html');
            const escapeHTML = str => !str ? '' : str.replace(/[&<>'"]/g, tag => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[tag]));
            
            let displayData = [];
            
            if (isFunderPage) {
                // Group by sponsor
                const fundersMap = {};
                
                // Fetch sponsor metadata for social links
                let sponsorsMeta = [];
                try {
                    const metaRaw = await fetchJSON('funding-data/enriched/sponsors_merged.json');
                    if (metaRaw && metaRaw.sponsors) {
                        sponsorsMeta = metaRaw.sponsors;
                    }
                } catch (e) {
                    console.log("Could not load sponsor metadata", e);
                }
                const sponsorMetaMap = {};
                sponsorsMeta.forEach(s => { 
                    sponsorMetaMap[s.name.toLowerCase()] = s; 
                    if (s.id) {
                        sponsorMetaMap[s.id.toLowerCase()] = s;
                    }
                });
                rosterDataRaw.forEach(d => {
                    if (d.sponsors && d.sponsors !== "None (Alumni)") {
                        d.sponsors.split(', ').forEach(s => {
                            const sp = s.trim();
                            if (!fundersMap[sp]) fundersMap[sp] = { name: sp, devsFunded: [] };
                            fundersMap[sp].devsFunded.push({
                                name: d.name,
                                isDev: !!d.github,
                                github: d.github
                            });
                        });
                    }
                });
                displayData = Object.values(fundersMap).sort((a, b) => b.devsFunded.length - a.devsFunded.length);
                
                const renderGrid = (searchStr) => {
                    const grid = document.getElementById('roster-grid');
                    let html = '';
                    
                    displayData.forEach(d => {
                        const s = searchStr.toLowerCase();
                        if (!s || d.name.toLowerCase().includes(s) || d.devsFunded.some(dev => dev.name.toLowerCase().includes(s))) {
                            let displayName = d.name === 'Hrf' ? 'HRF' : d.name;
                            const meta = sponsorMetaMap[displayName.toLowerCase()] || {};
                            
                            let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
                            if (meta.x_handle) {
                                avatarUrl = `https://unavatar.io/twitter/${meta.x_handle}`;
                            } else if (meta.github) {
                                avatarUrl = `https://unavatar.io/github/${meta.github}`;
                            }


                            let socialLinks = '';
                            if (meta.website) socialLinks += `<a href="${meta.website}" target="_blank" class="social-icon-btn"><i class="fas fa-globe"></i></a>`;
                            if (meta.x_handle) socialLinks += `<a href="https://twitter.com/${meta.x_handle}" target="_blank" class="social-icon-btn"><i class="fab fa-twitter"></i></a>`;
                            if (meta.github) socialLinks += `<a href="https://github.com/${meta.github}" target="_blank" class="social-icon-btn"><i class="fab fa-github"></i></a>`;

                            html += `
                                <div class="card funder-card" style="padding: 32px; display: flex; flex-direction: column; gap: 24px;">
                                    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 20px;">
                                        <div style="display: flex; align-items: center; gap: 20px;">
                                            <img src="${avatarUrl}" loading="lazy" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color); background: white;">
                                            <div>
                                                <a href="profile.html?type=funder&id=${encodeURIComponent(d.name)}" style="font-weight: 700; font-size: 1.25rem; color: var(--primary); text-decoration: none;">${escapeHTML(displayName)}</a>
                                                <div style="color: var(--text-secondary); font-size: 0.95rem; font-weight: 500; margin-top: 4px;">${d.devsFunded.length} Grantees</div>
                                            </div>
                                        </div>
                                        <div style="font-size: 1.15rem; margin-top: 4px;">
                                            ${socialLinks}
                                        </div>
                                    </div>
                                    <div style="margin-top: 8px;">
                                        <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; font-weight: 600;">Grantees</div>
                                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                            ${d.devsFunded.slice(0, 8).map(dev => {
                                                const devName = dev.name.replace(' and contributors', '');
                                                const url = dev.isDev ? `profile.html?type=dev&id=${encodeURIComponent(dev.github)}` : `profile.html?type=project&id=${encodeURIComponent(devName)}`;
                                                return `<a href="${url}" class="grantee-pill">${escapeHTML(devName)}</a>`;
                                            }).join('')}
                                            ${d.devsFunded.length > 8 ? `<a href="profile.html?type=funder&id=${encodeURIComponent(d.name)}" class="grantee-pill-more" style="text-decoration:none;">View all ${d.devsFunded.length} &rarr;</a>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                    });
                    grid.innerHTML = html || '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary); font-size: 1.1rem;">No results found.</div>';
                };
                
                const searchInput = document.getElementById('roster-search');
                if (searchInput) {
                    searchInput.addEventListener('input', e => {
                        renderGrid(e.target.value);
                    });
                }
                
                // Hide filters on funder page
                const filterControls = document.querySelector('.filter-controls');
                if (filterControls) filterControls.style.display = 'none';
                
                renderGrid('');

                return; // End funder page logic
            }
            
            // --- Developer Roster Logic ---
            displayData = rosterDataRaw;
            
            let chartRosterNetwork;
            
            const renderGrid = (searchStr, sponsorStr, projectStr, typeStr) => {
                const grid = document.getElementById('roster-grid');
                let html = '';
                
                displayData.forEach(d => {
                    const s = searchStr.toLowerCase();
                    const matchSearch = !s || (d.name && d.name.toLowerCase().includes(s)) || 
                                        (d.github && d.github.toLowerCase().includes(s)) || 
                                        (d.sponsors && d.sponsors.toLowerCase().includes(s)) || 
                                        (d.projects && d.projects.toLowerCase().includes(s));
                    
                    const matchSponsor = !sponsorStr || (d.sponsors && d.sponsors.toLowerCase().includes(sponsorStr.toLowerCase()));
                    const matchProject = !projectStr || (d.projects && d.projects.toLowerCase().includes(projectStr.toLowerCase()));
                    
                    let matchType = true;
                    if (typeStr === 'developer') matchType = !!d.github;
                    if (typeStr === 'project') matchType = !d.github;
                    
                    if (matchSearch && matchSponsor && matchProject && matchType) {
                        const isProject = !d.github;
                        const avatarUrl = d.github ? `https://github.com/${d.github}.png?size=80` : `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=random`;
                        const targetUrl = isProject ? `profile.html?type=project&id=${encodeURIComponent(d.name)}` : `profile.html?type=dev&id=${encodeURIComponent(d.github)}`;
                        
                        html += `
                            <div class="card funder-card" style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
                                <div style="display: flex; align-items: center; gap: 16px;">
                                    <img src="${avatarUrl}" loading="lazy" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color); background: white;">
                                    <div style="min-width: 0; overflow: hidden;">
                                        <a href="${targetUrl}" style="font-weight: 700; font-size: 1.15rem; color: var(--primary); text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${escapeHTML(d.name)}</a>
                                        <div style="color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${d.github ? '@' + escapeHTML(d.github) : (isProject ? 'Project / Org' : '')}</div>
                                    </div>
                                </div>
                                
                                <div style="margin-top: 8px;">
                                    <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; font-weight: 600;">Active Sponsors</div>
                                    <div style="font-weight: 500; font-size: 1rem; color: var(--text-primary);">${escapeHTML(d.sponsors ? d.sponsors.replace('Hrf', 'HRF') : '')}</div>
                                </div>
                                
                                <div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; font-weight: 600;">Projects</div>
                                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                        ${(d.projects || '').split(',').map(p => {
                                            const pName = p.trim();
                                            if (!pName) return '';
                                            return `<a href="profile.html?type=project&id=${encodeURIComponent(pName)}" class="grantee-pill">${escapeHTML(pName)}</a>`;
                                        }).join('')}
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                });
                grid.innerHTML = html || '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">No results found.</div>';
            };

            const renderNetwork = (searchStr, sponsorStr, projectStr, typeStr) => {
                const domNetwork = document.getElementById('roster-network-graph');
                if (!domNetwork) return;
                
                if (!chartRosterNetwork) {
                    chartRosterNetwork = echarts.init(domNetwork);
                    chartRosterNetwork.on('click', function (params) {
                        if (params.dataType === 'node') {
                            let urlType = 'dev';
                            if (params.data.category === 0) urlType = 'funder';
                            else if (params.data.category === 1) urlType = 'project';
                            window.location.href = `profile.html?type=${urlType}&id=${encodeURIComponent(params.name)}`;
                        }
                    });
                }

                const nodesMap = new Map();
                const links = [];
                
                displayData.forEach(d => {
                    const s = searchStr.toLowerCase();
                    const matchSearch = !s || (d.name && d.name.toLowerCase().includes(s)) || 
                                        (d.github && d.github.toLowerCase().includes(s)) || 
                                        (d.sponsors && d.sponsors.toLowerCase().includes(s)) || 
                                        (d.projects && d.projects.toLowerCase().includes(s));
                    
                    const matchSponsor = !sponsorStr || (d.sponsors && d.sponsors.toLowerCase().includes(sponsorStr.toLowerCase()));
                    const matchProject = !projectStr || (d.projects && d.projects.toLowerCase().includes(projectStr.toLowerCase()));
                    
                    let matchType = true;
                    if (typeStr === 'developer') matchType = !!d.github;
                    if (typeStr === 'project') matchType = !d.github;
                    
                    if (matchSearch && matchSponsor && matchProject && matchType) {
                        const devName = d.name;
                        const isProject = !d.github;
                        
                        // Add Developer/Org node
                        if (!nodesMap.has(devName)) {
                            nodesMap.set(devName, {
                                name: devName,
                                category: isProject ? 1 : 2,
                                symbolSize: isProject ? 20 : 12,
                                label: { show: isProject }
                            });
                        }
                        
                        if (d.sponsors && d.sponsors !== "None (Alumni)") {
                            d.sponsors.split(', ').forEach(sp => {
                                const spName = sp.trim().replace('Hrf', 'HRF');
                                if (!nodesMap.has(spName)) {
                                    nodesMap.set(spName, {
                                        name: spName,
                                        category: 0,
                                        symbolSize: 45,
                                        label: { show: true, fontSize: 14, fontWeight: 'bold' }
                                    });
                                }
                                links.push({ source: spName, target: devName });
                            });
                        }
                        
                        if (d.projects) {
                            d.projects.split(',').forEach(p => {
                                const pName = p.trim();
                                if (!pName) return;
                                if (!nodesMap.has(pName)) {
                                    nodesMap.set(pName, {
                                        name: pName,
                                        category: 1,
                                        symbolSize: 20,
                                        label: { show: true }
                                    });
                                }
                                links.push({ source: devName, target: pName });
                            });
                        }
                    }
                });
                
                chartRosterNetwork.setOption({
                    tooltip: {
                        enterable: true,
                        formatter: function(params) {
                            if (params.dataType === 'edge') return '';
                            let cat = 'Developer';
                            let urlType = 'dev';
                            if (params.data.category === 0) {
                                cat = 'Sponsor';
                                urlType = 'funder';
                            } else if (params.data.category === 1) {
                                cat = 'Project';
                                urlType = 'project';
                            }
                            
                            return `
                                <div style="padding: 8px; text-align: center; min-width: 140px;">
                                    <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 2px;">${params.name}</div>
                                    <div style="color: #6b7280; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; font-weight: 600;">${cat}</div>
                                    <a href="profile.html?type=${urlType}&id=${encodeURIComponent(params.name)}" style="display: inline-block; padding: 6px 16px; background: var(--primary); color: white; text-decoration: none; border-radius: 20px; font-weight: 500; font-size: 0.85rem; transition: background 0.2s; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);">View Profile &rarr;</a>
                                </div>
                            `;
                        }
                    },
                    legend: { data: ['Sponsors', 'Projects', 'Developers'], textStyle: { color: '#6b7280' } },
                    series: [{
                        type: 'graph',
                        layout: 'force',
                        data: Array.from(nodesMap.values()),
                        links: links,
                        categories: [
                            { name: 'Sponsors', itemStyle: { color: '#e07a5f' } }, // Warm orange/terracotta
                            { name: 'Projects', itemStyle: { color: '#3d5a80' } }, // Slate blue
                            { name: 'Developers', itemStyle: { color: '#9ca3af' } } // Gray
                        ],
                        roam: true,
                        label: { position: 'right', color: '#374151' },
                        force: { repulsion: 100, edgeLength: [20, 60], gravity: 0.15, friction: 0.2 },
                        lineStyle: { color: 'source', curveness: 0.2, opacity: 0.4 }
                    }]
                }, true); // Use true to replace old graph completely on filter
            };

            
            // Extract unique sponsors and projects for the filters
            const allSponsors = new Set();
            const allProjects = new Set();
            
            displayData.forEach(d => {
                if (d.sponsors && d.sponsors !== "None (Alumni)") {
                    d.sponsors.split(', ').forEach(s => allSponsors.add(s.trim()));
                }
                if (d.projects) {
                    d.projects.split(', ').forEach(p => allProjects.add(p.trim()));
                }
            });
            
            const sponsorSelect = document.getElementById('sponsor-filter');
            if (sponsorSelect) {
                Array.from(allSponsors).sort().forEach(sponsor => {
                    const option = document.createElement('option');
                    option.value = sponsor;
                    option.textContent = sponsor;
                    sponsorSelect.appendChild(option);
                });
            }
            
            const projectSelect = document.getElementById('project-filter');
            if (projectSelect) {
                Array.from(allProjects).sort().forEach(proj => {
                    if(!proj) return;
                    const option = document.createElement('option');
                    option.value = proj;
                    option.textContent = proj;
                    projectSelect.appendChild(option);
                });
            }
            
            // Input handlers
            const searchInput = document.getElementById('roster-search');
            const typeSelect = document.getElementById('type-filter');
            
            let currentSearch = '';
            let currentSponsor = '';
            let currentProject = '';
            let currentType = '';
            
            const updateViews = () => {
                renderGrid(currentSearch, currentSponsor, currentProject, currentType);
                renderNetwork(currentSearch, currentSponsor, currentProject, currentType);
            };
            
            if (searchInput) {
                searchInput.addEventListener('input', e => {
                    currentSearch = e.target.value;
                    updateViews();
                });
            }
            if (sponsorSelect) {
                sponsorSelect.addEventListener('change', e => {
                    currentSponsor = e.target.value;
                    updateViews();
                });
            }
            if (projectSelect) {
                projectSelect.addEventListener('change', e => {
                    currentProject = e.target.value;
                    updateViews();
                });
            }
            if (typeSelect) {
                typeSelect.addEventListener('change', e => {
                    currentType = e.target.value;
                    updateViews();
                });
            }
            
            // View Toggles
            const btnGrid = document.getElementById('view-grid-btn');
            const btnTable = document.getElementById('view-table-btn');
            const gridContainer = document.getElementById('roster-grid');
            const tableContainer = document.getElementById('roster-table-container');
            
            if (btnGrid && btnTable) {
                const appContent = document.getElementById('app-content');
                const filterControls = document.getElementById('filter-controls');
                const topControlsBar = document.getElementById('top-controls-bar');
                const viewToggles = document.querySelector('.view-toggles');
                
                btnGrid.addEventListener('click', () => {
                    gridContainer.style.display = 'grid';
                    tableContainer.style.display = 'none';
                    btnGrid.style.background = 'var(--primary)';
                    btnGrid.style.color = 'white';
                    btnTable.style.background = 'transparent';
                    btnTable.style.color = 'var(--text-secondary)';
                    
                    if (appContent) appContent.classList.remove('container-expanded');
                    if (topControlsBar) topControlsBar.style.display = 'flex';
                    
                    if (filterControls && topControlsBar) {
                        filterControls.classList.remove('filters-floating');
                        topControlsBar.insertBefore(filterControls, topControlsBar.firstChild);
                        
                        // Restore dropdowns for Grid view
                        if (sponsorSelect) sponsorSelect.style.display = '';
                        if (projectSelect) projectSelect.style.display = '';
                        if (typeSelect) typeSelect.style.display = '';
                    }
                    if (viewToggles && topControlsBar) {
                        viewToggles.classList.remove('toggles-floating');
                        topControlsBar.appendChild(viewToggles);
                    }
                });
                btnTable.addEventListener('click', () => {
                    gridContainer.style.display = 'none';
                    tableContainer.style.display = 'block';
                    btnTable.style.background = 'var(--primary)';
                    btnTable.style.color = 'white';
                    btnGrid.style.background = 'transparent';
                    btnGrid.style.color = 'var(--text-secondary)';
                    
                    if (appContent) appContent.classList.add('container-expanded');
                    
                    if (filterControls && tableContainer) {
                        filterControls.classList.add('filters-floating');
                        tableContainer.appendChild(filterControls);
                        
                        // Hide dropdowns for Network view to reduce clutter
                        if (sponsorSelect) sponsorSelect.style.display = 'none';
                        if (projectSelect) projectSelect.style.display = 'none';
                        if (typeSelect) typeSelect.style.display = 'none';
                    }
                    if (viewToggles && tableContainer) {
                        viewToggles.classList.add('toggles-floating');
                        tableContainer.appendChild(viewToggles);
                    }
                    if (topControlsBar) topControlsBar.style.display = 'none';
                    
                    if (chartRosterNetwork) {
                        setTimeout(() => chartRosterNetwork.resize(), 10);
                        setTimeout(() => chartRosterNetwork.resize(), 400); 
                    }
                });
            }
            
            // Initial render
            renderGrid('', '', '', '');
            renderNetwork('', '', '', '');
        }
    }
    
    window.addEventListener('resize', () => {
        if (chartAggregate) chartAggregate.resize();
        if (chartMegaRadar) chartMegaRadar.resize();
        
        // This variable is scoped inside the block above, so we can't directly access it here cleanly
        // unless it was globally declared. But ECharts instances are stored on the DOM element:
        const domNetwork = document.getElementById('roster-network-graph');
        if (domNetwork) {
            const chart = echarts.getInstanceByDom(domNetwork);
            if (chart) chart.resize();
        }
    });
}
