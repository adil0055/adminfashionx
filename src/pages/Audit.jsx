import React, { useState, useEffect } from 'react';
import { DownloadSimple } from '@phosphor-icons/react';
import { api } from '../services/api';

const Audit = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const result = await api.audit.getLogs();
                if (result.success) {
                    // Map API logs to UI format if needed, or assume they match
                    // API response: Paginated list of all admin actions (who changed what).
                    // Assuming structure matches or is close enough.
                    // If API returns simple objects, we might need to map statusClass etc.
                    const mappedLogs = result.data.map(log => ({
                        ...log,
                        statusClass: log.status === 'Success' ? 'status-active' : log.status === 'Pending Approval' ? 'status-warning' : 'status-inactive',
                        avatar: log.user ? log.user.charAt(0).toUpperCase() : 'U'
                    }));
                    setLogs(mappedLogs);
                }
            } catch (error) {
                console.error('Failed to load audit logs', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const handleExport = () => {
        const headers = ['ID', 'User', 'Action', 'Resource', 'Time', 'Status'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [log.id, log.user, log.action, log.resource, log.time, log.status].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'audit_logs.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <>
            <div className="section-header">
                <h2 className="section-title">System Audit Log</h2>
                <button className="btn btn-secondary" onClick={handleExport}>
                    <DownloadSimple /> Export CSV
                </button>
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
                        {logs.map((log, index) => (
                            <tr key={index}>
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
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default Audit;
