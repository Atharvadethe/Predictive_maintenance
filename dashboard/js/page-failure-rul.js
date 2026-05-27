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
    const riskyAssets = DATA.assets.filter(a => DATA.getAssetState(a.id).status !== 'Healthy')
        .sort((a, b) => DATA.getAssetState(a.id).rulDays - DATA.getAssetState(b.id).rulDays);
    const critAssets = DATA.assets.filter(a => DATA.getAssetState(a.id).status === 'Critical');
    const avgFailProb = DATA.assets.reduce((s, a) => s + DATA.getFailureProb(a.id), 0) / DATA.assets.length;
    filteredRiskyAssets = [...riskyAssets];

    content.innerHTML = `
        ${APP.renderPageHeader('Failure Prediction & RUL Analytics', 'AI-powered remaining useful life estimation and failure probability tracking')}

        <!-- Summary Cards -->
        <div class="grid grid-4 mb-5 stagger">
            <div class="kpi-card red">
                <div class="kpi-top">
                    <div><div class="kpi-label">Critical Assets</div><div class="kpi-value">${critAssets.length}</div></div>
                    <div class="card-icon" style="background:var(--red-bg);color:var(--red)"><i class="fas fa-skull-crossbones"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">RUL < 7 days</span></div>
            </div>
            <div class="kpi-card amber">
                <div class="kpi-top">
                    <div><div class="kpi-label">Warning Assets</div><div class="kpi-value">${riskyAssets.length - critAssets.length}</div></div>
                    <div class="card-icon" style="background:var(--amber-bg);color:var(--amber)"><i class="fas fa-exclamation-triangle"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">RUL < 30 days</span></div>
            </div>
            <div class="kpi-card blue">
                <div class="kpi-top">
                    <div><div class="kpi-label">Avg Failure Prob</div><div class="kpi-value">${avgFailProb.toFixed(0)}%</div></div>
                    <div class="card-icon" style="background:var(--blue-bg);color:var(--blue)"><i class="fas fa-percentage"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Across all assets</span></div>
            </div>
            <div class="kpi-card green">
                <div class="kpi-top">
                    <div><div class="kpi-label">Model Confidence</div><div class="kpi-value">94.7%</div></div>
                    <div class="card-icon" style="background:var(--green-bg);color:var(--green)"><i class="fas fa-brain"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Last model retrain: Apr 20</span></div>
            </div>
        </div>

        <!-- Filters -->
        <div class="filter-bar">
            <div class="filter-group">
                <label class="filter-label">Plant</label>
                <select id="rulFilterPlant" onchange="applyRULFilters()">
                    <option value="">All Plants</option>
                    <option value="Plant-A">Plant-A</option>
                    <option value="Plant-B">Plant-B</option>
                    <option value="Plant-C">Plant-C</option>
                </select>
            </div>
            <div class="filter-group">
                <label class="filter-label">Asset Type</label>
                <select id="rulFilterType" onchange="applyRULFilters()">
                    <option value="">All Types</option>
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
                    <option value="Critical">Critical</option>
                </select>
            </div>
            <div class="filter-group">
                <label class="filter-label">Criticality</label>
                <select id="rulFilterCriticality" onchange="applyRULFilters()">
                    <option value="">All</option>
                    <option value="High">High</option>
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
        <div class="section-header mb-4">
            <h3 class="section-title"><i class="fas fa-hourglass-half" style="margin-right:8px;color:var(--amber)"></i>Remaining Useful Life — At-Risk Assets</h3>
        </div>
        <div class="grid grid-4 mb-5 stagger" id="rulAssetsGrid">
            <!-- Rendered dynamically -->
        </div>

        <div class="grid grid-2 mb-5">
            <!-- Failure Probability Over Time -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Failure Probability Trend (7-Day)</span>
                </div>
                <div class="chart-container" style="height:280px">
                    <canvas id="failureProbChart"></canvas>
                </div>
            </div>

            <!-- Failure Category Breakdown -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Failure Category Breakdown</span>
                </div>
                <div class="chart-container" style="height:280px">
                    <canvas id="failureCatChart"></canvas>
                </div>
            </div>
        </div>

        <div class="grid grid-2 mb-5">
            <!-- Component Degradation Tracking -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Component Degradation Curves</span>
                </div>
                <div class="chart-container" style="height:280px">
                    <canvas id="degradationChart"></canvas>
                </div>
            </div>

            <!-- Predicted Downtime Impact -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Predicted Downtime Impact (Hours)</span>
                </div>
                <div class="chart-container" style="height:280px">
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
                        ${DATA.assets.sort((a,b) => DATA.getAssetState(a.id).healthIndex - DATA.getAssetState(b.id).healthIndex).map((a, i) => {
                            const s = DATA.getAssetState(a.id);
                            const fp = DATA.getFailureProb(a.id);
                            const fm = s.failureMode ? DATA.failureModes[s.failureMode] : null;
                            return `
                            <tr>
                                <td style="font-weight:700;color:var(--text-muted)">${i+1}</td>
                                <td class="mono" style="font-weight:600;color:var(--text-primary)">${a.id}</td>
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
            <div class="grid grid-3 gap-3" style="margin-top:8px">
                ${critAssets.map(a => {
                    const s = DATA.getAssetState(a.id);
                    const fm = s.failureMode ? DATA.failureModes[s.failureMode] : { cost: 15000, mttr: 8, label: 'Unknown' };
                    const downtimeCost = (fm.mttr * 2500);
                    return `
                    <div style="background:var(--bg-elevated);border-radius:var(--radius-md);padding:16px;border:1px solid var(--red-border)">
                        <div class="flex justify-between items-center mb-4">
                            <span class="asset-id">${a.id}</span>
                            <span class="badge badge-critical">CRITICAL</span>
                        </div>
                        <div class="text-xs text-muted mb-4">${fm.label}</div>
                        <div class="stat-row"><span class="text-xs">Repair Cost</span><span class="stat-value text-red">${APP.formatCurrency(fm.cost)}</span></div>
                        <div class="stat-row"><span class="text-xs">Downtime Cost</span><span class="stat-value text-amber">${APP.formatCurrency(downtimeCost)}</span></div>
                        <div class="stat-row"><span class="text-xs">MTTR</span><span class="stat-value">${fm.mttr}h</span></div>
                        <div class="stat-row"><span class="text-xs">Total Impact</span><span class="stat-value text-red font-bold">${APP.formatCurrency(fm.cost + downtimeCost)}</span></div>
                    </div>`;
                }).join('')}
            </div>
        </div>
    `;

    renderRULCards(riskyAssets);
    initFailureCharts(riskyAssets);
}

function applyRULFilters() {
    const plant = document.getElementById('rulFilterPlant').value;
    const type = document.getElementById('rulFilterType').value;
    const status = document.getElementById('rulFilterStatus').value;
    const criticality = document.getElementById('rulFilterCriticality').value;

    const riskyAssets = DATA.assets.filter(a => DATA.getAssetState(a.id).status !== 'Healthy')
        .sort((a, b) => DATA.getAssetState(a.id).rulDays - DATA.getAssetState(b.id).rulDays);

    filteredRiskyAssets = riskyAssets.filter(a => {
        const s = DATA.getAssetState(a.id);
        if (plant && a.site !== plant) return false;
        if (type && a.type !== type) return false;
        if (status && s.status !== status) return false;
        if (criticality && a.criticality !== criticality) return false;
        return true;
    });

    document.getElementById('rulAssetCount').textContent = `${filteredRiskyAssets.length} assets`;
    renderRULCards(filteredRiskyAssets);
}

function resetRULFilters() {
    document.getElementById('rulFilterPlant').value = '';
    document.getElementById('rulFilterType').value = '';
    document.getElementById('rulFilterStatus').value = '';
    document.getElementById('rulFilterCriticality').value = '';
    applyRULFilters();
}

function renderRULCards(assets) {
    const grid = document.getElementById('rulAssetsGrid');

    if (!assets.length) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <i class="fas fa-filter"></i>
                <p>No at-risk assets match the selected filters.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = assets.map(a => {
        const s = DATA.getAssetState(a.id);
        const fp = DATA.getFailureProb(a.id);
        const fm = s.failureMode ? DATA.failureModes[s.failureMode] : null;
        return `
        <div class="card" style="border-left:3px solid ${DATA.getStatusColor(s.status)}">
            <div class="flex justify-between items-center mb-4">
                <div>
                    <div class="asset-id">${a.id}</div>
                    <div class="text-xs text-muted">${DATA.formatAssetType(a.type)} · ${a.site}</div>
                </div>
                ${APP.createStatusBadge(s.status)}
            </div>
            <div class="flex items-center justify-between mb-4">
                ${APP.createProgressRing(s.healthIndex, 100, 64, 6)}
                <div style="text-align:right">
                    <div class="text-xs text-muted">RUL</div>
                    <div style="font-family:var(--font-mono);font-size:24px;font-weight:800;color:${APP.getHealthColor(s.healthIndex)}">${s.rulDays}<span style="font-size:12px;color:var(--text-muted)">d</span></div>
                </div>
            </div>
            <div class="flex flex-col gap-3">
                <div class="stat-row" style="padding:4px 0">
                    <span class="text-xs text-muted">Failure Prob.</span>
                    <span class="mono text-sm" style="color:${fp > 70 ? 'var(--red)' : fp > 40 ? 'var(--amber)' : 'var(--green)'}">${fp.toFixed(1)}%</span>
                </div>
                <div class="stat-row" style="padding:4px 0">
                    <span class="text-xs text-muted">Fault Type</span>
                    <span class="text-sm">${fm ? fm.label : 'Unknown'}</span>
                </div>
                <div class="stat-row" style="padding:4px 0">
                    <span class="text-xs text-muted">Confidence</span>
                    <span class="mono text-sm text-green">${(85 + Math.random() * 12).toFixed(0)}%</span>
                </div>
            </div>
        </div>`;
    }).join('');
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
