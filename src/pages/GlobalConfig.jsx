import React, { useState } from 'react';
import { FloppyDisk } from '@phosphor-icons/react';

const GlobalConfig = () => {
    const [config, setConfig] = useState({
        heartbeatInterval: 60,
        maintenanceMode: false,
        maxSessions: 50000
    });

    const handleSave = () => {
        // In a real app, this would make an API call
        alert('Global configuration saved successfully!');
    };

    return (
        <>
            <div className="section-header">
                <h2 className="section-title">System Defaults</h2>
                <button className="btn btn-primary" onClick={handleSave}>
                    <FloppyDisk /> Save Changes
                </button>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: 'var(--glass-border)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Platform Parameters</h3>

                    <div className="form-group">
                        <label className="form-label">Default Kiosk Heartbeat Interval (sec)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={config.heartbeatInterval}
                            onChange={(e) => setConfig({ ...config, heartbeatInterval: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Global Maintenance Mode</label>
                        <div className="feature-card" style={{ margin: 0, padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                            <div className="feature-info">
                                <h3 style={{ fontSize: '0.9rem' }}>Maintenance State</h3>
                                <p style={{ fontSize: '0.8rem' }}>Forces all connected kiosks into maintenance screen.</p>
                            </div>
                            <div
                                className={`toggle-switch ${config.maintenanceMode ? 'active' : ''}`}
                                onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
                            ></div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Max Global Concurent Sessions</label>
                        <input
                            type="number"
                            className="form-input"
                            value={config.maxSessions}
                            onChange={(e) => setConfig({ ...config, maxSessions: parseInt(e.target.value) })}
                        />
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: 'var(--glass-border)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Environment Info</h3>
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Current Version</p>
                        <p style={{ fontWeight: 600 }}>v2.4.0-release</p>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Last Deployed</p>
                        <p style={{ fontWeight: 600 }}>Dec 18, 04:00 AM</p>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Region</p>
                        <p style={{ fontWeight: 600 }}>US-East-1</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GlobalConfig;
