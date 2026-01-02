import React, { useState, useEffect } from 'react';
import { Plus, MagnifyingGlass, X, PencilSimple, Trash } from '@phosphor-icons/react';

import { api } from '../services/api';

const KiosksStock = () => {
    const [stockKiosks, setStockKiosks] = useState([]);
    const [filteredKiosks, setFilteredKiosks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newKiosk, setNewKiosk] = useState({
        id: '',
        location: '',
        status: 'In Stock'
    });

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        try {
            setLoading(true);
            const result = await api.kiosks.listStock();
            if (result.success) {
                setStockKiosks(result.data);
            }
        } catch (error) {
            console.error('Failed to load stock kiosks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = stockKiosks;

        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(k => k.id.toLowerCase().includes(lowerSearch));
        }

        if (statusFilter) {
            result = result.filter(k => k.status === statusFilter);
        }

        if (locationFilter) {
            result = result.filter(k => k.location && k.location.toLowerCase().includes(locationFilter.toLowerCase()));
        }

        setFilteredKiosks(result);
    }, [search, statusFilter, locationFilter, stockKiosks]);

    const handleAddKiosk = async () => {
        if (newKiosk.isEdit) {
            // Edit not supported by API spec yet
            alert('Editing stock kiosks is not supported by the backend API yet.');
        } else {
            // Add new
            try {
                const result = await api.kiosks.addStock({
                    kiosk_id: newKiosk.id,
                    warehouse: newKiosk.location
                });
                if (result.success) {
                    fetchStock();
                    setIsModalOpen(false);
                    setNewKiosk({ id: '', location: '', status: 'In Stock' });
                }
            } catch (error) {
                console.error('Failed to add kiosk', error);
                alert('Failed to add kiosk: ' + error.message);
            }
        }
    };

    const handleEdit = (kiosk) => {
        setNewKiosk({ ...kiosk, isEdit: true });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this kiosk from stock?')) {
            const updatedStock = stockKiosks.filter(k => k.id !== id);
            setStockKiosks(updatedStock);
            localStorage.setItem('nexus_stock_kiosks', JSON.stringify(updatedStock));
        }
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setLocationFilter('');
    };

    // Assign Modal
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignKiosk, setAssignKiosk] = useState(null);
    const [clients, setClients] = useState([]);
    const [assignData, setAssignData] = useState({ clientId: '', locationId: '' });
    const [assignLoading, setAssignLoading] = useState(false);

    const openAssignModal = async (kiosk) => {
        setAssignKiosk(kiosk);
        setAssignData({ clientId: '', locationId: '' });
        setIsAssignModalOpen(true);

        // Fetch clients if not loaded
        if (clients.length === 0) {
            try {
                const result = await api.clients.list();
                if (result.success) {
                    setClients(result.data);
                }
            } catch (error) {
                console.error('Failed to load clients', error);
            }
        }
    };

    const handleAssignSubmit = async () => {
        if (!assignData.clientId || !assignData.locationId) {
            alert('Please select a client and location');
            return;
        }

        try {
            setAssignLoading(true);
            const result = await api.kiosks.assign(assignKiosk.id, {
                client_id: assignData.clientId,
                location_id: assignData.locationId
            });

            if (result.success) {
                alert('Kiosk assigned successfully');
                setIsAssignModalOpen(false);
                fetchStock(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to assign kiosk', error);
            alert('Failed to assign kiosk: ' + error.message);
        } finally {
            setAssignLoading(false);
        }
    };

    // Helper to get locations for selected client
    const getClientLocations = () => {
        const client = clients.find(c => c.id == assignData.clientId);
        return client ? client.locations || [] : [];
    };

    return (
        <>
            <div className="section-header">
                <div>
                    <h2 className="section-title">Stock Kiosks</h2>
                    <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Manage unassigned kiosks in inventory. Add new stock, update status, and assign to clients.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus /> Add Stock Kiosk
                </button>
            </div>

            <div className="filter-bar">
                <div className="filter-search">
                    <MagnifyingGlass />
                    <input
                        type="text"
                        className="filter-input"
                        placeholder="Search by kiosk ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label>Status:</label>
                    <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Reserved">Reserved</option>
                        <option value="RMA / Repair">RMA / Repair</option>
                        <option value="Retired">Retired</option>
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
                            <th>Location</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredKiosks.length > 0 ? (
                            filteredKiosks.map((kiosk, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{kiosk.id}</td>
                                    <td>{kiosk.location || '-'}</td>
                                    <td>
                                        <span className={`status-capsule ${kiosk.status === 'In Stock' ? 'status-active' :
                                            kiosk.status === 'Reserved' ? 'status-warning' : 'status-inactive'
                                            }`}>
                                            {kiosk.status}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {new Date(kiosk.lastUpdated).toLocaleString()}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.75rem', padding: '2px 8px', marginRight: '8px' }}
                                            onClick={() => openAssignModal(kiosk)}
                                        >
                                            Assign
                                        </button>
                                        <button className="icon-btn" title="Edit" onClick={() => handleEdit(kiosk)}>
                                            <PencilSimple />
                                        </button>
                                        <button className="icon-btn" title="Delete" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(kiosk.id)}>
                                            <Trash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No stock kiosks found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Kiosk Modal */}
            {isModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-content" style={{ width: '500px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{newKiosk.isEdit ? 'Edit Stock Kiosk' : 'Add New Stock Kiosk'}</h3>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Kiosk ID (Serial Number)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. KSK-9942"
                                    value={newKiosk.id}
                                    onChange={(e) => setNewKiosk({ ...newKiosk, id: e.target.value })}
                                    disabled={newKiosk.isEdit}
                                />
                                {!newKiosk.isEdit && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        Leave blank to auto-generate a random ID.
                                    </p>
                                )}
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Warehouse A"
                                    value={newKiosk.location}
                                    onChange={(e) => setNewKiosk({ ...newKiosk, location: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-input"
                                    value={newKiosk.status}
                                    onChange={(e) => setNewKiosk({ ...newKiosk, status: e.target.value })}
                                >
                                    <option value="In Stock">In Stock</option>
                                    <option value="Reserved">Reserved</option>
                                    <option value="RMA / Repair">RMA / Repair</option>
                                    <option value="Retired">Retired</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={handleAddKiosk}>
                                {newKiosk.isEdit ? 'Save Changes' : 'Add Kiosk'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {isAssignModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-content" style={{ width: '500px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Assign Kiosk {assignKiosk?.id}</h3>
                            <button className="close-modal" onClick={() => setIsAssignModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Select Client</label>
                                <select
                                    className="form-input"
                                    value={assignData.clientId}
                                    onChange={(e) => setAssignData({ ...assignData, clientId: e.target.value, locationId: '' })}
                                >
                                    <option value="">-- Select Client --</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.display_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Select Location</label>
                                <select
                                    className="form-input"
                                    value={assignData.locationId}
                                    onChange={(e) => setAssignData({ ...assignData, locationId: e.target.value })}
                                    disabled={!assignData.clientId}
                                >
                                    <option value="">-- Select Location --</option>
                                    {getClientLocations().map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={handleAssignSubmit} disabled={assignLoading}>
                                {assignLoading ? 'Assigning...' : 'Assign Kiosk'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default KiosksStock;
