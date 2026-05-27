/* ===================================================================
   APP.JS — Shared Application Logic
   Sidebar, Navbar, Notifications, Utilities
   =================================================================== */

const APP = (() => {

    // ─── Current Page Detection ───
    function getCurrentPage() {
        const path = window.location.pathname;
        const file = path.split('/').pop() || 'index.html';
        return file.replace('.html', '');
    }

    // ─── Initialize Layout ───
    function initLayout() {
        renderSidebar();
        renderNavbar();
        renderFooter();
        renderNotificationPanel();
        initSidebarToggle();
        initNotificationToggle();
        initSearch();
        startLiveUpdates();
    }

    // ─── Sidebar ───
    function renderSidebar() {
        const currentPage = getCurrentPage();
        const navItems = [
            { section: 'MAIN' },
            { id: 'index', icon: 'fa-th-large', label: 'Executive Overview', href: 'index.html' },
            { id: 'asset-health', icon: 'fa-heartbeat', label: 'Asset Health', href: 'asset-health.html' },
            { id: 'anomalies', icon: 'fa-exclamation-triangle', label: 'Anomaly Detection', href: 'anomalies.html', badge: DATA.alerts.filter(a => !a.acknowledged && a.level === 'Critical').length },
            { id: 'ai-copilot', icon: 'fa-robot', label: 'Ask AI', href: 'ai-copilot.html' },
            { section: 'ANALYTICS' },
            { id: 'failure-rul', icon: 'fa-chart-area', label: 'Failure & RUL', href: 'failure-rul.html' },
            { id: 'maintenance', icon: 'fa-wrench', label: 'Maintenance', href: 'maintenance.html', badge: DATA.workOrders.filter(w => w.status === 'Open').length },
            { id: 'trends', icon: 'fa-chart-line', label: 'Trends & Reports', href: 'trends.html' },
        ];

        const sidebar = document.createElement('aside');
        sidebar.className = 'sidebar';
        sidebar.id = 'sidebar';
        sidebar.innerHTML = `
            <div class="sidebar-header">
                <div class="sidebar-logo"><i class="fas fa-industry"></i></div>
                <div class="sidebar-brand">
                    <h1>PdM Intelligence</h1>
                    <span>Industrial AI Platform</span>
                </div>
            </div>
            <nav class="sidebar-nav">
                ${navItems.map(item => {
                    if (item.section) {
                        return `<div class="nav-section-title">${item.section}</div>`;
                    }
                    const isActive = currentPage === item.id;
                    const badge = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
                    return `<a href="${item.href}" class="nav-item ${isActive ? 'active' : ''}">
                        <i class="fas ${item.icon}"></i>
                        <span class="nav-text">${item.label}</span>
                        ${badge}
                    </a>`;
                }).join('')}
            </nav>
            <div class="sidebar-footer">
                <button class="sidebar-toggle" id="sidebarToggle">
                    <i class="fas fa-chevron-left"></i>
                    <span class="nav-text">Collapse</span>
                </button>
            </div>
        `;
        document.querySelector('.app-container').prepend(sidebar);
    }

    // ─── Navbar ───
    function renderNavbar() {
        const currentPage = getCurrentPage();
        const pageNames = {
            'index': 'Executive Overview',
            'asset-health': 'Asset Health Monitoring',
            'anomalies': 'Anomaly Detection',
            'ai-copilot': 'Ask AI',
            'failure-rul': 'Failure & RUL Analytics',
            'maintenance': 'Maintenance Management',
            'trends': 'Trends & Analytics'
        };
        const pageName = pageNames[currentPage] || 'Dashboard';
        const unread = DATA.notifications.filter(n => !n.read).length;

        const navbar = document.createElement('header');
        navbar.className = 'navbar';
        navbar.innerHTML = `
            <div class="navbar-left">
                <div class="breadcrumb">
                    <span>Home</span>
                    <span class="separator"><i class="fas fa-chevron-right"></i></span>
                    <span class="current">${pageName}</span>
                </div>
            </div>
            <div class="navbar-right">
                <div class="live-indicator">
                    <span class="live-dot"></span>
                    <span>Live</span>
                </div>
                <div class="search-box" id="searchBox">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Search assets, alerts..." id="globalSearch">
                </div>
                <button class="navbar-icon-btn" id="exportBtn" title="Export">
                    <i class="fas fa-download"></i>
                </button>
                <button class="navbar-icon-btn" id="notificationBtn" title="Notifications">
                    <i class="fas fa-bell"></i>
                    ${unread > 0 ? '<span class="notification-dot"></span>' : ''}
                </button>
                <div class="user-avatar" title="Admin User">AU</div>
            </div>
        `;
        document.querySelector('.main-content').prepend(navbar);
    }

    // ─── Footer ───
    function renderFooter() {
        const footer = document.createElement('footer');
        footer.className = 'footer';
        footer.innerHTML = `
            <span>© 2026 PdM Intelligence Platform — Industrial AI Monitoring</span>
            <span>Last Sync: ${new Date().toLocaleTimeString()} | <span class="text-green">● System Online</span></span>
        `;
        document.querySelector('.main-content').appendChild(footer);
    }

    // ─── Notification Panel ───
    function renderNotificationPanel() {
        const overlay = document.createElement('div');
        overlay.className = 'notification-overlay';
        overlay.id = 'notifOverlay';
        document.body.appendChild(overlay);

        const panel = document.createElement('div');
        panel.className = 'notification-panel';
        panel.id = 'notifPanel';
        panel.innerHTML = `
            <div class="notification-panel-header">
                <h3>Notifications</h3>
                <button class="btn btn-sm btn-secondary" id="markAllRead">Mark all read</button>
            </div>
            <div class="notification-panel-body">
                ${DATA.notifications.map(n => `
                    <div class="notification-item ${n.read ? '' : 'unread'}">
                        <div class="n-dot ${n.type}"></div>
                        <div class="n-content">
                            <p>${n.message}</p>
                            <div class="n-time">${n.time}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        document.body.appendChild(panel);
    }

    // ─── Sidebar Toggle ───
    function initSidebarToggle() {
        const btn = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        if (!btn || !sidebar) return;
        btn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const icon = btn.querySelector('i');
            icon.classList.toggle('fa-chevron-left');
            icon.classList.toggle('fa-chevron-right');
        });
    }

    // ─── Notification Toggle ───
    function initNotificationToggle() {
        const btn = document.getElementById('notificationBtn');
        const panel = document.getElementById('notifPanel');
        const overlay = document.getElementById('notifOverlay');
        if (!btn || !panel) return;

        btn.addEventListener('click', () => {
            panel.classList.toggle('open');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            panel.classList.remove('open');
            overlay.classList.remove('active');
        });

        const markAll = document.getElementById('markAllRead');
        if (markAll) {
            markAll.addEventListener('click', () => {
                document.querySelectorAll('.notification-item.unread').forEach(el => el.classList.remove('unread'));
                const dot = document.querySelector('.notification-dot');
                if (dot) dot.remove();
            });
        }
    }

    // ─── Search ───
    function initSearch() {
        const input = document.getElementById('globalSearch');
        if (!input) return;
        input.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase().trim();
            if (typeof window.onGlobalSearch === 'function') {
                window.onGlobalSearch(q);
            }
        });
    }

    // ─── Live Update Simulation ───
    function startLiveUpdates() {
        setInterval(() => {
            DATA.assets.forEach(a => {
                const state = DATA.assetCurrentState[a.id];
                const readings = DATA.telemetrySnapshot[a.id];
                for (const key in readings) {
                    if (key === 'run_status') continue;
                    readings[key] *= (0.998 + Math.random() * 0.004);
                    readings[key] = +readings[key].toFixed(2);
                }
            });
            document.querySelectorAll('[data-live-value]').forEach(el => {
                const assetId = el.dataset.assetId;
                const tag = el.dataset.liveValue;
                if (DATA.telemetrySnapshot[assetId] && DATA.telemetrySnapshot[assetId][tag] !== undefined) {
                    el.textContent = DATA.telemetrySnapshot[assetId][tag].toFixed(1);
                }
            });
        }, 5000);
    }

    // ─── Utility Functions ───
    function formatNumber(n, decimals = 0) {
        if (n === undefined || n === null) return '—';
        return Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }

    function formatCurrency(n) {
        return '$' + formatNumber(n);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
               d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    function timeAgo(dateStr) {
        const now = new Date('2026-04-22T18:00:00Z');
        const d = new Date(dateStr);
        const diff = now - d;
        const hours = Math.floor(diff / 3600000);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    function animateCounter(el, target, duration = 1200, decimals = 0, prefix = '', suffix = '') {
        const start = 0;
        const startTime = performance.now();
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (target - start) * eased;
            el.textContent = prefix + formatNumber(current, decimals) + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    function createStatusBadge(status) {
        const cls = status === 'Healthy' ? 'badge-healthy' : status === 'Warning' ? 'badge-warning' : status === 'Critical' ? 'badge-critical' : 'badge-info';
        return `<span class="badge ${cls}"><span class="badge-dot"></span>${status}</span>`;
    }

    function createPriorityBadge(priority) {
        return `<span class="badge priority-${priority.toLowerCase()}">${priority}</span>`;
    }

    function getHealthColor(hi) {
        if (hi >= 80) return '#10b981';
        if (hi >= 55) return '#f59e0b';
        return '#ef4444';
    }

    function getHealthGradient(hi) {
        if (hi >= 80) return 'linear-gradient(90deg, #10b981, #34d399)';
        if (hi >= 55) return 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        return 'linear-gradient(90deg, #ef4444, #f87171)';
    }

    function createProgressRing(value, max, size = 60, strokeWidth = 5, color = null) {
        const pct = Math.min(value / max, 1);
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference * (1 - pct);
        const c = color || getHealthColor(value);
        return `
            <div class="progress-ring" style="width:${size}px;height:${size}px">
                <svg width="${size}" height="${size}">
                    <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="var(--bg-elevated)" stroke-width="${strokeWidth}"/>
                    <circle cx="${size/2}" cy="${size/2}" r="${radius}" fill="none" stroke="${c}" stroke-width="${strokeWidth}" 
                        stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round" style="transition: stroke-dashoffset 1s ease"/>
                </svg>
                <span class="progress-ring-text" style="font-size:${size > 50 ? 14 : 11}px">${Math.round(value)}</span>
            </div>
        `;
    }

    function createHealthBar(value) {
        const color = getHealthColor(value);
        return `
            <div class="health-bar-container">
                <div class="health-bar" style="width:${value}%;background:${color}"></div>
            </div>
        `;
    }

    function getTypeIcon(type) {
        const icons = {
            compressor: 'fa-compress-arrows-alt',
            motor: 'fa-cog',
            pump: 'fa-tint',
            turbine: 'fa-fan'
        };
        return icons[type] || 'fa-cube';
    }

    // ─── Page Header Helper ───
    function renderPageHeader(title, subtitle, actions = '') {
        return `
            <div class="page-header">
                <div>
                    <h2>${title}</h2>
                    <p>${subtitle}</p>
                </div>
                <div class="page-header-actions">
                    ${actions}
                </div>
            </div>
        `;
    }

    return {
        initLayout,
        getCurrentPage,
        formatNumber,
        formatCurrency,
        formatDate,
        formatDateTime,
        timeAgo,
        animateCounter,
        createStatusBadge,
        createPriorityBadge,
        getHealthColor,
        getHealthGradient,
        createProgressRing,
        createHealthBar,
        getTypeIcon,
        renderPageHeader,
    };
})();
