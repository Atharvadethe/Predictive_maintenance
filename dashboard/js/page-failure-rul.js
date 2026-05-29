/* ===================================================================
   PAGE-FAILURE-RUL.JS — Failure Prediction & RUL Analytics
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    APP.initLayout();
    renderFailureRUL();
});

let filteredRiskyAssets = [];

function renderFailureRUL() {
    const content = document.getElementById('pageContent');
    content.classList.add('failure-rul-compact');
    const riskyAssets = DATA.assets.filter(a => DATA.getAssetState(a.id).status !== 'Healthy')
        .sort((a, b) => DATA.getAssetState(a.id).rulDays - DATA.getAssetState(b.id).rulDays);
    const rankedAssets = [...DATA.assets].sort((a, b) => DATA.getAssetState(a.id).healthIndex - DATA.getAssetState(b.id).healthIndex);
    const critAssets = DATA.assets.filter(a => DATA.getAssetState(a.id).status === 'Critical');
    const avgFailProb = DATA.assets.reduce((s, a) => s + DATA.getFailureProb(a.id), 0) / DATA.assets.length;
    const avgRul = DATA.assets.reduce((s, a) => s + DATA.getAssetState(a.id).rulDays, 0) / DATA.assets.length;
    filteredRiskyAssets = [...riskyAssets];

    content.innerHTML = `
        ${APP.renderPageHeader('Failure Prediction & RUL Analytics', 'AI-powered remaining useful life estimation and failure probability tracking')}

        <div class="grid mb-4 stagger" id="rulSummaryCards" style="grid-template-columns:repeat(6,minmax(0,1fr));gap:6px">
            <div class="kpi-card c-red">
                <div class="kpi-top">
                    <div><div class="kpi-label">Critical Assets</div><div class="kpi-value">${critAssets.length}</div></div>
                    <div class="card-icon" style="background:var(--red-lt);color:var(--red)"><i class="fas fa-skull-crossbones"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">RUL &lt; 7 days</span></div>
            </div>
            <div class="kpi-card c-amber">
                <div class="kpi-top">
                    <div><div class="kpi-label">Warning Assets</div><div class="kpi-value">${riskyAssets.length - critAssets.length}</div></div>
                    <div class="card-icon" style="background:var(--amber-lt);color:var(--amber)"><i class="fas fa-exclamation-triangle"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">RUL &lt; 30 days</span></div>
            </div>
            <div class="kpi-card c-blue">
                <div class="kpi-top">
                    <div><div class="kpi-label">Avg Failure Prob</div><div class="kpi-value">${avgFailProb.toFixed(0)}%</div></div>
                    <div class="card-icon" style="background:var(--blue-bg);color:var(--carrier-blue)"><i class="fas fa-percentage"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Across the fleet</span></div>
            </div>
            <div class="kpi-card c-green">
                <div class="kpi-top">
                    <div><div class="kpi-label">Model Confidence</div><div class="kpi-value">94.7%</div></div>
                    <div class="card-icon" style="background:var(--green-lt);color:var(--green)"><i class="fas fa-brain"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Last model retrain: Apr 20</span></div>
            </div>
            <div class="kpi-card c-navy">
                <div class="kpi-top">
                    <div><div class="kpi-label">Avg RUL</div><div class="kpi-value">${avgRul.toFixed(0)}d</div></div>
                    <div class="card-icon" style="background:rgba(0,45,98,0.08);color:var(--carrier-navy)"><i class="fas fa-hourglass-half"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Fleet-wide remaining life</span></div>
            </div>
            <div class="kpi-card c-red">
                <div class="kpi-top">
                    <div><div class="kpi-label">At-Risk Assets</div><div class="kpi-value">${riskyAssets.length}</div></div>
                    <div class="card-icon" style="background:var(--red-lt);color:var(--red)"><i class="fas fa-exclamation-circle"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Critical &amp; Warning fleet</span></div>
            </div>
        </div>

        <!-- Filters -->
        <div class="filter-bar">
            <div class="filter-group">
                <label class="filter-label">Plant</label>
                <select id="rulFilterPlant" onchange="applyRULFilters()">
                    <option value="" selected>All Plants</option>
                    <option value="Plant-A">Plant-A</option>
                    <option value="Plant-B">Plant-B</option>
                    <option value="Plant-C">Plant-C</option>
                </select>
            </div>
            <div class="filter-group">
                <label class="filter-label">Asset Type</label>
                <select id="rulFilterType" onchange="applyRULFilters()">
                    <option value="" selected>All Types</option>
                    <option value="compressor">Compressor</option>
                    <option value="motor">Motor</option>
                    <option value="pump">Pump</option>
                    <option value="turbine">Turbine</option>
                </select>
            </div>
            <div class="filter-group">
                <label class="filter-label">Status</label>
                <select id="rulFilterStatus" onchange="applyRULFilters()">
                    <option value="">All Status</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Warning">Warning</option>
                    <option value="Critical" selected>Critical</option>
                </select>
            </div>
            <div class="filter-group">
                <label class="filter-label">Criticality</label>
                <select id="rulFilterCriticality" onchange="applyRULFilters()">
                    <option value="">All</option>
                    <option value="High" selected>High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </div>
            <div style="margin-left:auto;display:flex;gap:8px;align-items:flex-end">
                <button class="btn btn-secondary btn-sm" onclick="resetRULFilters()"><i class="fas fa-sync-alt"></i> Reset</button>
                <span class="text-xs text-muted" id="rulAssetCount">${riskyAssets.length} assets</span>
            </div>
        </div>

        <!-- RUL Cards for critical/warning assets -->
        <div class="section-header mb-3">
            <div>
                <h3 class="section-title"><i class="fas fa-hourglass-half" style="margin-right:8px;color:var(--amber)"></i>Remaining Useful Life — At-Risk Assets</h3>
                <p class="section-subtitle">Select one or more filters to reveal asset cards</p>
            </div>
            <span class="badge badge-info" id="rulCardState">Filter to reveal cards</span>
        </div>
        <div class="rul-card-shell mb-5" id="rulCardsShell">
            <div class="grid grid-4 stagger" id="rulAssetsGrid" hidden></div>
        </div>

        <!-- Charts Row (4-in-a-row) -->
        <div class="grid mb-5" style="grid-template-columns:repeat(4,minmax(0,1fr));gap:12px">
            <!-- Failure Probability Over Time -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Failure Probability (7-Day)</span>
                </div>
                <div class="chart-container" style="height:220px">
                    <canvas id="failureProbChart"></canvas>
                </div>
            </div>

            <!-- Failure Category Breakdown -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Failure Category Breakdown</span>
                </div>
                <div class="chart-container" style="height:220px">
                    <canvas id="failureCatChart"></canvas>
                </div>
            </div>

            <!-- Component Degradation Tracking -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Component Degradation Curves</span>
                </div>
                <div class="chart-container" style="height:220px">
                    <canvas id="degradationChart"></canvas>
                </div>
            </div>

            <!-- Predicted Downtime Impact -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Predicted Downtime Impact (Hours)</span>
                </div>
                <div class="chart-container" style="height:220px">
                    <canvas id="downtimeChart"></canvas>
                </div>
            </div>
        </div>

        <!-- High-Risk Asset Ranking Table -->
        <div class="card mb-5">
            <div class="card-header">
                <span class="card-title">Full Asset Risk Ranking</span>
                <button class="btn btn-sm btn-secondary"><i class="fas fa-download"></i> Export</button>
            </div>
            <div class="table-container" style="max-height:420px;overflow-y:auto">
                <table>
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Asset ID</th>
                            <th>Type</th>
                            <th>Plant</th>
                            <th>Health</th>
                            <th>RUL (days)</th>
                            <th>Failure Prob.</th>
                            <th>Fault Type</th>
                            <th>Status</th>
                            <th>Confidence</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rankedAssets.map((a, i) => {
        const s = DATA.getAssetState(a.id);
        const fp = DATA.getFailureProb(a.id);
        const fm = s.failureMode ? DATA.failureModes[s.failureMode] : null;
        return `
                            <tr class="failure-row-clickable" role="button" tabindex="0" onclick="openFailureAssetDetail('${a.id}', ${i + 1})" onkeydown="handleFailureRowKey(event, '${a.id}', ${i + 1})">
                                <td style="font-weight:700;color:var(--text-muted)">${i + 1}</td>
                                <td class="mono" style="font-weight:600;color:var(--accent)">${a.id}</td>
                                <td>${DATA.formatAssetType(a.type)}</td>
                                <td>${a.site}</td>
                                <td><span style="color:${APP.getHealthColor(s.healthIndex)};font-weight:700;font-family:var(--font-mono)">${s.healthIndex.toFixed(1)}</span></td>
                                <td class="mono">${s.rulDays}</td>
                                <td><span class="mono" style="color:${fp > 70 ? 'var(--red)' : fp > 40 ? 'var(--amber)' : 'var(--green)'}; font-weight:600">${fp.toFixed(1)}%</span></td>
                                <td class="text-xs">${fm ? fm.label : '—'}</td>
                                <td>${APP.createStatusBadge(s.status)}</td>
                                <td class="mono text-green">${(82 + Math.random() * 16).toFixed(0)}%</td>
                            </tr>`;
    }).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Failure Simulation Panel -->
        <div class="card mb-5">
            <div class="card-header">
                <span class="card-title"><i class="fas fa-flask" style="margin-right:8px;color:var(--purple)"></i>Failure Impact Simulation</span>
                <span class="badge badge-info">What-If Analysis</span>
            </div>
            <div class="grid gap-2" style="grid-template-columns:repeat(${critAssets.length || 1}, minmax(0,1fr)); margin-top:8px">
                ${critAssets.map(a => {
        const s = DATA.getAssetState(a.id);
        const fm = s.failureMode ? DATA.failureModes[s.failureMode] : { cost: 15000, mttr: 8, label: 'Unknown' };
        const downtimeCost = (fm.mttr * 2500);
        return `
                    <div style="background:var(--bg-elevated);border-radius:var(--radius-md);padding:10px;border:1px solid var(--red-border);font-size:11.5px">
                        <div class="flex justify-between items-center mb-2" style="line-height:1">
                            <span class="asset-id" style="font-size:11.5px">${a.id}</span>
                            <span class="badge badge-critical" style="font-size:8.5px;padding:2px 5px">CRITICAL</span>
                        </div>
                        <div class="text-xs text-muted mb-2" style="line-height:1.2;font-size:10px">${fm.label}</div>
                        <div class="stat-row" style="padding:2px 0"><span class="text-xs">Repair Cost</span><span class="stat-value text-red" style="font-size:11px">${APP.formatCurrency(fm.cost)}</span></div>
                        <div class="stat-row" style="padding:2px 0"><span class="text-xs">Downtime Cost</span><span class="stat-value text-amber" style="font-size:11px">${APP.formatCurrency(downtimeCost)}</span></div>
                        <div class="stat-row" style="padding:2px 0"><span class="text-xs">MTTR</span><span class="stat-value" style="font-size:11px">${fm.mttr}h</span></div>
                        <div class="stat-row" style="padding:2px 0"><span class="text-xs">Total Impact</span><span class="stat-value text-red font-bold" style="font-size:11px">${APP.formatCurrency(fm.cost + downtimeCost)}</span></div>
                    </div>`;
    }).join('')}
            </div>
        </div>

        <div class="wo-overlay" id="failureDetailOverlay" hidden onclick="closeFailureAssetDetail(event)">
            <div class="wo-panel failure-detail-panel" onclick="event.stopPropagation()"></div>
        </div>
    `;

    renderRULCards([]);
    initFailureCharts(riskyAssets);

    // Auto-apply Critical status + High criticality so cards show immediately
    const statusEl = document.getElementById('rulFilterStatus');
    const critEl = document.getElementById('rulFilterCriticality');
    if (statusEl) statusEl.value = 'Critical';
    if (critEl) critEl.value = 'High';
    applyRULFilters();

    window.onGlobalSearch = null;
}

function applyRULFilters() {
    const plant = document.getElementById('rulFilterPlant')?.value || '';
    const type = document.getElementById('rulFilterType')?.value || '';
    const status = document.getElementById('rulFilterStatus')?.value || '';
    const criticality = document.getElementById('rulFilterCriticality')?.value || '';
    const hasSelection = Boolean(plant || type || status || criticality);

    filteredRiskyAssets = DATA.assets.filter(a => {
        const s = DATA.getAssetState(a.id);
        if (s.status === 'Healthy') return false;
        if (plant && a.site !== plant) return false;
        if (type && a.type !== type) return false;
        if (status && s.status !== status) return false;
        if (criticality && a.criticality !== criticality) return false;
        return true;
    }).sort((a, b) => DATA.getAssetState(a.id).rulDays - DATA.getAssetState(b.id).rulDays);

    const assetCountEl = document.getElementById('rulAssetCount');
    if (assetCountEl) {
        assetCountEl.textContent = `${filteredRiskyAssets.length} assets`;
    }

    const grid = document.getElementById('rulAssetsGrid');
    const empty = document.getElementById('rulCardsEmpty');
    const state = document.getElementById('rulCardState');

    if (grid && state) {
        if (hasSelection) {
            grid.hidden = false;
            if (empty) empty.classList.add('hidden');
            state.textContent = `${filteredRiskyAssets.length} selected`;
            renderRULCards(filteredRiskyAssets);
        } else {
            grid.hidden = true;
            grid.innerHTML = '';
            if (empty) empty.classList.remove('hidden');
            state.textContent = 'Filter to reveal cards';
        }
    }
}

function resetRULFilters() {
    const plant = document.getElementById('rulFilterPlant');
    const type = document.getElementById('rulFilterType');
    const status = document.getElementById('rulFilterStatus');
    const criticality = document.getElementById('rulFilterCriticality');
    if (plant) plant.value = '';
    if (type) type.value = '';
    if (status) status.value = '';
    if (criticality) criticality.value = '';
    applyRULFilters();
}


function renderRULCards(assets) {
    const grid = document.getElementById('rulAssetsGrid');

    const empty = document.getElementById('rulCardsEmpty');
    if (!assets.length) {
        grid.hidden = true;
        if (empty) empty.classList.add('hidden');
        return;
    }

    grid.hidden = false;
    if (empty) empty.classList.add('hidden');

    grid.innerHTML = assets.map((a, idx) => {
        const s = DATA.getAssetState(a.id);
        const fp = DATA.getFailureProb(a.id);
        const fm = s.failureMode ? DATA.failureModes[s.failureMode] : null;
        const rank = idx + 1;
        return `
        <div class="rul-card ${s.status.toLowerCase()}" role="button" tabindex="0" onclick="openFailureAssetDetail('${a.id}', ${rank})" style="cursor:pointer">
            <div class="flex justify-between items-center mb-2">
                <div>
                    <div class="asset-id">${a.id}</div>
                    <div class="text-xs text-muted">${DATA.formatAssetType(a.type)} · ${a.site}</div>
                </div>
                ${APP.createStatusBadge(s.status)}
            </div>
            <div class="flex items-center justify-between mb-2">
                ${APP.createProgressRing(s.healthIndex, 100, 48, 4)}
                <div style="text-align:right">
                    <div class="text-xs text-muted">RUL</div>
                    <div style="font-family:var(--font-mono);font-size:18px;font-weight:700;color:${APP.getHealthColor(s.healthIndex)}">${s.rulDays}<span style="font-size:11px;color:var(--text-muted)">d</span></div>
                </div>
            </div>
            <div class="flex flex-col gap-1.5" style="border-top:1px solid var(--border-subtle);padding-top:6px;margin-top:6px">
                <div class="stat-row">
                    <span class="text-xs text-muted">Failure Prob.</span>
                    <span class="mono text-xs" style="font-weight:600;color:${fp > 70 ? 'var(--red)' : fp > 40 ? 'var(--amber)' : 'var(--green)'}">${fp.toFixed(1)}%</span>
                </div>
                <div class="stat-row">
                    <span class="text-xs text-muted">Fault Type</span>
                    <span class="text-xs" style="font-weight:600;color:var(--body);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px" title="${fm ? fm.label : 'Unknown'}">${fm ? fm.label : 'Unknown'}</span>
                </div>
            </div>
        </div>`;
    }).join('');
}

function handleFailureRowKey(event, assetId, rank) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openFailureAssetDetail(assetId, rank);
    }
}

function openFailureAssetDetail(assetId, rank) {
    const asset = DATA.getAssetById(assetId);
    if (!asset) return;

    const state = DATA.getAssetState(asset.id);
    const failureProb = DATA.getFailureProb(asset.id);
    const failureMode = state.failureMode ? DATA.failureModes[state.failureMode] : null;
    const alerts = DATA.getAlertsForAsset(asset.id).slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const workOrders = DATA.getWorkOrdersForAsset(asset.id).slice().sort((a, b) => new Date(b.created) - new Date(a.created));
    const insight = buildFailureAssetInsight(asset, state, failureProb, rank, failureMode, alerts, workOrders);

    const overlay = document.getElementById('failureDetailOverlay');
    const panel = document.querySelector('#failureDetailOverlay .failure-detail-panel');
    if (!overlay || !panel) return;

    panel.innerHTML = `
        <div class="wo-panel-head">
            <div>
                <div class="wo-panel-kicker">Risk Ranking Window</div>
                <h3>${asset.id}</h3>
                <div class="wo-panel-sub">Rank #${rank} · ${DATA.formatAssetType(asset.type)} · ${asset.site}</div>
            </div>
            <button class="wo-close" onclick="closeFailureAssetDetail(event)">&times;</button>
        </div>
        <div class="wo-panel-body">
            <div class="wo-summary-strip">
                <div class="wo-summary-card"><div class="wo-label">Rank</div><div class="wo-value">#${rank}</div></div>
                <div class="wo-summary-card"><div class="wo-label">Health Index</div><div class="wo-value" style="color:${APP.getHealthColor(state.healthIndex)}">${state.healthIndex.toFixed(1)}</div></div>
                <div class="wo-summary-card"><div class="wo-label">RUL</div><div class="wo-value">${state.rulDays.toFixed(1)} days</div></div>
                <div class="wo-summary-card"><div class="wo-label">Failure Prob.</div><div class="wo-value">${failureProb.toFixed(1)}%</div></div>
                <div class="wo-summary-card"><div class="wo-label">Status</div><div class="wo-value">${state.status}</div></div>
                <div class="wo-summary-card"><div class="wo-label">Confidence</div><div class="wo-value">${insight.confidence}%</div></div>
            </div>

            <div class="wo-layout failure-detail-layout">
                <div class="wo-main-column">
                    <div class="wo-detail-section">
                        <div class="wo-section-title">Asset & Ranking Details</div>
                        <div class="wo-kv-grid">
                            <div><span class="wo-k">Type</span><span class="wo-v">${DATA.formatAssetType(asset.type)}</span></div>
                            <div><span class="wo-k">Plant</span><span class="wo-v">${asset.site}</span></div>
                            <div><span class="wo-k">Criticality</span><span class="wo-v">${asset.criticality}</span></div>
                            <div><span class="wo-k">Fault Type</span><span class="wo-v">${failureMode ? failureMode.label : '—'}</span></div>
                        </div>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Risk Factors</div>
                        <div class="wo-kv-grid">
                            <div><span class="wo-k">Failure Mode</span><span class="wo-v">${failureMode ? failureMode.description : 'Condition-based risk model'}</span></div>
                            <div><span class="wo-k">Repair Cost</span><span class="wo-v">${APP.formatCurrency(failureMode ? failureMode.cost : Math.max(12000, Math.round((100 - state.healthIndex) * 220)))}</span></div>
                            <div><span class="wo-k">MTTR</span><span class="wo-v">${failureMode ? `${failureMode.mttr} hours` : '—'}</span></div>
                            <div><span class="wo-k">Open WOs</span><span class="wo-v">${workOrders.filter(w => w.status !== 'Closed').length}</span></div>
                        </div>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Recent Context</div>
                        ${alerts.length ? alerts.slice(0, 3).map(alert => `
                            <div class="wo-side-stat">
                                <span>${APP.formatDateTime(alert.timestamp)} · ${alert.sensor.replace(/_/g, ' ')}</span>
                                <span class="badge ${alert.level === 'Critical' ? 'badge-critical' : 'badge-warning'}" style="font-size:9px">${alert.level}</span>
                            </div>
                            <p style="margin:0 0 8px 0">${alert.reason}</p>
                        `).join('') : '<p style="margin:0">No recent alerts are associated with this asset.</p>'}
                    </div>
                </div>

                <div class="wo-side-column">
                    <div class="wo-detail-section">
                        <div class="wo-section-title">AI Insight</div>
                        <div class="insight-card ${insight.severity}">
                            <div class="insight-icon"><i class="fas fa-brain"></i></div>
                            <div class="insight-body">
                                <div class="insight-title">${insight.title}</div>
                                <div class="insight-message">${insight.message}</div>
                                <div class="insight-confidence">Confidence ${insight.confidence}%</div>
                            </div>
                        </div>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Recommended Action</div>
                        <p style="margin:0">${insight.recommendation}</p>
                    </div>

                    <div class="wo-actions compact">
                        <button class="btn btn-primary" onclick="closeFailureAssetDetail(event)"><i class="fas fa-check"></i> Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    overlay.hidden = false;
}

function closeFailureAssetDetail(event) {
    if (event) event.stopPropagation();
    const overlay = document.getElementById('failureDetailOverlay');
    if (!overlay) return;
    overlay.hidden = true;
}

function buildFailureAssetInsight(asset, state, failureProb, rank, failureMode, alerts, workOrders) {
    const openWO = workOrders.find(w => w.status !== 'Closed') || null;
    const riskBand = state.status === 'Critical' || state.rulDays < 7 || failureProb >= 70 ? 'critical' : state.status === 'Warning' || state.rulDays < 14 || failureProb >= 40 ? 'warning' : 'info';
    const confidence = Math.min(99, 84 + Math.round(failureProb / 8) + (openWO ? 2 : 0));

    let title = `${asset.id} is ranked #${rank} in the risk table`;
    let message = `${asset.id} has a health index of ${state.healthIndex.toFixed(1)}, RUL of ${state.rulDays.toFixed(1)} days, and failure probability of ${failureProb.toFixed(1)}%. The ranking is driven by the current condition model and the mapped failure mode ${failureMode ? failureMode.label.toLowerCase() : 'condition-based degradation'}.`;
    let recommendation = 'Review this asset against the next maintenance slot and confirm the failure trend before it escalates.';

    if (riskBand === 'critical') {
        title = `${asset.id} should be treated as an immediate risk`;
        message = `${asset.id} is in the critical band, which means the asset is near or inside the shortest RUL window and should be prioritized for intervention.`;
        recommendation = 'Escalate the asset for immediate inspection, parts verification, and maintenance planning.';
    } else if (riskBand === 'warning') {
        title = `${asset.id} needs near-term scheduling`;
        message = `${asset.id} is not yet critical, but its ranking shows it is degrading enough to justify a near-term maintenance slot.`;
        recommendation = 'Schedule a controlled inspection and compare the recent alerts with the last repair cycle.';
    }

    if (alerts.length > 1) {
        message += ` The asset has ${alerts.length} related alerts, which increases confidence that the issue is recurring rather than isolated.`;
    }

    if (openWO) {
        recommendation += ` A work order (${openWO.id}) is already ${openWO.status.toLowerCase()}, so keep the response aligned with that active job.`;
    }

    return { title, message, recommendation, confidence, severity: riskBand };
}

function initFailureCharts(riskyAssets) {
    // Failure Probability Trend
    const topRisk = riskyAssets.slice(0, 4);
    const dates = DATA.trendsDaily[DATA.assets[0].id].dates;
    CHARTS.createLineChart('failureProbChart', dates,
        topRisk.map((a, i) => ({
            label: a.id,
            data: DATA.trendsDaily[a.id].health.map(h => Math.max(0, 100 - (h / 100 * 100))),
            color: CHARTS.PALETTE[i],
            fill: false,
        })),
        { yScale: { min: 0, max: 100, title: { display: true, text: 'Failure Probability %' } } }
    );

    // Failure Category
    const catCounts = {};
    DATA.assets.forEach(a => {
        const fm = DATA.getAssetState(a.id).failureMode;
        if (fm && DATA.failureModes[fm]) {
            const cat = DATA.failureModes[fm].category;
            catCounts[cat] = (catCounts[cat] || 0) + 1;
        }
    });
    CHARTS.createDoughnutChart('failureCatChart',
        Object.keys(catCounts),
        Object.values(catCounts),
        [CHARTS.COLORS.red, CHARTS.COLORS.amber, CHARTS.COLORS.blue, CHARTS.COLORS.purple, CHARTS.COLORS.cyan],
        { cutout: '65%' }
    );

    // Degradation Curves
    CHARTS.createLineChart('degradationChart', dates,
        topRisk.slice(0, 3).map((a, i) => ({
            label: a.id,
            data: DATA.trendsDaily[a.id].health,
            color: CHARTS.PALETTE[i],
            fill: true,
        })),
        { yScale: { min: 0, max: 100, title: { display: true, text: 'Health Index' } } }
    );

    // Downtime Impact
    CHARTS.createBarChart('downtimeChart',
        riskyAssets.slice(0, 8).map(a => a.id),
        [{
            label: 'Predicted Downtime (hrs)',
            data: riskyAssets.slice(0, 8).map(a => {
                const fm = DATA.getAssetState(a.id).failureMode;
                return fm && DATA.failureModes[fm] ? DATA.failureModes[fm].mttr : 8;
            }),
            colors: riskyAssets.slice(0, 8).map(a => APP.getHealthColor(DATA.getAssetState(a.id).healthIndex))
        }],
        { plugins: { legend: { display: false } } }
    );
}
