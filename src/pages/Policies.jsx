import React, { useState } from 'react';
import { Plus, PencilSimple, Trash, X } from '@phosphor-icons/react';

const Policies = () => {
    const [policies, setPolicies] = useState([
        { id: 1, name: 'Data Retention', value: '30 Days', category: 'Compliance', status: 'Active' },
        { id: 2, name: 'User Consent', value: 'Strict (Double Opt-in)', category: 'Privacy', status: 'Active' },
        { id: 3, name: 'Max Login Attempts', value: '5 Retries', category: 'Security', status: 'Active' },
        { id: 4, name: 'Session Timeout', value: '15 Minutes', category: 'Security', status: 'Active' },
    ]);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this policy?')) {
            setPolicies(policies.filter(p => p.id !== id));
        }
    };

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPolicy, setCurrentPolicy] = useState({ id: null, name: '', value: '', category: 'Compliance', status: 'Active' });

    const handleSave = () => {
        if (!currentPolicy.name || !currentPolicy.value) return alert('Name and Value are required');

        if (currentPolicy.id) {
            // Edit
            setPolicies(policies.map(p => p.id === currentPolicy.id ? currentPolicy : p));
        } else {
            // Add
            setPolicies([...policies, { ...currentPolicy, id: Date.now() }]);
        }
        setIsModalOpen(false);
        setCurrentPolicy({ id: null, name: '', value: '', category: 'Compliance', status: 'Active' });
    };

    const openEdit = (policy) => {
        setCurrentPolicy(policy);
        setIsModalOpen(true);
    };

    const openAdd = () => {
        setCurrentPolicy({ id: null, name: '', value: '', category: 'Compliance', status: 'Active' });
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="section-header">
                <h2 className="section-title">Compliance & Retention Policies</h2>
                <button className="btn btn-primary" onClick={openAdd}><Plus /> Add Policy</button>
            </div>
            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Policy Name</th>
                            <th>Value / Restraint</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {policies.map(policy => (
                            <tr key={policy.id}>
                                <td><span style={{ fontWeight: 600 }}>{policy.name}</span></td>
                                <td>{policy.value}</td>
                                <td>{policy.category}</td>
                                <td><span className="status-capsule status-active">{policy.status}</span></td>
                                <td style={{ textAlign: 'right' }}>
                                    <button className="icon-btn" title="Edit" onClick={() => openEdit(policy)}>
                                        <PencilSimple />
                                    </button>
                                    <button className="icon-btn" title="Delete" onClick={() => handleDelete(policy.id)}>
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
                    <div className="modal-content" style={{ width: '500px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{currentPolicy.id ? 'Edit Policy' : 'Add New Policy'}</h3>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Policy Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={currentPolicy.name}
                                    onChange={(e) => setCurrentPolicy({ ...currentPolicy, name: e.target.value })}
                                    placeholder="e.g. Data Retention"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Value / Restraint</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={currentPolicy.value}
                                    onChange={(e) => setCurrentPolicy({ ...currentPolicy, value: e.target.value })}
                                    placeholder="e.g. 30 Days"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-input"
                                    value={currentPolicy.category}
                                    onChange={(e) => setCurrentPolicy({ ...currentPolicy, category: e.target.value })}
                                >
                                    <option value="Compliance">Compliance</option>
                                    <option value="Privacy">Privacy</option>
                                    <option value="Security">Security</option>
                                    <option value="Operational">Operational</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save Policy</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Policies;
