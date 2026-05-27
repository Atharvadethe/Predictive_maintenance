/* ===================================================================
   CHARTS.JS — Chart.js Factory Functions & Global Config
   Reusable chart creators for the PdM Dashboard
   =================================================================== */

const CHARTS = (() => {

    // ─── Global Chart.js Defaults ───
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(42, 58, 78, 0.5)';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.pointStyleWidth = 10;
    Chart.defaults.plugins.legend.labels.padding = 16;
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.95)';
    Chart.defaults.plugins.tooltip.titleFont = { size: 12, weight: '600' };
    Chart.defaults.plugins.tooltip.bodyFont = { size: 11 };
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(42, 58, 78, 0.8)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.elements.point.radius = 2;
    Chart.defaults.elements.point.hoverRadius = 5;
    Chart.defaults.elements.line.tension = 0.35;
    Chart.defaults.animation.duration = 1000;
    Chart.defaults.animation.easing = 'easeOutQuart';

    // ─── Color Palette ───
    const COLORS = {
        blue: '#3b82f6',
        cyan: '#06b6d4',
        green: '#10b981',
        amber: '#f59e0b',
        red: '#ef4444',
        purple: '#8b5cf6',
        pink: '#ec4899',
        indigo: '#6366f1',
        teal: '#14b8a6',
        orange: '#f97316',
        blueBg: 'rgba(59, 130, 246, 0.12)',
        greenBg: 'rgba(16, 185, 129, 0.12)',
        amberBg: 'rgba(245, 158, 11, 0.12)',
        redBg: 'rgba(239, 68, 68, 0.12)',
        purpleBg: 'rgba(139, 92, 246, 0.12)',
    };

    const PALETTE = [COLORS.blue, COLORS.cyan, COLORS.green, COLORS.amber, COLORS.red, COLORS.purple, COLORS.pink, COLORS.indigo, COLORS.teal, COLORS.orange];

    function createGradient(ctx, color1, color2, height = 300) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    }

    // ─── Line Chart ───
    function createLineChart(canvasId, labels, datasets, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        return new Chart(ctx, {
            type: 'line',
            data: { labels, datasets: datasets.map((ds, i) => ({
                label: ds.label,
                data: ds.data,
                borderColor: ds.color || PALETTE[i % PALETTE.length],
                backgroundColor: ds.fill ? createGradient(ctx.getContext('2d'), (ds.color || PALETTE[i]) + '30', 'transparent') : 'transparent',
                borderWidth: ds.borderWidth || 2,
                fill: ds.fill || false,
                pointRadius: ds.pointRadius !== undefined ? ds.pointRadius : 1,
                pointHoverRadius: 5,
                tension: ds.tension !== undefined ? ds.tension : 0.35,
                ...ds.extra,
            }))},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: datasets.length > 1, position: 'top', align: 'end' },
                    ...options.plugins,
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { maxTicksLimit: options.maxXTicks || 12 },
                        ...options.xScale,
                    },
                    y: {
                        beginAtZero: options.beginAtZero !== false,
                        grid: { color: 'rgba(42,58,78,0.3)' },
                        ...options.yScale,
                    },
                    ...options.scales,
                },
                ...options.chartOptions,
            }
        });
    }

    // ─── Bar Chart ───
    function createBarChart(canvasId, labels, datasets, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        return new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets: datasets.map((ds, i) => ({
                label: ds.label,
                data: ds.data,
                backgroundColor: ds.colors || ds.color || PALETTE[i % PALETTE.length],
                borderColor: 'transparent',
                borderRadius: ds.borderRadius || 4,
                borderWidth: 0,
                barThickness: ds.barThickness,
                ...ds.extra,
            }))},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: options.horizontal ? 'y' : 'x',
                plugins: {
                    legend: { display: datasets.length > 1, position: 'top', align: 'end' },
                    ...options.plugins,
                },
                scales: {
                    x: {
                        grid: { display: options.horizontal ? true : false, color: 'rgba(42,58,78,0.3)' },
                        stacked: options.stacked || false,
                        ...options.xScale,
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: options.horizontal ? 'transparent' : 'rgba(42,58,78,0.3)' },
                        stacked: options.stacked || false,
                        ...options.yScale,
                    },
                },
                ...options.chartOptions,
            }
        });
    }

    // ─── Doughnut Chart ───
    function createDoughnutChart(canvasId, labels, data, colors, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors || PALETTE.slice(0, data.length),
                    borderColor: '#1a2332',
                    borderWidth: 3,
                    hoverOffset: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: options.cutout || '72%',
                plugins: {
                    legend: { display: options.showLegend !== false, position: options.legendPos || 'bottom', labels: { padding: 12 } },
                    ...options.plugins,
                },
                ...options.chartOptions,
            }
        });
    }

    // ─── Area Chart (filled line) ───
    function createAreaChart(canvasId, labels, datasets, options = {}) {
        return createLineChart(canvasId, labels, datasets.map(ds => ({ ...ds, fill: true })), options);
    }

    // ─── Stacked Bar Chart ───
    function createStackedBar(canvasId, labels, datasets, options = {}) {
        return createBarChart(canvasId, labels, datasets, { ...options, stacked: true });
    }

    // ─── Horizontal Bar Chart ───
    function createHorizontalBar(canvasId, labels, datasets, options = {}) {
        return createBarChart(canvasId, labels, datasets, { ...options, horizontal: true });
    }

    // ─── Gauge Chart (doughnut-based) ───
    function createGaugeChart(canvasId, value, max = 100, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        const pct = value / max;
        let color;
        if (pct >= 0.8) color = COLORS.green;
        else if (pct >= 0.55) color = COLORS.amber;
        else color = COLORS.red;
        
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [value, max - value],
                    backgroundColor: [options.color || color, 'rgba(42,58,78,0.3)'],
                    borderWidth: 0,
                    circumference: 270,
                    rotation: 225,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '80%',
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
            },
            plugins: [{
                id: 'gaugeText',
                afterDraw(chart) {
                    const { ctx: c, chartArea } = chart;
                    const cx = (chartArea.left + chartArea.right) / 2;
                    const cy = (chartArea.top + chartArea.bottom) / 2 + 10;
                    c.save();
                    c.textAlign = 'center';
                    c.font = "700 24px 'JetBrains Mono', monospace";
                    c.fillStyle = '#f1f5f9';
                    c.fillText(Math.round(value) + (options.suffix || ''), cx, cy);
                    if (options.sublabel) {
                        c.font = "500 11px 'Inter', sans-serif";
                        c.fillStyle = '#64748b';
                        c.fillText(options.sublabel, cx, cy + 18);
                    }
                    c.restore();
                }
            }]
        });
    }

    // ─── DOM-based Heatmap ───
    function createHeatmapGrid(containerId, rows, cols, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.style.gridTemplateColumns = `auto repeat(${cols.length}, 1fr)`;
        
        // Header row
        container.innerHTML = '<div class="heatmap-cell" style="background:transparent"></div>';
        cols.forEach(col => {
            container.innerHTML += `<div style="text-align:center;font-size:10px;color:var(--text-muted);padding:4px;font-weight:600">${col}</div>`;
        });

        rows.forEach((row, ri) => {
            container.innerHTML += `<div style="font-size:11px;color:var(--text-secondary);padding:4px;display:flex;align-items:center;font-family:var(--font-mono)">${row}</div>`;
            cols.forEach((col, ci) => {
                const val = data[ri]?.[ci] || 0;
                let bg;
                if (val >= 0.85) bg = 'rgba(239,68,68,0.8)';
                else if (val >= 0.55) bg = 'rgba(245,158,11,0.7)';
                else if (val > 0.1) bg = 'rgba(59,130,246,0.4)';
                else bg = 'rgba(16,185,129,0.2)';
                container.innerHTML += `<div class="heatmap-cell" style="background:${bg}" title="${row} / ${col}: ${val.toFixed(2)}">${val > 0.1 ? val.toFixed(1) : ''}</div>`;
            });
        });
    }

    return {
        COLORS,
        PALETTE,
        createLineChart,
        createBarChart,
        createDoughnutChart,
        createAreaChart,
        createStackedBar,
        createHorizontalBar,
        createGaugeChart,
        createHeatmapGrid,
        createGradient,
    };
})();
