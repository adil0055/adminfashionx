import React from 'react';

const BillingTab = ({ client, updateClient }) => {
    const handleInputChange = (e, section) => {
        const { name, value } = e.target;
        updateClient({
            details: {
                ...client.details,
                [section]: {
                    ...client.details?.[section],
                    [name]: value
                }
            }
        });
    };

    return (
        <div className="tab-pane active">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <h3 className="card-header">Headquarters Address</h3>
                    <div className="form-group">
                        <label className="form-label">Street Address</label>
                        <input
                            type="text"
                            className="form-input"
                            name="street"
                            value={client.details?.hq_address?.street || ''}
                            onChange={(e) => handleInputChange(e, 'hq_address')}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">City</label>
                            <input
                                type="text"
                                className="form-input"
                                name="city"
                                value={client.details?.hq_address?.city || ''}
                                onChange={(e) => handleInputChange(e, 'hq_address')}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">State / Province</label>
                            <input
                                type="text"
                                className="form-input"
                                name="state"
                                value={client.details?.hq_address?.state || ''}
                                onChange={(e) => handleInputChange(e, 'hq_address')}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Postal Code</label>
                            <input
                                type="text"
                                className="form-input"
                                name="zip"
                                value={client.details?.hq_address?.zip || ''}
                                onChange={(e) => handleInputChange(e, 'hq_address')}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Country</label>
                            <input
                                type="text"
                                className="form-input"
                                name="country"
                                value={client.details?.hq_address?.country || ''}
                                onChange={(e) => handleInputChange(e, 'hq_address')}
                            />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="card-header">Billing Information</h3>
                    <div className="form-group">
                        <label className="form-label">Billing Contact Name</label>
                        <input
                            type="text"
                            className="form-input"
                            name="contact"
                            value={client.details?.billing?.contact || ''}
                            onChange={(e) => handleInputChange(e, 'billing')}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Billing Email</label>
                        <input
                            type="email"
                            className="form-input"
                            name="email"
                            value={client.details?.billing?.email || ''}
                            onChange={(e) => handleInputChange(e, 'billing')}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Payment Method</label>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '40px', height: '25px', background: '#ccc', borderRadius: '4px' }}></div>
                            <div>
                                <div style={{ fontWeight: 600 }}>Visa ending in 4242</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expires 12/2025</div>
                            </div>
                            <button className="btn btn-secondary" style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '4px 8px' }}>Update</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillingTab;
