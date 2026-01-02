import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Gear, Circle } from '@phosphor-icons/react';

const Topbar = () => {
    const location = useLocation();

    const getTitle = (pathname) => {
        if (pathname === '/') return 'Dashboard';
        if (pathname.startsWith('/clients')) return 'Clients'; // Covers /clients and /client-details
        if (pathname === '/onboard-client') return 'Onboard Client';
        if (pathname === '/kiosks-assigned') return 'Assigned Kiosks';
        if (pathname === '/kiosks-stock') return 'Stock Kiosks';
        if (pathname === '/global-config') return 'Global Configuration';
        if (pathname === '/policies') return 'Policies';
        if (pathname === '/features') return 'Feature Flags';
        if (pathname === '/roles') return 'Roles & Permissions';
        if (pathname === '/users') return 'User Management';
        if (pathname === '/audit') return 'Audit Logs';
        return 'Dashboard';
    };

    const [showNotifications, setShowNotifications] = React.useState(false);

    return (
        <header className="top-bar">
            <div className="breadcrumbs">
                <span className="current-page" id="page-title">{getTitle(location.pathname)}</span>
            </div>
            <div className="top-actions">
                <div style={{ position: 'relative' }}>
                    <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                        <Bell />
                        <span className="badge">3</span>
                    </button>
                    {showNotifications && (
                        <div className="dropdown-menu">
                            <div className="dropdown-header">Notifications</div>
                            <div className="dropdown-item">
                                <div style={{ fontWeight: 600 }}>New Client Onboarded</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FashionX just joined.</div>
                            </div>
                            <div className="dropdown-item">
                                <div style={{ fontWeight: 600 }}>Kiosk Offline</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>KSK-9942 is not responding.</div>
                            </div>
                            <div className="dropdown-item">
                                <div style={{ fontWeight: 600 }}>System Update</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Maintenance scheduled for tonight.</div>
                            </div>
                        </div>
                    )}
                </div>
                <Link to="/global-config" className="icon-btn" style={{ color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Gear />
                </Link>
                <div className="env-badge production">
                    <Circle weight="fill" /> Production
                </div>
            </div>
        </header>
    );
};

export default Topbar;
