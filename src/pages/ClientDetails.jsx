import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FloppyDisk, Buildings, MapPin, Desktop, Gear, ClockCounterClockwise, CircleNotch } from '@phosphor-icons/react';
import Modal from '../components/common/Modal';

import GeneralTab from '../components/client-details/GeneralTab';
import BillingTab from '../components/client-details/BillingTab';
import LocationsTab from '../components/client-details/LocationsTab';
import KiosksTab from '../components/client-details/KiosksTab';
import SettingsTab from '../components/client-details/SettingsTab';
import ActivityLogTab from '../components/client-details/ActivityLogTab';

import { api } from '../services/api';

const ClientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modal, setModal] = useState({ show: false, type: 'info', title: '', message: '' });

    const closeModal = () => setModal({ ...modal, show: false });

    useEffect(() => {
        const fetchClientDetails = async () => {
            try {
                setLoading(true);
                const result = await api.clients.getDetails(id);
                if (result.success) {
                    const data = result.data;
                    // Map API data to component state
                    // Parse config if it's a string
                    let apiConfig = {};
                    try {
                        if (data.api_client?.config) {
                            apiConfig = typeof data.api_client.config === 'string'
                                ? JSON.parse(data.api_client.config)
                                : data.api_client.config;
                        }
                    } catch (e) {
                        console.error("Failed to parse api_client config", e);
                    }

                    const mappedClient = {
                        id: data.id,
                        name: data.display_name,
                        client_type: data.client_type,
                        email: data.contact_email,
                        status: data.api_client?.status || 'Unknown',
                        tier: data.api_client?.tier_id === 1 ? 'Starter' : data.api_client?.tier_id === 2 ? 'Growth' : data.api_client?.tier_id === 3 ? 'Enterprise' : 'Custom',
                        locations: data.locations || [],
                        kiosks: [], // Not provided by this endpoint yet
                        api_client: {
                            ...data.api_client,
                            ...apiConfig // Merge parsed config (daily_quota, etc.) into api_client
                        },
                        timezone: data.timezone,
                        details: {
                            hq_address: data.hq_address || {},
                            image_specs: data.image_specs || {},
                            billing: {
                                contact: data.hq_address?.billing_contact || '',
                                email: data.contact_email
                            }
                        }
                    };
                    setClient(mappedClient);
                } else {
                    throw new Error(result.message || 'Failed to fetch client details');
                }
            } catch (err) {
                console.error('Error fetching client details:', err);
                // navigate('/clients'); // Optional: redirect on error
            } finally {
                setLoading(false);
            }
        };

        fetchClientDetails();
    }, [id, navigate]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const tierMapping = { 'Starter': 1, 'Growth': 2, 'Enterprise': 3 };
            const payload = {
                display_name: client.name,
                client_type: client.client_type,
                contact_email: client.email,
                status: client.status, // API should handle case-insensitivity or we map if needed
                timezone: client.timezone,
                tier_id: tierMapping[client.tier] || client.api_client?.tier_id
            };

            const result = await api.clients.update(client.id, payload);

            if (result.success) {
                setModal({
                    show: true,
                    type: 'success',
                    title: 'Success',
                    message: 'Client details updated successfully.'
                });
            } else {
                throw new Error(result.message || 'Update failed');
            }
        } catch (error) {
            console.error('Failed to save client:', error);
            setModal({
                show: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to save changes: ' + error.message
            });
        } finally {
            setSaving(false);
        }
    };

    const updateClientState = (updates) => {
        setClient(prev => ({ ...prev, ...updates }));
    };

    if (loading) return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading client details...</div>;
    if (!client) return null;

    return (
        <>
            <div className="section-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                        <Link to="/clients" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                            <ArrowLeft size={20} />
                        </Link>
                        <h2 className="section-title">{client.name}</h2>
                        <span className={`status-capsule ${client.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                            {client.status}
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '30px' }}>
                        ID: <span style={{ fontFamily: 'monospace' }}>{client.id}</span>
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? <CircleNotch className="spin" /> : <FloppyDisk />}
                        {saving ? ' Saving...' : ' Save Changes'}
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '2rem' }}>
                <div className="stat-card">
                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{client.tier}</div>
                    <div className="stat-label">Subscription Tier</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{client.locations?.length || 0}</div>
                    <div className="stat-label">Total Locations</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{client.kiosks?.length || 0}</div>
                    <div className="stat-label">Active Kiosks</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--warning)' }}>$0.00</div>
                    <div className="stat-label">Payment Due</div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="tabs-nav">
                <button
                    className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    <Buildings /> General
                </button>
                <button
                    className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('billing')}
                >
                    <MapPin /> Billing & Address
                </button>
                <button
                    className={`tab-btn ${activeTab === 'locations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('locations')}
                >
                    <MapPin /> Locations
                </button>
                <button
                    className={`tab-btn ${activeTab === 'kiosks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('kiosks')}
                >
                    <Desktop /> Kiosks
                </button>
                <button
                    className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <Gear /> Settings
                </button>
                <button
                    className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    <ClockCounterClockwise /> Activity Log
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'general' && (
                    <GeneralTab client={client} updateClient={updateClientState} />
                )}
                {activeTab === 'billing' && (
                    <BillingTab client={client} updateClient={updateClientState} />
                )}
                {activeTab === 'locations' && (
                    <LocationsTab client={client} updateClient={updateClientState} />
                )}
                {activeTab === 'kiosks' && (
                    <KiosksTab client={client} updateClient={updateClientState} />
                )}
                {activeTab === 'settings' && (
                    <SettingsTab client={client} updateClient={updateClientState} />
                )}
                {activeTab === 'logs' && (
                    <ActivityLogTab client={client} />
                )}
            </div>

            <Modal
                show={modal.show}
                onClose={closeModal}
                title={modal.title}
                type={modal.type}
                footer={<button className="btn btn-primary" onClick={closeModal}>OK</button>}
            >
                <p>{modal.message}</p>
            </Modal>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </>
    );
};

export default ClientDetails;
