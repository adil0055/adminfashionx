/**
 * Component Loader
 * Stores HTML in strings to ensure compatibility with file:// protocol (no CORS issues).
 * This acts as the "Common File" for the sidebar and topbar structure.
 */

const SIDEBAR_HTML = `
<aside class="sidebar">
    <div class="logo-area">
        <div class="logo-icon">
            <i class="ph-fill ph-hexagon"></i>
        </div>
        <div class="logo-text">
            <h1>Nexus</h1>
            <span>Governance Core</span>
        </div>
    </div>

    <nav class="main-nav">
        <a href="index.html" class="nav-item" data-page="index.html">
            <i class="ph ph-squares-four"></i>
            <span>Dashboard</span>
        </a>
        <a href="clients.html" class="nav-item" data-page="clients.html">
            <i class="ph ph-users-three"></i>
            <span>Clients</span>
        </a>
        <div class="nav-group">
            <div class="nav-group-header" id="kiosk-nav-header">
                <i class="ph ph-monitor"></i>
                <span>Kiosk</span>
                <i class="ph ph-caret-right chevron"></i>
            </div>
            <div class="nav-submenu">
                <a href="kiosks-assigned.html" class="nav-subitem" data-page="kiosks-assigned.html">
                    <span>Assigned</span>
                </a>
                <a href="kiosks-stock.html" class="nav-subitem" data-page="kiosks-stock.html">
                    <span>Stock</span>
                </a>
            </div>
        </div>
        <div class="nav-group">
            <div class="nav-group-header" id="settings-nav-header">
                <i class="ph ph-gear"></i>
                <span>Settings</span>
                <i class="ph ph-caret-right chevron"></i>
            </div>
            <div class="nav-submenu">
                <a href="global-config.html" class="nav-subitem" data-page="global-config.html">
                    <span>Global Config</span>
                </a>
                <a href="policies.html" class="nav-subitem" data-page="policies.html">
                    <span>Policies</span>
                </a>
                <a href="features.html" class="nav-subitem" data-page="features.html">
                    <span>Feature Flags</span>
                </a>
                <a href="roles.html" class="nav-subitem" data-page="roles.html">
                    <span>Roles & Permissions</span>
                </a>
                <a href="users.html" class="nav-subitem" data-page="users.html">
                    <span>User Management</span>
                </a>
            </div>
        </div>
        <a href="audit.html" class="nav-item" data-page="audit.html">
            <i class="ph ph-scroll"></i>
            <span>Audit Logs</span>
        </a>
    </nav>

    <div class="user-profile">
        <div class="avatar">SA</div>
        <div class="user-info">
            <span class="name">Super Admin</span>
            <span class="role">Platform Owner</span>
        </div>
    </div>
</aside>
`;

const TOPBAR_HTML = `
<header class="top-bar">
    <div class="breadcrumbs">
        <span class="current-page" id="page-title">Loading...</span>
    </div>
    <div class="top-actions">
        <button class="icon-btn"><i class="ph ph-bell"></i><span class="badge">3</span></button>
        <button class="icon-btn"><i class="ph ph-gear"></i></button>
        <div class="env-badge production">
            <i class="ph-fill ph-circle"></i> Production
        </div>
    </div>
</header>
`;

async function initComponents() {
    // 1. Inject Sidebar
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.outerHTML = SIDEBAR_HTML;
    }

    // 2. Set Active Link
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const cleanPath = path.split('?')[0];

    // Remove active class from all (just in case) then add to current
    const activeLink = document.querySelector(`.nav-item[data-page="${cleanPath}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    } else {
        // Check for submenu items
        const activeSubItem = document.querySelector(`.nav-subitem[data-page="${cleanPath}"]`);
        if (activeSubItem) {
            activeSubItem.classList.add('active');
            // Expand parent group
            const kioskHeader = document.getElementById('kiosk-nav-header');
            if (kioskHeader) {
                kioskHeader.classList.add('active', 'expanded');
            }
        } else {
            // Fallback for sub-pages
            if (cleanPath === 'onboard-client.html') {
                const clientLink = document.querySelector(`.nav-item[data-page="clients.html"]`);
                if (clientLink) clientLink.classList.add('active');
            }
        }
    }

    // 3. Handle Submenu Toggle
    const kioskHeader = document.getElementById('kiosk-nav-header');
    if (kioskHeader) {
        kioskHeader.onclick = (e) => {
            e.preventDefault();
            kioskHeader.classList.toggle('expanded');
        };

        // Auto-expand if a submenu item is active
        const activeSubItem = document.querySelector(`.nav-subitem[data-page="${cleanPath}"]`);
        if (activeSubItem && activeSubItem.closest('.nav-group').querySelector('#kiosk-nav-header')) {
            kioskHeader.classList.add('expanded');
        }
    }

    // Handle Settings Submenu Toggle
    const settingsHeader = document.getElementById('settings-nav-header');
    if (settingsHeader) {
        settingsHeader.onclick = (e) => {
            e.preventDefault();
            settingsHeader.classList.toggle('expanded');
        };

        // Auto-expand if a settings submenu item is active
        const settingsPages = ['global-config.html', 'policies.html', 'features.html', 'roles.html', 'users.html'];
        if (settingsPages.includes(cleanPath)) {
            settingsHeader.classList.add('expanded');
        }
    }

    // 4. Inject Topbar
    const topbarContainer = document.getElementById('topbar-container');
    if (topbarContainer) {
        topbarContainer.outerHTML = TOPBAR_HTML;
    }

    // 5. Set Page Title (Dynamic)
    const pageTitleEl = document.getElementById('page-title');
    if (pageTitleEl) {
        // Infer from document title
        const fullTitle = document.title;
        // Typically "Page Name - Platform Name" -> split by " - "
        const shortTitle = fullTitle.split(' - ')[0];
        pageTitleEl.textContent = shortTitle;
    }
}

// Run on DOM Ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents);
} else {
    initComponents();
}
