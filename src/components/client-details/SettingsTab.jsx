import React, { useState } from 'react';
import { api } from '../../services/api';
import { Copy, Eye, EyeSlash, ArrowsClockwise, X, Check, Warning, ShieldCheck } from '@phosphor-icons/react';
import Modal from '../common/Modal';

const SettingsTab = ({ client, updateClient }) => {
    const [showKey, setShowKey] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    // Modal States
    const [modal, setModal] = useState({
        show: false,
        type: 'info', // 'info', 'secret', 'confirm', 'error', 'success'
        title: '',
        message: '',
        data: null,
        onConfirm: null
    });

    const closeModal = () => setModal({ ...modal, show: false });

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

    const regenerateKey = async () => {
        setModal({
            show: true,
            type: 'confirm',
            title: 'Regenerate Client Secret',
            message: 'Are you sure? This will invalidate the old secret immediately. Any applications using the old secret will lose access.',
            onConfirm: async () => {
                try {
                    closeModal();
                    setRegenerating(true);
                    const result = await api.clients.regenerateSecret(client.id);

                    if (result.success) {
                        const newSecret = result.data.secret;
                        setModal({
                            show: true,
                            type: 'secret',
                            title: 'New Client Secret Generated',
                            message: 'Please copy this secret now. For security reasons, it will not be shown again.',
                            data: newSecret
                        });
                    } else {
                        throw new Error(result.message || 'Failed to regenerate secret');
                    }
                } catch (error) {
                    console.error('Error regenerating secret:', error);
                    setModal({
                        show: true,
                        type: 'error',
                        title: 'Regeneration Failed',
                        message: error.message
                    });
                } finally {
                    setRegenerating(false);
                }
            }
        });
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        setModal({
            show: true,
            type: 'success',
            title: 'Success',
            message: `${label} copied to clipboard.`
        });
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

                    <div className="form-group">
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={async () => {
                                try {
                                    const result = await api.clients.update(client.id, {
                                        image_specs: client.details?.image_specs
                                    });
                                    if (result.success) {
                                        setModal({
                                            show: true,
                                            type: 'success',
                                            title: 'Success',
                                            message: 'Image specifications updated successfully.'
                                        });
                                    }
                                } catch (error) {
                                    setModal({
                                        show: true,
                                        type: 'error',
                                        title: 'Error',
                                        message: 'Failed to update specifications: ' + error.message
                                    });
                                }
                            }}
                        >
                            Save Specifications
                        </button>
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
                            <button className="btn btn-secondary" onClick={() => copyToClipboard(client.api_client?.id || '', 'Client ID')} title="Copy Client ID">
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

                </div>

                <div className="card">
                    <h3 className="card-header">Quota Configuration</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        Override the default tier limits for this specific client.
                    </p>
                    <div className="form-group">
                        <label className="form-label">Daily Quota</label>
                        <input
                            type="number"
                            className="form-input"
                            value={client.api_client?.daily_quota || ''}
                            onChange={(e) => updateClient({
                                api_client: { ...client.api_client, daily_quota: parseInt(e.target.value) || 0 }
                            })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Monthly Quota</label>
                        <input
                            type="number"
                            className="form-input"
                            value={client.api_client?.monthly_quota || ''}
                            onChange={(e) => updateClient({
                                api_client: { ...client.api_client, monthly_quota: parseInt(e.target.value) || 0 }
                            })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Rate Limit (RPM)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={client.api_client?.rate_limit_rpm || ''}
                            onChange={(e) => updateClient({
                                api_client: { ...client.api_client, rate_limit_rpm: parseInt(e.target.value) || 0 }
                            })}
                        />
                    </div>
                    <div className="form-group">
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={async () => {
                                try {
                                    const result = await api.clients.update(client.id, {
                                        daily_quota: client.api_client?.daily_quota,
                                        monthly_quota: client.api_client?.monthly_quota,
                                        rate_limit_rpm: client.api_client?.rate_limit_rpm
                                    });
                                    if (result.success) {
                                        setModal({
                                            show: true,
                                            type: 'success',
                                            title: 'Success',
                                            message: 'Quota configuration updated successfully.'
                                        });
                                    }
                                } catch (error) {
                                    setModal({
                                        show: true,
                                        type: 'error',
                                        title: 'Error',
                                        message: 'Failed to update quotas: ' + error.message
                                    });
                                }
                            }}
                        >
                            Save Quotas
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                show={modal.show}
                onClose={closeModal}
                title={modal.title}
                type={modal.type}
                maxWidth="450px"
                footer={
                    modal.type === 'confirm' ? (
                        <>
                            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                            <button className="btn btn-primary" onClick={modal.onConfirm}>Confirm Regeneration</button>
                        </>
                    ) : (
                        <button className="btn btn-primary" onClick={closeModal} style={{ minWidth: '100px', justifyContent: 'center' }}>
                            {modal.type === 'secret' ? 'I have copied it' : 'OK'}
                        </button>
                    )
                }
            >
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: modal.type === 'secret' ? '1.5rem' : '0' }}>
                    {modal.message}
                </p>

                {modal.type === 'secret' && (
                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '1.25rem',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        position: 'relative'
                    }}>
                        <code style={{
                            display: 'block',
                            wordBreak: 'break-all',
                            color: 'var(--primary)',
                            fontFamily: 'monospace',
                            fontSize: '0.95rem',
                            paddingRight: '40px'
                        }}>
                            {modal.data}
                        </code>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(modal.data);
                            }}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'var(--bg-panel)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-main)',
                                padding: '6px',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                            title="Copy Secret"
                        >
                            <Copy size={18} />
                        </button>
                    </div>
                )}
            </Modal>

            <style>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div >
    );
};

export default SettingsTab;
