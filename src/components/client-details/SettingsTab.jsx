import React, { useState } from 'react';
import { api } from '../../services/api';
import { Copy, Eye, EyeSlash, ArrowsClockwise } from '@phosphor-icons/react';

const SettingsTab = ({ client, updateClient }) => {
    const [showKey, setShowKey] = useState(false);

    const handleSpecChange = (e) => {
        const { name, value } = e.target;
        updateClient({
            details: {
                ...client.details,
                image_specs: {
                    ...client.details?.image_specs,
                    [name]: value
                }
            }
        });
    };

    const [regenerating, setRegenerating] = useState(false);



    const regenerateKey = async () => {
        if (window.confirm('Regenerate Client Secret? This will invalidate the old secret immediately.')) {
            try {
                setRegenerating(true);
                const result = await api.clients.regenerateSecret(client.id);

                if (result.success) {
                    const newSecret = result.data.secret;
                    alert(`New Client Secret Generated:\n\n${newSecret}\n\nPlease copy this now. It will not be shown again.`);
                } else {
                    throw new Error(result.message || 'Failed to regenerate secret');
                }
            } catch (error) {
                console.error('Error regenerating secret:', error);
                alert(`Error: ${error.message}`);
            } finally {
                setRegenerating(false);
            }
        }
    };

    const copyClientId = () => {
        const id = client.api_client?.id || '';
        navigator.clipboard.writeText(id);
        alert('Client ID copied to clipboard');
    };

    const toggleClientStatus = () => {
        // Placeholder for status toggle API
        alert('Status toggle API not available yet.');
    };

    return (
        <div className="tab-pane active">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <h3 className="card-header">Image Specifications</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        Define the required dimensions and format for product images uploaded by this client.
                    </p>
                    <div className="form-group">
                        <label className="form-label">Max File Size (MB)</label>
                        <input
                            type="number"
                            className="form-input"
                            name="max_size"
                            value={client.details?.image_specs?.max_size || 5}
                            onChange={handleSpecChange}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Min Width (px)</label>
                            <input
                                type="number"
                                className="form-input"
                                name="min_width"
                                value={client.details?.image_specs?.min_width || 1024}
                                onChange={handleSpecChange}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Min Height (px)</label>
                            <input
                                type="number"
                                className="form-input"
                                name="min_height"
                                value={client.details?.image_specs?.min_height || 1024}
                                onChange={handleSpecChange}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Allowed Formats</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" checked readOnly /> JPG
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" checked readOnly /> PNG
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" /> WEBP
                            </label>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="card-header">API Access</h3>
                    <div className="form-group">
                        <label className="form-label">API Client ID (Public)</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                className="form-input"
                                value={client.api_client?.id || ''}
                                readOnly
                                style={{ fontFamily: 'monospace' }}
                            />
                            <button className="btn btn-secondary" onClick={copyClientId} title="Copy Client ID">
                                <Copy />
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Client Secret</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="password"
                                className="form-input"
                                value="••••••••••••••••••••••••"
                                readOnly
                                disabled
                            />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            The secret is hidden for security. You can regenerate it if lost.
                        </p>
                    </div>
                    <div className="form-group">
                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={regenerateKey}
                            disabled={regenerating}
                        >
                            <ArrowsClockwise className={regenerating ? 'spin' : ''} />
                            {regenerating ? 'Regenerating...' : 'Regenerate Secret'}
                        </button>
                    </div>
                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid var(--danger)' }}>
                        <h4 style={{ color: 'var(--danger)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Danger Zone</h4>
                        <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={toggleClientStatus}>
                            {client.status === 'active' ? 'Suspend Client Access' : 'Activate Client Access'}
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default SettingsTab;
