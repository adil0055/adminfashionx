import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FloppyDisk, Buildings, MapPin, Desktop, Gear, ClockCounterClockwise } from '@phosphor-icons/react';

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

    useEffect(() => {
        const fetchClientDetails = async () => {
            try {
                setLoading(true);
                const result = await api.clients.getDetails(id);
                if (result.success) {
                    const data = result.data;
                    // Map API data to component state
                    const mappedClient = {
                        id: data.id,
                        name: data.display_name,
                        email: data.contact_email,
                        status: data.api_client?.status || 'Unknown',
                        tier: data.api_client?.tier_id === 1 ? 'Starter' : data.api_client?.tier_id === 2 ? 'Growth' : data.api_client?.tier_id === 3 ? 'Enterprise' : 'Custom',
                        locations: data.locations || [],
                        kiosks: [], // Not provided by this endpoint yet
                        api_client: data.api_client,
                        details: data.details || {} // Ensure details object exists
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

    const handleSave = () => {
        // Placeholder for save functionality if needed, or remove if auto-save is preferred
        alert('Save functionality not implemented for this demo.');
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
                    <button className="btn btn-primary" onClick={handleSave}>
                        <FloppyDisk /> Save Changes
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
        </>
    );
};

export default ClientDetails;
