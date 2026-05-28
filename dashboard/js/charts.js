/* ===================================================================
   CHARTS.JS — Chart.js Factory Functions & Global Config
   Reusable chart creators for the PdM Dashboard
   =================================================================== */

const CHARTS = (() => {

    function themeVar(name, fallback = '') {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        return value || fallback;
    }

    function withAlpha(color, alpha) {
        if (!color) return color;
        const hex = color.replace('#', '');
        if (hex.length === 3) {
            const r = parseInt(hex[0] + hex[0], 16);
            const g = parseInt(hex[1] + hex[1], 16);
            const b = parseInt(hex[2] + hex[2], 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        if (hex.length === 6) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return color;
    }

    // ─── Global Chart.js Defaults ───
    Chart.defaults.color = themeVar('--text-muted', '#5d7da8');
    Chart.defaults.borderColor = themeVar('--border-subtle', '#d8e3f3');
    Chart.defaults.font.family = themeVar('--font-sans', "'Inter', sans-serif");
    Chart.defaults.font.size = 11;
    Chart.defaults.plugins.legend.labels.color = themeVar('--text-muted', '#5d7da8');
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.pointStyleWidth = 10;
    Chart.defaults.plugins.legend.labels.padding = 16;
    Chart.defaults.plugins.tooltip.backgroundColor = themeVar('--bg-surface', '#ffffff');
    Chart.defaults.plugins.tooltip.titleColor = themeVar('--text-primary', '#0f2f5f');
    Chart.defaults.plugins.tooltip.bodyColor = themeVar('--text-secondary', '#315a8a');
    Chart.defaults.plugins.tooltip.titleFont = { size: 12, weight: '600' };
    Chart.defaults.plugins.tooltip.bodyFont = { size: 11 };
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.borderColor = themeVar('--border-default', '#c5d6ea');
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.elements.point.radius = 2;
    Chart.defaults.elements.point.hoverRadius = 5;
    Chart.defaults.elements.line.tension = 0.35;
    Chart.defaults.animation.duration = 1000;
    Chart.defaults.animation.easing = 'easeOutQuart';

    // ─── Color Palette ───
    const COLORS = {
        blue: themeVar('--blue', '#2563eb'),
        cyan: themeVar('--cyan', '#0ea5e9'),
        green: themeVar('--green', '#0f766e'),
        amber: themeVar('--amber', '#7c3aed'),
        red: themeVar('--red', '#1d4ed8'),
        purple: themeVar('--purple', '#3b82f6'),
        pink: themeVar('--pink', '#60a5fa'),
        blueBg: withAlpha(themeVar('--blue', '#2563eb'), 0.12),
        greenBg: withAlpha(themeVar('--green', '#0f766e'), 0.12),
        amberBg: withAlpha(themeVar('--amber', '#7c3aed'), 0.12),
        redBg: withAlpha(themeVar('--red', '#1d4ed8'), 0.12),
        purpleBg: withAlpha(themeVar('--purple', '#3b82f6'), 0.12),
    };

    const PALETTE = [COLORS.blue, COLORS.cyan, COLORS.green, COLORS.amber, COLORS.red, COLORS.purple, COLORS.pink];

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
                backgroundColor: ds.fill ? createGradient(ctx.getContext('2d'), withAlpha(ds.color || PALETTE[i % PALETTE.length], 0.28), 'transparent') : 'transparent',
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
                        grid: { display: false, color: themeVar('--border-subtle', '#d8e3f3') },
                        ticks: { maxTicksLimit: options.maxXTicks || 12 },
                        ...options.xScale,
                    },
                    y: {
                        beginAtZero: options.beginAtZero !== false,
                        grid: { color: withAlpha(themeVar('--border-default', '#c5d6ea'), 0.7) },
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
        const chart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets: datasets.map((ds, i) => ({
                label: ds.label,
                data: ds.data,
                backgroundColor: ds.colors || ds.color || PALETTE[i % PALETTE.length],
                borderColor: 'transparent',
                borderRadius: ds.borderRadius || 4,
                borderWidth: 0,
                barThickness: ds.barThickness,
                // ensure very small stacked segments remain visible
                minBarLength: ds.minBarLength !== undefined ? ds.minBarLength : (options.stacked ? 6 : undefined),
                borderSkipped: ds.borderSkipped !== undefined ? ds.borderSkipped : false,
                // allow passing additional dataset options
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
                        grid: { display: options.horizontal ? true : false, color: withAlpha(themeVar('--border-default', '#c5d6ea'), 0.7) },
                        stacked: options.stacked || false,
                        ...options.xScale,
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: options.horizontal ? 'transparent' : withAlpha(themeVar('--border-default', '#c5d6ea'), 0.7) },
                        stacked: options.stacked || false,
                        ...options.yScale,
                    },
                },
                ...options.chartOptions,
            }
        });

        // ensure chart fully renders after fonts/layout finish — avoids initial blank canvas
        try {
            setTimeout(() => { chart.resize(); chart.update(); }, 60);
        } catch (e) {
            // ignore
        }

        return chart;
    }

    // ─── Doughnut Chart ───
    function createDoughnutChart(canvasId, labels, data, colors, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        // ensure no border on slices and no stroke around legend boxes
        const datasetBorderWidth = options.borderWidth !== undefined ? options.borderWidth : 0;
        const datasetBorderColor = options.borderColor !== undefined ? options.borderColor : 'transparent';
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors || PALETTE.slice(0, data.length),
                    borderColor: datasetBorderColor,
                    borderWidth: datasetBorderWidth,
                    hoverOffset: options.hoverOffset || 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: options.cutout || '72%',
                elements: {
                    arc: { borderWidth: 0 }
                },
                plugins: {
                    legend: {
                        display: options.showLegend !== false,
                        position: options.legendPos || 'bottom',
                        labels: { padding: 12, usePointStyle: true, boxWidth: options.boxWidth || 12 }
                    },
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
                    backgroundColor: [options.color || color, withAlpha(themeVar('--border-default', '#c5d6ea'), 0.7)],
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
                    c.font = `700 24px ${themeVar('--font-mono', "'JetBrains Mono', monospace")}`;
                    c.fillStyle = themeVar('--text-primary', '#0f2f5f');
                    c.fillText(Math.round(value) + (options.suffix || ''), cx, cy);
                    if (options.sublabel) {
                        c.font = `500 11px ${themeVar('--font-sans', "'Inter', sans-serif")}`;
                        c.fillStyle = themeVar('--text-muted', '#5d7da8');
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
                if (val >= 0.85) bg = withAlpha(themeVar('--red', '#1d4ed8'), 0.8);
                else if (val >= 0.55) bg = withAlpha(themeVar('--amber', '#7c3aed'), 0.7);
                else if (val > 0.1) bg = withAlpha(themeVar('--blue', '#2563eb'), 0.4);
                else bg = withAlpha(themeVar('--green', '#0f766e'), 0.2);
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
