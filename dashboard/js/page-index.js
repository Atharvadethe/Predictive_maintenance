/* ===================================================================
   PAGE-INDEX.JS — Executive Overview Dashboard
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    APP.initLayout();
    renderExecutiveDashboard();
});

function renderExecutiveDashboard() {
    const content = document.getElementById('pageContent');
    const k = DATA.kpis;

    content.innerHTML = `
        ${APP.renderPageHeader(
            'Executive Overview',
            'Real-time operational intelligence across all manufacturing plants',
            `<div class="live-indicator"><span class="live-dot"></span><span>Plant-A, Plant-B, Plant-C</span></div>`
        )}

        <!-- KPI Cards Row -->
        <div class="grid grid-4 mb-5 stagger" id="kpiGrid">
            ${kpiCard('Total Assets', k.totalAssets, 'fa-cubes', 'blue', '30 monitored across 3 plants', '+2 this month', 'up')}
            ${kpiCard('Healthy', k.healthy, 'fa-check-circle', 'green', `${((k.healthy/k.totalAssets)*100).toFixed(0)}% of fleet`, '+3 vs last week', 'up')}
            ${kpiCard('Warning', k.warning, 'fa-exclamation-circle', 'amber', 'Inspection scheduled', '−1 vs last week', 'up')}
            ${kpiCard('Critical', k.critical, 'fa-times-circle', 'red', 'Immediate action required', '+1 vs last week', 'down')}
        </div>

        <div class="grid grid-4 mb-5 stagger">
            ${kpiCard('OEE', k.oee, 'fa-tachometer-alt', 'blue', 'Overall Equipment Effectiveness', '+1.2% vs target', 'up', '%')}
            ${kpiCard('MTBF', k.mtbf, 'fa-clock', 'green', 'Mean Time Between Failures', '+12h improvement', 'up', ' hrs')}
            ${kpiCard('MTTR', k.mttr, 'fa-tools', 'amber', 'Mean Time To Repair', '−0.8h faster', 'up', ' hrs')}
            ${kpiCard('Active WOs', k.activeWorkOrders, 'fa-clipboard-list', 'purple', `${DATA.workOrders.filter(w=>w.status==='Open').length} open, ${DATA.workOrders.filter(w=>w.status==='In Progress').length} in progress`, '4 closed this week', 'neutral')}
        </div>

        <!-- Main Dashboard Grid -->
        <div class="grid grid-3 mb-5">
            <!-- Plant Health Gauge -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Overall Plant Health</span>
                    <span class="badge badge-info"><i class="fas fa-robot" style="margin-right:4px"></i>AI Score</span>
                </div>
                <div style="height:200px;display:flex;align-items:center;justify-content:center">
                    <canvas id="plantHealthGauge"></canvas>
                </div>
                <div style="display:flex;justify-content:space-around;margin-top:12px">
                    ${Object.entries(DATA.plantKpis).map(([plant, pk]) => `
                        <div style="text-align:center">
                            <div style="font-size:11px;color:var(--text-muted)">${plant}</div>
                            <div style="font-size:18px;font-weight:700;color:${APP.getHealthColor(pk.avgHealth)};font-family:var(--font-mono)">${pk.avgHealth}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Asset Distribution -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Asset Distribution by Status</span>
                </div>
                <div style="height:220px;position:relative">
                    <canvas id="assetDistChart"></canvas>
                </div>
                <div style="display:flex;justify-content:center;gap:20px;margin-top:8px">
                    <div class="flex items-center gap-3"><span style="width:8px;height:8px;border-radius:50%;background:var(--green)"></span><span class="text-xs text-muted">Healthy (${k.healthy})</span></div>
                    <div class="flex items-center gap-3"><span style="width:8px;height:8px;border-radius:50%;background:var(--amber)"></span><span class="text-xs text-muted">Warning (${k.warning})</span></div>
                    <div class="flex items-center gap-3"><span style="width:8px;height:8px;border-radius:50%;background:var(--red)"></span><span class="text-xs text-muted">Critical (${k.critical})</span></div>
                </div>
            </div>

            <!-- Top 5 Risky Assets -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Top 5 At-Risk Assets</span>
                    <a href="failure-rul.html" class="text-xs" style="color:var(--accent)">View all →</a>
                </div>
                <div class="flex flex-col gap-3">
                    ${DATA.getTopRiskyAssets(5).map((a, i) => {
                        const s = DATA.getAssetState(a.id);
                        return `
                        <div class="flex items-center gap-3" style="padding:8px;background:var(--bg-elevated);border-radius:var(--radius-md)">
                            <div style="width:24px;height:24px;border-radius:50%;background:${DATA.getStatusBg(s.status)};color:${DATA.getStatusColor(s.status)};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700">${i+1}</div>
                            <div class="flex-1">
                                <div class="flex justify-between items-center">
                                    <span class="text-mono" style="font-size:12px;font-weight:600">${a.id}</span>
                                    ${APP.createStatusBadge(s.status)}
                                </div>
                                <div style="margin-top:4px">${APP.createHealthBar(s.healthIndex)}</div>
                            </div>
                            <div style="text-align:right">
                                <div style="font-family:var(--font-mono);font-size:14px;font-weight:700;color:${APP.getHealthColor(s.healthIndex)}">${s.healthIndex.toFixed(1)}</div>
                                <div class="text-xs text-muted">RUL: ${s.rulDays}d</div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </div>

        <div class="grid grid-2 mb-5">
            <!-- Daily Anomaly Trend -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Daily Anomaly Score Trend (7-Day)</span>
                    <span class="badge badge-info">All Assets</span>
                </div>
                <div class="chart-container" style="height:260px">
                    <canvas id="anomalyTrendChart"></canvas>
                </div>
            </div>

            <!-- Critical Alerts Feed -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Critical Alerts Feed</span>
                    <a href="anomalies.html" class="text-xs" style="color:var(--accent)">View all →</a>
                </div>
                <div class="alert-feed" style="max-height:260px">
                    ${DATA.alerts.filter(a => !a.acknowledged).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0,6).map(a => `
                        <div class="alert-item">
                            <div class="alert-icon ${a.level.toLowerCase()}">
                                <i class="fas ${a.level === 'Critical' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i>
                            </div>
                            <div class="alert-content">
                                <p><strong>${a.assetId}</strong> — ${a.reason}</p>
                                <div class="alert-meta">
                                    <span>${APP.formatDateTime(a.timestamp)}</span>
                                    <span>Score: ${a.anomalyScore.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="grid grid-2 mb-5">
            <!-- Maintenance Cost Overview -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Monthly Maintenance Cost</span>
                    <span class="text-xs text-muted">Last 7 months</span>
                </div>
                <div class="chart-container" style="height:240px">
                    <canvas id="costChart"></canvas>
                </div>
            </div>

            <!-- RUL Summary -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">RUL Summary — Critical & Warning Assets</span>
                    <a href="failure-rul.html" class="text-xs" style="color:var(--accent)">Details →</a>
                </div>
                <div class="chart-container" style="height:240px">
                    <canvas id="rulChart"></canvas>
                </div>
            </div>
        </div>

        <div class="grid grid-3 mb-5">
            <!-- Plant-wise Comparison -->
            <div class="card" style="grid-column: span 2">
                <div class="card-header">
                    <span class="card-title">Plant-wise Performance Comparison</span>
                </div>
                <div class="chart-container" style="height:260px">
                    <canvas id="plantCompareChart"></canvas>
                </div>
            </div>

            <!-- Downtime & Energy -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Operational Metrics</span>
                </div>
                <div class="flex flex-col" style="gap:12px">
                    <div class="stat-row">
                        <span class="stat-label"><i class="fas fa-power-off text-red" style="margin-right:6px"></i>Downtime</span>
                        <span class="stat-value text-amber">${k.downtimePct}%</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label"><i class="fas fa-chart-bar text-blue" style="margin-right:6px"></i>OEE</span>
                        <span class="stat-value text-green">${k.oee}%</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label"><i class="fas fa-bullseye text-green" style="margin-right:6px"></i>Pred. Accuracy</span>
                        <span class="stat-value text-green">${k.predictiveAccuracy}%</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label"><i class="fas fa-dollar-sign text-amber" style="margin-right:6px"></i>Maint. Cost (MTD)</span>
                        <span class="stat-value">${APP.formatCurrency(k.totalMaintenanceCost)}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label"><i class="fas fa-bolt text-cyan" style="margin-right:6px;color:var(--cyan)"></i>Avg RUL</span>
                        <span class="stat-value">${k.avgRul} days</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label"><i class="fas fa-bell text-red" style="margin-right:6px"></i>Open Alerts</span>
                        <span class="stat-value text-red">${k.openAlerts}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label"><i class="fas fa-shield-alt text-green" style="margin-right:6px"></i>Predictive WOs</span>
                        <span class="stat-value text-green">${DATA.monthlyTrends.predictiveMaint[6]}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- AI Insights -->
        <div class="section-header mb-4">
            <div>
                <h3 class="section-title"><i class="fas fa-brain" style="margin-right:8px;color:var(--purple)"></i>AI-Powered Insights</h3>
                <p class="text-xs text-muted">Auto-generated recommendations from the anomaly detection engine</p>
            </div>
        </div>
        <div class="grid grid-2 mb-5 stagger">
            ${DATA.aiInsights.map(insight => `
                <div class="insight-card ${insight.type}">
                    <div class="insight-icon"><i class="fas ${insight.icon}"></i></div>
                    <div class="insight-body">
                        <div class="insight-title">${insight.title}</div>
                        <div class="insight-message">${insight.message}</div>
                        <div class="insight-confidence">Confidence: ${insight.confidence}% ${insight.asset ? `| Asset: ${insight.asset}` : ''}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // ─── Render Charts ───
    initCharts();
    animateKPIs();
}

function kpiCard(label, value, icon, color, subtitle, trend, trendDir, suffix = '') {
    const trendClass = trendDir === 'up' ? 'up' : trendDir === 'down' ? 'down' : 'neutral';
    const trendIcon = trendDir === 'up' ? 'fa-arrow-up' : trendDir === 'down' ? 'fa-arrow-down' : 'fa-minus';
    return `
        <div class="kpi-card ${color}">
            <div class="kpi-top">
                <div>
                    <div class="kpi-label">${label}</div>
                    <div class="kpi-value" data-count="${value}" data-suffix="${suffix}">${value}${suffix}</div>
                </div>
                <div class="card-icon" style="background:var(--${color === 'purple' ? 'accent' : color}-bg, var(--blue-bg));color:var(--${color === 'purple' ? 'purple' : color}, var(--blue))">
                    <i class="fas ${icon}"></i>
                </div>
            </div>
            <div class="kpi-footer">
                <span class="text-xs text-muted">${subtitle}</span>
                <span class="card-trend ${trendClass}"><i class="fas ${trendIcon}"></i> ${trend}</span>
            </div>
        </div>
    `;
}

function initCharts() {
    // Plant Health Gauge
    CHARTS.createGaugeChart('plantHealthGauge', DATA.kpis.plantHealthScore, 100, { sublabel: 'Plant Health Score', suffix: '%' });

    // Asset Distribution Doughnut
    CHARTS.createDoughnutChart('assetDistChart',
        ['Healthy', 'Warning', 'Critical'],
        [DATA.kpis.healthy, DATA.kpis.warning, DATA.kpis.critical],
        [CHARTS.COLORS.green, CHARTS.COLORS.amber, CHARTS.COLORS.red],
        { showLegend: false }
    );

    // Daily Anomaly Trend
    const trendData = DATA.trendsDaily['CMP-001'];
    CHARTS.createLineChart('anomalyTrendChart', trendData.dates, [
        { label: 'CMP-001', data: DATA.trendsDaily['CMP-001'].anomaly, color: CHARTS.COLORS.blue, fill: true },
        { label: 'MTR-001', data: DATA.trendsDaily['MTR-001'].anomaly, color: CHARTS.COLORS.amber, fill: true },
        { label: 'TRB-002', data: DATA.trendsDaily['TRB-002'].anomaly, color: CHARTS.COLORS.red },
        { label: 'PMP-006', data: DATA.trendsDaily['PMP-006'].anomaly, color: CHARTS.COLORS.pink },
    ], { beginAtZero: true, yScale: { max: 1 } });

    // Maintenance Cost
    CHARTS.createBarChart('costChart', DATA.monthlyTrends.months, [
        { label: 'Maintenance Cost', data: DATA.monthlyTrends.maintenanceCost.map(v => v/1000), color: CHARTS.COLORS.blue },
    ], { yScale: { ticks: { callback: v => '$' + v + 'K' } }, plugins: { legend: { display: false } } });

    // RUL Summary (critical & warning assets only)
    const riskAssets = DATA.assets.filter(a => {
        const s = DATA.getAssetState(a.id);
        return s.status === 'Critical' || s.status === 'Warning';
    }).sort((a, b) => DATA.getAssetState(a.id).rulDays - DATA.getAssetState(b.id).rulDays);

    CHARTS.createHorizontalBar('rulChart',
        riskAssets.map(a => a.id),
        [{ label: 'RUL (days)', data: riskAssets.map(a => DATA.getAssetState(a.id).rulDays), colors: riskAssets.map(a => APP.getHealthColor(DATA.getAssetState(a.id).healthIndex)) }],
        { plugins: { legend: { display: false } }, xScale: { title: { display: true, text: 'Days Remaining' } } }
    );

    // Plant Comparison
    const plants = ['Plant-A', 'Plant-B', 'Plant-C'];
    CHARTS.createBarChart('plantCompareChart', plants, [
        { label: 'Avg Health', data: plants.map(p => DATA.plantKpis[p].avgHealth), color: CHARTS.COLORS.green },
        { label: 'OEE %', data: plants.map(p => DATA.plantKpis[p].oee), color: CHARTS.COLORS.blue },
        { label: 'MTBF (÷10)', data: plants.map(p => DATA.plantKpis[p].mtbf / 10), color: CHARTS.COLORS.cyan },
    ]);
}

function animateKPIs() {
    document.querySelectorAll('.kpi-value[data-count]').forEach(el => {
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = suffix === '%' ? 1 : 0;
        APP.animateCounter(el, target, 1500, decimals, '', suffix);
    });
}
