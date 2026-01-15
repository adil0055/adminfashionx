import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';


const GeneralTab = ({ client, updateClient }) => {
    const [tiers, setTiers] = useState([]);
    const [loadingTiers, setLoadingTiers] = useState(true);

    useEffect(() => {
        const fetchTiers = async () => {
            try {
                const result = await api.config.listTiers();
                if (result.success && Array.isArray(result.data)) {
                    setTiers(result.data);
                } else if (Array.isArray(result)) {
                    setTiers(result);
                }
            } catch (error) {
                console.error('Failed to fetch tiers', error);
            } finally {
                setLoadingTiers(false);
            }
        };
        fetchTiers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updateClient({ [name]: value });
    };

    // Handle tier change - store both tier name and tier_id
    const handleTierChange = (e) => {
        const selectedTier = tiers.find(t => t.name === e.target.value);
        if (selectedTier) {
            updateClient({
                tier: selectedTier.name,
                tier_id: selectedTier.id
            });
        } else {
            updateClient({ tier: e.target.value });
        }
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
                        value={client.tier || ''}
                        onChange={handleTierChange}
                        disabled={loadingTiers}
                    >
                        {loadingTiers ? (
                            <option value="">Loading tiers...</option>
                        ) : (
                            <>
                                <option value="">Select Tier...</option>
                                {tiers.map(tier => (
                                    <option key={tier.id} value={tier.name}>
                                        {tier.name}
                                    </option>
                                ))}
                            </>
                        )}
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
