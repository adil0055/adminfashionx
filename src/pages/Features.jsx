import React, { useState } from 'react';
import { Flask } from '@phosphor-icons/react';

const Features = () => {
    const [features, setFeatures] = useState([
        { id: 1, name: 'Virtual Try-On V2', status: 'Beta', statusClass: 'status-warning', description: 'Next-gen AI rendering engine with improved fabric physics.', active: true },
        { id: 2, name: 'Instant Checkout', status: 'Alpha', statusClass: 'status-warning', description: 'Allow direct purchase from kiosk interface.', active: false },
        { id: 3, name: 'Social Sharing', status: 'GA', statusClass: 'status-active', description: 'Integration with Instagram and TikTok APIs.', active: true },
    ]);

    const toggleFeature = (id) => {
        setFeatures(features.map(f => f.id === id ? { ...f, active: !f.active } : f));
    };

    return (
        <>
            <div className="section-header">
                <h2 className="section-title">Feature Flags & Rollouts</h2>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
                {features.map(feature => (
                    <div key={feature.id} className="feature-card">
                        <div className="feature-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                <h3>{feature.name}</h3>
                                <span className={`status-capsule ${feature.statusClass}`}>{feature.status}</span>
                            </div>
                            <p>{feature.description}</p>
                        </div>
                        <div
                            className={`toggle-switch ${feature.active ? 'active' : ''}`}
                            onClick={() => toggleFeature(feature.id)}
                        ></div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px dashed var(--border-color)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Flask size={32} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                <p>Create new feature flags in the LaunchDarkly integration panel.</p>
            </div>
        </>
    );
};

export default Features;
