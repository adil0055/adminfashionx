import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Buildings,
    TrendUp,
    Monitor,
    Warning,
    TrendDown,
    Heartbeat,
    PlusCircle,
    FilePlus,
    ToggleLeft,
    FileMagnifyingGlass
} from '@phosphor-icons/react';
import { api } from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        activeClients: 0,
        totalKiosks: 0,
        policyViolations: 0,
        systemHealth: '100%'
    });
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [clientsResult, assignedKiosksResult, stockKiosksResult, logsResult] = await Promise.all([
                    api.clients.list(),
                    api.kiosks.listAssigned(),
                    api.kiosks.listStock(),
                    api.audit.getLogs()
                ]);

                let activeClients = 0;
                if (clientsResult.success) {
                    activeClients = clientsResult.data.length;
                }

                let totalKiosks = 0;
                if (assignedKiosksResult.success) totalKiosks += assignedKiosksResult.data.length;
                if (stockKiosksResult.success) totalKiosks += stockKiosksResult.data.length;

                let logs = [];
                if (logsResult.success) {
                    logs = logsResult.data.slice(0, 5).map(log => ({
                        ...log,
                        user: log.admin || 'Unknown',
                        time: new Date(log.created_at).toLocaleString(),
                        status: log.status || 'Success',
                        statusClass: (log.status || 'Success') === 'Success' ? 'status-active' : 'status-inactive',
                        avatar: (log.admin || 'U').charAt(0).toUpperCase()
                    }));
                }

                setStats({
                    activeClients,
                    totalKiosks,
                    policyViolations: 3, // Mock
                    systemHealth: 'Check Status'
                });
                setRecentLogs(logs);

            } catch (error) {
                console.error('Failed to load dashboard data', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <div className="dashboard-grid">
                <div className="stats-card">
                    <div className="stats-header">
                        <span>Active Clients</span>
                        <Buildings weight="fill" />
                    </div>
                    <div className="stats-value">{loading ? '-' : stats.activeClients}</div>
                    <div className="stats-trend up">
                        <TrendUp weight="bold" />
                        +12%
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-header">
                        <span>Total Kiosks</span>
                        <Monitor weight="fill" />
                    </div>
                    <div className="stats-value">{loading ? '-' : stats.totalKiosks}</div>
                    <div className="stats-trend up">
                        <TrendUp weight="bold" />
                        +5%
                    </div>
                </div>
                <div className="stats-card">
                    <div className="stats-header">
                        <span>Policy Violations</span>
                        <Warning weight="fill" />
                    </div>
                    <div className="stats-value">{stats.policyViolations}</div>
                    <div className="stats-trend down">
                        <TrendDown weight="bold" />
                        -2
                    </div>
                </div>
                <Link to="/system-health" className="stats-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="stats-header">
                        <span>System Health</span>
                        <Heartbeat weight="fill" />
                    </div>
                    <div className="stats-value">{stats.systemHealth}</div>
                    <div className="stats-trend up">
                        <TrendUp weight="bold" />
                        Click to View
                    </div>
                </Link>
            </div>

            <div className="section-header">
                <h2 className="section-title">Quick Actions</h2>
            </div>
            <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
                <Link to="/onboard-client" className="stats-card"
                    style={{ textDecoration: 'none', justifyContent: 'center', alignItems: 'center', border: '1px dashed var(--primary)', backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <PlusCircle size={32} color="var(--primary)" />
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Onboard New Client</span>
                    </div>
                </Link>
                <Link to="/policies" className="stats-card"
                    style={{ textDecoration: 'none', justifyContent: 'center', alignItems: 'center', border: '1px dashed var(--border-color)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <FilePlus size={32} color="var(--text-muted)" />
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Create Policy</span>
                    </div>
                </Link>
                <Link to="/features" className="stats-card"
                    style={{ textDecoration: 'none', justifyContent: 'center', alignItems: 'center', border: '1px dashed var(--border-color)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <ToggleLeft size={32} color="var(--text-muted)" />
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Manage Features</span>
                    </div>
                </Link>
                <Link to="/audit" className="stats-card"
                    style={{ textDecoration: 'none', justifyContent: 'center', alignItems: 'center', border: '1px dashed var(--border-color)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <FileMagnifyingGlass size={32} color="var(--text-muted)" />
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>View All Logs</span>
                    </div>
                </Link>
            </div>

            <div className="section-header">
                <h2 className="section-title">Recent Audit Activity</h2>
                <Link to="/audit" className="btn btn-secondary" style={{ textDecoration: 'none' }}>View All Logs</Link>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Resource</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentLogs.length > 0 ? (
                            recentLogs.map((log, idx) => (
                                <tr key={idx}>
                                    <td>{log.id}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '10px' }}>{log.avatar}</div>
                                            {log.user}
                                        </div>
                                    </td>
                                    <td>{log.action}</td>
                                    <td><span style={{ color: 'var(--text-muted)' }}>{log.resource}</span></td>
                                    <td>{log.time}</td>
                                    <td><span className={`status-capsule ${log.statusClass}`}>{log.status}</span></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    {loading ? 'Loading logs...' : 'No recent activity.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Dashboard;
