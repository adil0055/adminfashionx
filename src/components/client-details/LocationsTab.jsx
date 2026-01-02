import React, { useState } from 'react';
import { api } from '../../services/api';
import { Plus, Trash, MapPin, X } from '@phosphor-icons/react';

const LocationsTab = ({ client, updateClient }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newLocation, setNewLocation] = useState({ name: '', address: '', isPrimary: false });

    const [submitting, setSubmitting] = useState(false);



    const handleAddLocation = async () => {
        if (!newLocation.name) return alert('Location Name is required');

        try {
            setSubmitting(true);
            const result = await api.clients.addLocation(client.id, {
                name: newLocation.name,
                address: newLocation.address
            });

            if (result.success) {
                // Update local state
                let updatedLocs = client.locations ? [...client.locations] : [];
                // Note: The API returns the new location with ID.
                // We might want to refresh the whole client or just append the new location.
                // The API response data is { id: 3, name: "London Oxford St" } (address might be missing in response based on prompt example, but let's assume we can use local data for now or fetch again)
                // Actually, the prompt says response is {"success": true, "data": {"id": 3, "name": "London Oxford St"}}
                // It doesn't return the full object. I'll append what I have + the ID.

                const addedLocation = {
                    ...newLocation,
                    id: result.data.id
                };

                if (newLocation.isPrimary) {
                    updatedLocs = updatedLocs.map(l => ({ ...l, isPrimary: false }));
                }
                updatedLocs.push(addedLocation);

                updateClient({ locations: updatedLocs });
                setIsModalOpen(false);
                setNewLocation({ name: '', address: '', isPrimary: false });
            } else {
                throw new Error(result.message || 'Failed to add location');
            }
        } catch (error) {
            console.error('Error adding location:', error);
            alert(`Error adding location: ${error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveLocation = (index) => {
        if (window.confirm('Remove this location?')) {
            const updatedLocs = [...client.locations];
            updatedLocs.splice(index, 1);
            updateClient({ locations: updatedLocs });
        }
    };

    return (
        <div className="tab-pane active">
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="card-header" style={{ marginBottom: 0 }}>Physical Locations</h3>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus /> Add Location
                    </button>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {client.locations && client.locations.length > 0 ? (
                        client.locations.map((loc, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-panel)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {loc.name}
                                            {loc.isPrimary && <span className="status-capsule status-active" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>HQ</span>}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{loc.address}</div>
                                    </div>
                                </div>
                                <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => handleRemoveLocation(idx)}>
                                    <Trash />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                            No locations added yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-content" style={{ width: '500px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Add Location</h3>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Location Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newLocation.name}
                                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                                    placeholder="e.g. Flagship Store"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newLocation.address}
                                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                                    placeholder="123 Main St"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={newLocation.isPrimary}
                                        onChange={(e) => setNewLocation({ ...newLocation, isPrimary: e.target.checked })}
                                    />
                                    Mark as Primary Headquarters
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleAddLocation} disabled={submitting}>
                                {submitting ? 'Adding...' : 'Add Location'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationsTab;
