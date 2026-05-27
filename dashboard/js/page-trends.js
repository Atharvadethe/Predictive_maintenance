/* ===================================================================
   PAGE-TRENDS.JS — Trends & Analytics
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    APP.initLayout();
    renderTrendsPage();
});

function renderTrendsPage() {
    const content = document.getElementById('pageContent');

    content.innerHTML = `
        ${APP.renderPageHeader('Trends & Analytics', 'Long-term asset performance, OEE, MTBF, and operational efficiency analysis')}

        <div class="tabs">
            <div class="tab active" onclick="switchTab(this, 'performance')">Asset Performance</div>
            <div class="tab" onclick="switchTab(this, 'reliability')">Reliability & RCM</div>
            <div class="tab" onclick="switchTab(this, 'energy')">Energy Efficiency</div>
        </div>

        <div id="tab-performance" class="tab-content">
            <div class="grid grid-4 mb-5 stagger">
                ${metricCard('OEE Average', '87.4%', 'fa-chart-pie', 'blue', '+2.1% YTD')}
                ${metricCard('Availability', '94.2%', 'fa-clock', 'green', 'Target: 95.0%')}
                ${metricCard('Performance', '96.5%', 'fa-tachometer-alt', 'blue', 'Optimal')}
                ${metricCard('Quality Rate', '99.1%', 'fa-check-circle', 'green', 'Minimal defects')}
            </div>

            <div class="grid grid-2 mb-5">
                <div class="card">
                    <div class="card-header"><span class="card-title">Overall Equipment Effectiveness (OEE) Trend</span></div>
                    <div class="chart-container" style="height:300px"><canvas id="oeeTrendChart"></canvas></div>
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title">Production Downtime Analysis</span></div>
                    <div class="chart-container" style="height:300px"><canvas id="downtimeChart"></canvas></div>
                </div>
            </div>
        </div>

        <div id="tab-reliability" class="tab-content" style="display:none">
            <div class="grid grid-4 mb-5 stagger">
                ${metricCard('MTBF (Fleet Avg)', DATA.kpis.mtbf + 'h', 'fa-history', 'green', 'Mean Time Between Failures')}
                ${metricCard('MTTR (Fleet Avg)', DATA.kpis.mttr + 'h', 'fa-wrench', 'amber', 'Mean Time To Repair')}
                ${metricCard('Failure Rate', '0.042', 'fa-exclamation-triangle', 'red', 'Failures per month')}
                ${metricCard('RCM Compliance', '92%', 'fa-shield-alt', 'purple', 'Reliability Centered Maintenance')}
            </div>

            <div class="grid grid-2 mb-5">
                <div class="card">
                    <div class="card-header"><span class="card-title">MTBF vs MTTR Correlation</span></div>
                    <div class="chart-container" style="height:300px"><canvas id="mtbfChart"></canvas></div>
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title">Root Cause Analysis (Top Faults)</span></div>
                    <div class="chart-container" style="height:300px"><canvas id="rcaChart"></canvas></div>
                </div>
            </div>
        </div>

        <div id="tab-energy" class="tab-content" style="display:none">
            <div class="grid grid-3 mb-5 stagger">
                ${metricCard('Total Energy', '124.5 MWh', 'fa-bolt', 'amber', 'Last 30 Days')}
                ${metricCard('Energy Cost', '$14,250', 'fa-dollar-sign', 'red', 'Last 30 Days')}
                ${metricCard('Carbon Footprint', '85.2 tCO2e', 'fa-leaf', 'green', '-4.5% vs Last Month')}
            </div>

            <div class="card mb-5">
                <div class="card-header"><span class="card-title">Energy Consumption vs Health Index Anomaly</span></div>
                <div class="chart-container" style="height:350px"><canvas id="energyChart"></canvas></div>
            </div>
        </div>

        <div class="card">
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
    return `
        <div class="kpi-card ${color}">
            <div class="kpi-top">
                <div><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div></div>
                <div class="card-icon" style="background:var(--${color}-bg);color:var(--${color})"><i class="fas ${icon}"></i></div>
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

    // Energy
    CHARTS.createLineChart('energyChart', months, [
        { label: 'Energy Usage (MWh)', data: [110, 115, 130, 125, 140, 135, 124.5], color: CHARTS.COLORS.amber, fill: true },
        { label: 'Avg Anomaly Score (×100)', data: [25, 28, 45, 35, 60, 42, 22], color: CHARTS.COLORS.red, fill: false, tension: 0.4 }
    ]);
}
