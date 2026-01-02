import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Hexagon,
    SquaresFour,
    UsersThree,
    Monitor,
    CaretRight,
    Gear,
    Scroll,
    SignOut
} from '@phosphor-icons/react';

import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isKioskExpanded, setIsKioskExpanded] = useState(
        location.pathname.includes('kiosks')
    );
    const [isSettingsExpanded, setIsSettingsExpanded] = useState(
        ['/global-config', '/policies', '/features', '/roles', '/users', '/subscription-tiers'].includes(location.pathname)
    );

    return (
        <aside className="sidebar">
            <div className="logo-area">
                <div className="logo-icon">
                    <Hexagon weight="fill" />
                </div>
                <div className="logo-text">
                    <h1>Nexus</h1>
                    <span>Governance Core</span>
                </div>
            </div>

            <nav className="main-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                    <SquaresFour />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/clients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <UsersThree />
                    <span>Clients</span>
                </NavLink>

                <div className="nav-group">
                    <div
                        className={`nav-group-header ${isKioskExpanded ? 'expanded' : ''}`}
                        onClick={() => setIsKioskExpanded(!isKioskExpanded)}
                    >
                        <Monitor />
                        <span>Kiosk</span>
                        <CaretRight className="chevron" />
                    </div>
                    <div className="nav-submenu" style={{ display: isKioskExpanded ? 'block' : 'none' }}>
                        <NavLink to="/kiosks-assigned" className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}>
                            <span>Assigned</span>
                        </NavLink>
                        <NavLink to="/kiosks-stock" className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}>
                            <span>Stock</span>
                        </NavLink>
                    </div>
                </div>

                <div className="nav-group">
                    <div
                        className={`nav-group-header ${isSettingsExpanded ? 'expanded' : ''}`}
                        onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
                    >
                        <Gear />
                        <span>Settings</span>
                        <CaretRight className="chevron" />
                    </div>
                    <div className="nav-submenu" style={{ display: isSettingsExpanded ? 'block' : 'none' }}>
                        <NavLink to="/global-config" className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}>
                            <span>Global Config</span>
                        </NavLink>
                        <NavLink to="/policies" className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}>
                            <span>Policies</span>
                        </NavLink>
                        <NavLink to="/features" className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}>
                            <span>Feature Flags</span>
                        </NavLink>
                        <NavLink to="/roles" className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}>
                            <span>Roles & Permissions</span>
                        </NavLink>
                        <NavLink to="/users" className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}>
                            <span>User Management</span>
                        </NavLink>
                        <NavLink to="/subscription-tiers" className={({ isActive }) => `nav-subitem ${isActive ? 'active' : ''}`}>
                            <span>Subscription Tiers</span>
                        </NavLink>
                    </div>
                </div>

                <NavLink to="/audit" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Scroll />
                    <span>Audit Logs</span>
                </NavLink>
            </nav>

            <div className="user-profile">
                <div className="avatar">{user?.avatar || 'U'}</div>
                <div className="user-info">
                    <span className="name">{user?.name || 'User'}</span>
                    <span className="role">{user?.role?.replace('_', ' ') || 'Guest'}</span>
                </div>
                <button
                    onClick={logout}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        marginLeft: 'auto',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        transition: 'all 0.2s'
                    }}
                    title="Logout"
                    onMouseOver={(e) => {
                        e.currentTarget.style.color = 'var(--danger)';
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.background = 'none';
                    }}
                >
                    <SignOut size={20} weight="bold" />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
