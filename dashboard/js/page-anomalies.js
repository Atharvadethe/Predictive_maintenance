/* ===================================================================
   PAGE-ANOMALIES.JS — Anomaly Detection & Alert Center
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    APP.initLayout();
    renderAnomalyPage();
});

function renderAnomalyPage() {
    const content = document.getElementById('pageContent');
    const critAlerts = DATA.alerts.filter(a => a.level === 'Critical');
    const warnAlerts = DATA.alerts.filter(a => a.level === 'Warning');
    const unack = DATA.alerts.filter(a => !a.acknowledged);

    content.innerHTML = `
        ${APP.renderPageHeader('Anomaly Detection & Alert Center', 'Real-time alert monitoring, severity analysis, and threshold breach tracking')}

        <!-- Severity Counters -->
        <div class="grid grid-4 mb-5 stagger">
            <div class="kpi-card red">
                <div class="kpi-top">
                    <div><div class="kpi-label">Critical Alerts</div><div class="kpi-value">${critAlerts.length}</div></div>
                    <div class="card-icon" style="background:var(--red-bg);color:var(--red)"><i class="fas fa-exclamation-circle"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">${critAlerts.filter(a=>!a.acknowledged).length} unacknowledged</span></div>
            </div>
            <div class="kpi-card amber">
                <div class="kpi-top">
                    <div><div class="kpi-label">Warning Alerts</div><div class="kpi-value">${warnAlerts.length}</div></div>
                    <div class="card-icon" style="background:var(--amber-bg);color:var(--amber)"><i class="fas fa-exclamation-triangle"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">${warnAlerts.filter(a=>!a.acknowledged).length} unacknowledged</span></div>
            </div>
            <div class="kpi-card blue">
                <div class="kpi-top">
                    <div><div class="kpi-label">Total Alerts</div><div class="kpi-value">${DATA.alerts.length}</div></div>
                    <div class="card-icon" style="background:var(--blue-bg);color:var(--blue)"><i class="fas fa-bell"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Last 30 days</span></div>
            </div>
            <div class="kpi-card purple">
                <div class="kpi-top">
                    <div><div class="kpi-label">Unacknowledged</div><div class="kpi-value">${unack.length}</div></div>
                    <div class="card-icon" style="background:rgba(139,92,246,0.12);color:var(--purple)"><i class="fas fa-clock"></i></div>
                </div>
                <div class="kpi-footer"><span class="text-xs text-muted">Requires attention</span></div>
            </div>
        </div>

        <div class="grid grid-3 mb-5">
            <!-- Real-time Alert Feed -->
            <div class="card" style="grid-column:span 2">
                <div class="card-header">
                    <span class="card-title">Real-time Alert Feed</span>
                    <span class="live-indicator"><span class="live-dot"></span>Live</span>
                </div>
                <div class="alert-feed" style="max-height:340px">
                    ${DATA.alerts.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map(a => `
                        <div class="alert-item" style="${!a.acknowledged ? 'border-left:3px solid ' + (a.level === 'Critical' ? 'var(--red)' : 'var(--amber)') : ''}">
                            <div class="alert-icon ${a.level.toLowerCase()}">
                                <i class="fas ${a.level === 'Critical' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i>
                            </div>
                            <div class="alert-content">
                                <p><strong style="color:var(--text-primary)">${a.assetId}</strong> — ${a.reason}</p>
                                <div class="alert-meta">
                                    <span><i class="fas fa-clock"></i> ${APP.formatDateTime(a.timestamp)}</span>
                                    <span>Sensor: ${a.sensor}</span>
                                    <span>Score: <span style="color:${a.anomalyScore >= 0.85 ? 'var(--red)' : 'var(--amber)'}; font-weight:600">${a.anomalyScore.toFixed(2)}</span></span>
                                </div>
                            </div>
                            <div>
                                ${a.acknowledged
                                    ? '<span class="badge badge-healthy" style="font-size:9px"><i class="fas fa-check"></i> ACK</span>'
                                    : '<button class="btn btn-sm btn-danger" onclick="ackAlert(this)"><i class="fas fa-check"></i></button>'}
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
                <div class="timeline" style="max-height:340px;overflow-y:auto;padding-top:8px">
                    ${DATA.alerts.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0,10).map(a => `
                        <div class="timeline-item">
                            <div class="timeline-dot ${a.level.toLowerCase()}"></div>
                            <div class="timeline-time">${APP.formatDateTime(a.timestamp)}</div>
                            <div class="timeline-text"><strong>${a.assetId}</strong> — ${a.level}: ${a.sensor.replace(/_/g,' ')}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="grid grid-2 mb-5">
            <!-- Sensor Anomaly Heatmap -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Sensor Anomaly Heatmap</span>
                    <span class="text-xs text-muted">Asset × Sensor Contribution</span>
                </div>
                <div class="heatmap-grid" id="anomalyHeatmap" style="padding:8px"></div>
            </div>

            <!-- Threshold Breach Analysis -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Alert Distribution by Sensor Type</span>
                </div>
                <div class="chart-container" style="height:280px">
                    <canvas id="breachChart"></canvas>
                </div>
            </div>
        </div>

        <div class="grid grid-2 mb-5">
            <!-- Top Recurring Anomalies -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Top Recurring Anomalies</span>
                </div>
                <div class="chart-container" style="height:260px">
                    <canvas id="recurringChart"></canvas>
                </div>
            </div>

            <!-- Alert Escalation Workflow -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Alert Escalation Pipeline</span>
                </div>
                <div style="display:flex;gap:12px;margin-top:16px;align-items:stretch">
                    ${escalationStep('Detected', DATA.alerts.length, 'fa-radar', 'blue')}
                    <div style="display:flex;align-items:center;color:var(--text-disabled)"><i class="fas fa-chevron-right"></i></div>
                    ${escalationStep('Acknowledged', DATA.alerts.filter(a=>a.acknowledged).length, 'fa-check', 'amber')}
                    <div style="display:flex;align-items:center;color:var(--text-disabled)"><i class="fas fa-chevron-right"></i></div>
                    ${escalationStep('WO Created', DATA.alerts.filter(a=>a.workOrderId).length, 'fa-clipboard', 'purple')}
                    <div style="display:flex;align-items:center;color:var(--text-disabled)"><i class="fas fa-chevron-right"></i></div>
                    ${escalationStep('Resolved', DATA.workOrders.filter(w=>w.status==='Closed').length, 'fa-check-circle', 'green')}
                </div>
                <!-- Anomaly Score Distribution -->
                <div style="margin-top:24px">
                    <div class="card-title" style="margin-bottom:12px">Anomaly Score Thresholds</div>
                    <div class="flex flex-col gap-3">
                        <div class="stat-row">
                            <span class="stat-label"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--green);margin-right:6px"></span>Normal (< 0.55)</span>
                            <span class="stat-value text-green">${DATA.assets.filter(a=>DATA.getAssetState(a.id).anomalyScore<0.55).length} assets</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--amber);margin-right:6px"></span>Warning (≥ 0.55)</span>
                            <span class="stat-value text-amber">${DATA.assets.filter(a=>{const s=DATA.getAssetState(a.id).anomalyScore;return s>=0.55&&s<0.85;}).length} assets</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:var(--red);margin-right:6px"></span>Critical (≥ 0.85)</span>
                            <span class="stat-value text-red">${DATA.assets.filter(a=>DATA.getAssetState(a.id).anomalyScore>=0.85).length} assets</span>
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
            <div class="table-container" style="max-height:400px;overflow-y:auto">
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
                        ${DATA.alerts.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map(a => {
                            const action = a.anomalyScore >= 0.85 ? 'Create Work Order — Emergency' : 'Schedule Inspection';
                            return `
                            <tr>
                                <td class="mono" style="font-size:11px">${a.id}</td>
                                <td class="text-xs">${APP.formatDateTime(a.timestamp)}</td>
                                <td class="mono" style="font-weight:600;color:var(--text-primary)">${a.assetId}</td>
                                <td>${APP.createStatusBadge(a.level === 'Critical' ? 'Critical' : 'Warning')}</td>
                                <td>${a.sensor.replace(/_/g,' ')}</td>
                                <td><span class="mono" style="color:${a.anomalyScore >= 0.85 ? 'var(--red)' : 'var(--amber)'}; font-weight:600">${a.anomalyScore.toFixed(2)}</span></td>
                                <td>${a.acknowledged ? '<span class="text-green text-xs">Acknowledged</span>' : '<span class="text-amber text-xs">Pending</span>'}</td>
                                <td class="text-xs">${action}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    initAnomalyCharts();
}

function escalationStep(label, count, icon, color) {
    return `
        <div style="flex:1;background:var(--bg-elevated);border-radius:var(--radius-md);padding:16px;text-align:center">
            <div style="width:36px;height:36px;margin:0 auto 8px;border-radius:50%;background:var(--${color}-bg);color:var(--${color});display:flex;align-items:center;justify-content:center;font-size:14px">
                <i class="fas ${icon}"></i>
            </div>
            <div style="font-family:var(--font-mono);font-size:20px;font-weight:700;color:var(--text-primary)">${count}</div>
            <div class="text-xs text-muted">${label}</div>
        </div>
    `;
}

function ackAlert(btn) {
    const item = btn.closest('.alert-item');
    item.style.borderLeft = 'none';
    btn.outerHTML = '<span class="badge badge-healthy" style="font-size:9px"><i class="fas fa-check"></i> ACK</span>';
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
    CHARTS.createHeatmapGrid('anomalyHeatmap', critAssets.map(a => a.id), sensors.map(s => s.replace(/_/g,' ').slice(0,10)), heatData);

    // Breach by sensor
    const sensorCounts = {};
    DATA.alerts.forEach(a => { sensorCounts[a.sensor] = (sensorCounts[a.sensor] || 0) + 1; });
    const sortedSensors = Object.entries(sensorCounts).sort((a,b) => b[1] - a[1]);
    CHARTS.createBarChart('breachChart',
        sortedSensors.map(s => s[0].replace(/_/g,' ')),
        [{ label: 'Alert Count', data: sortedSensors.map(s => s[1]), colors: sortedSensors.map((s,i) => CHARTS.PALETTE[i % CHARTS.PALETTE.length]) }],
        { plugins: { legend: { display: false } } }
    );

    // Recurring
    const failureCounts = {};
    DATA.scenarioEvents.filter(e => e.failureMode).forEach(e => { failureCounts[e.failureMode] = (failureCounts[e.failureMode] || 0) + 1; });
    const sortedFailures = Object.entries(failureCounts).sort((a,b) => b[1] - a[1]);
    CHARTS.createHorizontalBar('recurringChart',
        sortedFailures.map(f => f[0].replace(/_/g,' ')),
        [{ label: 'Occurrences', data: sortedFailures.map(f => f[1]), colors: sortedFailures.map((f,i) => CHARTS.PALETTE[i]) }],
        { plugins: { legend: { display: false } } }
    );
}
