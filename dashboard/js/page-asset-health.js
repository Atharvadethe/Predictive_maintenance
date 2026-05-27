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

        <!-- Summary Cards -->
        <div class="grid grid-4 mb-5 stagger" id="summaryCards">
            ${summaryCard('Avg Health Index', avgHealth(DATA.assets), 'fa-heartbeat', 'green')}
            ${summaryCard('Top Degrading', DATA.getTopRiskyAssets(1)[0].id, 'fa-arrow-down', 'red')}
            ${summaryCard('Avg Utilization', '87.3%', 'fa-chart-pie', 'blue')}
            ${summaryCard('Sensors Online', '98.7%', 'fa-wifi', 'green')}
        </div>

        <!-- Asset Health Cards Grid -->
        <div class="section-header mb-4">
            <h3 class="section-title">Asset Health Cards</h3>
        </div>
        <div class="grid grid-3 mb-5" id="assetCardsGrid">
            <!-- Rendered dynamically -->
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
    `;

    renderAssetCards(DATA.assets);
    renderSensorTable(DATA.assets);
    initHealthCharts();

    // Search handler
    window.onGlobalSearch = (q) => {
        if (!q) { renderAssetCards(filteredAssets); renderSensorTable(filteredAssets); return; }
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

    filteredAssets = DATA.assets.filter(a => {
        const s = DATA.getAssetState(a.id);
        if (plant && a.site !== plant) return false;
        if (type && a.type !== type) return false;
        if (status && s.status !== status) return false;
        if (crit && a.criticality !== crit) return false;
        return true;
    });

    document.getElementById('assetCount').textContent = `${filteredAssets.length} assets`;
    renderAssetCards(filteredAssets);
    renderSensorTable(filteredAssets);
}

function renderAssetCards(assets) {
    const grid = document.getElementById('assetCardsGrid');
    grid.innerHTML = assets.map(a => {
        const s = DATA.getAssetState(a.id);
        const readings = DATA.telemetrySnapshot[a.id];
        const tags = DATA.tagCatalog.filter(t => t.assetType === a.type && t.tagName !== 'run_status' && t.tagName !== 'ambient_temp');
        const topTags = tags.slice(0, 4);

        return `
            <div class="asset-card">
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

function renderSensorTable(assets) {
    const tbody = document.getElementById('sensorTableBody');
    tbody.innerHTML = assets.map(a => {
        const s = DATA.getAssetState(a.id);
        return `
            <tr>
                <td class="mono" style="font-weight:600;color:var(--text-primary)">${a.id}</td>
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
    const critMap = { High: 3, Medium: 2, Low: 1 };
    CHARTS.createBarChart('critMatrixChart',
        types.map(t => DATA.formatAssetType(t)),
        [
            { label: 'Healthy', data: types.map(t => DATA.assets.filter(a => a.type === t && DATA.getAssetState(a.id).status === 'Healthy').length), color: CHARTS.COLORS.green },
            { label: 'Warning', data: types.map(t => DATA.assets.filter(a => a.type === t && DATA.getAssetState(a.id).status === 'Warning').length), color: CHARTS.COLORS.amber },
            { label: 'Critical', data: types.map(t => DATA.assets.filter(a => a.type === t && DATA.getAssetState(a.id).status === 'Critical').length), color: CHARTS.COLORS.red },
        ],
        { stacked: true }
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
