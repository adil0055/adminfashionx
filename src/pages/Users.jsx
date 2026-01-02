import React, { useState, useEffect } from 'react';
import { Plus, MagnifyingGlass, X, PencilSimple, Trash } from '@phosphor-icons/react';

const Users = () => {
    const [users, setUsers] = useState([
        { id: 1, name: 'John Admin', email: 'john@nexus.com', role: 'Super Admin', status: 'Active', lastLogin: '2 mins ago' },
        { id: 2, name: 'Sarah Ops', email: 'sarah@nexus.com', role: 'Admin', status: 'Active', lastLogin: '1 hour ago' },
        { id: 3, name: 'Mike Support', email: 'mike@nexus.com', role: 'Manager', status: 'Inactive', lastLogin: '2 days ago' },
    ]);
    const [filteredUsers, setFilteredUsers] = useState(users);

    // Filters
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        status: 'Active'
    });

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
            result = result.filter(u => u.role === roleFilter);
        }

        if (statusFilter) {
            result = result.filter(u => u.status === statusFilter);
        }

        setFilteredUsers(result);
    }, [search, roleFilter, statusFilter, users]);

    const openModal = (user = null) => {
        if (user) {
            setCurrentUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            });
        } else {
            setCurrentUser(null);
            setFormData({
                name: '',
                email: '',
                role: '',
                status: 'Active'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.email || !formData.role) {
            alert('Please fill in all required fields');
            return;
        }

        if (currentUser) {
            setUsers(users.map(u => u.id === currentUser.id ? { ...u, ...formData } : u));
        } else {
            setUsers([...users, { id: Date.now(), ...formData, lastLogin: 'Never' }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(u => u.id !== id));
        }
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
                <button className="btn btn-primary" onClick={() => openModal()}>
                    <Plus /> Add User
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
                        <option value="Super Admin">Super Admin</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Viewer">Viewer</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Status:</label>
                    <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
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
                            <th>Last Login</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td style={{ fontWeight: 600 }}>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    <span className={`status-capsule ${user.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td>{user.lastLogin}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <button className="icon-btn" title="Edit" onClick={() => openModal(user)}>
                                        <PencilSimple />
                                    </button>
                                    <button className="icon-btn" title="Delete" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(user.id)}>
                                        <Trash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay active">
                    <div className="modal-content" style={{ width: '600px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{currentUser ? 'Edit User' : 'Add New User'}</h3>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john.doe@example.com"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select
                                    className="form-input"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    required
                                >
                                    <option value="">Select a role</option>
                                    <option value="Super Admin">Super Admin</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Viewer">Viewer</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-input"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save User</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Users;
