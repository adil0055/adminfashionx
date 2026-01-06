import React, { useState, useEffect } from 'react';
import {
    Heartbeat,
    Database,
    HardDrives,
    ShareNetwork,
    Cpu,
    Warning,
    CheckCircle,
    XCircle,
    ArrowsClockwise
} from '@phosphor-icons/react';
import { api } from '../services/api';

const SystemHealth = () => {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const result = await api.health.diagnostic();
            if (result.success) {
                setHealth(result.data);
                setError(null);
            } else {
                // If api.health.diagnostic catches an error, it returns success:false but still data structure
                setHealth(result.data);
                setError(result.data.error || 'Failed to fetch health data');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setLastUpdated(new Date());
        }
    };

    useEffect(() => {
        fetchHealth();
        // Optional: Auto-refresh every 30s
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'healthy':
            case 'up':
            case 'connected':
            case 'operational':
            case 'reachable':
                return 'var(--success)';
            case 'degraded':
                return 'var(--warning)';
            case 'unhealthy':
            case 'down':
                return 'var(--danger)';
            default:
                return 'var(--text-muted)';
        }
    };

    const StatusBadge = ({ status, latency }) => {
        const color = getStatusColor(status);
        const isHealthy = color === 'var(--success)';

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="status-capsule" style={{
                    backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                    color: color,
                    border: `1px solid ${color}`
                }}>
                    {status || 'Unknown'}
                </span>
                {latency !== undefined && (
                    <span style={{
                        fontSize: '0.75rem',
                        color: latency > 100 ? 'var(--warning)' : 'var(--text-muted)',
                        fontWeight: 500
                    }}>
                        {latency}ms
                    </span>
                )}
            </div>
        );
    };

    const DependencyRow = ({ name, data, icon: Icon }) => (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: data?.status === 'unhealthy' ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)'
                }}>
                    <Icon size={20} />
                </div>
                <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{name}</div>
                    {data?.error && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginTop: '2px' }}>
                            <Warning size={14} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
                            {data.error}
                        </div>
                    )}
                    {data?.brokers && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Brokers: {data.brokers}</div>}
                    {data?.bucket && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bucket: {data.bucket}</div>}
                </div>
            </div>
            <StatusBadge status={data?.status} latency={data?.latency_ms} />
        </div>
    );

    if (loading && !health) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Heartbeat size={48} className="spin-slow" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                <h3>Running Diagnostics...</h3>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="section-header">
                <div>
                    <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Heartbeat weight="fill" color={getStatusColor(health?.status)} />
                        System Health
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Deep diagnostic check of all critical infrastructure and integrations.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {lastUpdated && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <button className="btn btn-secondary" onClick={fetchHealth} disabled={loading}>
                        <ArrowsClockwise className={loading ? 'spin' : ''} /> Refresh
                    </button>
                </div>
            </div>

            {/* Global Status Banner if Unhealthy */}
            {health?.status !== 'healthy' && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: health?.status === 'degraded' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${health?.status === 'degraded' ? 'var(--warning)' : 'var(--danger)'}`,
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Warning size={24} weight="fill" color={health?.status === 'degraded' ? 'var(--warning)' : 'var(--danger)'} />
                    <span style={{ fontWeight: 500, color: health?.status === 'degraded' ? 'var(--warning)' : 'var(--danger)' }}>
                        {health?.status === 'degraded' ? 'System Performance Degraded' : 'Critical System Failure'} - Some services are not operating correctly.
                    </span>
                </div>
            )}

            <div className="dashboard-grid">
                {/* Infrastructure Card */}
                <div className="stats-card" style={{ display: 'block', padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-panel)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Database size={20} color="var(--primary)" />
                            Infrastructure
                        </h3>
                    </div>
                    <div>
                        <DependencyRow name="Database (PostgreSQL)" data={health?.dependencies?.database} icon={Database} />
                        <DependencyRow name="Cache (Redis)" data={health?.dependencies?.redis} icon={HardDrives} />
                        <DependencyRow name="Event Bus (Kafka)" data={health?.dependencies?.kafka} icon={ShareNetwork} />
                    </div>
                </div>

                {/* Integrations Card */}
                <div className="stats-card" style={{ display: 'block', padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-panel)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShareNetwork size={20} color="var(--accent)" />
                            Integrations
                        </h3>
                    </div>
                    <div>
                        <DependencyRow name="VTON Provider (Flux/Qwen)" data={health?.integrations?.vton_provider} icon={Cpu} />
                        <DependencyRow name="Object Storage (S3)" data={health?.integrations?.s3_storage} icon={HardDrives} />
                    </div>
                </div>

                {/* System Stats Card */}
                <div className="stats-card" style={{ display: 'block', padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Cpu size={20} color="var(--success)" />
                        Server Resources
                    </h3>

                    <div style={{ marginBottom: '1.5rem' }}>
                        {(() => {
                            const load = health?.system?.cpu_load_avg?.[0] || 0;
                            const cores = health?.system?.cpu_count || 1;
                            const usagePercent = Math.round((load / cores) * 100);

                            let statusText = `Healthy ${usagePercent}%`;
                            let statusColor = 'var(--success)';

                            if (usagePercent > 400) {
                                statusText = `Critical >400%`;
                                statusColor = 'var(--danger)';
                            } else if (usagePercent > 100) {
                                statusText = `Bottleneck >100%`;
                                statusColor = 'var(--warning)';
                            }

                            return (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>CPU Usage ({cores} Cores)</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontWeight: 600, color: statusColor }}>{statusText}</span>
                                            {usagePercent > 100 ? (
                                                <Warning weight="fill" color={statusColor} />
                                            ) : (
                                                <CheckCircle weight="fill" color={statusColor} />
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-panel)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${Math.min(usagePercent, 100)}%`,
                                            backgroundColor: statusColor,
                                            transition: 'width 0.5s ease'
                                        }}></div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-panel)', borderRadius: '8px' }}>
                            <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Platform</div>
                            <div style={{ fontWeight: 500 }}>{health?.system?.platform || 'Linux'}</div>
                        </div>
                        <div style={{ padding: '1rem', backgroundColor: 'var(--bg-panel)', borderRadius: '8px' }}>
                            <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Total Latency</div>
                            <div style={{ fontWeight: 500 }}>{health?.total_latency_ms || 0}ms</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Version: {health?.version || '0.0.0'} • Python: {health?.system?.python_version}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemHealth;
