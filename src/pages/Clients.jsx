import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlass, Funnel, Plus, CircleNotch, Trash, Pause, Play } from '@phosphor-icons/react';
import { api } from '../services/api';
import Modal from '../components/common/Modal';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({ search: '', status: '' });

    // Custom Modal State
    const [customModal, setCustomModal] = useState({
        show: false,
        type: 'info',
        title: '',
        message: '',
        onConfirm: null
    });

    const closeCustomModal = () => setCustomModal({ ...customModal, show: false });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const result = await api.clients.list();
            setClients(result.data || []);
        } catch (err) {
            console.error('Error fetching clients:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = !filter.search ||
            (client.display_name && client.display_name.toLowerCase().includes(filter.search.toLowerCase())) ||
            (client.api_client_id && client.api_client_id.toLowerCase().includes(filter.search.toLowerCase()));
        const matchesStatus = !filter.status || client.status === filter.status;
        return matchesSearch && matchesStatus;
    });

    const getLocationCount = (client) => {
        // API returns 'locations' as a number (count) in the list view
        if (typeof client.locations === 'number') return client.locations;

        // Fallback checks
        if (typeof client.location_count === 'number') return client.location_count;
        if (typeof client.locations_count === 'number') return client.locations_count;
        if (Array.isArray(client.locations)) return client.locations.length;

        return 0;
    };

    const handleStatusToggle = (client) => {
        const newStatus = client.status === 'suspended' ? 'active' : 'suspended';
        const action = client.status === 'suspended' ? 'Activate' : 'Suspend';

        setCustomModal({
            show: true,
            type: 'confirm',
            title: `${action} Client`,
            message: `Are you sure you want to ${action.toLowerCase()} ${client.display_name}?`,
            onConfirm: async () => {
                closeCustomModal();
                try {
                    const result = await api.clients.updateStatus(client.id, newStatus);
                    if (result.success) {
                        fetchClients();
                    }
                } catch (error) {
                    console.error('Failed to update status', error);
                    setCustomModal({
                        show: true,
                        type: 'error',
                        title: 'Error',
                        message: 'Failed to update status: ' + error.message
                    });
                }
            }
        });
    };

    const handleDelete = (client) => {
        setCustomModal({
            show: true,
            type: 'confirm',
            title: 'Delete Client',
            message: `Are you sure you want to delete ${client.display_name}? This action cannot be undone.`,
            onConfirm: async () => {
                closeCustomModal();
                try {
                    const result = await api.clients.delete(client.id);
                    if (result.success) {
                        fetchClients();
                    }
                } catch (error) {
                    console.error('Failed to delete client', error);
                    setCustomModal({
                        show: true,
                        type: 'error',
                        title: 'Error',
                        message: 'Failed to delete client: ' + error.message
                    });
                }
            }
        });
    };

    const clearFilters = () => setFilter({ search: '', status: '' });

    return (
        <>
            <div className="section-header">
                <h2 className="section-title">Client Management</h2>
                <Link to="/onboard-client" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                    <Plus weight="bold" />
                    Onboard New Client
                </Link>
            </div>

            <div className="filter-bar">
                <div className="filter-search" style={{ position: 'relative' }}>
                    <MagnifyingGlass
                        size={20}
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)'
                        }}
                    />
                    <input
                        type="text"
                        className="filter-input"
                        style={{ paddingLeft: '40px', width: '100%' }}
                        placeholder="Search clients..."
                        value={filter.search}
                        onChange={e => setFilter({ ...filter, search: e.target.value })}
                    />
                </div>
                <div className="filter-group">
                    <label>Status:</label>
                    <select
                        className="filter-select"
                        value={filter.status}
                        onChange={e => setFilter({ ...filter, status: e.target.value })}
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div className="filter-actions">
                    <button className="filter-clear" onClick={clearFilters}>Clear Filters</button>
                </div>
                <div className="filter-results">
                    Showing {filteredClients.length} of {clients.length} clients
                </div>
            </div>

            <div className="data-table-container">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <CircleNotch size={32} className="spin" />
                        <p>Loading clients...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
                        Error: {error}
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Client Name</th>
                                <th>API Client ID</th>
                                <th>Locations</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="clients-table-body">
                            {filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No clients match the current filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map(client => (
                                    <tr key={client.id}>
                                        <td><span style={{ fontWeight: 600 }}>{client.display_name}</span></td>
                                        <td><code style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{client.api_client_id}</code></td>
                                        <td>
                                            {getLocationCount(client)} Locations
                                        </td>
                                        <td>
                                            <span className={`status-capsule ${client.status === 'active' ? 'status-active' : client.status === 'suspended' ? 'status-warning' : 'status-neutral'}`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <Link to={`/clients/${client.id}`} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px', textDecoration: 'none', display: 'inline-block', marginRight: '8px' }}>
                                                Manage
                                            </Link>
                                            <button
                                                className="icon-btn"
                                                title={client.status === 'suspended' ? 'Activate' : 'Suspend'}
                                                onClick={() => handleStatusToggle(client)}
                                                style={{ marginRight: '4px' }}
                                            >
                                                {client.status === 'suspended' ? <Play /> : <Pause />}
                                            </button>
                                            <button
                                                className="icon-btn"
                                                title="Delete"
                                                style={{ color: 'var(--danger)' }}
                                                onClick={() => handleDelete(client)}
                                            >
                                                <Trash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                show={customModal.show}
                onClose={closeCustomModal}
                title={customModal.title}
                type={customModal.type}
                footer={
                    customModal.type === 'confirm' ? (
                        <>
                            <button className="btn btn-secondary" onClick={closeCustomModal}>Cancel</button>
                            <button className="btn btn-primary" onClick={customModal.onConfirm}>Confirm</button>
                        </>
                    ) : (
                        <button className="btn btn-primary" onClick={closeCustomModal} style={{ minWidth: '100px', justifyContent: 'center' }}>OK</button>
                    )
                }
            >
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    {customModal.message}
                </p>
            </Modal>

            <style>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default Clients;
