import React, { useState, useEffect } from 'react';
import { Plus, PencilSimple, Trash, X, Warning } from '@phosphor-icons/react';
import { api } from '../services/api';

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const result = await api.audit.getRoles();
            if (result.success) {
                setRoles(result.data);
            }
        } catch (error) {
            console.error('Failed to load roles', error);
        } finally {
            setLoading(false);
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: 'var(--success)',
        permissions: []
    });

    const allPermissions = [
        { id: 'all_access', label: 'Full System Access' },
        { id: 'manage_users', label: 'Manage Users' },
        { id: 'manage_content', label: 'Manage Content' },
        { id: 'view_reports', label: 'View Reports' },
        { id: 'manage_settings', label: 'Manage Settings' },
        { id: 'manage_tickets', label: 'Manage Support Tickets' },
        { id: 'audit:read', label: 'Read Audit Logs' },
        { id: 'kiosks:read', label: 'Read Kiosks' }
    ];

    const openModal = (role = null) => {
        if (role) {
            setCurrentRole(role);
            setFormData({
                name: role.name,
                description: role.description,
                color: role.color,
                permissions: role.permissions
            });
        } else {
            setCurrentRole(null);
            setFormData({
                name: '',
                description: '',
                color: 'var(--success)',
                permissions: []
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) return alert('Role Name is required');

        try {
            if (currentRole) {
                // Edit not supported by API spec yet
                alert('Editing roles is not supported by the backend API yet.');
                // Optimistic update for demo
                setRoles(roles.map(r => r.id === currentRole.id ? { ...r, ...formData } : r));
            } else {
                const result = await api.audit.createRole(formData);
                if (result.success) {
                    fetchRoles();
                }
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to save role', error);
            alert('Failed to save role: ' + error.message);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this role?')) {
            setRoles(roles.filter(r => r.id !== id));
        }
    };

    const togglePermission = (permId) => {
        setFormData(prev => {
            const perms = prev.permissions.includes(permId)
                ? prev.permissions.filter(p => p !== permId)
                : [...prev.permissions, permId];
            return { ...prev, permissions: perms };
        });
    };

    return (
        <>
            <div className="section-header">
                <div>
                    <h2 className="section-title">Roles & Permissions</h2>
                    <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Configure role-based access control and permissions
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <Plus /> Add Role
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {roles.map(role => (
                    <div key={role.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: role.color }}></div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{role.name}</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="icon-btn" onClick={() => openModal(role)}><PencilSimple /></button>
                                <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(role.id)}><Trash /></button>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{role.description}</p>
                        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Permissions:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {role.permissions.map(p => (
                                    <span key={p} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-main)' }}>
                                        {allPermissions.find(ap => ap.id === p)?.label || p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-content" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2 className="modal-title">{currentRole ? 'Edit Role' : 'Add Role'}</h2>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Role Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Content Manager"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    rows="2"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of this role's purpose"
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Color Badge</label>
                                <select
                                    className="form-input"
                                    value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                >
                                    <option value="var(--danger)">Red (High Access)</option>
                                    <option value="var(--warning)">Orange (Admin)</option>
                                    <option value="var(--accent)">Blue (Manager)</option>
                                    <option value="var(--success)">Green (Standard)</option>
                                    <option value="var(--text-muted)">Gray (Limited)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Permissions</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    {allPermissions.map(perm => (
                                        <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.includes(perm.id)}
                                                onChange={() => togglePermission(perm.id)}
                                            />
                                            <span style={{ fontSize: '0.9rem' }}>{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save Role</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Roles;
