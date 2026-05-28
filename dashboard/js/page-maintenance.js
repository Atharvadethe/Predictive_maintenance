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
    content.classList.add('maintenance-compact');
    
    const openWO = DATA.workOrders.filter(w => w.status === 'Open');
    const inProgressWO = DATA.workOrders.filter(w => w.status === 'In Progress');
    const closedWO = DATA.workOrders.filter(w => w.status === 'Closed');
    const emergencyWO = DATA.workOrders.filter(w => w.priority === 'P1');
    const totalCost = closedWO.reduce((sum, w) => sum + w.cost, 0);

    content.innerHTML = `
        ${APP.renderPageHeader('Maintenance Management', 'Track work orders, predictive maintenance schedules, and resource allocation')}

        <div class="grid grid-6 mb-4 stagger" id="maintenanceKpis">
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
            <div class="kpi-card purple">
                <div class="kpi-top">
                    <div><div class="kpi-label">Closed WOs</div><div class="kpi-value">${closedWO.length}</div></div>
                    <div class="card-icon" style="background:rgba(139,92,246,0.12);color:var(--purple)"><i class="fas fa-check-circle"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Completed maintenance actions</span></div>
            </div>
            <div class="kpi-card green">
                <div class="kpi-top">
                    <div><div class="kpi-label">Predictive WOs</div><div class="kpi-value">${DATA.monthlyTrends.predictiveMaint[DATA.monthlyTrends.predictiveMaint.length - 1]}</div></div>
                    <div class="card-icon" style="background:var(--green-bg);color:var(--green)"><i class="fas fa-robot"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Latest monthly volume</span></div>
            </div>
        </div>

        <div class="grid grid-2 mb-4">
            <!-- Work Order Status Breakdown -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Work Order Status Distribution</span>
                </div>
                <div class="chart-container maintenance-chart" style="height:220px">
                    <canvas id="woStatusChart"></canvas>
                </div>
            </div>

            <!-- Maintenance Cost by Asset Type -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Maintenance Cost by Asset Type (YTD)</span>
                </div>
                <div class="chart-container maintenance-chart" style="height:220px">
                    <canvas id="costTypeChart"></canvas>
                </div>
            </div>
        </div>

        <div class="grid grid-2 mb-4">
            <!-- WOs by Priority Trend -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Work Orders by Type Trend (Last 7 Months)</span>
                </div>
                <div class="chart-container maintenance-chart" style="height:240px">
                    <canvas id="woTrendChart"></canvas>
                </div>
            </div>
            
            <!-- Tech Utilization -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Technician Workload</span>
                </div>
                <div class="chart-container maintenance-chart" style="height:240px">
                    <canvas id="techLoadChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Work Orders Table -->
        <div class="card mb-5 maintenance-registry-card">
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
                            <th>Actions</th>
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

        <div class="wo-overlay maintenance-wo-overlay" id="maintenanceWoOverlay" hidden onclick="closeMaintenanceWoDetail(event)">
            <div class="wo-panel maintenance-wo-panel" onclick="event.stopPropagation()"></div>
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

        // Actions column: Approve / Reject for Open WOs
        let actionsHtml = '';
        if (w.status === 'Open') {
            actionsHtml = `
                <div class="flex gap-2">
                    <button class="btn btn-sm btn-success" onclick="event.stopPropagation(); approveWO('${w.id}')">Approve</button>
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); rejectWO('${w.id}')">Reject</button>
                </div>`;
        } else if (w.status === 'In Progress') {
            actionsHtml = `<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); closeWO('${w.id}')">Mark Closed</button>`;
        } else {
            actionsHtml = `-`;
        }

        return `
            <tr class="maintenance-row-clickable" role="button" tabindex="0" onclick="openMaintenanceWoDetail('${w.id}')" onkeydown="handleMaintenanceWoRowKey(event, '${w.id}')">
                <td class="mono" style="font-weight:600;color:var(--accent)">${w.id}</td>
                <td class="text-xs">${APP.formatDate(w.date)}</td>
                <td class="mono" style="font-weight:600;color:var(--text-primary)">${w.assetId}</td>
                <td><span class="text-xs" style="color:var(--text-secondary)">${w.type || ''}</span></td>
                <td>${APP.createPriorityBadge(w.priority)}</td>
                <td style="max-width:200px" class="truncate tooltip" data-tooltip="${w.description || ''}">${w.description || ''}</td>
                <td>${actionsHtml}</td>
                <td class="text-xs">${w.technician || ''}</td>
                <td>${statusBadge}</td>
                <td class="mono">${w.cost ? APP.formatCurrency(w.cost) : '—'}</td>
            </tr>
        `;
    }).join('');
}

