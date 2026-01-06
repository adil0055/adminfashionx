import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Gear, Circle, Heartbeat } from '@phosphor-icons/react';
import { api } from '../services/api';

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

    // System Health Status
    const [healthStatus, setHealthStatus] = React.useState('unknown'); // healthy, degraded, unhealthy, unknown

    React.useEffect(() => {
        const checkHealth = async () => {
            try {
                // Use the lightweight diagnostic check (or we could assume a lighter endpoint exists, but per instructions we use the same)
                const result = await api.health.diagnostic();
                if (result.success && result.data?.status) {
                    setHealthStatus(result.data.status);
                } else {
                    setHealthStatus('unhealthy');
                }
            } catch (e) {
                setHealthStatus('unhealthy');
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const getHealthColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'healthy': return 'var(--success)';
            case 'degraded': return 'var(--warning)';
            case 'unhealthy': return 'var(--danger)';
            default: return 'var(--text-muted)';
        }
    };


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
                <Link to="/system-health" title={`System Status: ${healthStatus}`} style={{ textDecoration: 'none' }}>
                    <div className="icon-btn" style={{
                        color: getHealthColor(healthStatus),
                        backgroundColor: `color-mix(in srgb, ${getHealthColor(healthStatus)} 10%, transparent)`
                    }}>
                        <Heartbeat weight="fill" />
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default Topbar;
