import React, { useState, useEffect } from 'react';
import { Plus, MagnifyingGlass, X, PencilSimple, Trash, ArrowSquareOut } from '@phosphor-icons/react';

import { api } from '../services/api';
import Modal from '../components/common/Modal';

const KiosksStock = () => {
    const [stockKiosks, setStockKiosks] = useState([]);
    const [filteredKiosks, setFilteredKiosks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [locationFilter, setLocationFilter] = useState('');

    // Add Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newKiosk, setNewKiosk] = useState({
        id: '',
        location: ''
    });

    // Edit Modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editKiosk, setEditKiosk] = useState(null);
    const [editWarehouse, setEditWarehouse] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    // Assign Modal
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignKiosk, setAssignKiosk] = useState(null);
    const [clients, setClients] = useState([]);
    const [clientLocations, setClientLocations] = useState([]); // Store locations for selected client
    const [assignData, setAssignData] = useState({ clientId: '', locationId: '' });
    const [assignLoading, setAssignLoading] = useState(false);

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
            result = result.filter(k =>
                (k.kiosk_id && k.kiosk_id.toLowerCase().includes(lowerSearch)) ||
                (k.id && k.id.toString().includes(lowerSearch))
            );
        }

        if (locationFilter) {
            result = result.filter(k => k.warehouse && k.warehouse.toLowerCase().includes(locationFilter.toLowerCase()));
        }

        setFilteredKiosks(result);
    }, [search, locationFilter, stockKiosks]);

    const handleAddKiosk = async () => {
        try {
            const result = await api.kiosks.addStock({
                kiosk_id: newKiosk.id,
                warehouse: newKiosk.location
            });
            if (result.success) {
                fetchStock();
                setIsModalOpen(false);
                setNewKiosk({ id: '', location: '' });
                setCustomModal({
                    show: true,
                    type: 'success',
                    title: 'Success',
                    message: 'Kiosk added to stock successfully.'
                });
            }
        } catch (error) {
            console.error('Failed to add kiosk', error);
            setCustomModal({
                show: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to add kiosk: ' + error.message
            });
        }
    };

    const handleEditClick = (kiosk) => {
        setEditKiosk(kiosk);
        setEditWarehouse(kiosk.warehouse || '');
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!editWarehouse.trim()) {
            setCustomModal({
                show: true,
                type: 'info',
                title: 'Validation Error',
                message: 'Warehouse location is required'
            });
            return;
        }

        try {
            setEditLoading(true);
            const result = await api.kiosks.updateStock(editKiosk.id, {
                warehouse: editWarehouse
            });

            if (result.success) {
                setCustomModal({
                    show: true,
                    type: 'success',
                    title: 'Success',
                    message: 'Kiosk details updated successfully'
                });
                setIsEditModalOpen(false);
                fetchStock();
            }
        } catch (error) {
            console.error('Failed to update kiosk', error);
            setCustomModal({
                show: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to update kiosk: ' + (error.message || 'Unknown error')
            });
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = (id) => {
        setCustomModal({
            show: true,
            type: 'confirm',
            title: 'Delete Kiosk',
            message: 'Are you sure you want to delete this kiosk from stock? This action cannot be undone.',
            onConfirm: async () => {
                closeCustomModal();
                try {
                    const result = await api.kiosks.deleteStock(id);
                    if (result.success) {
                        setCustomModal({
                            show: true,
                            type: 'success',
                            title: 'Success',
                            message: 'Kiosk deleted successfully'
                        });
                        fetchStock();
                    }
                } catch (error) {
                    console.error('Failed to delete kiosk', error);
                    setCustomModal({
                        show: true,
                        type: 'error',
                        title: 'Error',
                        message: 'Failed to delete kiosk: ' + error.message
                    });
                }
            }
        });
    };

    const openAssignModal = async (kiosk) => {
        setAssignKiosk(kiosk);
        setAssignData({ clientId: '', locationId: '' });
        setClientLocations([]); // Reset locations
        setIsAssignModalOpen(true);

        // Fetch clients if not loaded
        if (clients.length === 0) {
            try {
                const result = await api.clients.list();
                if (result.success && Array.isArray(result.data)) {
                    setClients(result.data);
                }
            } catch (error) {
                console.error('Failed to load clients', error);
                setCustomModal({
                    show: true,
                    type: 'error',
                    title: 'Error',
                    message: 'Failed to load clients: ' + error.message
                });
            }
        }
    };

    // Fetch locations when a client is selected
    useEffect(() => {
        const fetchLocations = async () => {
            if (!assignData.clientId) {
                setClientLocations([]);
                return;
            }

            try {
                const result = await api.clients.getDetails(assignData.clientId);
                if (result.success && result.data && Array.isArray(result.data.locations)) {
                    setClientLocations(result.data.locations);
                } else {
                    setClientLocations([]);
                }
            } catch (error) {
                console.error('Failed to fetch client locations', error);
            }
        };

        fetchLocations();
    }, [assignData.clientId]);

    const handleAssignSubmit = async () => {
        if (!assignData.clientId || !assignData.locationId) {
            setCustomModal({
                show: true,
                type: 'info',
                title: 'Selection Required',
                message: 'Please select a client and location'
            });
            return;
        }

        try {
            setAssignLoading(true);
            const result = await api.kiosks.assign(assignKiosk.id, {
                client_id: assignData.clientId,
                location_id: assignData.locationId
            });

            if (result.success) {
                setCustomModal({
                    show: true,
                    type: 'success',
                    title: 'Success',
                    message: 'Kiosk assigned successfully'
                });
                setIsAssignModalOpen(false);
                fetchStock(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to assign kiosk', error);
            setCustomModal({
                show: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to assign kiosk: ' + (error.message || 'Unknown error')
            });
        } finally {
            setAssignLoading(false);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setLocationFilter('');
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
                <button className="btn btn-primary" onClick={() => {
                    setNewKiosk({ id: '', location: '' });
                    setIsModalOpen(true);
                }}>
                    <Plus weight="bold" /> Add New Kiosk
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
                    <label>Warehouse:</label>
                    <input
                        type="text"
                        className="filter-input"
                        placeholder="Filter by warehouse..."
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
                            <th>Kiosk ID (Hardware)</th>
                            <th>Warehouse / Location</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    Loading stock...
                                </td>
                            </tr>
                        ) : filteredKiosks.length > 0 ? (
                            filteredKiosks.map((kiosk, idx) => (
                                <tr key={idx}>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{kiosk.kiosk_id || kiosk.id}</td>
                                    <td>{kiosk.warehouse || '-'}</td>
                                    <td>
                                        <span className="status-capsule status-neutral">
                                            In Stock
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            className="btn btn-primary"
                                            style={{ fontSize: '0.75rem', padding: '2px 8px', marginRight: '8px' }}
                                            onClick={() => openAssignModal(kiosk)}
                                        >
                                            Assign <ArrowSquareOut style={{ marginLeft: '4px' }} />
                                        </button>
                                        <button
                                            className="icon-btn"
                                            title="Edit Details"
                                            onClick={() => handleEditClick(kiosk)}
                                            style={{ marginRight: '4px' }}
                                        >
                                            <PencilSimple />
                                        </button>
                                        <button
                                            className="icon-btn"
                                            title="Delete"
                                            onClick={() => handleDelete(kiosk.id)}
                                            style={{ color: 'var(--danger)' }}
                                        >
                                            <Trash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No stock kiosks found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Kiosk Modal */}
            {isModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Add New Kiosk</h3>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Kiosk ID (Hardware ID)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. KSK-001"
                                    value={newKiosk.id}
                                    onChange={(e) => setNewKiosk({ ...newKiosk, id: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Warehouse Location</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Austin Hub"
                                    value={newKiosk.location}
                                    onChange={(e) => setNewKiosk({ ...newKiosk, location: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddKiosk}>Add Kiosk</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Kiosk Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Edit Kiosk Details</h3>
                            <button className="close-modal" onClick={() => setIsEditModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Kiosk ID (Hardware ID)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={editKiosk?.kiosk_id || editKiosk?.id || ''}
                                    disabled
                                    style={{ opacity: 0.7, cursor: 'not-allowed' }}
                                />
                                <small style={{ color: 'var(--text-muted)' }}>Hardware ID cannot be changed.</small>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Warehouse Location</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Austin Hub"
                                    value={editWarehouse}
                                    onChange={(e) => setEditWarehouse(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleEditSubmit} disabled={editLoading}>
                                {editLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Modal */}
            {isAssignModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Assign Kiosk {assignKiosk?.kiosk_id || assignKiosk?.id}</h3>
                            <button className="close-modal" onClick={() => setIsAssignModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Select Client</label>
                                <select
                                    className="form-select"
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
                                    className="form-select"
                                    value={assignData.locationId}
                                    onChange={(e) => setAssignData({ ...assignData, locationId: e.target.value })}
                                    disabled={!assignData.clientId}
                                >
                                    <option value="">-- Select Location --</option>
                                    {clientLocations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAssignSubmit} disabled={assignLoading}>
                                {assignLoading ? 'Assigning...' : 'Assign Kiosk'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
        </>
    );
};

export default KiosksStock;