function handleMaintenanceWoRowKey(event, woId) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openMaintenanceWoDetail(woId);
    }
}

function openMaintenanceWoDetail(woId) {
    const wo = DATA.workOrders.find(item => item.id === woId);
    if (!wo) return;

    const asset = DATA.getAssetById(wo.assetId);
    const state = asset ? DATA.getAssetState(asset.id) : null;
    const alerts = asset ? DATA.getAlertsForAsset(asset.id).slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [];
    const failureMode = state && state.failureMode ? DATA.failureModes[state.failureMode] : asset && asset.failureMode ? DATA.failureModes[asset.failureMode] : null;
    const insight = buildMaintenanceWoInsight(wo, asset, state, alerts, failureMode);
    const canModify = wo.status !== 'Closed';

    const overlay = document.getElementById('maintenanceWoOverlay');
    const panel = document.querySelector('#maintenanceWoOverlay .maintenance-wo-panel');
    if (!overlay || !panel) return;

    panel.innerHTML = `
        <div class="wo-panel-head">
            <div>
                <div class="wo-panel-kicker">Work Order Information Window</div>
                <h3>${wo.id}</h3>
                <div class="wo-panel-sub">${wo.assetId} · ${wo.type || 'N/A'} · ${APP.createStatusBadge(wo.status)}</div>
            </div>
            <button class="wo-close" onclick="closeMaintenanceWoDetail(event)">&times;</button>
        </div>
        <div class="wo-panel-body">
            <div class="wo-summary-strip">
                <div class="wo-summary-card"><div class="wo-label">Priority</div><div class="wo-value">${wo.priority}</div></div>
                <div class="wo-summary-card"><div class="wo-label">Status</div><div class="wo-value">${wo.status}</div></div>
                <div class="wo-summary-card"><div class="wo-label">SLA</div><div class="wo-value">${wo.slaHours || '—'} hrs</div></div>
                <div class="wo-summary-card"><div class="wo-label">Cost</div><div class="wo-value">${wo.cost ? APP.formatCurrency(wo.cost) : '—'}</div></div>
                <div class="wo-summary-card"><div class="wo-label">Engineeer / Tech</div><div class="wo-value">${wo.engineer || wo.technician || 'Unassigned'}</div></div>
                <div class="wo-summary-card"><div class="wo-label">Trigger</div><div class="wo-value">${wo.trigger || '—'}</div></div>
            </div>

            <div class="wo-layout maintenance-wo-layout">
                <div class="wo-main-column">
                    <div class="wo-detail-section">
                        <div class="wo-section-title">Work Order Details</div>
                        <div class="wo-kv-grid">
                            <div><span class="wo-k">Asset</span><span class="wo-v">${wo.assetId}${asset ? ` · ${DATA.formatAssetType(asset.type)}` : ''}</span></div>
                            <div><span class="wo-k">Plant</span><span class="wo-v">${asset ? asset.site : '—'}</span></div>
                            <div><span class="wo-k">Created</span><span class="wo-v">${APP.formatDateTime(wo.created || wo.date)}</span></div>
                            <div><span class="wo-k">Closed</span><span class="wo-v">${wo.closed ? APP.formatDateTime(wo.closed) : 'Open'}</span></div>
                            <div><span class="wo-k">Fault Type</span><span class="wo-v">${wo.faultType || '—'}</span></div>
                            <div><span class="wo-k">Assigned To</span><span class="wo-v">${wo.engineer || wo.technician || 'Unassigned'}</span></div>
                        </div>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Description</div>
                        <p style="margin:0">${wo.description || 'No description provided.'}</p>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Parts and Materials</div>
                        <p style="margin:0">${(wo.spareParts && wo.spareParts.length) ? wo.spareParts.join(', ') : 'No spare parts listed.'}</p>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Modify Work Order</div>
                        <div class="wo-kv-grid">
                            <div>
                                <span class="wo-k">Status</span>
                                <select id="maintenanceWoStatus" class="filter-select">
                                    <option value="Open" ${wo.status === 'Open' ? 'selected' : ''}>Open</option>
                                    <option value="In Progress" ${wo.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                    <option value="Scheduled" ${wo.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
                                    <option value="Closed" ${wo.status === 'Closed' ? 'selected' : ''}>Closed</option>
                                </select>
                            </div>
                            <div>
                                <span class="wo-k">Priority</span>
                                <select id="maintenanceWoPriority" class="filter-select">
                                    <option value="P1" ${wo.priority === 'P1' ? 'selected' : ''}>P1</option>
                                    <option value="P2" ${wo.priority === 'P2' ? 'selected' : ''}>P2</option>
                                    <option value="P3" ${wo.priority === 'P3' ? 'selected' : ''}>P3</option>
                                </select>
                            </div>
                            <div>
                                <span class="wo-k">Technician</span>
                                <input id="maintenanceWoTechnician" class="filter-select" type="text" value="${wo.engineer || wo.technician || ''}" placeholder="Assign technician">
                            </div>
                            <div>
                                <span class="wo-k">Estimated Duration</span>
                                <input id="maintenanceWoDuration" class="filter-select" type="text" value="${wo.estDuration || ''}" placeholder="e.g. 6h">
                            </div>
                        </div>
                        <div class="wo-actions compact" style="margin-top:10px">
                            <button class="btn btn-primary" ${canModify ? `onclick="saveMaintenanceWoChanges('${wo.id}')"` : 'disabled'}><i class="fas fa-save"></i> Save Changes</button>
                            <button class="btn btn-secondary" onclick="cancelMaintenanceWo('${wo.id}')"><i class="fas fa-ban"></i> Cancel Work Order</button>
                        </div>
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
                        <div class="wo-section-title">Asset Context</div>
                        <div class="wo-side-stat"><span>Health Index</span><span>${state ? state.healthIndex.toFixed(1) : '—'}</span></div>
                        <div class="wo-side-stat"><span>RUL</span><span>${state ? `${state.rulDays.toFixed(1)} days` : '—'}</span></div>
                        <div class="wo-side-stat"><span>Failure Mode</span><span>${failureMode ? failureMode.label : 'Condition-based'}</span></div>
                        <div class="wo-side-stat"><span>Recent Alerts</span><span>${alerts.length}</span></div>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Recommended Action</div>
                        <p style="margin:0">${insight.recommendation}</p>
                    </div>

                    <div class="wo-actions compact">
                        <button class="btn btn-primary" onclick="closeMaintenanceWoDetail(event)"><i class="fas fa-check"></i> Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    overlay.hidden = false;
}

function closeMaintenanceWoDetail(event) {
    if (event) event.stopPropagation();
    const overlay = document.getElementById('maintenanceWoOverlay');
    if (!overlay) return;
    overlay.hidden = true;
}

function saveMaintenanceWoChanges(woId) {
    const wo = DATA.workOrders.find(item => item.id === woId);
    if (!wo) return;

    const status = document.getElementById('maintenanceWoStatus')?.value || wo.status;
    const priority = document.getElementById('maintenanceWoPriority')?.value || wo.priority;
    const technician = document.getElementById('maintenanceWoTechnician')?.value.trim() || '';
    const estDuration = document.getElementById('maintenanceWoDuration')?.value.trim() || '';

    wo.status = status;
    wo.priority = priority;
    if (technician) {
        wo.engineer = technician;
        wo.technician = technician;
    }
    if (estDuration) wo.estDuration = estDuration;
    if (status === 'Closed' && !wo.closed) wo.closed = new Date().toISOString();

    renderWOTable(filteredWO);
    initMaintCharts();
    openMaintenanceWoDetail(woId);
}

function cancelMaintenanceWo(woId) {
    const wo = DATA.workOrders.find(item => item.id === woId);
    if (!wo) return;
    wo.status = 'Closed';
    wo.cancelled = true;
    wo.closed = new Date().toISOString();
    renderWOTable(filteredWO);
    initMaintCharts();
    openMaintenanceWoDetail(woId);
}

function buildMaintenanceWoInsight(wo, asset, state, alerts, failureMode) {
    const overdueHours = wo.slaHours ? Math.max(0, (new Date() - new Date(wo.created || wo.date)) / 3600000 - wo.slaHours) : 0;
    const urgency = wo.priority === 'P1' || (state && state.rulDays < 7) ? 'critical' : wo.priority === 'P2' || overdueHours > 0 ? 'warning' : 'info';
    const confidence = Math.min(99, 84 + alerts.length * 2 + (urgency === 'critical' ? 6 : urgency === 'warning' ? 3 : 0));

    let title = `${wo.id} is active and should stay aligned with maintenance execution`;
    let message = `${wo.id} covers ${asset ? asset.id : wo.assetId} and currently sits in ${wo.status.toLowerCase()} state. The asset posture and alert history indicate ${failureMode ? failureMode.label.toLowerCase() : 'condition-based maintenance'} as the likely driver.`;
    let recommendation = 'Keep the work order aligned with the asset trend and verify parts, assignment, and closure timing.';

    if (urgency === 'critical') {
      title = `${wo.id} requires immediate attention`;
      message = `${wo.id} is a high-priority intervention because the linked asset is either critical or rapidly degrading.`;
      recommendation = 'Escalate, confirm parts, and avoid delay in assignment or execution.';
    } else if (urgency === 'warning') {
      title = `${wo.id} should be reviewed soon`;
      message = `${wo.id} is not yet in the critical band but is close enough to justify a quick review of timing and resource readiness.`;
      recommendation = 'Review the schedule, technician load, and spare parts before the next maintenance window.';
    }

    if (overdueHours > 0) {
      recommendation += ` The job is overdue by ${overdueHours.toFixed(1)} hours against SLA.`;
    }

    if (alerts.length > 1) {
      message += ` There are ${alerts.length} related alerts for the asset, which suggests a repeatable failure pattern.`;
    }

    return { title, message, recommendation, confidence, severity: urgency };
}

// Approve a work order: set to In Progress and optionally assign a technician
function approveWO(woId) {
    const wo = DATA.workOrders.find(w => w.id === woId);
    if (!wo) return;
    wo.status = 'In Progress';
    if (!wo.technician) wo.technician = 'Unassigned';
    renderWOTable(filteredWO);
    initMaintCharts();
}

// Reject a work order: mark as Closed and add a rejected flag
function rejectWO(woId) {
    const wo = DATA.workOrders.find(w => w.id === woId);
    if (!wo) return;
    wo.status = 'Closed';
    wo.rejected = true;
    wo.closed = new Date().toISOString();
    renderWOTable(filteredWO);
    initMaintCharts();
}

function closeWO(woId) {
    const wo = DATA.workOrders.find(w => w.id === woId);
    if (!wo) return;
    wo.status = 'Closed';
    wo.closed = new Date().toISOString();
    renderWOTable(filteredWO);
    initMaintCharts();
}

// Refresh the maintenance UI if the page is active
function refreshMaintenance() {
    const pageContent = document.getElementById('pageContent');
    if (!pageContent) return;
    // Re-render the entire maintenance page to refresh KPIs, tables and charts
    renderMaintenancePage();
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
