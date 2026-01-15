import React, { useState } from 'react';
import { Plus, Desktop, Circle, Trash, X } from '@phosphor-icons/react';
import { api } from '../../services/api';

const KiosksTab = ({ client, updateClient }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newKioskId, setNewKioskId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddKiosk = async () => {
        if (!newKioskId) return alert('Kiosk ID is required');

        setIsSubmitting(true);
        try {
            await api.kiosks.assign(newKioskId, { client_id: client.id });

            // Optimistic update
            const newKiosk = {
                id: newKioskId,
                status: 'Offline',
                location: 'Unassigned',
                assigned_to: { client_id: client.id }
            };

            const updatedKiosks = client.kiosks ? [...client.kiosks, newKiosk] : [newKiosk];
            updateClient({ kiosks: updatedKiosks });
            setIsModalOpen(false);
            setNewKioskId('');
        } catch (error) {
            console.error("Failed to assign kiosk", error);
            alert("Failed to assign kiosk: " + (error.data?.detail || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveKiosk = async (index, kioskId) => {
        if (window.confirm('Unassign this kiosk?')) {
            try {
                await api.kiosks.unassign(kioskId);
                const updatedKiosks = [...client.kiosks];
                updatedKiosks.splice(index, 1);
                updateClient({ kiosks: updatedKiosks });
            } catch (error) {
                console.error("Failed to unassign kiosk", error);
                alert("Failed to unassign kiosk: " + (error.data?.detail || error.message));
            }
        }
    };

    return (
        <div className="tab-pane active">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="card-header" style={{ marginBottom: 0 }}>Assigned Kiosks</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Assign kiosks from the <strong>Kiosk → Stock</strong> section
                    </span>
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
                                            <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => handleRemoveKiosk(idx, kiosk.id)}>
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
                            <button className="btn btn-primary" onClick={handleAddKiosk} disabled={isSubmitting}>
                                {isSubmitting ? 'Assigning...' : 'Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KiosksTab;
