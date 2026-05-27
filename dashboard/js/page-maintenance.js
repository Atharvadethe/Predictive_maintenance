/* ===================================================================
   PAGE-MAINTENANCE.JS — Maintenance Management
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    APP.initLayout();
    renderMaintenancePage();
});

let filteredWO = [...DATA.workOrders];

function renderMaintenancePage() {
    const content = document.getElementById('pageContent');
    
    const openWO = DATA.workOrders.filter(w => w.status === 'Open');
    const inProgressWO = DATA.workOrders.filter(w => w.status === 'In Progress');
    const closedWO = DATA.workOrders.filter(w => w.status === 'Closed');
    const emergencyWO = DATA.workOrders.filter(w => w.priority === 'P1');
    const totalCost = closedWO.reduce((sum, w) => sum + w.cost, 0);

    content.innerHTML = `
        ${APP.renderPageHeader('Maintenance Management', 'Track work orders, predictive maintenance schedules, and resource allocation')}

        <!-- KPI Cards -->
        <div class="grid grid-4 mb-5 stagger">
            <div class="kpi-card blue">
                <div class="kpi-top">
                    <div><div class="kpi-label">Open Work Orders</div><div class="kpi-value">${openWO.length}</div></div>
                    <div class="card-icon" style="background:var(--blue-bg);color:var(--blue)"><i class="fas fa-clipboard-list"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">${inProgressWO.length} currently in progress</span></div>
            </div>
            <div class="kpi-card red">
                <div class="kpi-top">
                    <div><div class="kpi-label">Emergency (P1)</div><div class="kpi-value">${emergencyWO.length}</div></div>
                    <div class="card-icon" style="background:var(--red-bg);color:var(--red)"><i class="fas fa-fire"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Immediate action required</span></div>
            </div>
            <div class="kpi-card green">
                <div class="kpi-top">
                    <div><div class="kpi-label">MTTR</div><div class="kpi-value">${DATA.kpis.mttr} hrs</div></div>
                    <div class="card-icon" style="background:var(--green-bg);color:var(--green)"><i class="fas fa-tools"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Mean Time To Repair</span></div>
            </div>
            <div class="kpi-card amber">
                <div class="kpi-top">
                    <div><div class="kpi-label">Total Cost (MTD)</div><div class="kpi-value">${APP.formatCurrency(totalCost)}</div></div>
                    <div class="card-icon" style="background:var(--amber-bg);color:var(--amber)"><i class="fas fa-dollar-sign"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Across all closed WOs</span></div>
            </div>
        </div>

        <div class="grid grid-2 mb-5">
            <!-- Work Order Status Breakdown -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Work Order Status Distribution</span>
                </div>
                <div class="chart-container" style="height:260px">
                    <canvas id="woStatusChart"></canvas>
                </div>
            </div>

            <!-- Maintenance Cost by Asset Type -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Maintenance Cost by Asset Type (YTD)</span>
                </div>
                <div class="chart-container" style="height:260px">
                    <canvas id="costTypeChart"></canvas>
                </div>
            </div>
        </div>

        <div class="grid grid-2 mb-5">
            <!-- WOs by Priority Trend -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Work Orders by Type Trend (Last 7 Months)</span>
                </div>
                <div class="chart-container" style="height:280px">
                    <canvas id="woTrendChart"></canvas>
                </div>
            </div>
            
            <!-- Tech Utilization -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Technician Workload</span>
                </div>
                <div class="chart-container" style="height:280px">
                    <canvas id="techLoadChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Work Orders Table -->
        <div class="card mb-5">
            <div class="card-header">
                <span class="card-title">Work Order Registry</span>
                <div class="flex gap-3">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="woSearch" placeholder="Search WO or Asset...">
                    </div>
                    <button class="btn btn-sm btn-primary"><i class="fas fa-plus"></i> New WO</button>
                    <button class="btn btn-sm btn-secondary"><i class="fas fa-download"></i> Export</button>
                </div>
            </div>
            
            <div class="filter-bar" style="margin-top:-10px">
                <div class="filter-group">
                    <select id="woStatusFilter" class="filter-select" onchange="filterWorkOrders()">
                        <option value="">All Statuses</option>
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                    </select>
                </div>
                <div class="filter-group">
                    <select id="woPriorityFilter" class="filter-select" onchange="filterWorkOrders()">
                        <option value="">All Priorities</option>
                        <option value="P1">P1 (Emergency)</option>
                        <option value="P2">P2 (High)</option>
                        <option value="P3">P3 (Normal)</option>
                    </select>
                </div>
                <div class="filter-group">
                    <select id="woTypeFilter" class="filter-select" onchange="filterWorkOrders()">
                        <option value="">All Types</option>
                        <option value="Predictive">Predictive</option>
                        <option value="Preventive">Preventive</option>
                        <option value="Corrective">Corrective</option>
                    </select>
                </div>
            </div>

            <div class="table-container" style="max-height:500px;overflow-y:auto">
                <table>
                    <thead>
                        <tr>
                            <th>WO ID</th>
                            <th>Date Created</th>
                            <th>Asset ID</th>
                            <th>Type</th>
                            <th>Priority</th>
                            <th>Description</th>
                            <th>Assigned To</th>
                            <th>Status</th>
                            <th>Cost</th>
                        </tr>
                    </thead>
                    <tbody id="woTableBody">
                        <!-- Populated by JS -->
                    </tbody>
                </table>
            </div>
        </div>
    `;

    renderWOTable(filteredWO);
    initMaintCharts();
    
    // Search listener
    const searchInput = document.getElementById('woSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            const results = filteredWO.filter(w => 
                w.id.toLowerCase().includes(q) || 
                w.assetId.toLowerCase().includes(q) || 
                w.description.toLowerCase().includes(q)
            );
            renderWOTable(results);
        });
    }
}

function filterWorkOrders() {
    const status = document.getElementById('woStatusFilter').value;
    const priority = document.getElementById('woPriorityFilter').value;
    const type = document.getElementById('woTypeFilter').value;

    filteredWO = DATA.workOrders.filter(w => {
        if (status && w.status !== status) return false;
        if (priority && w.priority !== priority) return false;
        if (type && w.type !== type) return false;
        return true;
    });
    
    renderWOTable(filteredWO);
}

function renderWOTable(workOrders) {
    const tbody = document.getElementById('woTableBody');
    tbody.innerHTML = workOrders.map(w => {
        let statusBadge = '';
        if (w.status === 'Open') statusBadge = '<span class="badge badge-warning" style="font-size:9px">OPEN</span>';
        else if (w.status === 'In Progress') statusBadge = '<span class="badge badge-info" style="font-size:9px">IN PROGRESS</span>';
        else statusBadge = '<span class="badge badge-healthy" style="font-size:9px">CLOSED</span>';

        return `
            <tr>
                <td class="mono" style="font-weight:600;color:var(--accent)">${w.id}</td>
                <td class="text-xs">${APP.formatDate(w.date)}</td>
                <td class="mono" style="font-weight:600;color:var(--text-primary)">${w.assetId}</td>
                <td><span class="text-xs" style="color:var(--text-secondary)">${w.type}</span></td>
                <td>${APP.createPriorityBadge(w.priority)}</td>
                <td style="max-width:200px" class="truncate tooltip" data-tooltip="${w.description}">${w.description}</td>
                <td class="text-xs">${w.technician}</td>
                <td>${statusBadge}</td>
                <td class="mono">${w.cost ? APP.formatCurrency(w.cost) : '—'}</td>
            </tr>
        `;
    }).join('');
}

function initMaintCharts() {
    // WO Status
    const statusCounts = { 'Open': 0, 'In Progress': 0, 'Closed': 0 };
    DATA.workOrders.forEach(w => statusCounts[w.status]++);
    CHARTS.createDoughnutChart('woStatusChart',
        Object.keys(statusCounts),
        Object.values(statusCounts),
        [CHARTS.COLORS.amber, CHARTS.COLORS.blue, CHARTS.COLORS.green],
        { cutout: '70%', legendPos: 'right' }
    );

    // Cost by Asset Type
    const costByType = {};
    DATA.workOrders.filter(w => w.status === 'Closed').forEach(w => {
        const asset = DATA.assets.find(a => a.id === w.assetId);
        if (asset) {
            costByType[asset.type] = (costByType[asset.type] || 0) + w.cost;
        }
    });
    CHARTS.createBarChart('costTypeChart',
        Object.keys(costByType).map(t => DATA.formatAssetType(t)),
        [{ label: 'Total Cost ($)', data: Object.values(costByType), colors: [CHARTS.COLORS.blue, CHARTS.COLORS.cyan, CHARTS.COLORS.amber, CHARTS.COLORS.purple] }],
        { plugins: { legend: { display: false } } }
    );

    // WO Trend
    CHARTS.createStackedBar('woTrendChart',
        DATA.monthlyTrends.months,
        [
            { label: 'Predictive', data: DATA.monthlyTrends.predictiveMaint, color: CHARTS.COLORS.green },
            { label: 'Preventive', data: DATA.monthlyTrends.preventiveMaint, color: CHARTS.COLORS.blue },
            { label: 'Corrective', data: DATA.monthlyTrends.correctiveMaint, color: CHARTS.COLORS.amber },
            { label: 'Emergency', data: DATA.monthlyTrends.emergencyMaint, color: CHARTS.COLORS.red }
        ]
    );

    // Tech Load
    const techCounts = {};
    DATA.workOrders.filter(w => w.status !== 'Closed').forEach(w => {
        techCounts[w.technician] = (techCounts[w.technician] || 0) + 1;
    });
    const techs = Object.keys(techCounts).sort((a,b) => techCounts[b] - techCounts[a]).slice(0, 5);
    CHARTS.createHorizontalBar('techLoadChart',
        techs,
        [{ label: 'Active Tasks', data: techs.map(t => techCounts[t]), color: CHARTS.COLORS.indigo }],
        { plugins: { legend: { display: false } }, xScale: { max: Math.max(...Object.values(techCounts)) + 2 } }
    );
}
