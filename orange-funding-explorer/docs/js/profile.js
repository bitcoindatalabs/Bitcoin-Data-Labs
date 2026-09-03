document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const id = urlParams.get('id');

    const backLink = document.getElementById('back-link');
    if (backLink) {
        backLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = type === 'funder' ? 'funders.html' : 'index.html';
            }
        });
    }

    if (!type || !id) {
        showError();
        return;
    }

    try {
        if (type === 'funder') {
            const rosterData = await fetch('funding-data/enriched/explorer/roster.json').then(r => r.json());
            const funded = rosterData.filter(d => d.sponsors && d.sponsors.includes(id));
            
            if (funded.length === 0) {
                showError();
                return;
            }
            
            let meta = {};
            try {
                const sponsorsMetaRaw = await fetch('funding-data/enriched/sponsors_merged.json').then(r => r.json());
                meta = sponsorsMetaRaw.sponsors.find(s => 
                    s.name.toLowerCase() === id.toLowerCase() || 
                    (s.id && s.id.toLowerCase() === id.toLowerCase())
                ) || {};
            } catch (e) {
                console.log("Could not load sponsor metadata for profile", e);
            }

            const p = {
                type: 'funder',
                name: id,
                funded: funded,
                meta: meta
            };
            renderProfile(p);
            return;
        }

        const url = `funding-data/enriched/explorer/profiles/${type === 'dev' ? 'devs' : 'projects'}/${encodeURIComponent(id.toLowerCase())}.json`;
        const response = await fetch(url);
        
        if (!response.ok) {
            showError();
            return;
        }

        const data = await response.json();
        renderProfile(data);
    } catch (e) {
        console.error(e);
        showError();
    }
});

