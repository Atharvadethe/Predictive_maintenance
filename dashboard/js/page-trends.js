/* ===================================================================
   PAGE-TRENDS.JS — Trends & Analytics
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    APP.initLayout();
    renderTrendsPage();
});

function renderTrendsPage() {
    const content = document.getElementById('pageContent');
    content.classList.add('trends-compact');

    const latestMonthlyTrend = DATA.monthlyTrends;
    const oeeDelta = (latestMonthlyTrend.oee[latestMonthlyTrend.oee.length - 1] - latestMonthlyTrend.oee[latestMonthlyTrend.oee.length - 2]).toFixed(1);
    const mtbfDelta = latestMonthlyTrend.mtbf[latestMonthlyTrend.mtbf.length - 1] - latestMonthlyTrend.mtbf[latestMonthlyTrend.mtbf.length - 2];
    const downtimeDelta = (latestMonthlyTrend.downtime[latestMonthlyTrend.downtime.length - 1] - latestMonthlyTrend.downtime[latestMonthlyTrend.downtime.length - 2]).toFixed(1);
    const plantHealth = DATA.kpis.plantHealthScore;
    const predictiveAccuracy = DATA.kpis.predictiveAccuracy;

    content.innerHTML = `
        ${APP.renderPageHeader('Trends & Analytics', 'Long-term asset performance, OEE, MTBF, and operational efficiency analysis')}

        <div class="tabs">
            <div class="tab active" onclick="switchTab(this, 'performance')">Asset Performance</div>
            <div class="tab" onclick="switchTab(this, 'reliability')">Reliability & RCM</div>
        </div>

        <div id="tab-performance" class="tab-content">
            <div class="grid mb-4 stagger" id="performanceKpis" style="grid-template-columns:repeat(6,minmax(0,1fr));gap:6px">
                ${metricCard('OEE Average', '87.4%', 'fa-chart-pie', 'blue', '+2.1% YTD')}
                ${metricCard('Availability', '94.2%', 'fa-clock', 'green', 'Target: 95.0%')}
                ${metricCard('Performance', '96.5%', 'fa-tachometer-alt', 'blue', 'Optimal')}
                ${metricCard('Quality Rate', '99.1%', 'fa-check-circle', 'green', 'Minimal defects')}
                ${metricCard('Downtime', DATA.kpis.downtimePct + '%', 'fa-exclamation-triangle', 'amber', `${downtimeDelta > 0 ? '+' : ''}${downtimeDelta}% vs prior month`)}
                ${metricCard('Plant Health', plantHealth + '%', 'fa-heartbeat', 'navy', `${oeeDelta > 0 ? '+' : ''}${oeeDelta}% OEE momentum`)}
            </div>

            <div class="grid grid-2 mb-4">
                <div class="card">
                    <div class="card-header"><span class="card-title">Overall Equipment Effectiveness (OEE) Trend</span></div>
                    <div class="chart-container trends-chart" style="height:240px"><canvas id="oeeTrendChart"></canvas></div>
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title">Production Downtime Analysis</span></div>
                    <div class="chart-container trends-chart" style="height:240px"><canvas id="downtimeChart"></canvas></div>
                </div>
            </div>
        </div>

        <div id="tab-reliability" class="tab-content" style="display:none">
            <div class="grid mb-4 stagger" id="reliabilityKpis" style="grid-template-columns:repeat(6,minmax(0,1fr));gap:6px">
                ${metricCard('MTBF (Fleet Avg)', DATA.kpis.mtbf + 'h', 'fa-history', 'green', 'Mean Time Between Failures')}
                ${metricCard('MTTR (Fleet Avg)', DATA.kpis.mttr + 'h', 'fa-wrench', 'amber', 'Mean Time To Repair')}
                ${metricCard('Failure Rate', '0.042', 'fa-exclamation-triangle', 'red', 'Failures per month')}
                ${metricCard('RCM Compliance', '92%', 'fa-shield-alt', 'navy', 'Reliability Centered Maintenance')}
                ${metricCard('Avg RUL', DATA.kpis.avgRul + 'd', 'fa-hourglass-half', 'blue', 'Fleet average remaining life')}
                ${metricCard('Predictive Accuracy', predictiveAccuracy + '%', 'fa-bullseye', 'green', `${mtbfDelta > 0 ? '+' : ''}${mtbfDelta}h MTBF momentum`)}
            </div>

            <div class="grid grid-2 mb-4">
                <div class="card">
                    <div class="card-header"><span class="card-title">MTBF vs MTTR Correlation</span></div>
                    <div class="chart-container trends-chart" style="height:240px"><canvas id="mtbfChart"></canvas></div>
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title">Root Cause Analysis (Top Faults)</span></div>
                    <div class="chart-container trends-chart" style="height:240px"><canvas id="rcaChart"></canvas></div>
                </div>
            </div>
        </div>

        <div class="card trends-report-card">
            <div class="card-header">
                <span class="card-title">Generate Custom Report</span>
            </div>
            <div class="flex gap-3 items-center">
                <select class="filter-select"><option>Monthly Executive Summary</option><option>Asset Health Audit</option><option>Maintenance Cost Analysis</option></select>
                <select class="filter-select"><option>PDF</option><option>Excel (CSV)</option><option>PowerPoint</option></select>
                <button class="btn btn-primary"><i class="fas fa-file-export"></i> Generate Report</button>
            </div>
        </div>
    `;

    window.switchTab = (btn, tabId) => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
        document.getElementById('tab-' + tabId).style.display = 'block';
    };

    initTrendCharts();
}

function metricCard(label, value, icon, color, subtitle) {
    const colorMap = { green: 'c-green', red: 'c-red', blue: 'c-blue', amber: 'c-amber', navy: 'c-navy', teal: 'c-teal' };
    const colorClass = colorMap[color] || 'c-blue';
    const iconBg = color === 'red' ? 'var(--red-lt)' : color === 'green' ? 'var(--green-lt)'
        : color === 'amber' ? 'var(--amber-lt)' : color === 'teal' ? 'var(--teal-lt)'
            : color === 'navy' ? 'rgba(0,45,98,0.08)' : 'var(--blue-bg)';
    const iconColor = color === 'red' ? 'var(--red)' : color === 'green' ? 'var(--green)'
        : color === 'amber' ? 'var(--amber)' : color === 'teal' ? 'var(--teal)'
            : color === 'navy' ? 'var(--carrier-navy)' : 'var(--carrier-blue)';
    return `
        <div class="kpi-card ${colorClass}">
            <div class="kpi-top">
                <div><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div></div>
                <div class="card-icon" style="background:${iconBg};color:${iconColor}"><i class="fas ${icon}"></i></div>
            </div>
            <div class="kpi-footer"><span class="text-xs text-muted">${subtitle}</span></div>
        </div>
    `;
}

function initTrendCharts() {
    const months = DATA.monthlyTrends.months;

    // OEE Trend
    CHARTS.createLineChart('oeeTrendChart', months, [
        { label: 'Overall OEE', data: [82.1, 83.5, 84.0, 85.2, 86.8, 87.1, 87.4], color: CHARTS.COLORS.blue, fill: true }
    ], { yScale: { min: 70, max: 100 } });

    // Downtime
    CHARTS.createStackedBar('downtimeChart', months, [
        { label: 'Planned (hrs)', data: [120, 115, 140, 110, 105, 130, 95], color: CHARTS.COLORS.green },
        { label: 'Unplanned (hrs)', data: [45, 60, 35, 55, 20, 40, 15], color: CHARTS.COLORS.red }
    ]);

    // MTBF/MTTR
    CHARTS.createLineChart('mtbfChart', months, [
        { label: 'MTBF (Hours)', data: [450, 470, 465, 490, 510, 505, 520], color: CHARTS.COLORS.green, fill: false },
        { label: 'MTTR (Hours × 10)', data: [42, 40, 45, 38, 35, 36, 32], color: CHARTS.COLORS.amber, fill: false }
    ]);

    // RCA
    CHARTS.createDoughnutChart('rcaChart',
        ['Bearing Wear', 'Misalignment', 'Overheating', 'Lubrication', 'Electrical'],
        [35, 25, 20, 15, 5],
        [CHARTS.COLORS.red, CHARTS.COLORS.amber, CHARTS.COLORS.blue, CHARTS.COLORS.purple, CHARTS.COLORS.cyan]
    );

}
