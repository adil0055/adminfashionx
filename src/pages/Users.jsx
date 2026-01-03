import React, { useState, useEffect } from 'react';
import { Plus, MagnifyingGlass, X, PencilSimple, Trash } from '@phosphor-icons/react';
import { api } from '../services/api';
import Modal from '../components/common/Modal';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modals
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Form Data
    const [inviteData, setInviteData] = useState({ name: '', email: '', password: '', role_id: '' });
    const [editData, setEditData] = useState({ id: '', role_id: '', status: '', password: '' });
    const [currentUser, setCurrentUser] = useState(null); // For display in edit modal

    const [formLoading, setFormLoading] = useState(false);

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
            const [usersRes, rolesRes] = await Promise.all([
                api.users.list(),
                api.roles.list()
            ]);

            if (rolesRes.success) {
                setRoles(rolesRes.data);
            }

            if (usersRes.success) {
                setUsers(usersRes.data);
                setFilteredUsers(usersRes.data);
            }
        } catch (error) {
            console.error('Failed to load data', error);
            setCustomModal({
                show: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to load users and roles.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let result = users;

        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(u =>
                u.name.toLowerCase().includes(lowerSearch) ||
                u.email.toLowerCase().includes(lowerSearch)
            );
        }

        if (roleFilter) {
            // Assuming role is returned as a string name in user object, or we need to map it
            // The requirement says user.role (e.g., "Super Admin")
            result = result.filter(u => u.role === roleFilter);
        }

        if (statusFilter) {
            result = result.filter(u => u.status === statusFilter);
        }

        setFilteredUsers(result);
    }, [search, roleFilter, statusFilter, users]);

    const handleInviteSubmit = async () => {
        if (!inviteData.name || !inviteData.email || !inviteData.password || !inviteData.role_id) {
            setCustomModal({
                show: true,
                type: 'info',
                title: 'Validation Error',
                message: 'Please fill in all required fields.'
            });
            return;
        }

        try {
            setFormLoading(true);
            const result = await api.users.create({
                name: inviteData.name,
                email: inviteData.email,
                password: inviteData.password,
                role_id: parseInt(inviteData.role_id)
            });

            if (result.success) {
                setCustomModal({
                    show: true,
                    type: 'success',
                    title: 'Success',
                    message: 'User invited successfully.'
                });
                setIsInviteModalOpen(false);
                setInviteData({ name: '', email: '', password: '', role_id: '' });
                fetchData();
            }
        } catch (error) {
            console.error('Failed to invite user', error);
            setCustomModal({
                show: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to invite user: ' + (error.message || 'Unknown error')
            });
        } finally {
            setFormLoading(false);
        }
    };

    const openEditModal = (user) => {
        setCurrentUser(user);
        // Find role ID from role name if needed, or assume user object has role_id
        // If user object only has role name, we need to find the matching role in roles list
        const role = roles.find(r => r.name === user.role);

        setEditData({
            id: user.id,
            role_id: role ? role.id : '', // Default to current role
            status: user.status,
            password: '' // Optional
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        try {
            setFormLoading(true);
            const updates = {
                role_id: parseInt(editData.role_id),
                status: editData.status
            };

            if (editData.password) {
                updates.password = editData.password;
            }

            const result = await api.users.update(editData.id, updates);

            if (result.success) {
                setCustomModal({
                    show: true,
                    type: 'success',
                    title: 'Success',
                    message: 'User updated successfully.'
                });
                setIsEditModalOpen(false);
                fetchData();
            }
        } catch (error) {
            console.error('Failed to update user', error);
            setCustomModal({
                show: true,
                type: 'error',
                title: 'Error',
                message: 'Failed to update user: ' + (error.message || 'Unknown error')
            });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = (user) => {
        setCustomModal({
            show: true,
            type: 'confirm',
            title: 'Delete User',
            message: `Are you sure you want to remove ${user.name}? This action cannot be undone.`,
            onConfirm: async () => {
                closeCustomModal();
                try {
                    const result = await api.users.delete(user.id);
                    if (result.success) {
                        setCustomModal({
                            show: true,
                            type: 'success',
                            title: 'Success',
                            message: 'User deleted successfully.'
                        });
                        fetchData();
                    }
                } catch (error) {
                    console.error('Failed to delete user', error);
                    setCustomModal({
                        show: true,
                        type: 'error',
                        title: 'Error',
                        message: error.message || 'Failed to delete user.'
                    });
                }
            }
        });
    };

    const clearFilters = () => {
        setSearch('');
        setRoleFilter('');
        setStatusFilter('');
    };

    return (
        <>
            <div className="section-header">
                <div>
                    <h2 className="section-title">User Management</h2>
                    <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Manage system users, roles, and access permissions
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsInviteModalOpen(true)}>
                    <Plus weight="bold" /> Invite User
                </button>
            </div>

            <div className="filter-bar">
                <div className="filter-search">
                    <MagnifyingGlass />
                    <input
                        type="text"
                        className="filter-input"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <label>Role:</label>
                    <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="">All Roles</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.name}>{role.name}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Status:</label>
                    <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
                <div className="filter-actions">
                    <button className="filter-clear" onClick={clearFilters}>
                        <X /> Clear
                    </button>
                </div>
                <div className="filter-results">
                    {filteredUsers.length} results found
                </div>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    Loading users...
                                </td>
                            </tr>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td style={{ fontWeight: 600 }}>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        <span className={`status-capsule ${user.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="icon-btn" title="Edit" onClick={() => openEditModal(user)}>
                                            <PencilSimple />
                                        </button>
                                        <button className="icon-btn" title="Delete" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(user)}>
                                            <Trash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Invite User Modal */}
            {isInviteModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Invite New User</h3>
                            <button className="close-modal" onClick={() => setIsInviteModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={inviteData.name}
                                    onChange={e => setInviteData({ ...inviteData, name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={inviteData.email}
                                    onChange={e => setInviteData({ ...inviteData, email: e.target.value })}
                                    placeholder="john.doe@example.com"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Temporary Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={inviteData.password}
                                    onChange={e => setInviteData({ ...inviteData, password: e.target.value })}
                                    placeholder="Enter password"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select
                                    className="form-select"
                                    value={inviteData.role_id}
                                    onChange={e => setInviteData({ ...inviteData, role_id: e.target.value })}
                                >
                                    <option value="">Select a role</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsInviteModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleInviteSubmit} disabled={formLoading}>
                                {formLoading ? 'Inviting...' : 'Invite User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && currentUser && (
                <div className="modal-overlay active">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Edit User: {currentUser.name}</h3>
                            <button className="close-modal" onClick={() => setIsEditModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select
                                    className="form-select"
                                    value={editData.role_id}
                                    onChange={e => setEditData({ ...editData, role_id: e.target.value })}
                                >
                                    <option value="">Select a role</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    value={editData.status}
                                    onChange={e => setEditData({ ...editData, status: e.target.value })}
                                >
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password (Optional)</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={editData.password}
                                    onChange={e => setEditData({ ...editData, password: e.target.value })}
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleEditSubmit} disabled={formLoading}>
                                {formLoading ? 'Saving...' : 'Save Changes'}
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

export default Users;
