import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UsersThree, MagnifyingGlass, X, ClockCounterClockwise, PencilSimple, Pause, Play } from '@phosphor-icons/react';
import { api } from '../services/api';
import Modal from '../components/common/Modal';

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

    // Modals
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedKiosk, setSelectedKiosk] = useState(null);

    // Edit Assignment Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editKiosk, setEditKiosk] = useState(null);
    const [editData, setEditData] = useState({ clientId: '', locationId: '' });
    const [clientLocations, setClientLocations] = useState([]);
    const [editLoading, setEditLoading] = useState(false);

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
        fetchData();
    }, []);

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
                        // Check 'client' field first (from API response), then 'client_name', then lookup
                        clientName: k.client || k.client_name || (client ? client.display_name : 'Unknown'),
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

    useEffect(() => {
        let result = kiosks;

        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(k =>
                k.id.toString().toLowerCase().includes(lowerSearch) ||
                (k.clientName && k.clientName.toLowerCase().includes(lowerSearch))
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

    // Fetch locations when client is selected in Edit Modal
    useEffect(() => {
        const fetchLocations = async () => {
            if (!editData.clientId) {
                setClientLocations([]);
                return;
            }

            try {
                const result = await api.clients.getDetails(editData.clientId);
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
    }, [editData.clientId]);

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

    const openEditModal = (kiosk) => {
        setEditKiosk(kiosk);
        // Pre-fill data if possible, otherwise reset
        setEditData({
            clientId: kiosk.clientId || '',
            locationId: '' // We might not have location ID in the list view, so user has to re-select
        });
        setClientLocations([]);
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!editData.clientId || !editData.locationId) {
            setCustomModal({
                show: true,
                type: 'info',
                title: 'Selection Required',
                message: 'Please select a client and location'
            });
            return;
        }

        try {
            setEditLoading(true);
            const result = await api.kiosks.assign(editKiosk.id, {
                client_id: editData.clientId,
                location_id: editData.locationId
            });

            if (result.success) {
                setCustomModal({
                    show: true,
                    type: 'success',
                    title: 'Success',
                    message: 'Kiosk assignment updated successfully'
                });
                setIsEditModalOpen(false);
                fetchData(); // Refresh list
            }
        } catch (error) {
            console.error('Failed to update assignment', error);
            setCustomModal({
                show: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to update assignment: ' + (error.message || 'Unknown error')
            });
        } finally {
            setEditLoading(false);
        }
    };

    const handleStatusToggle = async (kiosk) => {
        const newStatus = kiosk.status === 'suspended' ? 'online' : 'suspended';
        const action = kiosk.status === 'suspended' ? 'Resume' : 'Suspend';

        setCustomModal({
            show: true,
            type: 'confirm',
            title: `${action} Kiosk`,
            message: `Are you sure you want to ${action.toLowerCase()} kiosk ${kiosk.id}?`,
            onConfirm: async () => {
                closeCustomModal();
                try {
                    const result = await api.kiosks.updateStatus(kiosk.id, newStatus);
                    if (result.success) {
                        setCustomModal({
                            show: true,
                            type: 'success',
                            title: 'Success',
                            message: `Kiosk ${action.toLowerCase()}ed successfully`
                        });
                        fetchData();
                    }
                } catch (error) {
                    console.error(`Failed to ${action.toLowerCase()} kiosk`, error);
                    setCustomModal({
                        show: true,
                        type: 'error',
                        title: 'Error',
                        message: `Failed to ${action.toLowerCase()} kiosk: ` + error.message
                    });
                }
            }
        });
    };

    const handleUnassign = async (kiosk) => {
        setCustomModal({
            show: true,
            type: 'confirm',
            title: 'Unassign Kiosk',
            message: `Are you sure you want to unassign kiosk ${kiosk.id}? It will be returned to stock.`,
            onConfirm: async () => {
                closeCustomModal();
                try {
                    const result = await api.kiosks.unassign(kiosk.id);
                    if (result.success) {
                        setCustomModal({
                            show: true,
                            type: 'success',
                            title: 'Success',
                            message: 'Kiosk unassigned successfully'
                        });
                        fetchData(); // Refresh list
                    }
                } catch (error) {
                    console.error('Failed to unassign kiosk', error);
                    setCustomModal({
                        show: true,
                        type: 'error',
                        title: 'Error',
                        message: 'Failed to unassign kiosk: ' + error.message
                    });
                }
            }
        });
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
                            <option key={c.id} value={c.id}>{c.display_name}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Status:</label>
                    <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="suspended">Suspended</option>
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
                            <th>Assignment ID</th>
                            <th>Hardware ID</th>
                            <th>Client</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    Loading kiosks...
                                </td>
                            </tr>
                        ) : filteredKiosks.length > 0 ? (
                            filteredKiosks.map((kiosk) => (
                                <tr key={kiosk.id}>
                                    <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{kiosk.id}</td>
                                    <td style={{ fontFamily: 'monospace' }}>{kiosk.kiosk_id || '-'}</td>
                                    <td>
                                        <Link to={`/clients/${kiosk.clientId}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>
                                            {kiosk.clientName}
                                        </Link>
                                    </td>
                                    <td>{kiosk.location || '-'}</td>
                                    <td>
                                        <span className={`status-capsule ${kiosk.status === 'online' ? 'status-active' :
                                            kiosk.status === 'suspended' ? 'status-warning' : 'status-inactive'
                                            }`}>
                                            {kiosk.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            className="icon-btn"
                                            title="Edit Assignment"
                                            onClick={() => openEditModal(kiosk)}
                                            style={{ marginRight: '4px' }}
                                        >
                                            <PencilSimple />
                                        </button>
                                        <button
                                            className="icon-btn"
                                            title={kiosk.status === 'suspended' ? "Resume" : "Suspend"}
                                            onClick={() => handleStatusToggle(kiosk)}
                                            style={{ marginRight: '4px', color: kiosk.status === 'suspended' ? 'var(--success)' : 'var(--warning)' }}
                                        >
                                            {kiosk.status === 'suspended' ? <Play /> : <Pause />}
                                        </button>
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

            {/* Edit Assignment Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Edit Assignment</h3>
                            <button className="close-modal" onClick={() => setIsEditModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Select Client</label>
                                <select
                                    className="form-select"
                                    value={editData.clientId}
                                    onChange={(e) => setEditData({ ...editData, clientId: e.target.value, locationId: '' })}
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
                                    value={editData.locationId}
                                    onChange={(e) => setEditData({ ...editData, locationId: e.target.value })}
                                    disabled={!editData.clientId}
                                >
                                    <option value="">-- Select Location --</option>
                                    {clientLocations.map(loc => (
                                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleEditSubmit} disabled={editLoading}>
                                {editLoading ? 'Updating...' : 'Update Assignment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

export default KiosksAssigned;
