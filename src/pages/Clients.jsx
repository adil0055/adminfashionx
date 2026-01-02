import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlass, Funnel, Plus, CircleNotch } from '@phosphor-icons/react';
import { api } from '../services/api';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState({ search: '', status: '' });

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
                                            {Array.isArray(client.locations) ? client.locations.length : 0} Locations
                                        </td>
                                        <td>
                                            <span className={`status-capsule ${client.status === 'active' ? 'status-active' : 'status-neutral'}`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <Link to={`/clients/${client.id}`} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px', textDecoration: 'none', display: 'inline-block' }}>
                                                Manage
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
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
