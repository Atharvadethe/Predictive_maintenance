/* ===================================================================
   PAGE-ANOMALIES.JS — Anomaly Detection & Alert Center
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    APP.initLayout();
    renderAnomalyPage();
});

let activeAnomalyAlertId = null;

function renderAnomalyPage() {
    const content = document.getElementById('pageContent');
    content.classList.add('anomaly-compact');

    const alertsSorted = [...DATA.alerts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const critAlerts = alertsSorted.filter(a => a.level === 'Critical');
    const warnAlerts = alertsSorted.filter(a => a.level === 'Warning');
    const unack = alertsSorted.filter(a => !a.acknowledged);
    const activeWOs = DATA.workOrders.filter(w => w.status !== 'Closed');
    const linkedWOs = alertsSorted.filter(a => a.workOrderId).length;
    const avgAnomaly = alertsSorted.reduce((sum, alert) => sum + alert.anomalyScore, 0) / alertsSorted.length;

    content.innerHTML = `
        ${APP.renderPageHeader('Anomaly Detection & Alert Center', 'Real-time alert monitoring, severity analysis, and threshold breach tracking')}

        <div class="grid mb-4 stagger" id="anomalyKpis" style="grid-template-columns:repeat(7,minmax(0,1fr));gap:6px">
            <div class="kpi-card c-red">
                <div class="kpi-top">
                    <div><div class="kpi-label">Critical Alerts</div><div class="kpi-value">${critAlerts.length}</div></div>
                    <div class="card-icon" style="background:var(--red-lt);color:var(--red)"><i class="fas fa-exclamation-circle"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">${critAlerts.filter(a => !a.acknowledged).length} unacknowledged</span></div>
            </div>
            <div class="kpi-card c-amber">
                <div class="kpi-top">
                    <div><div class="kpi-label">Warning Alerts</div><div class="kpi-value">${warnAlerts.length}</div></div>
                    <div class="card-icon" style="background:var(--amber-lt);color:var(--amber)"><i class="fas fa-exclamation-triangle"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">${warnAlerts.filter(a => !a.acknowledged).length} unacknowledged</span></div>
            </div>
            <div class="kpi-card c-blue">
                <div class="kpi-top">
                    <div><div class="kpi-label">Total Alerts</div><div class="kpi-value">${DATA.alerts.length}</div></div>
                    <div class="card-icon" style="background:var(--blue-bg);color:var(--carrier-blue)"><i class="fas fa-bell"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Last 30 days</span></div>
            </div>
            <div class="kpi-card c-blue">
                <div class="kpi-top">
                    <div><div class="kpi-label">Unacknowledged</div><div class="kpi-value">${unack.length}</div></div>
                    <div class="card-icon" style="background:var(--blue-bg);color:var(--carrier-blue)"><i class="fas fa-clock"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Requires attention</span></div>
            </div>
            <div class="kpi-card c-navy">
                <div class="kpi-top">
                    <div><div class="kpi-label">WO Linked</div><div class="kpi-value">${linkedWOs}</div></div>
                    <div class="card-icon" style="background:rgba(0,45,98,0.08);color:var(--carrier-navy)"><i class="fas fa-link"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Alerts already converted</span></div>
            </div>
            <div class="kpi-card c-green">
                <div class="kpi-top">
                    <div><div class="kpi-label">Active WOs</div><div class="kpi-value">${activeWOs.length}</div></div>
                    <div class="card-icon" style="background:var(--green-lt);color:var(--green)"><i class="fas fa-clipboard-list"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Maintenance registry open items</span></div>
            </div>
            <div class="kpi-card c-amber">
                <div class="kpi-top">
                    <div><div class="kpi-label">Avg Anomaly</div><div class="kpi-value">${avgAnomaly.toFixed(2)}</div></div>
                    <div class="card-icon" style="background:var(--amber-lt);color:var(--amber)"><i class="fas fa-wave-square"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Fleet-wide anomaly intensity</span></div>
            </div>
        </div>

        <div class="grid grid-3 mb-4">
            <!-- Real-time Alert Feed -->
            <div class="card" style="grid-column:span 2">
                <div class="card-header">
                    <span class="card-title">Real-time Alert Feed</span>
                    <span class="live-indicator"><span class="live-dot"></span>Live</span>
                </div>
                <div class="alert-feed anomaly-feed" style="max-height:280px; overflow-y:auto; padding:10px 16px;">
                    ${alertsSorted.map(a => `
                        <div class="alert-item anomaly-alert" data-alert-id="${a.id}" style="${!a.acknowledged ? 'border-left:3px solid ' + (a.level === 'Critical' ? 'var(--red)' : 'var(--amber)') : ''}">
                            <div class="alert-icon ${a.level.toLowerCase()}">
                                <i class="fas ${a.level === 'Critical' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i>
                            </div>
                            <div class="alert-content" style="padding-left: 4px;">
                                <p><strong style="color:var(--text-primary)">${a.assetId}</strong> — ${a.reason}</p>
                                <div class="alert-meta">
                                    <span><i class="fas fa-clock"></i> ${APP.formatDateTime(a.timestamp)}</span>
                                    <span>Sensor: ${a.sensor}</span>
                                    <span>Score: <span style="color:${a.anomalyScore >= 0.85 ? 'var(--red)' : 'var(--amber)'}; font-weight:600">${a.anomalyScore.toFixed(2)}</span></span>
                                </div>
                            </div>
                            <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;margin-left: 8px;">
                                ${a.workOrderId ? `<button class="badge badge-warning anomaly-wo-chip" style="font-size:9.5px; padding:4px 8px; border:1px solid var(--amber-border); background:var(--amber-lt); color:var(--amber); cursor:pointer;" onclick="openWorkOrderPanel('${a.id}')"><i class="fas fa-clipboard-list"></i> ${a.workOrderId}</button>` : ''}
                                ${a.acknowledged
            ? '<span class="badge badge-healthy" style="font-size:9.5px; padding:4px 8px;"><i class="fas fa-check"></i> ACK</span>'
            : '<button class="btn btn-sm" style="color:var(--green); border-color:var(--green-border); background:var(--green-lt); padding:4px 8px; display:flex; align-items:center; justify-content:center;" onclick="ackAlert(this)"><i class="fas fa-check"></i></button>'}
                                ${a.workOrderId ? '' : `<button class="btn btn-sm anomaly-create-wo-btn" style="color:var(--carrier-blue); border-color:var(--blue-border); background:var(--blue-bg); padding:4px 8px; display:flex; align-items:center; justify-content:center;" onclick="openWorkOrderPanel('${a.id}')"><i class="fas fa-clipboard-list"></i> WO</button>`}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Alert Timeline -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Alert Timeline</span>
                </div>
                <div class="timeline anomaly-timeline" style="max-height:280px; overflow-y:auto; padding:10px 16px;">
                    ${alertsSorted.slice(0, 10).map(a => `
                        <div class="tl-item" style="padding: 10px 0; display: flex; gap: 10px; border-bottom: 1px solid var(--border); position: relative;">
                            <div class="tl-dot ${a.level.toLowerCase()}" style="background:${a.level === 'Critical' ? 'var(--red)' : 'var(--amber)'}; width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px;"></div>
                            <div class="tl-body" style="flex: 1; min-width: 0;">
                                <div class="tl-head" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 3px;">
                                    <span class="tl-name" style="font-size: 11.5px; font-weight: 600; color: var(--ink);">${a.assetId}</span>
                                    <span class="tl-time" style="font-size: 9.5px; font-family: var(--font-mono); color: var(--faint);">${APP.formatDateTime(a.timestamp)}</span>
                                </div>
                                <div class="tl-desc" style="font-size: 11px; color: var(--muted); line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${a.level}: ${a.sensor.replace(/_/g, ' ')}">${a.level}: ${a.sensor.replace(/_/g, ' ')}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="grid grid-3 mb-5">
            <!-- Alert Distribution by Sensor Type -->
            <div class="card" style="margin-bottom: 0px; display: flex; flex-direction: column;">
                <div class="card-header" style="flex-shrink: 0;">
                    <span class="card-title">Alert Distribution by Sensor Type</span>
                </div>
                <div class="chart-container anomaly-chart" style="height:160px; padding:10px; flex: 1;">
                    <canvas id="breachChart"></canvas>
                </div>
            </div>

            <!-- Top Recurring Anomalies -->
            <div class="card" style="margin-bottom: 0px; display: flex; flex-direction: column;">
                <div class="card-header" style="flex-shrink: 0;">
                    <span class="card-title">Top Recurring Anomalies</span>
                </div>
                <div class="chart-container anomaly-chart" style="height:160px; padding:10px; flex: 1;">
                    <canvas id="recurringChart"></canvas>
                </div>
            </div>

            <!-- Alert Escalation Pipeline -->
            <div class="card" style="margin-bottom: 0px; display: flex; flex-direction: column;">
                <div class="card-header" style="flex-shrink: 0;">
                    <span class="card-title">Alert Escalation Pipeline</span>
                </div>
                <div style="padding:10px; display:flex; flex-direction:column; justify-content:space-between; flex:1;">
                    <div class="anomaly-pipeline" style="display:flex; gap:3px; justify-content:space-between; align-items:center;">
                        ${escalationStep('Detected', DATA.alerts.length, 'fa-radar', 'blue')}
                        <div style="display:flex;align-items:center;color:var(--text-disabled);font-size:10px;flex-shrink:0;"><i class="fas fa-chevron-right"></i></div>
                        ${escalationStep('Acked', DATA.alerts.filter(a => a.acknowledged).length, 'fa-check', 'amber')}
                        <div style="display:flex;align-items:center;color:var(--text-disabled);font-size:10px;flex-shrink:0;"><i class="fas fa-chevron-right"></i></div>
                        ${escalationStep('WO Created', DATA.alerts.filter(a => a.workOrderId).length, 'fa-clipboard', 'purple')}
                        <div style="display:flex;align-items:center;color:var(--text-disabled);font-size:10px;flex-shrink:0;"><i class="fas fa-chevron-right"></i></div>
                        ${escalationStep('Resolved', DATA.workOrders.filter(w => w.status === 'Closed').length, 'fa-check-circle', 'green')}
                    </div>
                    <!-- Anomaly Score Distribution -->
                    <div style="margin-top:12px; border-top: 1px solid var(--border); padding-top:8px;">
                        <div class="card-title" style="margin-bottom:6px; font-size:11px;">Anomaly Score Thresholds</div>
                        <div class="flex flex-col gap-1.5" style="display:flex; flex-direction:column; gap:4px;">
                            <div class="stat-row" style="display:flex; justify-content:space-between; font-size:10.5px;">
                                <span class="stat-label" style="display:flex; align-items:center;"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--green);margin-right:5px;flex-shrink:0;"></span>Normal (&lt; 0.55)</span>
                                <span class="stat-value text-green" style="font-family:var(--font-mono);">${DATA.assets.filter(a => DATA.getAssetState(a.id).anomalyScore < 0.55).length} assets</span>
                            </div>
                            <div class="stat-row" style="display:flex; justify-content:space-between; font-size:10.5px;">
                                <span class="stat-label" style="display:flex; align-items:center;"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--amber);margin-right:5px;flex-shrink:0;"></span>Warning (&ge; 0.55)</span>
                                <span class="stat-value text-amber" style="font-family:var(--font-mono);">${DATA.assets.filter(a => { const s = DATA.getAssetState(a.id).anomalyScore; return s >= 0.55 && s < 0.85; }).length} assets</span>
                            </div>
                            <div class="stat-row" style="display:flex; justify-content:space-between; font-size:10.5px;">
                                <span class="stat-label" style="display:flex; align-items:center;"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--red);margin-right:5px;flex-shrink:0;"></span>Critical (&ge; 0.85)</span>
                                <span class="stat-value text-red" style="font-family:var(--font-mono);">${DATA.assets.filter(a => DATA.getAssetState(a.id).anomalyScore >= 0.85).length} assets</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Critical Anomaly Table -->
        <div class="card mb-5">
            <div class="card-header">
                <span class="card-title">Detailed Alert Log</span>
                <button class="btn btn-sm btn-secondary"><i class="fas fa-download"></i> Export CSV</button>
            </div>
            <div class="table-container anomaly-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Alert ID</th>
                            <th>Timestamp</th>
                            <th>Asset ID</th>
                            <th>Severity</th>
                            <th>Sensor</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th>Suggested Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${DATA.alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(a => {
                const action = a.anomalyScore >= 0.85 ? 'Create Work Order — Emergency' : 'Schedule Inspection';
                return `
                            <tr class="alert-row-clickable" role="button" tabindex="0" onclick="openAlertDetail('${a.id}')" onkeydown="handleAlertRowKey(event, '${a.id}')">
                                <td class="mono" style="font-size:11px;color:var(--accent)">${a.id}</td>
                                <td class="text-xs">${APP.formatDateTime(a.timestamp)}</td>
                                <td class="mono" style="font-weight:600;color:var(--text-primary)">${a.assetId}</td>
                                <td>${APP.createStatusBadge(a.level === 'Critical' ? 'Critical' : 'Warning')}</td>
                                <td>${a.sensor.replace(/_/g, ' ')}</td>
                                <td><span class="mono" style="color:${a.anomalyScore >= 0.85 ? 'var(--red)' : 'var(--amber)'}; font-weight:600">${a.anomalyScore.toFixed(2)}</span></td>
                                <td>${a.acknowledged ? '<span class="text-green text-xs">Acknowledged</span>' : '<span class="text-amber text-xs">Pending</span>'}</td>
                                <td class="text-xs">${action}</td>
                            </tr>`;
            }).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <div class="wo-overlay alert-detail-overlay" id="alertDetailOverlay" hidden onclick="closeAlertDetail(event)">
            <div class="wo-panel alert-detail-panel" onclick="event.stopPropagation()"></div>
        </div>

        <div class="wo-overlay" id="woDetailOverlay" hidden onclick="closeWorkOrderPanel(event)">
            <div class="wo-panel" id="woDetailPanel" onclick="event.stopPropagation()"></div>
        </div>
    `;

    initAnomalyCharts();
}

function escalationStep(label, count, icon, color) {
    return `
        <div style="flex:1;background:var(--bg-elevated);border-radius:var(--radius-sm);padding:8px 4px;text-align:center;min-width:0;box-sizing:border-box;">
            <div style="width:28px;height:28px;margin:0 auto 4px;border-radius:50%;background:var(--${color}-bg);color:var(--${color});display:flex;align-items:center;justify-content:center;font-size:11px;">
                <i class="fas ${icon}"></i>
            </div>
            <div style="font-family:var(--font-mono);font-size:16px;font-weight:700;line-height:1.2;color:var(--text-primary);">${count}</div>
            <div class="text-xs text-muted" style="font-size:9.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;" title="${label}">${label}</div>
        </div>
    `;
}

function ackAlert(btn) {
    const item = btn.closest('.alert-item');
    item.style.borderLeft = 'none';
    btn.outerHTML = '<span class="badge badge-healthy" style="font-size:9px"><i class="fas fa-check"></i> ACK</span>';
}

function handleAlertRowKey(event, alertId) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openAlertDetail(alertId);
    }
}

function openAlertDetail(alertId) {
    const alert = DATA.alerts.find(a => a.id === alertId);
    if (!alert) return;

    const asset = DATA.getAssetById(alert.assetId);
    const state = DATA.getAssetState(alert.assetId);
    const alertsForAsset = DATA.getAlertsForAsset(alert.assetId).slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const workOrders = DATA.getWorkOrdersForAsset(alert.assetId).slice().sort((a, b) => new Date(b.created) - new Date(a.created));
    const failureMode = DATA.failureModes[state.failureMode] || DATA.failureModes[asset?.failureMode] || null;
    const insight = buildAlertInsight(alert, asset, state, alertsForAsset, workOrders, failureMode);

    const overlay = document.getElementById('alertDetailOverlay');
    const panel = document.querySelector('#alertDetailOverlay .alert-detail-panel');
    if (!overlay || !panel) return;

    panel.innerHTML = `
        <div class="wo-panel-head">
            <div>
                <div class="wo-panel-kicker">Alert Detail Window</div>
                <h3>${alert.id}</h3>
                <div class="wo-panel-sub">${alert.assetId} · ${alert.level} · ${APP.formatDateTime(alert.timestamp)}</div>
            </div>
            <button class="wo-close" onclick="closeAlertDetail(event)">&times;</button>
        </div>
        <div class="wo-panel-body">
            <div class="wo-summary-strip">
                <div class="wo-summary-card"><div class="wo-label">Asset</div><div class="wo-value">${alert.assetId}</div></div>
                <div class="wo-summary-card"><div class="wo-label">Severity</div><div class="wo-value">${alert.level}</div></div>
                <div class="wo-summary-card"><div class="wo-label">Sensor</div><div class="wo-value">${alert.sensor.replace(/_/g, ' ')}</div></div>
                <div class="wo-summary-card"><div class="wo-label">Anomaly Score</div><div class="wo-value">${alert.anomalyScore.toFixed(2)}</div></div>
                <div class="wo-summary-card"><div class="wo-label">Status</div><div class="wo-value">${alert.acknowledged ? 'Acknowledged' : 'Pending'}</div></div>
                <div class="wo-summary-card"><div class="wo-label">Work Order</div><div class="wo-value">${alert.workOrderId || 'None'}</div></div>
            </div>

            <div class="wo-layout alert-detail-layout">
                <div class="wo-main-column">
                    <div class="wo-detail-section">
                        <div class="wo-section-title">Alert Details</div>
                        <div class="wo-kv-grid">
                            <div><span class="wo-k">Reason</span><span class="wo-v">${alert.reason}</span></div>
                            <div><span class="wo-k">Timestamp</span><span class="wo-v">${APP.formatDateTime(alert.timestamp)}</span></div>
                            <div><span class="wo-k">Threshold</span><span class="wo-v">${alert.threshold || '—'}</span></div>
                            <div><span class="wo-k">Confidence</span><span class="wo-v">${alert.confidence || '—'}%</span></div>
                        </div>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Asset Context</div>
                        <div class="wo-kv-grid">
                            <div><span class="wo-k">Asset Type</span><span class="wo-v">${asset ? DATA.formatAssetType(asset.type) : '—'}</span></div>
                            <div><span class="wo-k">Plant</span><span class="wo-v">${asset ? asset.site : '—'}</span></div>
                            <div><span class="wo-k">Health Index</span><span class="wo-v">${state ? state.healthIndex.toFixed(1) : '—'}</span></div>
                            <div><span class="wo-k">RUL</span><span class="wo-v">${state ? `${state.rulDays.toFixed(1)} days` : '—'}</span></div>
                        </div>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Recent Related Alerts</div>
                        ${alertsForAsset.slice(0, 3).map(item => `
                            <div class="wo-side-stat">
                                <span>${APP.formatDateTime(item.timestamp)} · ${item.sensor.replace(/_/g, ' ')}</span>
                                <span class="badge ${item.level === 'Critical' ? 'badge-critical' : 'badge-warning'}" style="font-size:9px">${item.level}</span>
                            </div>
                        `).join('') || '<p style="margin:0">No related alerts found.</p>'}
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
                        <div class="wo-section-title">Maintenance Context</div>
                        <div class="wo-side-stat"><span>Failure mode</span><span>${failureMode ? failureMode.label : 'Condition-based'}</span></div>
                        <div class="wo-side-stat"><span>Open WOs</span><span>${workOrders.filter(w => w.status !== 'Closed').length}</span></div>
                        <div class="wo-side-stat"><span>Linked WO</span><span>${alert.workOrderId || 'None'}</span></div>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Recommended Action</div>
                        <p style="margin:0">${insight.recommendation}</p>
                    </div>

                    <div class="wo-actions compact">
                        ${alert.workOrderId ? `<button class="btn btn-primary" onclick="openWorkOrderPanel('${alert.id}')"><i class="fas fa-clipboard-list"></i> Open Work Order</button>` : `<button class="btn btn-primary" onclick="openWorkOrderPanel('${alert.id}')"><i class="fas fa-clipboard-list"></i> Create Work Order</button>`}
                        <button class="btn btn-secondary" onclick="closeAlertDetail(event)">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    overlay.hidden = false;
}

function closeAlertDetail(event) {
    if (event) event.stopPropagation();
    const overlay = document.getElementById('alertDetailOverlay');
    if (!overlay) return;
    overlay.hidden = true;
}

function buildAlertInsight(alert, asset, state, alertsForAsset, workOrders, failureMode) {
    const linkedWO = alert.workOrderId ? DATA.workOrders.find(w => w.id === alert.workOrderId) : workOrders.find(w => w.status !== 'Closed') || null;
    const riskBand = alert.anomalyScore >= 0.85 || (state && state.rulDays < 7) ? 'critical' : alert.anomalyScore >= 0.55 || (state && state.rulDays < 14) ? 'warning' : 'info';
    const confidence = Math.min(99, 88 + Math.round(alert.anomalyScore * 8) + (linkedWO ? 3 : 0));

    let title = `${alert.assetId} alert is under active review`;
    let message = `${alert.assetId} triggered a ${alert.level.toLowerCase()} alert from ${alert.sensor.replace(/_/g, ' ')} with a score of ${alert.anomalyScore.toFixed(2)}. The AI view links this to ${failureMode ? failureMode.label.toLowerCase() : 'condition-based degradation'} and the current asset posture.`;
    let recommendation = 'Validate the sensor trend, confirm the asset state, and schedule the next inspection window.';

    if (riskBand === 'critical') {
        title = `${alert.assetId} requires immediate attention`;
        message = `${alert.assetId} is in a critical alert state and should be treated as a near-term maintenance risk. The combination of severity, asset state, and related history suggests an active degradation path.`;
        recommendation = 'Create or escalate the work order immediately and protect the asset from continued load if needed.';
    } else if (riskBand === 'warning') {
        title = `${alert.assetId} should be scheduled soon`;
        message = `${alert.assetId} is showing an elevated anomaly that is still manageable, but it should be checked before the condition worsens.`;
        recommendation = 'Schedule inspection soon and compare this alert against the recent maintenance history.';
    }

    if (linkedWO) {
        recommendation += ` A related work order (${linkedWO.id}) is already ${linkedWO.status.toLowerCase()}, so keep the maintenance response aligned.`;
    }

    if (alertsForAsset.length > 1) {
        message += ` There are ${alertsForAsset.length} related alerts for this asset, which increases the likelihood of a recurring underlying fault.`;
    }

    return { title, message, recommendation, confidence, severity: riskBand };
}

function inferFaultType(alert) {
    const sensor = (alert.sensor || '').toLowerCase();
    if (sensor.includes('vibration')) return 'bearing_wear';
    if (sensor.includes('winding') || sensor.includes('temperature')) return 'thermal_runaway';
    if (sensor.includes('current')) return 'insulation_breakdown';
    if (sensor.includes('pressure')) return 'valve_leak';
    if (sensor.includes('flow')) return 'cavitation';
    if (sensor.includes('exhaust')) return 'blade_erosion';
    if (sensor.includes('voltage')) return 'winding_degradation';
    return 'general_inspection';
}

function buildWorkOrderDraft(alert) {
    const asset = DATA.getAssetById(alert.assetId);
    const state = DATA.getAssetState(alert.assetId);
    const faultType = inferFaultType(alert);
    const failure = DATA.failureModes[faultType] || DATA.failureModes.general_inspection;
    const priority = alert.level === 'Critical' ? 'P1' : 'P2';

    return {
        asset,
        state,
        faultType,
        failure,
        workClass: 'Maintenance Repair & Overhaul',
        scope: 'Corrective maintenance',
        trigger: 'AI Alert',
        priority,
        slaHours: priority === 'P1' ? 12 : 24,
        estDuration: priority === 'P1' ? '6h' : '4h',
        technician: 'Unassigned',
        description: `${alert.reason}. Schedule MRO response and verify return to baseline.`,
        spareParts: failure.description,
    };
}

function openWorkOrderPanel(alertId) {
    activeAnomalyAlertId = alertId;
    renderWorkOrderPanel(alertId);
}

function closeWorkOrderPanel(event) {
    if (event && event.target !== event.currentTarget) return;
    const overlay = document.getElementById('woDetailOverlay');
    if (!overlay) return;
    overlay.hidden = true;
}

function renderWorkOrderPanel(alertId) {
    const overlay = document.getElementById('woDetailOverlay');
    const panel = document.getElementById('woDetailPanel');
    const alert = DATA.alerts.find(a => a.id === alertId);
    if (!overlay || !panel || !alert) return;

    const existingWO = alert.workOrderId ? DATA.workOrders.find(w => w.id === alert.workOrderId) : DATA.getWorkOrdersForAsset(alert.assetId).slice().sort((a, b) => new Date(b.created) - new Date(a.created))[0];
    const draft = buildWorkOrderDraft(alert);
    const wo = existingWO || draft;
    const isExisting = Boolean(existingWO);
    const badgeClass = alert.level === 'Critical' ? 'badge-critical' : 'badge-warning';

    panel.innerHTML = `
        <div class="wo-panel-head">
            <div>
                <div class="wo-panel-kicker">In-page work order window</div>
                <h3>${isExisting ? wo.id : 'Create Work Order'}</h3>
                <div class="wo-panel-sub">${alert.assetId} · ${draft.workClass}</div>
            </div>
            <button class="wo-close" onclick="closeWorkOrderPanel()">&times;</button>
        </div>
        <div class="wo-panel-body">
            <div class="wo-summary-strip">
                <div class="wo-summary-card">
                    <div class="wo-label">Alert Severity</div>
                    <div class="wo-value"><span class="badge ${badgeClass}" style="font-size:9px">${alert.level.toUpperCase()}</span></div>
                </div>
                <div class="wo-summary-card">
                    <div class="wo-label">Work Class</div>
                    <div class="wo-value">${draft.workClass}</div>
                </div>
                <div class="wo-summary-card">
                    <div class="wo-label">Priority</div>
                    <div class="wo-value">${draft.priority}</div>
                </div>
                <div class="wo-summary-card">
                    <div class="wo-label">SLA</div>
                    <div class="wo-value">${draft.slaHours} hrs</div>
                </div>
                <div class="wo-summary-card">
                    <div class="wo-label">Estimated Repair</div>
                    <div class="wo-value">${draft.estDuration}</div>
                </div>
                <div class="wo-summary-card">
                    <div class="wo-label">Technician</div>
                    <div class="wo-value">${isExisting ? (wo.technician || wo.engineer || 'Unassigned') : draft.technician}</div>
                </div>
            </div>

            <div class="wo-layout">
                <div class="wo-main-column">
                    <div class="wo-detail-section">
                        <div class="wo-section-title">Failure Context</div>
                        <p>${draft.description}</p>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Work Order Details</div>
                        <div class="wo-kv-grid">
                            <div><span class="wo-k">Asset</span><span class="wo-v">${alert.assetId}${draft.asset ? ` · ${DATA.formatAssetType(draft.asset.type)}` : ''}</span></div>
                            <div><span class="wo-k">Plant</span><span class="wo-v">${draft.asset ? draft.asset.site : '—'}</span></div>
                            <div><span class="wo-k">Sensor</span><span class="wo-v">${alert.sensor.replace(/_/g, ' ')}</span></div>
                            <div><span class="wo-k">Trigger</span><span class="wo-v">${draft.trigger}</span></div>
                        </div>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Parts / Materials</div>
                        <p>${isExisting ? (wo.spareParts && wo.spareParts.length ? wo.spareParts.join(', ') : 'Not assigned yet') : draft.failure.description}</p>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Operational Notes</div>
                        <p>${alert.anomalyScore >= 0.85 ? 'Escalate immediately. Put the asset in safe operating mode and notify maintenance supervision.' : 'Schedule inspection during the next maintenance window and monitor the anomaly trend.'}</p>
                    </div>
                </div>

                <div class="wo-side-column">
                    <div class="wo-detail-section">
                        <div class="wo-section-title">Recommended Scope</div>
                        <div class="wo-chip-row">
                            <span class="chip navy">${draft.workClass}</span>
                            <span class="chip blue">${draft.scope}</span>
                            <span class="chip amber">${draft.faultType.replace(/_/g, ' ')}</span>
                        </div>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Priority Summary</div>
                        <div class="wo-side-stat">
                            <div class="wo-side-stat-label">Alert Score</div>
                            <div class="wo-side-stat-value">${alert.anomalyScore.toFixed(2)}</div>
                        </div>
                        <div class="wo-side-stat">
                            <div class="wo-side-stat-label">RUL</div>
                            <div class="wo-side-stat-value">${draft.state ? `${draft.state.rulDays} days` : '—'}</div>
                        </div>
                        <div class="wo-side-stat">
                            <div class="wo-side-stat-label">Cost Impact</div>
                            <div class="wo-side-stat-value">${APP.formatCurrency(draft.failure.cost || 0)}</div>
                        </div>
                    </div>

                    <div class="wo-detail-section">
                        <div class="wo-section-title">Action</div>
                        <div class="wo-actions compact">
                            ${isExisting ? '<button class="btn btn-primary" onclick="window.location.href=\'maintenance.html\'">Open Maintenance Registry</button>' : `<button class="btn btn-primary" onclick="createWorkOrder(null, '${alert.id}')">Create Work Order</button>`}
                            <button class="btn btn-secondary" onclick="closeWorkOrderPanel()">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    overlay.hidden = false;
}

function initAnomalyCharts() {
    // Heatmap
    const critAssets = DATA.assets.filter(a => {
        const s = DATA.getAssetState(a.id);
        return s.status === 'Critical' || s.status === 'Warning';
    }).slice(0, 8);
    const sensors = ['vibration_rms', 'bearing_temp', 'winding_temp', 'motor_current', 'discharge_press'];
    const heatData = critAssets.map(a => {
        const s = DATA.getAssetState(a.id);
        return sensors.map(() => +(s.anomalyScore * (0.5 + Math.random() * 0.8)).toFixed(2));
    });
    CHARTS.createHeatmapGrid('anomalyHeatmap', critAssets.map(a => a.id), sensors.map(s => s.replace(/_/g, ' ').slice(0, 10)), heatData);

    // Breach by sensor
    const sensorTypeMap = {
        vibration: 'Vibration',
        temp: 'Temperature',
        temperature: 'Temperature',
        current: 'Current',
        pressure: 'Pressure',
        speed: 'Speed',
        flow: 'Flow',
        voltage: 'Voltage',
    };

    const alertBuckets = {};
    DATA.alerts.forEach(a => {
        const sensorKey = a.sensor.toLowerCase();
        const sensorType = Object.keys(sensorTypeMap).find(key => sensorKey.includes(key)) || 'Other';
        const displayType = sensorTypeMap[sensorType] || 'Other';

        if (!alertBuckets[displayType]) {
            alertBuckets[displayType] = { Critical: 0, Warning: 0 };
        }
        if (a.level === 'Critical') alertBuckets[displayType].Critical += 1;
        if (a.level === 'Warning') alertBuckets[displayType].Warning += 1;
    });

    const sortedTypes = Object.entries(alertBuckets).sort((a, b) => (b[1].Critical + b[1].Warning) - (a[1].Critical + a[1].Warning));
    CHARTS.createStackedBar('breachChart',
        sortedTypes.map(s => s[0]),
        [
            {
                label: 'Critical Alerts',
                data: sortedTypes.map(s => s[1].Critical),
                color: CHARTS.COLORS.red,
            },
            {
                label: 'Warning Alerts',
                data: sortedTypes.map(s => s[1].Warning),
                color: CHARTS.COLORS.amber,
            }
        ],
        { plugins: { legend: { display: true } } }
    );

    // Recurring
    const failureCounts = {};
    DATA.scenarioEvents.filter(e => e.failureMode).forEach(e => { failureCounts[e.failureMode] = (failureCounts[e.failureMode] || 0) + 1; });
    const sortedFailures = Object.entries(failureCounts).sort((a, b) => b[1] - a[1]);
    CHARTS.createHorizontalBar('recurringChart',
        sortedFailures.map(f => f[0].replace(/_/g, ' ')),
        [{ label: 'Occurrences', data: sortedFailures.map(f => f[1]), colors: sortedFailures.map((f, i) => CHARTS.PALETTE[i]) }],
        { plugins: { legend: { display: false } } }
    );
}

function createWorkOrder(btn, alertId) {
    const alert = DATA.alerts.find(a => a.id === (alertId || activeAnomalyAlertId));
    if (!alert) return;

    if (alert.workOrderId) {
        renderWorkOrderPanel(alert.id);
        return;
    }

    const existingCount = DATA.workOrders.length + 1;
    const seq = String(existingCount).padStart(3, '0');
    const woId = `WO-${alert.assetId}-${seq}`;
    const draft = buildWorkOrderDraft(alert);

    const priority = draft.priority;

    const now = new Date().toISOString();
    const newWO = {
        id: woId,
        assetId: alert.assetId,
        created: now,
        date: now,
        closed: null,
        priority,
        status: 'Open',
        trigger: 'AI Alert',
        type: 'Corrective',
        workClass: draft.workClass,
        description: draft.description,
        faultType: draft.faultType,
        technician: draft.technician,
        engineer: draft.technician,
        estDuration: draft.estDuration,
        cost: 0,
        slaHours: priority === 'P1' ? 12 : 24,
        spareParts: [],
        scope: draft.scope,
        rootCause: alert.reason,
    };

    DATA.workOrders.push(newWO);
    alert.workOrderId = woId;

    const item = btn ? btn.closest('.alert-item') : document.querySelector(`.alert-item[data-alert-id="${alert.id}"]`);
    if (item) {
        const badgeHtml = `<button class="badge badge-warning anomaly-wo-chip" style="font-size:9.5px; padding:4px 8px; border:1px solid var(--amber-border); background:var(--amber-lt); color:var(--amber); cursor:pointer;" onclick="openWorkOrderPanel('${alert.id}')"><i class="fas fa-clipboard-list"></i> ${woId}</button>`;
        const controlDiv = item.querySelector('div:last-child');
        if (controlDiv) {
            const woBtn = controlDiv.querySelector('.anomaly-create-wo-btn') || controlDiv.querySelector('button.btn-primary');
            if (woBtn) woBtn.remove();
            if (!controlDiv.querySelector('.anomaly-wo-chip')) {
                controlDiv.insertAdjacentHTML('afterbegin', badgeHtml);
            }
        }
    }

    if (btn) btn.disabled = true;
    activeAnomalyAlertId = alert.id;
    renderWorkOrderPanel(alert.id);
    if (typeof refreshMaintenance === 'function') refreshMaintenance();
}
