/* ===================================================================
   PAGE-ASSET-HEALTH.JS — Asset Health Monitoring
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    APP.initLayout();
    renderAssetHealth();
});

let filteredAssets = [...DATA.assets];

function renderAssetHealth() {
    const content = document.getElementById('pageContent');
    content.classList.add('asset-health-compact');
    content.innerHTML = `
        ${APP.renderPageHeader('Asset Health Monitoring', 'Real-time equipment health indices, sensor readings, and condition tracking')}

        <!-- Filters -->
        <div class="filter-bar">
            <div class="filter-group">
                <label class="filter-label">Plant</label>
                <select id="filterPlant" onchange="applyFilters()">
                    <option value="">All Plants</option>
                    <option value="Plant-A">Plant-A</option>
                    <option value="Plant-B">Plant-B</option>
                    <option value="Plant-C">Plant-C</option>
                </select>
            </div>
            <div class="filter-group">
                <label class="filter-label">Asset Type</label>
                <select id="filterType" onchange="applyFilters()">
                    <option value="">All Types</option>
                    <option value="compressor">Compressor</option>
                    <option value="motor">Motor</option>
                    <option value="pump">Pump</option>
                    <option value="turbine">Turbine</option>
                </select>
            </div>
            <div class="filter-group">
                <label class="filter-label">Status</label>
                <select id="filterStatus" onchange="applyFilters()">
                    <option value="">All Status</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Warning">Warning</option>
                    <option value="Critical">Critical</option>
                </select>
            </div>
            <div class="filter-group">
                <label class="filter-label">Criticality</label>
                <select id="filterCrit" onchange="applyFilters()">
                    <option value="">All</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
            </div>
            <div style="margin-left:auto;display:flex;gap:8px;align-items:flex-end">
                <button class="btn btn-secondary btn-sm" onclick="applyFilters()"><i class="fas fa-sync-alt"></i> Refresh</button>
                <span class="text-xs text-muted" id="assetCount">${DATA.assets.length} assets</span>
            </div>
        </div>

        <div class="grid grid-6 mb-4 stagger" id="summaryCards">
            ${summaryCard('Avg Health Index', avgHealth(DATA.assets), 'fa-heartbeat', 'green')}
            ${summaryCard('Top Degrading', DATA.getTopRiskyAssets(1)[0].id, 'fa-arrow-down', 'red')}
            ${summaryCard('Avg Utilization', '87.3%', 'fa-chart-pie', 'blue')}
            ${summaryCard('Sensors Online', '98.7%', 'fa-wifi', 'green')}
            ${summaryCard('Critical Assets', DATA.kpis.critical, 'fa-exclamation-circle', 'red')}
            ${summaryCard('Avg RUL', `${DATA.kpis.avgRul} days`, 'fa-hourglass-half', 'amber')}
        </div>

        <div class="section-header mb-3">
            <div>
                <h3 class="section-title">Asset Health Cards</h3>
                <p class="section-subtitle">Select one or more filters to load asset cards</p>
            </div>
            <span class="badge badge-info" id="assetCardState">Filter to reveal cards</span>
        </div>
        <div class="asset-card-shell mb-5" id="assetCardsShell">
            <div class="asset-card-empty" id="assetCardsEmpty">
                Use the filter bar to narrow the fleet, then the asset cards will appear here.
            </div>
            <div class="grid grid-3" id="assetCardsGrid" hidden></div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-2 mb-5">
            <!-- Health Trend Graph -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Health Index Trend (7-Day)</span>
                </div>
                <div class="chart-container" style="height:280px">
                    <canvas id="healthTrendChart"></canvas>
                </div>
            </div>

            <!-- Asset Criticality Matrix -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Asset Criticality vs Health Matrix</span>
                </div>
                <div class="chart-container" style="height:280px">
                    <canvas id="critMatrixChart"></canvas>
                </div>
            </div>
        </div>

        <div class="grid grid-2 mb-5">
            <!-- Equipment Utilization -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Equipment Utilization by Type</span>
                </div>
                <div class="chart-container" style="height:260px">
                    <canvas id="utilizationChart"></canvas>
                </div>
            </div>

            <!-- Top Degrading Assets -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Top Degrading Assets</span>
                </div>
                <div class="chart-container" style="height:260px">
                    <canvas id="degradingChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Sensor Values Table -->
        <div class="card mb-5">
            <div class="card-header">
                <span class="card-title">Current Sensor Readings — All Assets</span>
                <button class="btn btn-sm btn-secondary"><i class="fas fa-download"></i> Export</button>
            </div>
            <div class="table-container" style="max-height:400px;overflow-y:auto">
                <table id="sensorTable">
                    <thead>
                        <tr>
                            <th>Asset ID</th>
                            <th>Type</th>
                            <th>Plant</th>
                            <th>Status</th>
                            <th>Health</th>
                            <th>Anomaly</th>
                            <th>RUL (days)</th>
                            <th>Last Maint.</th>
                            <th>Criticality</th>
                        </tr>
                    </thead>
                    <tbody id="sensorTableBody"></tbody>
                </table>
            </div>
        </div>

        <div class="wo-overlay asset-detail-overlay" id="assetDetailOverlay" hidden onclick="closeAssetDetail(event)">
            <div class="wo-panel asset-detail-panel" onclick="event.stopPropagation()"></div>
        </div>
    `;

    renderAssetCards([]);
    renderSensorTable(DATA.assets);
    initHealthCharts();

    // Search handler
    window.onGlobalSearch = (q) => {
        const hasSelection = Boolean(
            document.getElementById('filterPlant').value ||
            document.getElementById('filterType').value ||
            document.getElementById('filterStatus').value ||
            document.getElementById('filterCrit').value
        );

        if (!hasSelection) {
            renderSensorTable(DATA.assets);
            return;
        }

        if (!q) {
            renderAssetCards(filteredAssets);
            renderSensorTable(filteredAssets);
            return;
        }

        const results = filteredAssets.filter(a => a.id.toLowerCase().includes(q) || a.type.includes(q) || a.site.toLowerCase().includes(q));
        renderAssetCards(results);
        renderSensorTable(results);
    };
}

function avgHealth(assets) {
    const avg = assets.reduce((s, a) => s + DATA.getAssetState(a.id).healthIndex, 0) / assets.length;
    return avg.toFixed(1);
}

function summaryCard(label, value, icon, color) {
    return `
        <div class="kpi-card ${color}">
            <div class="kpi-top">
                <div>
                    <div class="kpi-label">${label}</div>
                    <div class="kpi-value" style="font-size:24px">${value}</div>
                </div>
                <div class="card-icon" style="background:var(--${color}-bg);color:var(--${color})">
                    <i class="fas ${icon}"></i>
                </div>
            </div>
        </div>`;
}

function applyFilters() {
    const plant = document.getElementById('filterPlant').value;
    const type = document.getElementById('filterType').value;
    const status = document.getElementById('filterStatus').value;
    const crit = document.getElementById('filterCrit').value;
    const hasSelection = Boolean(plant || type || status || crit);

    filteredAssets = DATA.assets.filter(a => {
        const s = DATA.getAssetState(a.id);
        if (plant && a.site !== plant) return false;
        if (type && a.type !== type) return false;
        if (status && s.status !== status) return false;
        if (crit && a.criticality !== crit) return false;
        return true;
    });

    document.getElementById('assetCount').textContent = `${filteredAssets.length} assets`;
    const grid = document.getElementById('assetCardsGrid');
    const empty = document.getElementById('assetCardsEmpty');
    const state = document.getElementById('assetCardState');

    if (hasSelection) {
        grid.hidden = false;
        empty.classList.add('hidden');
        state.textContent = `${filteredAssets.length} selected`;
        renderAssetCards(filteredAssets);
    } else {
        grid.hidden = true;
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        state.textContent = 'Filter to reveal cards';
    }

    renderSensorTable(filteredAssets);
}

function renderAssetCards(assets) {
    const grid = document.getElementById('assetCardsGrid');
    const empty = document.getElementById('assetCardsEmpty');

    if (!assets.length) {
        grid.hidden = true;
        empty.classList.remove('hidden');
        empty.textContent = 'No assets match the selected filter.';
        return;
    }

    grid.hidden = false;
    empty.classList.add('hidden');
    grid.innerHTML = assets.map(a => {
        const s = DATA.getAssetState(a.id);
        const readings = DATA.telemetrySnapshot[a.id];
        const tags = DATA.tagCatalog.filter(t => t.assetType === a.type && t.tagName !== 'run_status' && t.tagName !== 'ambient_temp');
        const topTags = tags.slice(0, 4);

        return `
            <div class="asset-card" role="button" tabindex="0" onclick="openAssetDetail('${a.id}')" onkeydown="handleAssetCardKey(event, '${a.id}')">
                <div class="asset-card-header">
                    <div class="flex items-center gap-3">
                        <i class="fas ${APP.getTypeIcon(a.type)}" style="color:var(--accent);font-size:16px"></i>
                        <div>
                            <div class="asset-id">${a.id}</div>
                            <div class="text-xs text-muted">${DATA.formatAssetType(a.type)} · ${a.site}</div>
                        </div>
                    </div>
                    ${APP.createStatusBadge(s.status)}
                </div>

                <div class="flex items-center justify-between" style="margin:12px 0">
                    ${APP.createProgressRing(s.healthIndex, 100, 56, 5)}
                    <div style="text-align:right">
                        <div class="text-xs text-muted">RUL</div>
                        <div style="font-family:var(--font-mono);font-size:16px;font-weight:700;color:${APP.getHealthColor(s.healthIndex)}">${s.rulDays}d</div>
                        <div class="text-xs text-muted">Anomaly: ${s.anomalyScore.toFixed(3)}</div>
                    </div>
                </div>

                <div class="asset-metrics">
                    ${topTags.map(t => {
                        const val = readings[t.tagName];
                        return val !== undefined ? `
                            <div class="asset-metric">
                                <span class="asset-metric-label">${t.tagName.replace(/_/g,' ')}</span>
                                <span class="asset-metric-value" data-live-value="${t.tagName}" data-asset-id="${a.id}">${val.toFixed(1)} <span class="text-xs text-muted">${t.unit}</span></span>
                            </div>
                        ` : '';
                    }).join('')}
                </div>

                <div style="margin-top:12px;padding-top:8px;border-top:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center">
                    <span class="text-xs text-muted">Last: ${APP.formatDate(s.lastMaintenance)}</span>
                    <span class="badge ${a.criticality === 'High' ? 'badge-critical' : a.criticality === 'Medium' ? 'badge-warning' : 'badge-info'}" style="font-size:9px">${a.criticality}</span>
                </div>
            </div>
        `;
    }).join('');
}

function handleAssetCardKey(event, assetId) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openAssetDetail(assetId);
    }
}

function openAssetDetail(assetId) {
    const asset = DATA.getAssetById(assetId);
    if (!asset) return;

    const state = DATA.getAssetState(asset.id);
    const alerts = DATA.getAlertsForAsset(asset.id).slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const workOrders = DATA.getWorkOrdersForAsset(asset.id).slice().sort((a, b) => new Date(b.created) - new Date(a.created));
    const failureMode = DATA.failureModes[state.failureMode] || DATA.failureModes[asset.failureMode] || null;
    const latestAlert = alerts[0] || null;
    const latestWO = workOrders[0] || null;

    const insightSeverity = state.status === 'Critical' || state.rulDays < 7 ? 'critical' : state.status === 'Warning' ? 'warning' : 'info';
    const aiInsight = buildAssetInsight(asset, state, alerts, workOrders, failureMode);
    const actionLabel = latestWO && latestWO.status !== 'Closed' ? 'Review Work Order' : 'Create Maintenance Plan';

    const overlay = document.getElementById('assetDetailOverlay');
    const panel = document.querySelector('#assetDetailOverlay .asset-detail-panel');

    panel.innerHTML = `
        <div class="wo-panel-head">
            <div class="wo-panel-kicker">Asset Detail Window</div>
            <h3>${asset.id} · ${DATA.formatAssetType(asset.type)}</h3>
            <div class="wo-panel-sub">${asset.site} · ${asset.criticality} criticality · ${APP.createStatusBadge(state.status)}</div>
            <button class="wo-close" aria-label="Close asset detail" onclick="closeAssetDetail(event)">×</button>
        </div>
        <div class="wo-panel-body">
            <div class="wo-summary-strip">
                <div class="wo-summary-card"><div class="wo-label">Health Index</div><div class="wo-value" style="color:${APP.getHealthColor(state.healthIndex)}">${state.healthIndex.toFixed(1)}</div></div>
                <div class="wo-summary-card"><div class="wo-label">RUL</div><div class="wo-value">${state.rulDays.toFixed(1)} days</div></div>
                <div class="wo-summary-card"><div class="wo-label">Anomaly Score</div><div class="wo-value">${state.anomalyScore.toFixed(3)}</div></div>
                <div class="wo-summary-card"><div class="wo-label">Status</div><div class="wo-value">${state.status}</div></div>
                <div class="wo-summary-card"><div class="wo-label">Criticality</div><div class="wo-value">${asset.criticality}</div></div>
                <div class="wo-summary-card"><div class="wo-label">Alerts</div><div class="wo-value">${alerts.length}</div></div>
            </div>

            <div class="wo-layout asset-detail-layout">
                <div class="wo-main-column">
                    <div class="wo-detail-section">
                        <div class="wo-section-title">Asset Snapshot</div>
                        <div class="wo-kv-grid">
                            <div><span class="wo-k">Asset Type</span><span class="wo-v">${DATA.formatAssetType(asset.type)}</span></div>
                            <div><span class="wo-k">Plant</span><span class="wo-v">${asset.site}</span></div>
                            <div><span class="wo-k">Last Maintenance</span><span class="wo-v">${APP.formatDate(state.lastMaintenance)}</span></div>
                            <div><span class="wo-k">Utilization</span><span class="wo-v">${(DATA.kpis.oee + (asset.criticality === 'High' ? 0.8 : 0)).toFixed(1)}%</span></div>
                        </div>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Recent Sensor Highlights</div>
                        <div class="wo-kv-grid">
                            ${DATA.tagCatalog.filter(t => t.assetType === asset.type && t.tagName !== 'run_status' && t.tagName !== 'ambient_temp').slice(0, 4).map(tag => {
                                const value = DATA.telemetrySnapshot[asset.id]?.[tag.tagName];
                                return `<div><span class="wo-k">${tag.tagName.replace(/_/g, ' ')}</span><span class="wo-v">${value !== undefined ? value.toFixed(1) + ' ' + tag.unit : 'N/A'}</span></div>`;
                            }).join('')}
                        </div>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Recent Alerts</div>
                        ${alerts.length ? alerts.slice(0, 3).map(alert => `
                            <div class="wo-side-stat">
                                <span>${APP.formatDateTime(alert.timestamp)} · ${alert.sensor.replace(/_/g, ' ')}</span>
                                <span class="badge ${alert.level === 'Critical' ? 'badge-critical' : 'badge-warning'}" style="font-size:9px">${alert.level}</span>
                            </div>
                            <p style="margin:0 0 8px 0">${alert.reason}</p>
                        `).join('') : '<p style="margin:0">No alerts are currently associated with this asset.</p>'}
                    </div>
                </div>

                <div class="wo-side-column">
                    <div class="wo-detail-section">
                        <div class="wo-section-title">AI Insight</div>
                        <div class="insight-card ${insightSeverity}">
                            <div class="insight-icon"><i class="fas fa-brain"></i></div>
                            <div class="insight-body">
                                <div class="insight-title">${aiInsight.title}</div>
                                <div class="insight-message">${aiInsight.message}</div>
                                <div class="insight-confidence">Confidence ${aiInsight.confidence}%</div>
                            </div>
                        </div>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Maintenance Context</div>
                        <div class="wo-side-stat"><span>Failure mode</span><span>${failureMode ? failureMode.label : 'Condition-based'}</span></div>
                        <div class="wo-side-stat"><span>Latest WO</span><span>${latestWO ? latestWO.id : 'None'}</span></div>
                        <div class="wo-side-stat"><span>WO status</span><span>${latestWO ? latestWO.status : 'N/A'}</span></div>
                        <div class="wo-side-stat"><span>Recommended action</span><span>${actionLabel}</span></div>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Recommendation</div>
                        <p style="margin:0">${aiInsight.recommendation}</p>
                    </div>

                    <div class="wo-actions compact">
                        <button class="btn btn-primary" onclick="closeAssetDetail(event)"><i class="fas fa-check"></i> Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    overlay.hidden = false;
}

function closeAssetDetail(event) {
    if (event) event.stopPropagation();
    const overlay = document.getElementById('assetDetailOverlay');
    if (!overlay) return;
    overlay.hidden = true;
}

function buildAssetInsight(asset, state, alerts, workOrders, failureMode) {
    const latestAlert = alerts[0];
    const latestWO = workOrders[0];
    const riskBand = state.healthIndex < 50 || state.rulDays < 7 ? 'critical' : state.healthIndex < 70 || state.rulDays < 14 ? 'warning' : 'info';
    const confidence = Math.min(99, 86 + alerts.length * 2 + (riskBand === 'critical' ? 6 : riskBand === 'warning' ? 3 : 0));

    let title = `${asset.id} is being monitored within a ${state.status.toLowerCase()} risk band`;
    let message = `${asset.id} has a health index of ${state.healthIndex.toFixed(1)} and RUL of ${state.rulDays.toFixed(1)} days. The current alert pattern suggests ${failureMode ? failureMode.label.toLowerCase() : 'condition-based degradation'}, so the asset should stay on the active watchlist.`;
    let recommendation = 'Continue watching the current trend and validate the next maintenance window against the remaining useful life.';

    if (riskBand === 'critical') {
        title = `${asset.id} needs immediate intervention`;
        message = `${asset.id} is in the critical band. Health is low, RUL is short, and recent alerts indicate the condition is moving toward failure unless it is removed from service or corrected quickly.`;
        recommendation = 'Prioritize this asset for immediate inspection, parts confirmation, and maintenance scheduling.';
    } else if (riskBand === 'warning') {
        title = `${asset.id} should be scheduled soon`;
        message = `${asset.id} is degrading but still controllable. The AI view recommends bringing it into the next maintenance cycle before the condition crosses into the critical band.`;
        recommendation = 'Plan a near-term maintenance slot and confirm the alert trail against the last repair cycle.';
    }

    if (latestAlert) {
        message += ` The latest alert was ${latestAlert.level.toLowerCase()} from ${latestAlert.sensor.replace(/_/g, ' ')} and reinforces the current risk posture.`;
    }

    if (latestWO && latestWO.status !== 'Closed') {
        recommendation += ` A related work order (${latestWO.id}) is already ${latestWO.status.toLowerCase()}, so keep the maintenance queue aligned with that activity.`;
    }

    return { title, message, recommendation, confidence };
}

function renderSensorTable(assets) {
    const tbody = document.getElementById('sensorTableBody');
    tbody.innerHTML = assets.map(a => {
        const s = DATA.getAssetState(a.id);
        return `
            <tr class="asset-row-clickable" role="button" tabindex="0" onclick="openAssetDetail('${a.id}')" onkeydown="handleAssetRowKey(event, '${a.id}')">
                <td class="mono" style="font-weight:600;color:var(--accent)">${a.id}</td>
                <td>${DATA.formatAssetType(a.type)}</td>
                <td>${a.site}</td>
                <td>${APP.createStatusBadge(s.status)}</td>
                <td><span style="color:${APP.getHealthColor(s.healthIndex)};font-weight:600;font-family:var(--font-mono)">${s.healthIndex.toFixed(1)}</span></td>
                <td class="mono">${s.anomalyScore.toFixed(3)}</td>
                <td class="mono">${s.rulDays}</td>
                <td class="text-xs">${APP.formatDate(s.lastMaintenance)}</td>
                <td><span class="badge ${a.criticality === 'High' ? 'badge-critical' : a.criticality === 'Medium' ? 'badge-warning' : 'badge-info'}" style="font-size:9px">${a.criticality}</span></td>
            </tr>
        `;
    }).join('');
}

function handleAssetRowKey(event, assetId) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openAssetDetail(assetId);
    }
}

function initHealthCharts() {
    // Health Trend
    const realAssets = ['CMP-001', 'MTR-001', 'CMP-002', 'MTR-002'];
    CHARTS.createLineChart('healthTrendChart',
        DATA.trendsDaily['CMP-001'].dates,
        realAssets.map((id, i) => ({
            label: id,
            data: DATA.trendsDaily[id].health,
            color: CHARTS.PALETTE[i],
        })),
        { yScale: { min: 0, max: 100, title: { display: true, text: 'Health Index' } } }
    );

    // Criticality Matrix (scatter-like using bar)
    const types = ['compressor', 'motor', 'pump', 'turbine'];
    const countByHealthBand = (assetType, band) => DATA.assets.filter(a => {
        if (a.type !== assetType) return false;
        const healthIndex = DATA.getAssetState(a.id).healthIndex;
        if (band === 'Critical') return healthIndex < 35;
        if (band === 'Warning') return healthIndex >= 35 && healthIndex < 70;
        return healthIndex >= 70;
    }).length;
    CHARTS.createStackedBar('critMatrixChart',
        types.map(t => DATA.formatAssetType(t)),
        [
            { label: 'Healthy', data: types.map(t => countByHealthBand(t, 'Healthy')), color: CHARTS.COLORS.green },
            { label: 'Warning', data: types.map(t => countByHealthBand(t, 'Warning')), color: CHARTS.COLORS.amber },
            { label: 'Critical', data: types.map(t => countByHealthBand(t, 'Critical')), color: CHARTS.COLORS.red, minBarLength: 8, borderRadius: 6 },
        ],
        { stacked: true, plugins: { legend: { display: true } } }
    );

    // Utilization
    CHARTS.createBarChart('utilizationChart',
        types.map(t => DATA.formatAssetType(t)),
        [{ label: 'Utilization %', data: [89.2, 91.5, 85.8, 78.4], colors: [CHARTS.COLORS.blue, CHARTS.COLORS.cyan, CHARTS.COLORS.green, CHARTS.COLORS.amber] }],
        { plugins: { legend: { display: false } }, yScale: { max: 100 } }
    );

    // Degrading
    const degrading = DATA.getTopRiskyAssets(8);
    CHARTS.createHorizontalBar('degradingChart',
        degrading.map(a => a.id),
        [{ label: 'Health', data: degrading.map(a => DATA.getAssetState(a.id).healthIndex), colors: degrading.map(a => APP.getHealthColor(DATA.getAssetState(a.id).healthIndex)) }],
        { plugins: { legend: { display: false } }, xScale: { max: 100 } }
    );
}
