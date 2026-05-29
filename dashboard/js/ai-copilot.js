/* ===================================================================
    ASK-AI.JS — Industrial 'Ask AI' Assistant
    Frontend-only rule engine over the existing dashboard datasets
    =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    APP.initLayout();
    COPILOT.init();
});

const COPILOT = (() => {
    const SIM_NOW = new Date('2026-04-22T18:00:00Z');

    const quickQuestions = [
        'Which assets are critical right now?',
        'Why was a work order created for Compressor-03?',
        'What are the top anomaly causes today?',
        'Which plant has lowest health score?',
        'What failures are expected next week?',
        'What is the impact of delaying maintenance?',
        'Show me risky assets with low RUL',
        'Give maintenance priorities for this week',
    ];

    const state = {
        messages: [],
        isTyping: false,
        latestResponse: null,
    };

    function init() {
        renderPage();
        state.messages = [buildMessage('ai', 'I am the Industrial Predictive Maintenance assistant — Ask AI. Ask me about asset health, anomaly causes, RUL, work orders, plant performance, SLA risk, or maintenance priorities. I will correlate the live dashboard data and explain the operational and business impact.' , {
            severity: 'info',
            confidence: 96,
        })];
        state.latestResponse = buildDefaultResponse();
        wireEvents();
        renderSuggestions();
        renderMessages();
        renderContextPanel(state.latestResponse);
    }

    function renderPage() {
        const content = document.getElementById('pageContent');
        content.classList.add('copilot-compact');
        content.innerHTML = `
            ${APP.renderPageHeader('Ask AI', 'Industrial Predictive Maintenance assistant for assets, anomalies, RUL, alerts, work orders, KPIs, and operational decisions')}

            <div class="copilot-shell">
                <section class="copilot-panel copilot-chat">
                    <div class="copilot-chat-header">
                        <div class="copilot-title">
                            <h3>Ask AI — Industrial Assistant</h3>
                            <p>Rule-based reasoning over the same dashboard datasets used across the PdM platform.</p>
                        </div>
                        <div class="copilot-status">
                            <span class="status-pill online"><i class="fas fa-circle" style="font-size:8px"></i> Online</span>
                            <span class="status-pill monitoring"><i class="fas fa-satellite-dish"></i> Monitoring</span>
                            <button class="btn btn-sm btn-secondary" id="clearConversationBtn"><i class="fas fa-broom"></i> Clear</button>
                            <button class="btn btn-sm btn-primary" id="exportConversationBtn"><i class="fas fa-file-export"></i> Export</button>
                        </div>
                    </div>

                    <div class="copilot-chat-body">
                        <div class="copilot-suggestions" id="suggestionChips"></div>
                        <div class="copilot-history" id="chatHistory"></div>
                    </div>

                    <div class="copilot-input">
                        <div class="copilot-composer">
                            <textarea id="copilotInput" placeholder="Ask about critical assets, anomaly causes, upcoming failures, work orders, plant health, or maintenance priorities..."></textarea>
                            <button class="btn btn-primary" id="sendMessageBtn"><i class="fas fa-paper-plane"></i> Send</button>
                        </div>
                    </div>
                </section>

                <aside class="copilot-panel copilot-context">
                    <div class="copilot-context-header">
                        <div class="copilot-title">
                            <h3>AI Insights / Context</h3>
                            <p>Real-time fleet posture and explainable recommendations.</p>
                        </div>
                        <span class="confidence-pill" id="confidenceBadge">AI Confidence 96%</span>
                    </div>
                    <div class="copilot-context-body" id="contextPanel"></div>
                </aside>
            </div>
        `;
    }

    function wireEvents() {
        document.getElementById('sendMessageBtn').addEventListener('click', () => {
            submitMessage();
        });

        const input = document.getElementById('copilotInput');
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submitMessage();
            }
        });

        document.getElementById('clearConversationBtn').addEventListener('click', clearConversation);
        document.getElementById('exportConversationBtn').addEventListener('click', exportConversation);

        document.getElementById('suggestionChips').addEventListener('click', (event) => {
            const btn = event.target.closest('button[data-question]');
            if (!btn) return;
            submitMessage(btn.dataset.question);
        });
    }

    function renderSuggestions() {
        const container = document.getElementById('suggestionChips');
        container.innerHTML = quickQuestions.map(question => `
            <button class="copilot-chip" data-question="${escapeHtml(question)}">${escapeHtml(question)}</button>
        `).join('');
    }

    function renderMessages() {
        const history = document.getElementById('chatHistory');
        const typingMarkup = state.isTyping ? `
            <div class="copilot-message ai">
                <div class="copilot-bubble"><span class="copilot-typing"><span></span><span></span><span></span></span></div>
                <div class="copilot-meta"><span>AI is analyzing telemetry, alerts, and work order history</span></div>
            </div>
        ` : '';

        history.innerHTML = state.messages.map(renderMessage).join('') + typingMarkup;
        history.scrollTop = history.scrollHeight;
    }

    function renderMessage(message) {
        const when = APP.formatDateTime(message.timestamp);
        const severityClass = message.severity ? message.severity.toLowerCase() : 'info';
        if (message.role === 'user') {
            return `
                <div class="copilot-message user">
                    <div class="copilot-bubble">${escapeHtml(message.text)}</div>
                    <div class="copilot-meta"><span>You</span><span>${when}</span></div>
                </div>
            `;
        }

        return `
            <div class="copilot-message ai">
                <div class="copilot-bubble">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;flex-wrap:wrap">
                        <span class="severity-pill ${severityClass}">${escapeHtml((message.severity || 'info').toUpperCase())}</span>
                        <span class="confidence-pill">Confidence ${message.confidence}%</span>
                    </div>
                    <div>${formatLineBreaks(escapeHtml(message.text))}</div>
                </div>
                <div class="copilot-meta"><span>Ask AI</span><span>${when}</span></div>
            </div>
        `;
    }

    function submitMessage(forcedText) {
        const input = document.getElementById('copilotInput');
        const text = (forcedText || input.value || '').trim();
        if (!text || state.isTyping) return;

        state.messages.push(buildMessage('user', text));
        input.value = '';
        state.isTyping = true;
        renderMessages();

        window.setTimeout(() => {
            const response = generateResponse(text);
            state.messages.push(buildMessage('ai', response.text, {
                severity: response.severity,
                confidence: response.confidence,
            }));
            state.latestResponse = response;
            state.isTyping = false;
            renderMessages();
            renderContextPanel(response);
        }, 650);
    }

    function clearConversation() {
        state.messages = [buildMessage('ai', 'Conversation cleared. I am ready for the next maintenance question. Ask about plant health, anomalies, RUL, work orders, or operational risk.', {
            severity: 'info',
            confidence: 95,
        })];
        state.latestResponse = buildDefaultResponse();
        state.isTyping = false;
        renderMessages();
        renderContextPanel(state.latestResponse);
    }

    function exportConversation() {
        const payload = state.messages.map(message => {
            const who = message.role === 'user' ? 'USER' : 'AI';
            return `[${APP.formatDateTime(message.timestamp)}] ${who}: ${message.text}`;
        }).join('\n\n');

        const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `ask-ai-conversation-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }

    function renderContextPanel(response) {
        const confidence = response.confidence || 94;
        document.getElementById('confidenceBadge').textContent = `AI Confidence ${confidence}%`;

        const topRisks = getTopRiskAssets(4);
        const openAlerts = DATA.alerts.filter(alert => !alert.acknowledged);
        const breaches = getSlaBreaches();
        const priorities = response.recommendations.length ? response.recommendations : buildDefaultPriorities();

        document.getElementById('contextPanel').innerHTML = `
            <div class="copilot-metrics">
                <div class="copilot-metric">
                    <div class="label">Fleet Health</div>
                    <div class="value">${DATA.kpis.plantHealthScore.toFixed(1)}</div>
                    <div class="copilot-progress"><span style="width:${DATA.kpis.plantHealthScore}%"></span></div>
                </div>
                <div class="copilot-metric">
                    <div class="label">OEE</div>
                    <div class="value">${DATA.kpis.oee.toFixed(1)}%</div>
                    <div class="label" style="margin-top:8px">Overall equipment effectiveness</div>
                </div>
                <div class="copilot-metric">
                    <div class="label">MTBF</div>
                    <div class="value">${DATA.kpis.mtbf}h</div>
                    <div class="label" style="margin-top:8px">Mean time between failures</div>
                </div>
                <div class="copilot-metric">
                    <div class="label">MTTR</div>
                    <div class="value">${DATA.kpis.mttr.toFixed(1)}h</div>
                    <div class="label" style="margin-top:8px">Mean time to repair</div>
                </div>
                <div class="copilot-metric">
                    <div class="label">Active WOs</div>
                    <div class="value">${DATA.kpis.activeWorkOrders}</div>
                    <div class="label" style="margin-top:8px">Open maintenance workload</div>
                </div>
                <div class="copilot-metric">
                    <div class="label">Avg RUL</div>
                    <div class="value">${DATA.kpis.avgRul}d</div>
                    <div class="label" style="margin-top:8px">Remaining useful life</div>
                </div>
            </div>

            <div class="copilot-explain">
                <h4>Risk Snapshot</h4>
                <p>${escapeHtml(response.summary)}</p>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
                    <span class="risk-pill ${response.riskImpact.toLowerCase()}">Impact: ${escapeHtml(response.riskImpact)}</span>
                    <span class="severity-pill ${response.severity.toLowerCase()}">Severity: ${escapeHtml(response.severity)}</span>
                    <span class="confidence-pill">Confidence ${confidence}%</span>
                </div>
                <div style="margin-top:12px;font-size:11px;color:var(--text-secondary)">Downtime risk: ${escapeHtml(response.downtimeRisk)} | Maintenance cost implication: ${escapeHtml(response.costImplication)}</div>
            </div>

            <div>
                <div class="copilot-section-title">Recommended Actions</div>
                <div class="copilot-list">
                    ${priorities.map((item, index) => `
                        <div class="copilot-list-item">
                            <div class="rank">${index + 1}</div>
                            <div class="body">
                                <strong>${escapeHtml(item.title)}</strong>
                                <span>${escapeHtml(item.detail)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div>
                <div class="copilot-section-title">Explainable AI</div>
                <div class="copilot-explain">
                    <h4>Why this recommendation?</h4>
                    <p>${escapeHtml(response.explanation)}</p>
                </div>
            </div>

            <div>
                <div class="copilot-section-title">High-Risk Assets</div>
                <div class="copilot-list">
                    ${topRisks.map((asset, index) => {
                        const state = DATA.getAssetState(asset.id);
                        const metrics = buildAssetSummary(asset);
                        return `
                            <div class="copilot-list-item">
                                <div class="rank">${index + 1}</div>
                                <div class="body">
                                    <strong>${asset.id} · ${DATA.formatAssetType(asset.type)} · ${state.status}</strong>
                                    <span>Health ${state.healthIndex.toFixed(1)} | RUL ${state.rulDays.toFixed(1)} days | Alerts ${metrics.alertCount} | WOs ${metrics.workOrderCount}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="copilot-disclaimer">
                Simulated AI for demo purposes only. Recommendations are generated from rule-based correlations across assets, alerts, telemetry, work orders, threshold rules, and KPI datasets. No external model or backend is used.
            </div>
        `;
    }

    function generateResponse(query) {
        const asset = findAssetFromQuery(query);
        const normalized = normalize(query);

        if (asset && /why|work order|created|alert|rul|health|maintenance|anomal|failure/.test(normalized)) {
            return buildAssetDeepDive(asset, query);
        }

        if (/(critical assets|critical right now|immediate attention|risky assets|low rul|upcoming failures|next week|likely to fail)/.test(normalized)) {
            return buildCriticalAssetsResponse();
        }

        if (/(work order|wo |sla|breach|approved|rejected|open wos|maintenance actions)/.test(normalized)) {
            return buildWorkOrderResponse(asset, query);
        }

        if (/(anomaly causes|top anomaly|sensor.*anomal|which sensors|recent critical alerts|what caused)/.test(normalized)) {
            return buildAnomalyResponse();
        }

        if (/(which plant|lowest health|plant performance|why.*health|plant health decreasing)/.test(normalized)) {
            return buildPlantResponse();
        }

        if (/(impact of delaying maintenance|delay maintenance|business impact|downtime impact)/.test(normalized)) {
            return buildDelayImpactResponse(asset);
        }

        if (/(kpi|oee|mtbf|mttr|downtime)/.test(normalized)) {
            return buildKpiResponse();
        }

        if (/(rul|remaining useful life|failure prediction|expected failures)/.test(normalized)) {
            return buildUpcomingFailureResponse();
        }

        if (/(priorities for this week|maintenance priorities|prioritize|actions should be prioritized|what maintenance actions)/.test(normalized)) {
            return buildPriorityResponse();
        }

        return buildDefaultResponse(query);
    }

    function buildAssetDeepDive(asset, query) {
        const state = DATA.getAssetState(asset.id);
        const alerts = DATA.getAlertsForAsset(asset.id).slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const workOrders = DATA.getWorkOrdersForAsset(asset.id).slice().sort((a, b) => new Date(b.created) - new Date(a.created));
        const failureInfo = DATA.failureModes[state.failureMode] || DATA.failureModes[asset.failureMode] || null;
        const anomalySignal = Math.round(state.anomalyScore * 100);
        const latestAlert = alerts[0];
        const latestWO = workOrders[0];
        const riskImpact = deriveRiskImpact(state.healthIndex, state.rulDays, anomalySignal, asset.criticality);
        const confidence = Math.min(99, 88 + Math.round(anomalySignal / 8));

        const recommendations = [];
        if (state.healthIndex < 50 && state.rulDays < 7) {
            recommendations.push({ title: 'Immediate maintenance', detail: `${asset.id} meets the escalation rule: health below 50 and RUL below 7 days. Execute corrective intervention now.` });
        } else if (state.healthIndex < 70 || state.rulDays < 14) {
            recommendations.push({ title: 'Schedule within 72 hours', detail: `${asset.id} is in a degraded zone and should be reserved for a high-priority maintenance slot.` });
        }
        if (latestWO && latestWO.status !== 'Closed') {
            recommendations.push({ title: 'Work order follow-up', detail: `${latestWO.id} is currently ${latestWO.status}. Confirm parts availability, assignment, and SLA timer.` });
        }
        if (alerts.length > 1) {
            recommendations.push({ title: 'Recurring anomaly review', detail: `${asset.id} has ${alerts.length} alerts. Repeated alerts indicate an unresolved failure mechanism or incomplete repair.` });
        }

        const explanation = [
            `${asset.id} is a ${asset.criticality.toLowerCase()} criticality ${DATA.formatAssetType(asset.type).toLowerCase()} at ${asset.site}.`,
            `The current health index is ${state.healthIndex.toFixed(1)} with RUL ${state.rulDays.toFixed(1)} days and anomaly score ${state.anomalyScore.toFixed(3)}.`,
            latestAlert ? `The latest alert was ${latestAlert.level.toLowerCase()} on ${APP.formatDateTime(latestAlert.timestamp)} from ${latestAlert.sensor}, pointing to ${latestAlert.reason}.` : 'No recent alerts were found for this asset.',
            latestWO ? `The latest work order ${latestWO.id} is ${latestWO.status.toLowerCase()} and provides a maintenance trail that should be checked against the current failure signature.` : 'No work order exists yet, so the asset remains exposed to risk without a formal mitigation path.',
            failureInfo ? `The dominant failure mode is ${failureInfo.label} with a typical MTTR of ${failureInfo.mttr} hours and cost exposure of ${APP.formatCurrency(failureInfo.cost)}.` : 'No dominant failure mode is mapped for this asset, so the recommendation is based on live condition signals.',
        ].join(' ');

        return {
            title: `Asset deep dive for ${asset.id}`,
            text: [
                `${asset.id} is a ${state.status.toLowerCase()} asset with health ${state.healthIndex.toFixed(1)} and RUL ${state.rulDays.toFixed(1)} days.`,
                latestAlert ? `Latest alert: ${latestAlert.level} on ${APP.formatDateTime(latestAlert.timestamp)} driven by ${latestAlert.sensor} (${latestAlert.anomalyScore.toFixed(2)} score).` : 'No recent alerts are associated with this asset.',
                latestWO ? `Work order trail: ${latestWO.id} is ${latestWO.status} with SLA ${latestWO.slaHours} hours.` : 'No active work order exists for this asset.',
                failureInfo ? `Probable mechanism: ${failureInfo.label} (${failureInfo.description})` : 'Failure mechanism is inferred from live telemetry and alert history.',
                `Recommendation: ${recommendations[0]?.detail || 'Investigate condition trends and schedule a focused inspection.'}`,
            ].join('\n'),
            severity: state.status === 'Critical' ? 'critical' : state.status === 'Warning' ? 'warning' : 'info',
            confidence,
            riskImpact,
            downtimeRisk: state.rulDays < 7 ? 'High' : state.rulDays < 20 ? 'Medium' : 'Low',
            costImplication: failureInfo ? `${APP.formatCurrency(failureInfo.cost)} direct repair exposure` : `${APP.formatCurrency(Math.round((100 - state.healthIndex) * 180))} inferred exposure`,
            summary: `${asset.id} is the right candidate for immediate review because health degradation, anomaly intensity, and remaining useful life are converging.`,
            explanation,
            recommendations,
            assets: [buildAssetSummary(asset)],
        };
    }

    function buildCriticalAssetsResponse() {
        const assets = getTopRiskAssets(5).filter(asset => {
            const state = DATA.getAssetState(asset.id);
            return state.status === 'Critical' || state.rulDays <= 7 || state.healthIndex < 50;
        });
        const lines = assets.map((asset, index) => {
            const state = DATA.getAssetState(asset.id);
            return `${index + 1}. ${asset.id} at ${asset.site}: health ${state.healthIndex.toFixed(1)}, RUL ${state.rulDays.toFixed(1)} days, anomaly score ${state.anomalyScore.toFixed(3)}.`;
        });

        return {
            title: 'Critical assets snapshot',
            text: [
                `The highest-risk assets are the ones below because they already combine low health, short RUL, and elevated anomaly scores.`,
                ...lines,
                'Priority action: isolate the most critical equipment first, verify spare parts, and schedule the emergency jobs before the next production window.',
            ].join('\n'),
            severity: 'critical',
            confidence: 95,
            riskImpact: 'High',
            downtimeRisk: 'High',
            costImplication: 'High unplanned downtime exposure across multiple work centers',
            summary: `${assets.length} assets are in the immediate attention zone and should be treated as production risks, not routine observations.`,
            explanation: 'The copilot ranks assets by a combined rule set using health index, RUL, anomaly score, status, and alert/work order history. Assets under 50 health or under 7 days RUL receive emergency priority.',
            recommendations: buildPriorityRecommendations(assets),
            assets: assets.map(buildAssetSummary),
        };
    }

    function buildWorkOrderResponse(asset) {
        const targetAssets = asset ? [asset] : getTopRiskAssets(4);
        const openOrders = DATA.workOrders.filter(order => order.status !== 'Closed');
        const overdueOrders = getSlaBreaches();
        const messages = [];

        if (asset) {
            const alerts = DATA.getAlertsForAsset(asset.id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const latestAlert = alerts[0];
            messages.push(`The work order for ${asset.id} exists because the alert chain shows ${alerts.length} alert(s) tied to ${asset.id} and the asset is trending toward a maintenance threshold.`);
            if (latestAlert) {
                messages.push(`Latest alert context: ${latestAlert.level} on ${APP.formatDateTime(latestAlert.timestamp)} due to ${latestAlert.reason}.`);
            }
        } else {
            messages.push(`Open work orders are concentrated on assets that combine short RUL, unresolved alerts, and high criticality.`);
        }

        messages.push(`There are ${openOrders.length} active work orders and ${overdueOrders.length} likely SLA breaches in the current simulation window.`);

        return {
            title: asset ? `Why was a work order created for ${asset.id}?` : 'Work order and SLA posture',
            text: messages.join('\n'),
            severity: overdueOrders.length ? 'warning' : 'info',
            confidence: asset ? 94 : 90,
            riskImpact: overdueOrders.length ? 'High' : 'Medium',
            downtimeRisk: overdueOrders.length ? 'High' : 'Medium',
            costImplication: overdueOrders.length ? 'Rising labor and downtime exposure from delayed closure' : 'Moderate maintenance spend with controlled execution risk',
            summary: asset
                ? `${asset.id} needs a work order because the alert history and current condition data are aligned with a corrective intervention path.`
                : 'The maintenance portfolio is active, and the main risk is not the lack of work orders but their timely approval and closure.',
            explanation: asset
                ? `The work order exists because the asset is accumulating alerts, RUL pressure, and condition anomalies. When those signals align, the recommended action is to convert the alert into a controlled maintenance job.`
                : `Open work orders are evaluated against SLA hours. Any item beyond its target window is flagged because delayed closure increases exposure to unplanned downtime and secondary damage.`,
            recommendations: asset ? [
                { title: 'Approve or prioritize', detail: `Move ${asset.id} into the next maintenance slot and confirm parts before the failure window closes.` },
                { title: 'Check recurrence', detail: `Compare the active alert trail to prior repairs to verify the original fault was fully removed.` },
            ] : buildDefaultPriorities(),
            assets: targetAssets.map(buildAssetSummary),
        };
    }

    function buildAnomalyResponse() {
        const sensorCounts = countAlertsBySensor();
        const topSensors = Object.entries(sensorCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
        const criticalAlerts = DATA.alerts.filter(alert => alert.level === 'Critical');
        const topCauses = topSensors.map(([sensor, count]) => `${sensor.replace(/_/g, ' ')} (${count} alerts)`).join(', ');

        return {
            title: 'Top anomaly causes today',
            text: [
                `The dominant anomaly drivers today are ${topCauses}.`,
                `There are ${criticalAlerts.length} critical alerts in the feed, so the anomaly problem is not isolated; it is affecting multiple sensors and equipment classes.`,
                'Action: inspect the sensors that appear repeatedly, validate calibration, and compare them against the failure mode catalog to separate sensor drift from true asset degradation.',
            ].join('\n'),
            severity: 'warning',
            confidence: 92,
            riskImpact: criticalAlerts.length > 5 ? 'High' : 'Medium',
            downtimeRisk: criticalAlerts.length > 5 ? 'High' : 'Medium',
            costImplication: 'Potentially significant if recurring sensor anomalies mask real mechanical degradation',
            summary: 'Anomaly severity is concentrated around vibration, temperature, current, and pressure signals, which usually point to mechanical or electrical degradation rather than random noise.',
            explanation: 'The copilot groups alerts by sensor type and severity. Repeated critical alerts raise the confidence that the underlying issue is a persistent failure pattern rather than a one-off excursion.',
            recommendations: [
                { title: 'Inspect top sensor families', detail: `Focus on ${topSensors.map(([sensor]) => sensor.replace(/_/g, ' ')).join(', ')} first.` },
                { title: 'Cross-check by asset', detail: 'If multiple alerts come from the same asset, treat it as a recurring failure risk rather than separate events.' },
            ],
            assets: getTopRiskAssets(3).map(buildAssetSummary),
        };
    }

    function buildPlantResponse() {
        const plantEntries = Object.entries(DATA.plantKpis).sort((a, b) => a[1].avgHealth - b[1].avgHealth);
        const [lowestPlant, lowestStats] = plantEntries[0];
        const worstAssets = DATA.assets.filter(asset => asset.site === lowestPlant).sort((a, b) => DATA.getAssetState(a.id).healthIndex - DATA.getAssetState(b.id).healthIndex).slice(0, 3);

        return {
            title: 'Lowest health plant analysis',
            text: [
                `${lowestPlant} currently has the lowest average health score at ${lowestStats.avgHealth.toFixed(1)}.`,
                `It carries ${lowestStats.critical} critical assets and ${lowestStats.warning} warning assets, which pulls the fleet average down and raises operational risk.`,
                `The main contributors are ${worstAssets.map(asset => asset.id).join(', ')}. Their combined condition signals are reducing plant reliability and increasing the chance of downtime.`
            ].join('\n'),
            severity: lowestStats.critical > 0 ? 'warning' : 'info',
            confidence: 93,
            riskImpact: lowestStats.critical > 0 ? 'High' : 'Medium',
            downtimeRisk: lowestStats.critical > 0 ? 'High' : 'Medium',
            costImplication: `${APP.formatCurrency(Math.round(lowestStats.critical * 12000 + lowestStats.warning * 4500))} estimated exposure from degraded plant assets`,
            summary: `${lowestPlant} is the weakest plant because its lower health score is being driven by several degraded assets rather than a single outlier.`,
            explanation: 'The plant view combines average health, critical counts, warning counts, and the asset-level health mix. A plant with multiple degraded assets is more fragile than a plant with one isolated issue.',
            recommendations: [
                { title: 'Stabilize the lowest-health assets', detail: `Prioritize ${worstAssets.map(asset => asset.id).join(', ')} before their condition cascades into the rest of the plant.` },
                { title: 'Bundle maintenance windows', detail: 'If possible, combine inspections on the degraded plant to reduce downtime and mobilization cost.' },
            ],
            assets: worstAssets.map(buildAssetSummary),
        };
    }

    function buildDelayImpactResponse(asset) {
        const risks = asset ? [asset] : getTopRiskAssets(4).filter(item => {
            const state = DATA.getAssetState(item.id);
            return state.rulDays < 20 || state.healthIndex < 70;
        });
        const totalCost = risks.reduce((sum, item) => {
            const state = DATA.getAssetState(item.id);
            const failureInfo = DATA.failureModes[state.failureMode] || DATA.failureModes[item.failureMode] || null;
            return sum + (failureInfo ? failureInfo.cost : Math.max(2500, Math.round((100 - state.healthIndex) * 180)));
        }, 0);

        return {
            title: 'Impact of delaying maintenance',
            text: [
                `Delaying maintenance increases the probability of moving from a warning state to an unplanned outage.`,
                `${risks.length} high-risk assets are contributing most of the exposure, and the estimated direct repair / disruption impact is ${APP.formatCurrency(totalCost)} before secondary downtime costs are added.`,
                'Business effect: the longer the delay, the higher the chance of SLA breaches, overtime labor, spare-part rush orders, and production loss.',
            ].join('\n'),
            severity: 'critical',
            confidence: 91,
            riskImpact: 'High',
            downtimeRisk: 'High',
            costImplication: `${APP.formatCurrency(Math.round(totalCost * 1.5))} including likely secondary downtime and expedite premiums`,
            summary: 'Delayed maintenance converts controllable degradation into a higher-cost outage and directly affects uptime, SLA compliance, and production throughput.',
            explanation: 'The copilot estimates impact by combining the asset failure mode cost, health decay, RUL pressure, and the possibility of an SLA breach. When RUL is short, delay has a nonlinear cost curve.',
            recommendations: [
                { title: 'Execute now', detail: 'Move the highest-risk assets into the next maintenance window before the failure cost compounds.' },
                { title: 'Protect production', detail: 'If a delay is unavoidable, isolate the asset, monitor telemetry more frequently, and pre-stage spare parts.' },
            ],
            assets: risks.map(buildAssetSummary),
        };
    }

    function buildKpiResponse() {
        return {
            title: 'KPI summary',
            text: [
                `OEE is ${DATA.kpis.oee.toFixed(1)}%, MTBF is ${DATA.kpis.mtbf} hours, MTTR is ${DATA.kpis.mttr.toFixed(1)} hours, and downtime is ${DATA.kpis.downtimePct.toFixed(1)}%.`,
                `Plant health is ${DATA.kpis.plantHealthScore.toFixed(1)} with ${DATA.kpis.critical} critical assets and ${DATA.kpis.activeWorkOrders} active work orders.`,
                'Interpretation: the operation is healthy enough to keep running, but the current risk distribution justifies proactive maintenance on the weakest assets.',
            ].join('\n'),
            severity: 'info',
            confidence: 97,
            riskImpact: DATA.kpis.critical > 0 ? 'Medium' : 'Low',
            downtimeRisk: DATA.kpis.downtimePct > 4 ? 'Medium' : 'Low',
            costImplication: `${APP.formatCurrency(DATA.kpis.totalMaintenanceCost)} total maintenance spend across active and closed work orders`,
            summary: 'The KPI layer confirms the fleet is operating with strong OEE and MTBF, but the risk concentration is uneven across assets and plants.',
            explanation: 'The KPI answers are pulled from the same dashboard metrics used in the executive overview and maintenance views, then interpreted against current alerts and work orders.',
            recommendations: buildDefaultPriorities(),
            assets: getTopRiskAssets(3).map(buildAssetSummary),
        };
    }

    function buildUpcomingFailureResponse() {
        const assets = DATA.assets
            .map(asset => ({ asset, state: DATA.getAssetState(asset.id) }))
            .filter(item => item.state.rulDays <= 7 || item.state.status === 'Critical')
            .sort((a, b) => a.state.rulDays - b.state.rulDays)
            .slice(0, 5)
            .map(item => item.asset);

        return {
            title: 'Expected failures next week',
            text: [
                `The assets most likely to fail in the next 7 days are ${assets.map(asset => asset.id).join(', ')}.`,
                'They are already in the failure-imminent band, which means the recommended action is to stop treating them as future risk and move them into immediate work order execution.',
                'The business logic behind this answer is short RUL combined with elevated anomaly scores and low health indices.',
            ].join('\n'),
            severity: 'critical',
            confidence: 95,
            riskImpact: 'High',
            downtimeRisk: 'High',
            costImplication: 'High outage exposure if these assets are left on production load',
            summary: 'The next-week failure horizon is dominated by assets that have already crossed the warning boundary and are moving toward a controlled shutdown or emergency intervention.',
            explanation: 'The forecast uses the simulated RUL field, health index, anomaly score, and current status. Assets below 7 days RUL or in the critical band are considered imminent failure candidates.',
            recommendations: [
                { title: 'Issue work orders now', detail: 'Create or approve work orders for imminent assets before the next production cycle.' },
                { title: 'Pre-stage spares', detail: 'Verify spare parts, maintenance windows, and assignment coverage immediately.' },
            ],
            assets: assets.map(buildAssetSummary),
        };
    }

    function buildPriorityResponse() {
        const candidates = getTopRiskAssets(6);
        return {
            title: 'Maintenance priorities for this week',
            text: [
                'Prioritize assets by a combined score of low health, low RUL, repeated alerts, and criticality.',
                'Top priority assets should be handled first, then warning assets with recurring sensor patterns, and finally routine checks on the remaining degraded equipment.',
                'If production capacity is limited, bundle low-risk preventive tasks and dedicate the emergency window to the highest-risk assets only.',
            ].join('\n'),
            severity: 'warning',
            confidence: 90,
            riskImpact: 'Medium',
            downtimeRisk: 'Medium',
            costImplication: 'Moderate spend now prevents higher unplanned cost later',
            summary: 'This week’s maintenance schedule should be built around the highest-risk assets first, then grouped by plant and spare-part compatibility.',
            explanation: 'The copilot ranks work based on combined risk and operational urgency. Assets with critical status or very low RUL are always placed ahead of routine preventive work.',
            recommendations: buildPriorityRecommendations(candidates),
            assets: candidates.map(buildAssetSummary),
        };
    }

    function buildDefaultResponse(query = '') {
        const topRisks = getTopRiskAssets(4);
        const summary = `I can answer questions about asset health, anomalies, RUL, failures, alerts, work orders, KPIs, and plant performance. ${topRisks[0].id} is currently the leading risk asset, so you can ask about that unit or request a fleet-level risk summary.`;
        return {
            title: query ? `No exact rule match for: ${query}` : 'Operational summary',
            text: 'I am ready to analyze the dashboard datasets. Try asking which assets are critical, which plant has the lowest health score, what failures are expected next week, or why a work order was created for a specific asset.',
            severity: 'info',
            confidence: 92,
            riskImpact: 'Low',
            downtimeRisk: 'Low',
            costImplication: 'No direct estimate until a specific operational question is asked',
            summary,
            explanation: 'The copilot matches keywords and asset identifiers, then correlates the request against health, anomaly, RUL, alerts, and work order data to generate an explainable recommendation.',
            recommendations: buildDefaultPriorities(),
            assets: topRisks.map(buildAssetSummary),
        };
    }

    function buildDefaultPriorities() {
        return getTopRiskAssets(4).map(asset => {
            const state = DATA.getAssetState(asset.id);
            const alertCount = DATA.getAlertsForAsset(asset.id).length;
            const workOrderCount = DATA.getWorkOrdersForAsset(asset.id).length;
            return {
                title: `${asset.id} — ${state.status} asset`,
                detail: `Health ${state.healthIndex.toFixed(1)} | RUL ${state.rulDays.toFixed(1)} days | Alerts ${alertCount} | WOs ${workOrderCount}`,
            };
        });
    }

    function buildPriorityRecommendations(assets) {
        return assets.slice(0, 4).map(asset => {
            const state = DATA.getAssetState(asset.id);
            return {
                title: `${asset.id} maintenance priority`,
                detail: `Health ${state.healthIndex.toFixed(1)} and RUL ${state.rulDays.toFixed(1)} days justify immediate scheduling with parts confirmation and technician assignment.`,
            };
        });
    }

    function buildAssetSummary(asset) {
        const state = DATA.getAssetState(asset.id);
        return {
            id: asset.id,
            type: asset.type,
            site: asset.site,
            status: state.status,
            health: state.healthIndex,
            rul: state.rulDays,
            anomalyScore: state.anomalyScore,
            alertCount: DATA.getAlertsForAsset(asset.id).length,
            workOrderCount: DATA.getWorkOrdersForAsset(asset.id).length,
        };
    }

    function getTopRiskAssets(limit = 5) {
        return [...DATA.assets]
            .map(asset => ({ asset, score: calculateRiskScore(asset) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.asset);
    }

    function calculateRiskScore(asset) {
        const state = DATA.getAssetState(asset.id);
        const alerts = DATA.getAlertsForAsset(asset.id);
        const wos = DATA.getWorkOrdersForAsset(asset.id);
        const criticalityWeight = { High: 14, Medium: 8, Low: 4 }[asset.criticality] || 6;
        const statusWeight = { Healthy: 0, Warning: 12, Critical: 24 }[state.status] || 8;
        const rulWeight = Math.max(0, 40 - Math.min(40, state.rulDays * 4));
        const healthWeight = (100 - state.healthIndex) * 0.45;
        const anomalyWeight = state.anomalyScore * 40;
        const alertWeight = alerts.length * 4.5;
        const woWeight = wos.filter(order => order.status !== 'Closed').length * 5;
        return criticalityWeight + statusWeight + rulWeight + healthWeight + anomalyWeight + alertWeight + woWeight;
    }

    function deriveRiskImpact(healthIndex, rulDays, anomalyScore, criticality) {
        const base = (100 - healthIndex) * 0.35 + Math.max(0, 20 - rulDays) * 2.2 + anomalyScore * 45 + ({ High: 10, Medium: 6, Low: 3 }[criticality] || 5);
        if (base >= 55) return 'High';
        if (base >= 28) return 'Medium';
        return 'Low';
    }

    function getSlaBreaches() {
        return DATA.workOrders.filter(order => {
            if (order.status === 'Closed') return false;
            const created = new Date(order.created || order.date);
            const elapsedHours = (SIM_NOW - created) / 3600000;
            return elapsedHours > order.slaHours;
        });
    }

    function countAlertsBySensor() {
        return DATA.alerts.reduce((acc, alert) => {
            const key = alert.sensor || 'unknown';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }

    function findAssetFromQuery(query) {
        const upper = query.toUpperCase();
        const directMatch = upper.match(/\b([A-Z]{3}-\d{3})\b/);
        if (directMatch) {
            const asset = DATA.getAssetById(directMatch[1]);
            if (asset) return asset;
        }

        const normalized = normalize(query);
        const numericMatch = normalized.match(/\b(\d{1,3})\b/);
        const assetNumber = numericMatch ? String(parseInt(numericMatch[1], 10)).padStart(3, '0') : null;
        if (!assetNumber) return null;

        const typeMap = [
            { word: 'compressor', code: 'CMP' },
            { word: 'motor', code: 'MTR' },
            { word: 'pump', code: 'PMP' },
            { word: 'turbine', code: 'TRB' },
        ];

        const type = typeMap.find(item => normalized.includes(item.word));
        if (type) {
            return DATA.assets.find(asset => asset.id.startsWith(type.code) && asset.id.endsWith(assetNumber)) || null;
        }

        return DATA.assets.find(asset => asset.id.endsWith(assetNumber)) || null;
    }

    function buildMessage(role, text, extras = {}) {
        return {
            role,
            text,
            timestamp: SIM_NOW.toISOString(),
            severity: extras.severity || 'info',
            confidence: extras.confidence || 92,
        };
    }

    function normalize(value) {
        return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatLineBreaks(value) {
        return value.replace(/\n/g, '<br>');
    }

    return {
        init,
    };
})();