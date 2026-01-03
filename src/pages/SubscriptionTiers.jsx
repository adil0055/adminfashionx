import React, { useState, useEffect } from 'react';
import { Plus, PencilSimple, Trash, X, Check } from '@phosphor-icons/react';
import { api } from '../services/api';

const SubscriptionTiers = () => {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTier, setCurrentTier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        period: 'per month',
        description: '',
        features: '',
        recommended: false,
        color: 'var(--accent)',
        daily_quota: 1000,
        monthly_quota: 30000,
        rate_limit_rpm: 100
    });

    useEffect(() => {
        fetchTiers();
    }, []);

    const fetchTiers = async () => {
        try {
            setLoading(true);
            const result = await api.config.listTiers();
            if (result.success) {
                setTiers(result.data);
            }
        } catch (error) {
            console.error('Failed to load tiers', error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (tier = null) => {
        if (tier) {
            setCurrentTier(tier);
            setFormData({
                name: tier.name || '',
                price: tier.price_monthly || tier.price || '',
                period: tier.period || 'per month',
                description: tier.description || '',
                features: Array.isArray(tier.features) ? tier.features.join('\n') : (tier.features || ''),
                recommended: tier.recommended || false,
                color: tier.color || 'var(--accent)',
                daily_quota: tier.daily_quota || 1000,
                monthly_quota: tier.monthly_quota || 30000,
                rate_limit_rpm: tier.rate_limit_rpm || 100
            });
        } else {
            setCurrentTier(null);
            setFormData({
                name: '',
                price: '',
                period: 'per month',
                description: '',
                features: '',
                recommended: false,
                color: 'var(--accent)',
                daily_quota: 1000,
                monthly_quota: 30000,
                rate_limit_rpm: 100
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) return alert('Tier Name is required');

        const featuresList = formData.features.split('\n').filter(f => f.trim() !== '');
        const payload = {
            ...formData,
            features: featuresList,
            price_monthly: parseFloat(formData.price) || 0
        };

        try {
            let result;
            if (currentTier) {
                // Assuming update endpoint exists or we just use create for now as per prompt
                // The prompt only specified POST /config/tiers
                // For now, I'll just log that update isn't fully supported by API spec provided
                console.warn('Update tier API not specified, creating new instead or skipping');
                // If we want to support update, we'd need an endpoint. 
                // For this task, I will assume create is the main focus.
                // But to make the UI work for the user, I'll just create a new one or show error.
                // Let's assume we can't update for now based on strict prompt.
                alert('Update tier functionality not available in this demo.');
                return;
            } else {
                result = await api.config.createTier(payload);
            }

            if (result && result.success) {
                fetchTiers();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Failed to save tier', error);
            alert('Failed to save tier: ' + error.message);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this tier?')) {
            setTiers(tiers.filter(t => t.id !== id));
        }
    };

    return (
        <>
            <div className="section-header">
                <div>
                    <h2 className="section-title">Subscription Tiers</h2>
                    <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Manage pricing plans and feature sets
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <Plus /> Add Tier
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading tiers...
                </div>
            ) : tiers.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No subscription tiers found. Click "Add Tier" to create one.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {tiers.map(tier => (
                        <div key={tier.id} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            position: 'relative',
                            border: tier.recommended ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                            background: 'var(--bg-card)',
                            padding: '1.5rem',
                            borderRadius: '16px'
                        }}>
                            {tier.recommended && (
                                <div style={{ position: 'absolute', top: '-10px', right: '20px', background: 'var(--accent)', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                    Recommended
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: tier.color || 'var(--text-main)' }}>{tier.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.5rem' }}>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>${tier.price_monthly || tier.price || 0}</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{tier.period || 'per month'}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="icon-btn" onClick={() => openModal(tier)}><PencilSimple /></button>
                                    <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(tier.id)}><Trash /></button>
                                </div>
                            </div>

                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{tier.description || 'No description'}</p>

                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Features:</div>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {(Array.isArray(tier.features) ? tier.features : []).map((feature, index) => (
                                        <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                            <Check size={14} weight="bold" color="var(--accent)" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                    {(!tier.features || tier.features.length === 0) && (
                                        <li style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No features specified</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">{currentTier ? 'Edit Tier' : 'Add Tier'}</h2>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Tier Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Pro Plan"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Price</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="e.g., 99"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Period</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.period}
                                        onChange={e => setFormData({ ...formData, period: e.target.value })}
                                        placeholder="e.g., per month"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    rows="2"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the plan"
                                ></textarea>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Daily Quota</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.daily_quota}
                                        onChange={e => setFormData({ ...formData, daily_quota: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Monthly Quota</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.monthly_quota}
                                        onChange={e => setFormData({ ...formData, monthly_quota: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Rate Limit (RPM)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.rate_limit_rpm}
                                        onChange={e => setFormData({ ...formData, rate_limit_rpm: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Features (one per line)</label>
                                <textarea
                                    className="form-input"
                                    rows="5"
                                    value={formData.features}
                                    onChange={e => setFormData({ ...formData, features: e.target.value })}
                                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Highlight Color</label>
                                <select
                                    className="form-input"
                                    value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                >
                                    <option value="var(--accent)">Blue (Accent)</option>
                                    <option value="var(--success)">Green (Success)</option>
                                    <option value="var(--warning)">Orange (Warning)</option>
                                    <option value="var(--danger)">Red (Danger)</option>
                                    <option value="var(--text-muted)">Gray (Muted)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.recommended}
                                        onChange={e => setFormData({ ...formData, recommended: e.target.checked })}
                                    />
                                    <span>Mark as Recommended</span>
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save Tier</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SubscriptionTiers;
