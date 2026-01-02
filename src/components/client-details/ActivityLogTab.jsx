import React from 'react';

const ActivityLogTab = ({ client }) => {
    // Mock logs if none exist
    const logs = client.activityLogs || [
        { id: 1, action: 'Client Profile Updated', user: 'System Admin', time: '2 hours ago', details: 'Updated billing address' },
        { id: 2, action: 'Kiosk Assigned', user: 'Sarah Ops', time: '1 day ago', details: 'Assigned KSK-9942 to Flagship Store' },
        { id: 3, action: 'Plan Upgraded', user: 'System', time: '1 week ago', details: 'Upgraded to Enterprise Tier' },
    ];

    return (
        <div className="tab-pane active">
            <div className="card">
                <h3 className="card-header">Activity Log</h3>
                <div className="timeline" style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-color)' }}>
                    {logs.map((log, idx) => (
                        <div key={idx} className="timeline-item" style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <div style={{ position: 'absolute', left: '-1.95rem', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--bg-panel)', border: '2px solid var(--primary)' }}></div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{log.time} by {log.user}</div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-color)' }}>
                                <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-main)' }}>{log.action}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{log.details}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActivityLogTab;
