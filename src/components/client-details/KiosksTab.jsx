import React, { useState } from 'react';
import { Plus, Desktop, Circle, Trash, X } from '@phosphor-icons/react';

const KiosksTab = ({ client, updateClient }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newKioskId, setNewKioskId] = useState('');

    const handleAddKiosk = () => {
        if (!newKioskId) return alert('Kiosk ID is required');

        const newKiosk = {
            id: newKioskId,
            status: 'Offline', // Default status
            location: 'Unassigned'
        };

        const updatedKiosks = client.kiosks ? [...client.kiosks, newKiosk] : [newKiosk];
        updateClient({ kiosks: updatedKiosks });
        setIsModalOpen(false);
        setNewKioskId('');
    };

    const handleRemoveKiosk = (index) => {
        if (window.confirm('Unassign this kiosk?')) {
            const updatedKiosks = [...client.kiosks];
            updatedKiosks.splice(index, 1);
            updateClient({ kiosks: updatedKiosks });
        }
    };

    return (
        <div className="tab-pane active">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="card-header" style={{ marginBottom: 0 }}>Assigned Kiosks</h3>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus /> Assign Kiosk
                    </button>
                </div>

                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Kiosk ID</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {client.kiosks && client.kiosks.length > 0 ? (
                                client.kiosks.map((kiosk, idx) => (
                                    <tr key={idx}>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{kiosk.id}</td>
                                        <td>{kiosk.location || 'Unassigned'}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Circle weight="fill" color={kiosk.status === 'Online' ? 'var(--accent)' : 'var(--danger)'} size={10} />
                                                {kiosk.status}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => handleRemoveKiosk(idx)}>
                                                <Trash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        No kiosks assigned to this client.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-content" style={{ width: '400px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Assign Kiosk</h3>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Kiosk ID</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newKioskId}
                                    onChange={(e) => setNewKioskId(e.target.value)}
                                    placeholder="e.g. KSK-1001"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddKiosk}>Assign</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KiosksTab;
