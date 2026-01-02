import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UsersThree, MagnifyingGlass, X, ClockCounterClockwise } from '@phosphor-icons/react';
import { api } from '../services/api';

const KiosksAssigned = () => {
    const [kiosks, setKiosks] = useState([]);
    const [clients, setClients] = useState([]);
    const [filteredKiosks, setFilteredKiosks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [clientFilter, setClientFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');

    // Modal
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedKiosk, setSelectedKiosk] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [kiosksResult, clientsResult] = await Promise.all([
                    api.kiosks.listAssigned(),
                    api.clients.list()
                ]);

                if (clientsResult.success) {
                    setClients(clientsResult.data);
                }

                if (kiosksResult.success) {
                    // Map client name if not present in kiosk object, using clients list
                    const mappedKiosks = kiosksResult.data.map(k => {
                        const client = clientsResult.data.find(c => c.id === k.client_id);
                        return {
                            ...k,
                            clientName: k.client_name || (client ? client.display_name : 'Unknown'),
                            clientId: k.client_id
                        };
                    });
                    setKiosks(mappedKiosks);
                    setFilteredKiosks(mappedKiosks);
                }
            } catch (error) {
                console.error('Failed to load assigned kiosks', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let result = kiosks;

        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(k =>
                k.id.toLowerCase().includes(lowerSearch) ||
                k.clientName.toLowerCase().includes(lowerSearch)
            );
        }

        if (clientFilter) {
            result = result.filter(k => k.clientId === clientFilter);
        }

        if (statusFilter) {
            result = result.filter(k => k.status === statusFilter);
        }

        if (locationFilter) {
            result = result.filter(k => k.location && k.location.toLowerCase().includes(locationFilter.toLowerCase()));
        }

        setFilteredKiosks(result);
    }, [search, clientFilter, statusFilter, locationFilter, kiosks]);

    const clearFilters = () => {
        setSearch('');
        setClientFilter('');
        setStatusFilter('');
        setLocationFilter('');
    };

    const openHistory = (kiosk) => {
        setSelectedKiosk(kiosk);
        setIsHistoryModalOpen(true);
    };

    const handleUnassign = async (kiosk) => {
        if (window.confirm(`Are you sure you want to unassign kiosk ${kiosk.id}? It will be returned to stock.`)) {
            try {
                const result = await api.kiosks.unassign(kiosk.id);
                if (result.success) {
                    alert('Kiosk unassigned successfully');
                    // Refresh list
                    const fetchData = async () => {
                        try {
                            setLoading(true);
                            const [kiosksResult, clientsResult] = await Promise.all([
                                api.kiosks.listAssigned(),
                                api.clients.list()
                            ]);

                            if (clientsResult.success) {
                                setClients(clientsResult.data);
                            }

                            if (kiosksResult.success) {
                                const mappedKiosks = kiosksResult.data.map(k => {
                                    const client = clientsResult.data.find(c => c.id === k.client_id);
                                    return {
                                        ...k,
                                        clientName: k.client_name || (client ? client.display_name : 'Unknown'),
                                        clientId: k.client_id
                                    };
                                });
                                setKiosks(mappedKiosks);
                                setFilteredKiosks(mappedKiosks);
                            }
                        } catch (error) {
                            console.error('Failed to load assigned kiosks', error);
                        } finally {
                            setLoading(false);
                        }
                    };
                    fetchData();
                }
            } catch (error) {
                console.error('Failed to unassign kiosk', error);
                alert('Failed to unassign kiosk: ' + error.message);
            }
        }
    };

    return (
        <>
            <div className="section-header">
                <div>
                    <h2 className="section-title">Assigned Kiosks</h2>
                    <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        View all kiosks assigned to clients across the platform.
                    </p>
                </div>
                <Link to="/clients" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                    <UsersThree /> View Clients
                </Link>
            </div>

            <div className="filter-bar">
                <div className="filter-search">
                    <MagnifyingGlass />
                    <input
                        type="text"
                        className="filter-input"
                        placeholder="Search by kiosk ID or client name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label>Client:</label>
                    <select className="filter-select" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
                        <option value="">All Clients</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Status:</label>
                    <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All</option>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Location:</label>
                    <input
                        type="text"
                        className="filter-input"
                        placeholder="Filter by location..."
                        style={{ minWidth: '180px' }}
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                    />
                </div>
                <div className="filter-actions">
                    <button className="filter-clear" onClick={clearFilters}>
                        <X /> Clear
                    </button>
                </div>
                <div className="filter-results">
                    {filteredKiosks.length} results found
                </div>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Kiosk ID</th>
                            <th>Client</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredKiosks.length > 0 ? (
                            filteredKiosks.map((kiosk, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{kiosk.id}</td>
                                    <td>
                                        <Link to={`/clients/${kiosk.clientId}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>
                                            {kiosk.clientName}
                                        </Link>
                                    </td>
                                    <td>{kiosk.location || '-'}</td>
                                    <td>
                                        <span className={`status-capsule ${kiosk.status === 'Online' ? 'status-active' : 'status-inactive'}`}>
                                            {kiosk.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.75rem', padding: '2px 8px', marginRight: '8px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                            onClick={() => handleUnassign(kiosk)}
                                        >
                                            Unassign
                                        </button>
                                        <button className="icon-btn" title="View History" onClick={() => openHistory(kiosk)}>
                                            <ClockCounterClockwise />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No kiosks found matching criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* History Modal */}
            {isHistoryModalOpen && selectedKiosk && (
                <div className="modal-overlay active">
                    <div className="modal-content" style={{ width: '700px' }}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">Kiosk History</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    History for {selectedKiosk.id}
                                </p>
                            </div>
                            <button className="close-modal" onClick={() => setIsHistoryModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="timeline" style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-color)' }}>
                                {/* Mock History Data */}
                                <div className="timeline-item" style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                    <div style={{ position: 'absolute', left: '-1.95rem', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--bg-panel)', border: '2px solid var(--primary)' }}></div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Just now</div>
                                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-color)' }}>
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-main)' }}>Status Check</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>System performed automated health check. Status: {selectedKiosk.status}.</div>
                                    </div>
                                </div>
                                <div className="timeline-item" style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                    <div style={{ position: 'absolute', left: '-1.95rem', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--bg-panel)', border: '2px solid var(--primary)' }}></div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>2 days ago</div>
                                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-color)' }}>
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-main)' }}>Software Update</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Firmware updated to v2.4.1 successfully.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsHistoryModalOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default KiosksAssigned;
