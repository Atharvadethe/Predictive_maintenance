/* ===================================================================
   PAGE-INDEX.JS — Executive Overview Dashboard
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    APP.initLayout();
    renderExecutiveDashboard();
});

function renderExecutiveDashboard() {
    const content = document.getElementById('pageContent');
    content.classList.add('overview-compact');
    const k = DATA.kpis;
    const warningMtbf = getGroupMtbf('Warning');
    const criticalMtbf = getGroupMtbf('Critical');

    content.innerHTML = `
        ${APP.renderPageHeader(
        'Executive Overview',
        'Real-time operational intelligence across all manufacturing plants',
        `<div class="live-indicator"><span class="live-dot"></span><span>Plant-A, Plant-B, Plant-C</span></div>`
    )}

        <div class="grid stagger overview-kpis mb-4" id="kpiGrid" style="grid-template-columns:repeat(8,minmax(0,1fr));gap:6px">
            ${kpiCard('Total Assets', k.totalAssets, 'fa-cubes', 'navy', '30 monitored · 3 plants', '+2 this month', 'up')}
            ${kpiCard('Healthy', k.healthy, 'fa-check-circle', 'green', `${((k.healthy / k.totalAssets) * 100).toFixed(0)}% of fleet`, '+3 vs last week', 'up')}
            ${kpiCard('Warning', k.warning, 'fa-exclamation-circle', 'amber', 'Inspection scheduled', '−1 vs last week', 'up')}
            ${kpiCard('Critical', k.critical, 'fa-times-circle', 'red', 'Immediate action required', '+1 vs last week', 'down')}
            ${kpiCard('Warning MTBF', warningMtbf, 'fa-exclamation-triangle', 'amber', 'Avg warning assets', 'At-risk fleet', 'neutral', ' hrs')}
            ${kpiCard('Critical MTBF', criticalMtbf, 'fa-times-circle', 'red', 'Avg critical assets', 'Needs attention', 'down', ' hrs')}
            ${kpiCard('MTTR', k.mttr, 'fa-tools', 'teal', 'Mean Time To Repair', '−0.8h faster', 'up', ' hrs')}
            ${kpiCard('Active WOs', k.activeWorkOrders, 'fa-clipboard-list', 'blue', `${DATA.workOrders.filter(w => w.status === 'Open').length} open · ${DATA.workOrders.filter(w => w.status === 'In Progress').length} in progress`, '4 closed this week', 'neutral')}
        </div>

        <!-- Row 1: Overview & High-level Metrics (3 columns) -->
        <div class="grid grid-3 mb-4">
            <!-- Plant Health Gauge -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Overall Plant Health</span>
                    <span class="badge badge-info"><i class="fas fa-robot" style="margin-right:4px"></i>AI Score</span>
                </div>
                <div style="height:150px;display:flex;align-items:center;justify-content:center">
                    <canvas id="plantHealthGauge"></canvas>
                </div>
                <div style="display:flex;justify-content:space-around;margin-top:4px">
                    ${Object.entries(DATA.plantKpis).map(([plant, pk]) => `
                        <div style="text-align:center">
                            <div style="font-size:10px;color:var(--text-muted)">${plant}</div>
                            <div style="font-size:16px;font-weight:700;color:${APP.getHealthColor(pk.avgHealth)};font-family:var(--font-mono)">${pk.avgHealth}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Asset Distribution -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Asset Distribution by Status</span>
                </div>
                <div style="height:162px;position:relative;margin-top:2px">
                    <canvas id="assetDistChart"></canvas>
                </div>
                <div style="display:flex;justify-content:center;gap:16px;margin-top:2px;margin-bottom:2px">
                    <div class="flex items-center gap-1.5"><span style="width:8px;height:8px;border-radius:50%;background:var(--green);flex-shrink:0"></span><span style="font-size:11px;font-weight:600;color:var(--text-secondary)">Healthy (${k.healthy})</span></div>
                    <div class="flex items-center gap-1.5"><span style="width:8px;height:8px;border-radius:50%;background:var(--amber);flex-shrink:0"></span><span style="font-size:11px;font-weight:600;color:var(--text-secondary)">Warning (${k.warning})</span></div>
                    <div class="flex items-center gap-1.5"><span style="width:8px;height:8px;border-radius:50%;background:var(--red);flex-shrink:0"></span><span style="font-size:11px;font-weight:600;color:var(--text-secondary)">Critical (${k.critical})</span></div>
                </div>
            </div>

            <!-- Operational Metrics -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Operational Metrics</span>
                </div>
                <div class="flex flex-col" style="gap:3px">
                    <div class="stat-row" style="padding: 1.5px 0">
                        <span class="stat-label" style="font-size:11px"><i class="fas fa-power-off text-red" style="margin-right:6px"></i>Downtime</span>
                        <span class="stat-value text-amber" style="font-size:12px">${k.downtimePct}%</span>
                    </div>
                    <div class="stat-row" style="padding: 1.5px 0">
                        <span class="stat-label" style="font-size:11px"><i class="fas fa-chart-bar text-blue" style="margin-right:6px"></i>OEE</span>
                        <span class="stat-value text-green" style="font-size:12px">${k.oee}%</span>
                    </div>
                    <div class="stat-row" style="padding: 1.5px 0">
                        <span class="stat-label" style="font-size:11px"><i class="fas fa-bullseye text-green" style="margin-right:6px"></i>Pred. Accuracy</span>
                        <span class="stat-value text-green" style="font-size:12px">${k.predictiveAccuracy}%</span>
                    </div>
                    <div class="stat-row" style="padding: 1.5px 0">
                        <span class="stat-label" style="font-size:11px"><i class="fas fa-dollar-sign text-amber" style="margin-right:6px"></i>Maint. Cost (MTD)</span>
                        <span class="stat-value" style="font-size:12px">${APP.formatCurrency(k.totalMaintenanceCost)}</span>
                    </div>
                    <div class="stat-row" style="padding: 1.5px 0">
                        <span class="stat-label" style="font-size:11px"><i class="fas fa-bolt text-cyan" style="margin-right:6px;color:var(--cyan)"></i>Avg RUL</span>
                        <span class="stat-value" style="font-size:12px">${k.avgRul} days</span>
                    </div>
                    <div class="stat-row" style="padding: 1.5px 0">
                        <span class="stat-label" style="font-size:11px"><i class="fas fa-bell text-red" style="margin-right:6px"></i>Open Alerts</span>
                        <span class="stat-value text-red" style="font-size:12px">${k.openAlerts}</span>
                    </div>
                    <div class="stat-row" style="padding: 1.5px 0">
                        <span class="stat-label" style="font-size:11px"><i class="fas fa-shield-alt text-green" style="margin-right:6px"></i>Predictive WOs</span>
                        <span class="stat-value text-green" style="font-size:12px">${DATA.monthlyTrends.predictiveMaint[6]}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Row 2: Risks, Alerts, & Feeds (3 columns) -->
        <div class="grid grid-3 mb-4">
            <!-- Daily Anomaly Trend -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Daily Anomaly Score Trend</span>
                    <span class="badge badge-info">7-Day</span>
                </div>
                <div class="chart-container" style="height:150px">
                    <canvas id="anomalyTrendChart"></canvas>
                </div>
            </div>

            <!-- Critical Alerts Feed -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Critical Alerts Feed</span>
                    <a href="anomalies.html" class="text-xs" style="color:var(--accent)">View all →</a>
                </div>
                <div class="alert-feed" style="max-height:150px; overflow-y:auto; padding-right:4px">
                    ${DATA.alerts.filter(a => !a.acknowledged).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5).map(a => `
                        <div class="alert-item" style="padding: 4px 0; gap: 8px">
                            <div class="alert-icon ${a.level.toLowerCase()}" style="width: 24px; height: 24px; font-size: 11px">
                                <i class="fas ${a.level === 'Critical' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i>
                            </div>
                            <div class="alert-content">
                                <p style="font-size:10.5px; margin-bottom: 1px; line-height: 1.3"><strong>${a.assetId}</strong> — ${a.reason}</p>
                                <div class="alert-meta" style="gap: 8px; font-size: 9px">
                                    <span>${APP.formatDateTime(a.timestamp)}</span>
                                    <span>Score: ${a.anomalyScore.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Top 5 Risky Assets -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Top 5 At-Risk Assets</span>
                    <a href="failure-rul.html" class="text-xs" style="color:var(--accent)">View all →</a>
                </div>
                <div class="flex flex-col gap-1.5" style="max-height:150px; overflow-y:auto; padding-right:4px">
                    ${DATA.getTopRiskyAssets(5).map((a, i) => {
        const s = DATA.getAssetState(a.id);
        return `
                        <div class="flex items-center gap-2" style="padding:4px 6px;background:var(--bg-elevated);border-radius:var(--radius-md)">
                            <div style="width:16px;height:16px;border-radius:50%;background:${DATA.getStatusBg(s.status)};color:${DATA.getStatusColor(s.status)};display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;flex-shrink:0">${i + 1}</div>
                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-center" style="line-height:1">
                                    <span class="text-mono" style="font-size:10px;font-weight:600">${a.id}</span>
                                    ${APP.createStatusBadge(s.status)}
                                </div>
                                <div style="margin-top:2px">${APP.createHealthBar(s.healthIndex)}</div>
                            </div>
                            <div style="text-align:right; line-height:1; flex-shrink:0">
                                <div style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:${APP.getHealthColor(s.healthIndex)}">${s.healthIndex.toFixed(1)}</div>
                                <div class="text-xxs text-muted" style="font-size:9px">RUL: ${s.rulDays}d</div>
                            </div>
                        </div>`;
    }).join('')}
                </div>
            </div>
        </div>

        <!-- Row 3: Long-term Operations & Costs (3 columns) -->
        <div class="grid grid-3 mb-4">
            <!-- Maintenance Cost Overview -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Monthly Maintenance Cost</span>
                    <span class="text-xs text-muted">Last 7 months</span>
                </div>
                <div class="chart-container" style="height:150px">
                    <canvas id="costChart"></canvas>
                </div>
            </div>

            <!-- RUL Summary -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">RUL Summary — Warning & Critical</span>
                    <a href="failure-rul.html" class="text-xs" style="color:var(--accent)">Details →</a>
                </div>
                <div class="chart-container" style="height:150px">
                    <canvas id="rulChart"></canvas>
                </div>
            </div>

            <!-- Plant-wise Comparison -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Plant Performance Comparison</span>
                </div>
                <div class="chart-container" style="height:150px">
                    <canvas id="plantCompareChart"></canvas>
                </div>
            </div>
        </div>

        <!-- AI Insights -->
        <div class="section-header" style="margin-bottom:10px">
            <div>
                <h3 class="section-title"><i class="fas fa-brain" style="margin-right:8px;color:var(--carrier-blue)"></i>AI-Powered Insights</h3>
                <p class="text-xs text-muted">Auto-generated recommendations from the anomaly detection engine</p>
            </div>
        </div>
        <div class="grid grid-4 mb-4 stagger">
            ${DATA.aiInsights.map(insight => `
                <div class="insight-card ${insight.type}" style="margin-bottom: 0px; height: 100%; display: flex; flex-direction: row; align-items: stretch; padding: 10px 12px; gap: 10px;">
                    <div class="insight-icon" style="width: 28px; height: 28px; font-size: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm);"><i class="fas ${insight.icon}"></i></div>
                    <div class="insight-body" style="display: flex; flex-direction: column; justify-content: space-between; flex: 1; min-width: 0;">
                        <div>
                            <div class="insight-title" style="font-size: 11.5px; font-weight: 700; margin-bottom: 3px; line-height: 1.2;">${insight.title}</div>
                            <div class="insight-message" style="font-size: 10.5px; line-height: 1.4; color: var(--muted); margin-bottom: 6px;">${insight.message}</div>
                        </div>
                        <div class="insight-confidence" style="font-size: 9.5px; font-family: var(--font-mono); color: var(--faint); border-top: 1px solid rgba(0,0,0,0.03); padding-top: 4px; margin-top: auto;">Conf: ${insight.confidence}% ${insight.asset ? `| Asset: ${insight.asset}` : ''}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // ─── Render Charts ───
    initCharts();
    animateKPIs();
}

function getGroupMtbf(status) {
    const group = DATA.assets
        .filter(asset => DATA.assetCurrentState[asset.id]?.status === status)
        .map(asset => DATA.assetCurrentState[asset.id]);

    if (!group.length) return 0;

    const avgRulDays = group.reduce((sum, item) => sum + item.rulDays, 0) / group.length;
    return Math.round(avgRulDays * 24);
}

function kpiCard(label, value, icon, color, subtitle, trend, trendDir, suffix = '') {
    const trendClass = trendDir === 'up' ? 'up' : trendDir === 'down' ? 'down' : 'neutral';
    const trendIcon = trendDir === 'up' ? 'fa-arrow-up' : trendDir === 'down' ? 'fa-arrow-down' : 'fa-minus';
    // map color name to css class (c-navy, c-blue, c-green, c-amber, c-red, c-teal)
    const colorMap = { navy: 'c-navy', blue: 'c-blue', green: 'c-green', amber: 'c-amber', red: 'c-red', teal: 'c-teal', purple: 'c-blue' };
    const colorClass = colorMap[color] || 'c-blue';
    const iconBg = color === 'red' ? 'var(--red-lt)' : color === 'green' ? 'var(--green-lt)' :
        color === 'amber' ? 'var(--amber-lt)' : color === 'teal' ? 'var(--teal-lt)' :
            color === 'navy' ? 'rgba(0,45,98,0.08)' : 'var(--blue-bg)';
    const iconColor = color === 'red' ? 'var(--red)' : color === 'green' ? 'var(--green)' :
        color === 'amber' ? 'var(--amber)' : color === 'teal' ? 'var(--teal)' :
            color === 'navy' ? 'var(--carrier-navy)' : 'var(--carrier-blue)';
    return `
        <div class="kpi-card ${colorClass}">
            <div class="kpi-top">
                <div>
                    <div class="kpi-label">${label}</div>
                    <div class="kpi-value" data-count="${value}" data-suffix="${suffix}">${value}${suffix}</div>
                </div>
                <div class="card-icon" style="background:${iconBg};color:${iconColor}">
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
        { showLegend: false, cutout: '65%' }
    );

    // Daily Anomaly Trend
    const trendData = DATA.trendsDaily['CMP-001'];
    CHARTS.createLineChart('anomalyTrendChart', trendData.dates, [
        { label: 'CMP-001', data: DATA.trendsDaily['CMP-001'].anomaly, color: CHARTS.COLORS.blue, fill: true },
        { label: 'MTR-001', data: DATA.trendsDaily['MTR-001'].anomaly, color: CHARTS.COLORS.amber, fill: true },
        { label: 'TRB-002', data: DATA.trendsDaily['TRB-002'].anomaly, color: CHARTS.COLORS.red },
        { label: 'PMP-006', data: DATA.trendsDaily['PMP-006'].anomaly, color: CHARTS.COLORS.pink },
    ], { 
        beginAtZero: true, 
        yScale: { max: 1, ticks: { font: { size: 9 } } },
        xScale: { ticks: { font: { size: 9 } } },
        plugins: { 
            legend: { 
                position: 'top', 
                align: 'end',
                labels: { padding: 4, boxWidth: 6, font: { size: 9 } } 
            } 
        }
    });

    // Maintenance Cost
    CHARTS.createBarChart('costChart', DATA.monthlyTrends.months, [
        { label: 'Maintenance Cost', data: DATA.monthlyTrends.maintenanceCost.map(v => v / 1000), color: CHARTS.COLORS.blue },
    ], { 
        yScale: { ticks: { font: { size: 9 }, callback: v => '$' + v + 'K' } }, 
        xScale: { ticks: { font: { size: 9 } } },
        plugins: { legend: { display: false } } 
    });

    // RUL Summary (critical & warning assets only)
    const riskAssets = DATA.assets.filter(a => {
        const s = DATA.getAssetState(a.id);
        return s.status === 'Critical' || s.status === 'Warning';
    }).sort((a, b) => DATA.getAssetState(a.id).rulDays - DATA.getAssetState(b.id).rulDays);

    CHARTS.createHorizontalBar('rulChart',
        riskAssets.map(a => a.id),
        [{ label: 'RUL (days)', data: riskAssets.map(a => DATA.getAssetState(a.id).rulDays), colors: riskAssets.map(a => APP.getHealthColor(DATA.getAssetState(a.id).healthIndex)) }],
        { 
            plugins: { legend: { display: false } }, 
            xScale: { title: { display: false }, ticks: { font: { size: 9 } } },
            yScale: { ticks: { font: { size: 9 } } }
        }
    );

    // Plant Comparison
    const plants = ['Plant-A', 'Plant-B', 'Plant-C'];
    CHARTS.createBarChart('plantCompareChart', plants, [
        { label: 'Avg Health', data: plants.map(p => DATA.plantKpis[p].avgHealth), color: CHARTS.COLORS.green },
        { label: 'OEE %', data: plants.map(p => DATA.plantKpis[p].oee), color: CHARTS.COLORS.blue },
        { label: 'MTBF (÷10)', data: plants.map(p => DATA.plantKpis[p].mtbf / 10), color: CHARTS.COLORS.cyan },
    ], {
        yScale: { ticks: { font: { size: 9 } } },
        xScale: { ticks: { font: { size: 9 } } },
        plugins: { 
            legend: { 
                position: 'top', 
                align: 'end',
                labels: { padding: 4, boxWidth: 6, font: { size: 9 } } 
            } 
        }
    });
}

function animateKPIs() {
    document.querySelectorAll('.kpi-value[data-count]').forEach(el => {
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = suffix === '%' ? 1 : 0;
        APP.animateCounter(el, target, 1500, decimals, '', suffix);
    });
}
