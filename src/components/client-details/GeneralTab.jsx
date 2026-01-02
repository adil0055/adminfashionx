import React, { useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';

const GeneralTab = ({ client, updateClient }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updateClient({ [name]: value });
    };

    const handleClientTypeChange = (e) => {
        const { value, checked } = e.target;
        let types = client.clientTypes || [];
        if (checked) {
            types = [...types, value];
        } else {
            types = types.filter(t => t !== value);
        }
        updateClient({ clientTypes: types });
    };

    return (
        <div className="tab-pane active" style={{ display: 'block' }}>
            <div className="card" style={{ maxWidth: '600px' }}>
                <h3 className="card-header">Core Details</h3>
                <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input
                        type="text"
                        className="form-input"
                        name="name"
                        value={client.name || ''}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                        className="form-input"
                        name="status"
                        value={client.status || 'Active'}
                        onChange={handleInputChange}
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Tier</label>
                    <select
                        className="form-input"
                        name="tier"
                        value={client.tier || 'Starter'}
                        onChange={handleInputChange}
                    >
                        <option value="Starter">Starter</option>
                        <option value="Growth">Growth</option>
                        <option value="Enterprise">Enterprise</option>
                    </select>
                </div>

                {/* Client Types Dropdown */}
                <div className="form-group">
                    <label className="form-label">Client Type(s)</label>
                    <div style={{ position: 'relative' }}>
                        <div
                            className="form-input"
                            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            <span style={{ color: (client.clientTypes && client.clientTypes.length) ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                {(client.clientTypes && client.clientTypes.length) ? client.clientTypes.join(', ') : 'Select client types...'}
                            </span>
                            <CaretDown />
                        </div>
                        {isDropdownOpen && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                background: 'var(--bg-panel)', border: '1px solid var(--border-color)',
                                borderRadius: '8px', marginTop: '4px', zIndex: 100, maxHeight: '250px', overflowY: 'auto'
                            }}>
                                {['Retail Brand', 'Online Brand', 'Shopify Plugin', 'Marketplace Seller', 'Hybrid'].map(type => (
                                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            value={type}
                                            checked={client.clientTypes?.includes(type)}
                                            onChange={handleClientTypeChange}
                                        />
                                        <span>{type}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <input
                        className="form-input"
                        name="timezone"
                        value={client.timezone || ''}
                        onChange={handleInputChange}
                        placeholder="Search..."
                    />
                </div>
            </div>
        </div>
    );
};

export default GeneralTab;
