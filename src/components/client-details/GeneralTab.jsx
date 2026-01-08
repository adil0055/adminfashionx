import React, { useState } from 'react';


const GeneralTab = ({ client, updateClient }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updateClient({ [name]: value });
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
                    <label className="form-label">Client Type</label>
                    <select
                        className="form-input"
                        name="client_type"
                        value={client.client_type || ''}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Client Type...</option>
                        <option value="KIOSK">KIOSK (Retail brand)</option>
                        <option value="API">API (ONLINE Brand)</option>
                        <option value="HYBRID">Hybrid (RETAIL KIOSK + API)</option>
                    </select>
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