function showError() {
    document.getElementById('profile-loading').style.display = 'none';
    document.getElementById('profile-not-found').style.display = 'block';
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function renderProfile(p) {
    document.getElementById('profile-loading').style.display = 'none';
    document.getElementById('profile-content').style.display = 'block';
    
    // Title
    document.title = `${escapeHtml(p.name)} | Ecosystem Funding Explorer`;
    
    // Hero
    document.getElementById('profile-name').textContent = p.name;
    
    if (p.type === 'developer' && p.github) {
        document.getElementById('profile-avatar').innerHTML = `<img src="https://github.com/${escapeHtml(p.github)}.png?size=100" style="width: 100%; height: 100%; object-fit: cover;">`;
        document.getElementById('profile-links').innerHTML = `<a href="https://github.com/${escapeHtml(p.github)}" target="_blank" class="social-icon-btn"><i class="fab fa-github"></i></a>`;
    } else if (p.type === 'project') {
        document.getElementById('profile-avatar').innerHTML = `<i class="fas fa-project-diagram" style="font-size: 50px;"></i>`;
        let linksHtml = '';
        if (p.eco_data && p.eco_data.website) linksHtml += `<a href="${escapeHtml(p.eco_data.website)}" target="_blank" class="social-icon-btn"><i class="fas fa-globe"></i></a>`;
        if (p.eco_data && p.eco_data.github) linksHtml += `<a href="https://github.com/${escapeHtml(p.eco_data.github)}" target="_blank" class="social-icon-btn"><i class="fab fa-github"></i></a>`;
        document.getElementById('profile-links').innerHTML = linksHtml;
    } else if (p.type === 'funder') {
        const meta = p.meta || {};
        const avatarUrl = meta.x_handle ? `https://unavatar.io/twitter/${meta.x_handle}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`;
        document.getElementById('profile-avatar').innerHTML = `<img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;">`;
        let linksHtml = '';
        if (meta.website) linksHtml += `<a href="${escapeHtml(meta.website)}" target="_blank" class="social-icon-btn"><i class="fas fa-globe"></i></a>`;
        if (meta.x_handle) linksHtml += `<a href="https://twitter.com/${escapeHtml(meta.x_handle)}" target="_blank" class="social-icon-btn"><i class="fab fa-twitter"></i></a>`;
        if (meta.github) linksHtml += `<a href="https://github.com/${escapeHtml(meta.github)}" target="_blank" class="social-icon-btn"><i class="fab fa-github"></i></a>`;
        document.getElementById('profile-links').innerHTML = linksHtml;
    }
    
    // Description
    const descEl = document.getElementById('profile-description');
    if (p.description || p.notes) {
        descEl.textContent = p.description || p.notes;
    } else {
        descEl.style.display = 'none';
    }
    
    // Badges
    const badgesEl = document.getElementById('profile-badges');
    let badgesHtml = '';
    badgesHtml += `<span style="background: rgba(245,158,11,0.15); color: #f59e0b; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">${p.type === 'developer' ? 'Funded Developer' : 'Funded Project'}</span>`;
    
    if (p.eco_data && p.eco_data.layers_active) {
        p.eco_data.layers_active.slice(0, 2).forEach(layer => {
            badgesHtml += `<span style="background: rgba(148,163,184,0.15); color: #94A3B8; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">${escapeHtml(layer)}</span>`;
        });
    }
    badgesEl.innerHTML = badgesHtml;
    
    // Column Data
    const col1Title = document.getElementById('profile-col1-title');
    const col1Content = document.getElementById('profile-col1-content');
    const col2Title = document.getElementById('profile-col2-title');
    const col2Subtitle = document.getElementById('profile-col2-subtitle');
    const statsEl = document.getElementById('profile-eco-stats');
    const col2Content = document.getElementById('profile-col2-content');
    
    let html1 = '';
    
    if (p.type === 'developer') {
        col1Title.innerHTML = `<i class="fas fa-hand-holding-usd" style="color: var(--primary); margin-right: 8px;"></i> Grant History`;
        col2Title.innerHTML = `<i class="fas fa-code-branch" style="color: var(--primary); margin-right: 8px;"></i> Ecosystem Impact`;
        col2Subtitle.textContent = 'Top Repositories';
        
        if (p.grants && p.grants.length > 0) {
            p.grants.forEach(g => {
                html1 += `
                    <div style="background: var(--bg-color); border: 1px solid var(--border-color); padding: 16px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <strong style="color: var(--text-primary); font-size: 1.1rem;">${escapeHtml(g.sponsor)}</strong>
                            <span style="color: var(--text-secondary); font-size: 0.9rem;">${g.start_date ? escapeHtml(g.start_date.substring(0, 4)) : 'Unknown'} - ${g.end_date ? escapeHtml(g.end_date.substring(0, 4)) : 'Present'}</span>
                        </div>
                        <div style="color: var(--text-secondary); font-size: 0.95rem;">
                            <i class="fas fa-layer-group" style="margin-right: 6px; font-size: 0.85rem;"></i> Focus: ${escapeHtml(g.project)}
                        </div>
                    </div>
                `;
            });
        } else {
            html1 = `<p style="color: var(--text-secondary);">No direct grants recorded.</p>`;
        }
        col1Content.innerHTML = html1;
        
        if (!p.eco_data) {
            document.getElementById('profile-eco-card').innerHTML += `<p style="color: var(--text-secondary); margin-top: 24px; text-align: center;">No ecosystem activity mapped for this profile yet.</p>`;
            return;
        }
        
        statsEl.style.display = 'grid';
        statsEl.innerHTML = `
            <div style="background: var(--bg-color); border: 1px solid var(--border-color); padding: 16px; border-radius: 8px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${p.eco_data.tenure_months || 0}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Months Tenure</div>
            </div>
            <div style="background: var(--bg-color); border: 1px solid var(--border-color); padding: 16px; border-radius: 8px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${Object.keys(p.eco_data.languages || {}).length}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Languages Used</div>
            </div>
        `;
        
        let reposHtml = '';
        if (p.eco_data.top_repos && p.eco_data.top_repos.length > 0) {
            p.eco_data.top_repos.slice(0, 5).forEach(r => {
                reposHtml += `
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                        <a href="https://github.com/${escapeHtml(r.repo_name)}" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: 500;">${escapeHtml(r.repo_name)}</a>
                        <span style="color: var(--text-secondary); font-size: 0.85rem;">${r.display_metric || 0} ${escapeHtml(r.metric_label || 'opened PRs')}</span>
                    </div>
                `;
            });
        } else {
            reposHtml = `<p style="color: var(--text-secondary); font-size: 0.9rem;">No repos recorded.</p>`;
        }
        col2Content.innerHTML = reposHtml;
        
    } else if (p.type === 'project') {
        col1Title.innerHTML = `<i class="fas fa-network-wired" style="color: var(--primary); margin-right: 8px;"></i> Funding Network`;
        col2Title.innerHTML = `<i class="fas fa-server" style="color: var(--primary); margin-right: 8px;"></i> Project Resources`;
        col2Subtitle.textContent = 'Associated Repositories';
        
        // Project avatar from github org
        if (p.eco_data && p.eco_data.github) {
            document.getElementById('profile-avatar').innerHTML = `<img src="https://github.com/${escapeHtml(p.eco_data.github)}.png?size=100" style="width: 100%; height: 100%; object-fit: cover;">`;
        }
        
        // Project description from eco_data
        if (p.eco_data && p.eco_data.description) {
            document.getElementById('profile-description').textContent = p.eco_data.description;
            document.getElementById('profile-description').style.display = 'block';
        }
        
        // Project website and GitHub links
        const linksEl = document.getElementById('profile-links');
        let linksHtml = '';
        if (p.eco_data && p.eco_data.website) {
            linksHtml += `<a href="${escapeHtml(p.eco_data.website)}" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: 500;"><i class="fas fa-globe"></i> Website</a>`;
        }
        if (p.eco_data && p.eco_data.github) {
            linksHtml += `<a href="https://github.com/${escapeHtml(p.eco_data.github)}" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: 500;"><i class="fab fa-github"></i> GitHub</a>`;
        }
        linksEl.innerHTML = linksHtml;
        
        // Layer badge
        if (p.eco_data && p.eco_data.layer) {
            const badgesEl = document.getElementById('profile-badges');
            badgesEl.innerHTML += `<span style="background: rgba(148,163,184,0.15); color: #94A3B8; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">${escapeHtml(p.eco_data.layer)}</span>`;
        }

        html1 += `<div style="margin-bottom: 24px;">
            <p style="color: var(--text-secondary); margin: 0 0 12px 0; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px;"><strong>Funded Developers (${p.developers ? p.developers.length : 0})</strong></p>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        `;
        (p.developers || []).forEach(d => {
            html1 += `<a href="profile.html?type=dev&id=${encodeURIComponent(d)}" style="background: var(--bg-color); padding: 6px 12px; border-radius: 16px; text-decoration: none; color: var(--text-primary); border: 1px solid var(--border-color); font-size: 0.9rem; transition: all 0.2s;">@${escapeHtml(d)}</a>`;
        });
        html1 += `</div></div>`;
        
        html1 += `<div>
            <p style="color: var(--text-secondary); margin: 0 0 12px 0; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px;"><strong>Active Sponsors (${p.sponsors ? p.sponsors.length : 0})</strong></p>
            <ul style="margin: 0; padding-left: 20px; color: var(--text-primary); display: flex; flex-direction: column; gap: 8px;">
        `;
        (p.sponsors || []).forEach(s => {
            html1 += `<li>${escapeHtml(s)}</li>`;
        });
        html1 += `</ul></div>`;

        // Top Contributors section
        if (p.eco_data && p.eco_data.top_contributors && p.eco_data.top_contributors.length > 0) {
            html1 += `<div style="margin-top: 24px;">
                <p style="color: var(--text-secondary); margin: 0 0 12px 0; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px;"><strong>Top Contributors</strong></p>
                <div style="display: flex; flex-direction: column; gap: 8px;">
            `;
            p.eco_data.top_contributors.slice(0, 8).forEach(c => {
                const isFunded = (p.developers || []).some(d => d.toLowerCase() === c.github_login.toLowerCase());
                const fundedBadge = isFunded ? `<span style="background: rgba(34,197,94,0.15); color: #22c55e; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 600; margin-left: 6px;">Funded</span>` : '';
                const activeIndicator = c.is_active_last_12m 
                    ? `<span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e; display: inline-block; margin-right: 6px;" title="Active in last 12 months"></span>`
                    : `<span style="width: 8px; height: 8px; border-radius: 50%; background: #94A3B8; display: inline-block; margin-right: 6px;" title="Inactive"></span>`;
                html1 += `
                    <div style="display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid var(--border-color);">
                        <img src="https://github.com/${escapeHtml(c.github_login)}.png?size=32" style="width: 28px; height: 28px; border-radius: 50%;">
                        <div style="flex: 1;">
                            ${activeIndicator}
                            <a href="https://github.com/${escapeHtml(c.github_login)}" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: 500; font-size: 0.9rem;">${escapeHtml(c.github_login)}</a>
                            ${fundedBadge}
                        </div>
                        <span style="color: var(--text-secondary); font-size: 0.8rem;">${c.display_metric || 0} ${escapeHtml(c.metric_label || 'opened PRs')} · ${c.tenure_months}mo</span>
                    </div>
                `;
            });
            html1 += `</div></div>`;
        }
        
        col1Content.innerHTML = html1;
        
        // Project Metrics — use aggregate_metrics if available
        const am = (p.eco_data && p.eco_data.aggregate_metrics) || {};
        const totalStars = am.total_stars || 0;
        const totalForks = am.total_forks || 0;
        const totalContributors = am.total_code_contributors || 0;
        const primaryLang = am.primary_language || '';
        
        statsEl.style.display = 'grid';
        statsEl.style.gridTemplateColumns = '1fr 1fr';
        statsEl.innerHTML = `
            <div style="background: var(--bg-color); border: 1px solid var(--border-color); padding: 16px; border-radius: 8px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;"><i class="fas fa-star" style="color: #f59e0b; font-size: 1.2rem; margin-right: 4px;"></i> ${totalStars >= 1000 ? (totalStars/1000).toFixed(1) + 'k' : totalStars}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Stars</div>
            </div>
            <div style="background: var(--bg-color); border: 1px solid var(--border-color); padding: 16px; border-radius: 8px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;"><i class="fas fa-code-branch" style="color: var(--primary); font-size: 1.2rem; margin-right: 4px;"></i> ${totalForks >= 1000 ? (totalForks/1000).toFixed(1) + 'k' : totalForks}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Forks</div>
            </div>
            <div style="background: var(--bg-color); border: 1px solid var(--border-color); padding: 16px; border-radius: 8px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;"><i class="fas fa-users" style="color: #6366f1; font-size: 1.2rem; margin-right: 4px;"></i> ${totalContributors >= 1000 ? (totalContributors/1000).toFixed(1) + 'k' : totalContributors}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Contributors</div>
            </div>
            <div style="background: var(--bg-color); border: 1px solid var(--border-color); padding: 16px; border-radius: 8px; text-align: center;">
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;"><i class="fas fa-code" style="color: #06b6d4; font-size: 1.2rem; margin-right: 4px;"></i> ${escapeHtml(primaryLang) || '—'}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Primary Language</div>
            </div>
        `;
        
        let reposHtml = '';
        if (p.eco_data && p.eco_data.top_repos && p.eco_data.top_repos.length > 0) {
            p.eco_data.top_repos.forEach(r => {
                const busFactor = r.bus_factor_tier 
                    ? `<span style="background: ${r.bus_factor_tier === 'healthy' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)'}; color: ${r.bus_factor_tier === 'healthy' ? '#22c55e' : '#f59e0b'}; padding: 2px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 600;">${escapeHtml(r.bus_factor_tier)}</span>`
                    : '';
                reposHtml += `
                    <div style="background: var(--bg-color); border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <a href="https://github.com/${escapeHtml(r.repo_name)}" target="_blank" style="color: var(--primary); text-decoration: none; font-weight: 500;">${escapeHtml(r.repo_name)}</a>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                ${busFactor}
                                <span style="color: var(--text-secondary); font-size: 0.85rem;"><i class="fas fa-star" style="color: #f59e0b;"></i> ${r.stars || 0}</span>
                            </div>
                        </div>
                        ${r.description ? `<p style="margin: 0 0 6px 0; font-size: 0.9rem; color: var(--text-secondary);">${escapeHtml(r.description)}</p>` : ''}
                        <div style="display: flex; gap: 12px; font-size: 0.8rem; color: var(--text-secondary);">
                            ${r.language ? `<span><i class="fas fa-circle" style="font-size: 0.5rem; vertical-align: middle;"></i> ${escapeHtml(r.language)}</span>` : ''}
                            ${r.code_contributors ? `<span><i class="fas fa-user-friends"></i> ${r.code_contributors} contributors</span>` : ''}
                        </div>
                    </div>
                `;
            });
        } else {
            reposHtml = `<p style="color: var(--text-secondary); font-size: 0.9rem;">No GitHub repositories mapped to this project yet.</p>`;
        }
        col2Content.innerHTML = reposHtml;
    } else if (p.type === 'funder') {
        col1Title.innerHTML = `<i class="fas fa-hand-holding-usd" style="color: var(--primary); margin-right: 8px;"></i> Funding Focus`;
        col2Title.innerHTML = `<i class="fas fa-users" style="color: var(--primary); margin-right: 8px;"></i> Grantees (${p.funded.length})`;
        col2Subtitle.textContent = 'Supported Entities';
        
        document.getElementById('profile-avatar').innerHTML = `<i class="fas fa-building" style="font-size: 50px;"></i>`;
        
        let devsHtml = `<div style="display: flex; flex-wrap: wrap; gap: 8px;">`;
        p.funded.forEach(d => {
            const url = d.github ? `profile.html?type=dev&id=${encodeURIComponent(d.github)}` : `profile.html?type=project&id=${encodeURIComponent(d.name)}`;
            devsHtml += `<a href="${url}" style="background: var(--bg-color); padding: 6px 12px; border-radius: 16px; text-decoration: none; color: var(--text-primary); border: 1px solid var(--border-color); font-size: 0.9rem; transition: all 0.2s;">${escapeHtml(d.name)}</a>`;
        });
        devsHtml += `</div>`;
        
        col2Content.innerHTML = devsHtml;
        col1Content.innerHTML = `<p style="color: var(--text-secondary); font-size: 1.1rem; line-height: 1.6;">Supporting <strong>${p.funded.length}</strong> active grantees in the ecosystem. Click on a grantee to view their individual profile and ecosystem contributions.</p>`;
        
        const badgesEl = document.getElementById('profile-badges');
        badgesEl.innerHTML = `<span style="background: rgba(16,185,129,0.15); color: #10b981; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 600;">Ecosystem Funder</span>`;
        
        statsEl.style.display = 'none';
    }
}
