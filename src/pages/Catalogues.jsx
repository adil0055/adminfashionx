import React, { useState } from 'react';
import ManageCatalogues from '../components/catalogues/ManageCatalogues';
import UpdateCatalogues from '../components/catalogues/UpdateCatalogues';

const Catalogues = () => {
    const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'update'

    return (
        <>
            <div className="section-header">
                <div>
                    <h2 className="section-title">Catalogues</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Manage and update client product catalogues
                    </p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="tabs-nav" style={{ marginBottom: '2rem' }}>
                <button
                    className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manage')}
                >
                    Manage Catalogues
                </button>
                <button
                    className={`tab-btn ${activeTab === 'update' ? 'active' : ''}`}
                    onClick={() => setActiveTab('update')}
                >
                    Update Catalogues
                </button>
            </div>

            {/* Content Area */}
            <div className="tab-content">
                {activeTab === 'manage' ? <ManageCatalogues /> : <UpdateCatalogues />}
            </div>
        </>
    );
};

export default Catalogues;
