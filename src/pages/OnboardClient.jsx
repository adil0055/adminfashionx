import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Rocket, ChartLineUp, Buildings, X, Copy, CheckCircle, CircleNotch } from '@phosphor-icons/react';
import Modal from '../components/common/Modal';

const OnboardClient = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        company_name: '',
        client_type: '',
        timezone: '',
        hq_street: '',
        hq_city: '',
        hq_state: '',
        hq_zip: '',
        hq_country: '',
        billing_contact: '',
        billing_email: '',
        tier_id: null,
        locations: [],
        image_specs: {
            max_size: 5,
            min_width: 1024,
            min_height: 1024,
            allowed_formats: ['jpg', 'png']
        }
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState({
        name: '',
        address: '',
        isPrimary: false
    });

    // Custom Modal State for alerts/info
    const [customModal, setCustomModal] = useState({
        show: false,
        type: 'info',
        title: '',
        message: ''
    });

    const closeCustomModal = () => setCustomModal({ ...customModal, show: false });

    // API & Secret State
    const [submitting, setSubmitting] = useState(false);
    const [createdClient, setCreatedClient] = useState(null); // { secret, api_client_id, id }
    const [showSecretModal, setShowSecretModal] = useState(false);
    const [tiers, setTiers] = useState([]);

    useEffect(() => {
        const fetchTiers = async () => {
            try {
                const result = await api.config.listTiers();
                if (result.success && result.data.length > 0) {
                    setTiers(result.data);
                    // Set default tier if not set
                    setFormData(prev => ({ ...prev, tier_id: result.data[0].id }));
                }
            } catch (error) {
                console.error("Failed to fetch tiers", error);
            }
        };
        fetchTiers();
    }, []);

    const totalSteps = 6;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNext = () => {
        if (currentStep < totalSteps) {
            // Basic Validation
            if (currentStep === 1 && !formData.company_name) {
                setCustomModal({
                    show: true,
                    type: 'info',
                    title: 'Validation Error',
                    message: 'Company Name is required'
                });
                return;
            }
            setCurrentStep(prev => prev + 1);
        } else {
            submitClient();
        }
    };

    const submitClient = async () => {
        setSubmitting(true);
        try {
            // 1. Create Client
            const createResult = await api.clients.create({
                display_name: formData.company_name,
                contact_email: formData.billing_email,
                tier_id: formData.tier_id,
                client_type: formData.client_type,
                timezone: formData.timezone,
                hq_street: formData.hq_street,
                hq_city: formData.hq_city,
                hq_state: formData.hq_state,
                hq_zip: formData.hq_zip,
                hq_country: formData.hq_country,
                billing_contact: formData.billing_contact,
                image_specs: formData.image_specs
            });

            if (!createResult.success) throw new Error(createResult.message || 'Failed to create client');

            const newClientData = createResult.data; // { id, api_client_id, secret, ... }
            const clientId = newClientData.id;

            // 2. Add Locations
            for (const loc of formData.locations) {
                await api.clients.addLocation(clientId, {
                    name: loc.name,
                    address: loc.address
                });
            }

            // 3. Show Secret
            setCreatedClient(newClientData);
            setShowSecretModal(true);

        } catch (error) {
            console.error('Onboarding failed:', error);
            setCustomModal({
                show: true,
                type: 'error',
                title: 'Onboarding Failed',
                message: error.message
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // Location Modal Handlers
    const openModal = () => {
        setModalData({ name: '', address: '', isPrimary: formData.locations.length === 0 });
        setIsModalOpen(true);
    };

    const saveLocation = () => {
        if (!modalData.name) {
            setCustomModal({
                show: true,
                type: 'info',
                title: 'Validation Error',
                message: 'Location Name is required'
            });
            return;
        }

        let updatedLocs = [...formData.locations];
        if (modalData.isPrimary) {
            updatedLocs = updatedLocs.map(l => ({ ...l, isPrimary: false }));
        }
        updatedLocs.push(modalData);

        setFormData(prev => ({ ...prev, locations: updatedLocs }));
        setIsModalOpen(false);
    };

    const removeLocation = (index) => {
        const updated = [...formData.locations];
        updated.splice(index, 1);
        setFormData(prev => ({ ...prev, locations: updated }));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCustomModal({
            show: true,
            type: 'success',
            title: 'Copied',
            message: 'Copied to clipboard!'
        });
    };

    const handleFinish = () => {
        setShowSecretModal(false);
        navigate('/clients');
    };

    return (
        <div className="wizard-container">
            {/* Step Indicators */}
            <div className="wizard-steps">
                {[1, 2, 3, 4, 5, 6].map(step => (
                    <div key={step} className={`step-indicator ${step === currentStep ? 'active' : ''} ${step < currentStep ? 'completed' : ''}`}>
                        <div className="step-circle">{step}</div>
                        <span className="step-label">
                            {step === 1 && 'Details'}
                            {step === 2 && 'Billing'}
                            {step === 3 && 'Locations'}
                            {step === 4 && 'Subscription'}
                            {step === 5 && 'Image Specs'}
                            {step === 6 && 'Review'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Step 1: Details */}
            {currentStep === 1 && (
                <div className="step-content active">
                    <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Client Details</h2>
                    <div className="form-group">
                        <label className="form-label">Company Name</label>
                        <input
                            type="text"
                            className="form-input"
                            name="company_name"
                            value={formData.company_name}
                            onChange={handleInputChange}
                            placeholder="e.g. Global Retail Inc."
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Client Type</label>
                        <select
                            className="form-input"
                            name="client_type"
                            value={formData.client_type}
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
                            value={formData.timezone}
                            onChange={handleInputChange}
                            placeholder="Search Timezone..."
                        />
                    </div>
                </div>
            )}

            {/* Step 2: Address & Billing */}
            {currentStep === 2 && (
                <div className="step-content active">
                    <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Address & Billing</h2>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                            Headquarters Address
                        </h3>
                        <div className="form-group">
                            <label className="form-label">Street Address</label>
                            <input type="text" className="form-input" name="hq_street" value={formData.hq_street} onChange={handleInputChange} placeholder="123 Fashion Ave" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">City</label>
                                <input type="text" className="form-input" name="hq_city" value={formData.hq_city} onChange={handleInputChange} placeholder="New York" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">State / Province</label>
                                <input type="text" className="form-input" name="hq_state" value={formData.hq_state} onChange={handleInputChange} placeholder="NY" />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Postal Code</label>
                                <input type="text" className="form-input" name="hq_zip" value={formData.hq_zip} onChange={handleInputChange} placeholder="10001" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Country</label>
                                <select className="form-input" name="hq_country" value={formData.hq_country} onChange={handleInputChange}>
                                    <option value="" disabled>Select Country</option>
                                    <option value="US">United States</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="CA">Canada</option>
                                    <option value="AU">Australia</option>
                                    <option value="DE">Germany</option>
                                    <option value="FR">France</option>
                                    <option value="IT">Italy</option>
                                    <option value="JP">Japan</option>
                                    <option value="CN">China</option>
                                    <option value="IN">India</option>
                                    <option value="BR">Brazil</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                            Billing Information
                        </h3>
                        <div className="form-group">
                            <label className="form-label">Billing Contact Name</label>
                            <input type="text" className="form-input" name="billing_contact" value={formData.billing_contact} onChange={handleInputChange} placeholder="Jane Doe" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Billing Email</label>
                            <input type="email" className="form-input" name="billing_email" value={formData.billing_email} onChange={handleInputChange} placeholder="billing@company.com" />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 3: Locations */}
            {currentStep === 3 && (
                <div className="step-content active">
                    <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Manage Locations</h2>
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Define physical locations.
                    </p>

                    <div className="form-group">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {formData.locations.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                                    No locations added yet.
                                </div>
                            ) : (
                                formData.locations.map((loc, idx) => (
                                    <div key={idx} className="fade-in" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {loc.name}
                                                {loc.isPrimary && <span style={{ color: 'var(--accent)', fontSize: '0.75rem', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px' }}>PRIMARY</span>}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{loc.address || 'No address'}</div>
                                        </div>
                                        <button type="button" onClick={() => removeLocation(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                            <i className="ph ph-trash" style={{ fontSize: '1.2rem' }}></i>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        <button type="button" className="add-location-btn" onClick={openModal} style={{ marginTop: '1.5rem', width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Plus /> Add New Location
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Subscription Tier */}
            {currentStep === 4 && (
                <div className="step-content active">
                    <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Select Subscription Tier</h2>
                    <div className="tier-grid">
                        {tiers.length === 0 ? (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                Loading subscription tiers...
                            </div>
                        ) : (
                            tiers.map(tier => (
                                <div
                                    key={tier.id}
                                    className={`tier-card ${formData.tier_id === tier.id ? 'selected' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, tier_id: tier.id }))}
                                    style={{ borderColor: formData.tier_id === tier.id ? tier.color || 'var(--primary)' : 'var(--border-color)' }}
                                >
                                    <div style={{ color: tier.color || 'var(--text-main)', marginBottom: '1rem' }}>
                                        {tier.name.includes('Starter') ? <Rocket size={32} /> :
                                            tier.name.includes('Growth') ? <ChartLineUp size={32} /> :
                                                tier.name.includes('Enterprise') ? <Buildings size={32} /> :
                                                    <Rocket size={32} />}
                                    </div>

                                    <div className="tier-name" style={{ color: tier.color || 'var(--text-main)' }}>{tier.name}</div>
                                    <div className="tier-price">
                                        ${tier.price_monthly || tier.price || 0} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ mo</span>
                                    </div>
                                    <ul className="tier-features">
                                        {(Array.isArray(tier.features) ? tier.features : []).map((feature, idx) => (
                                            <li key={idx}>{feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Step 5: Image Specs */}
            {currentStep === 5 && (
                <div className="step-content active">
                    <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Image Specifications</h2>
                    <div className="form-group">
                        <label className="form-label">Max File Size (MB)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={formData.image_specs.max_size}
                            onChange={e => setFormData({ ...formData, image_specs: { ...formData.image_specs, max_size: parseInt(e.target.value) || 0 } })}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Min Width (px)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.image_specs.min_width}
                                onChange={e => setFormData({ ...formData, image_specs: { ...formData.image_specs, min_width: parseInt(e.target.value) || 0 } })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Min Height (px)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.image_specs.min_height}
                                onChange={e => setFormData({ ...formData, image_specs: { ...formData.image_specs, min_height: parseInt(e.target.value) || 0 } })}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Allowed Formats</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {['jpg', 'png', 'webp'].map(fmt => (
                                <label key={fmt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.image_specs.allowed_formats.includes(fmt)}
                                        onChange={e => {
                                            const newFormats = e.target.checked
                                                ? [...formData.image_specs.allowed_formats, fmt]
                                                : formData.image_specs.allowed_formats.filter(f => f !== fmt);
                                            setFormData({ ...formData, image_specs: { ...formData.image_specs, allowed_formats: newFormats } });
                                        }}
                                    />
                                    {fmt.toUpperCase()}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
                <div className="step-content active">
                    <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Review & Confirm</h2>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1rem' }}>
                            <div>
                                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Company</h4>
                                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{formData.company_name || '-'}</p>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{formData.client_type || 'No Type Selected'}</p>
                            </div>
                            <div>
                                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tier</h4>
                                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)' }}>
                                    {tiers.find(t => t.id === formData.tier_id)?.name || 'Unknown'}
                                </p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Headquarters</h4>
                            <p style={{ fontSize: '1rem' }}>
                                {[formData.hq_street, formData.hq_city, formData.hq_state, formData.hq_country].filter(Boolean).join(', ') || '-'}
                            </p>
                        </div>
                        <div>
                            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Locations Overview</h4>
                            <ul style={{ listStyle: 'none', fontSize: '0.9rem', color: 'var(--text-main)', padding: 0 }}>
                                {formData.locations.map((loc, i) => (
                                    <li key={i} style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 600 }}>
                                            {loc.name} {loc.isPrimary && <span style={{ color: 'var(--accent)', fontSize: '0.75rem', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>PRIMARY</span>}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{loc.address}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                            <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Image Specs</h4>
                            <p style={{ fontSize: '0.9rem' }}>
                                Max {formData.image_specs.max_size}MB, {formData.image_specs.min_width}x{formData.image_specs.min_height}px, {formData.image_specs.allowed_formats.join(', ').toUpperCase()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Control */}
            <div className="wizard-footer">
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/clients')} style={{ marginRight: 'auto' }}>Cancel</button>
                {currentStep > 1 && (
                    <button type="button" className="btn btn-secondary" onClick={handlePrev} disabled={submitting}>Back</button>
                )}
                <button type="button" className="btn btn-primary" onClick={handleNext} disabled={submitting}>
                    {submitting ? <CircleNotch className="spin" /> : (currentStep === totalSteps ? 'Confirm Onboarding' : 'Next Step')}
                </button>
            </div>

            {/* Location Modal */}
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
                                    value={modalData.name}
                                    onChange={e => setModalData({ ...modalData, name: e.target.value })}
                                    placeholder="e.g. Flagship Store"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={modalData.address}
                                    onChange={e => setModalData({ ...modalData, address: e.target.value })}
                                    placeholder="123 Main St"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={modalData.isPrimary}
                                        onChange={e => setModalData({ ...modalData, isPrimary: e.target.checked })}
                                    />
                                    Mark as Primary Headquarters
                                </label>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={saveLocation}>Add Location</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Secret Display Modal */}
            {showSecretModal && createdClient && (
                <div className="modal-overlay active" style={{ zIndex: 1000 }}>
                    <div className="modal-content" style={{ width: '500px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CheckCircle size={24} color="var(--success)" weight="fill" />
                                Client Onboarded!
                            </h3>
                        </div>
                        <div className="modal-body">
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                                The client <strong>{formData.company_name}</strong> has been successfully created.
                            </p>
                            <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                                <h4 style={{ color: 'var(--warning)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    ⚠️ Important: Save this Secret
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
                                    This secret key will <strong>only be shown once</strong>. Please copy it and store it securely.
                                </p>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        readOnly
                                        value={createdClient.secret}
                                        className="form-input"
                                        style={{ fontFamily: 'monospace', fontSize: '0.9rem', background: 'var(--bg-dark)' }}
                                    />
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => copyToClipboard(createdClient.secret)}
                                        title="Copy to clipboard"
                                    >
                                        <Copy size={20} />
                                    </button>
                                </div>
                            </div>
                            <div style={{ fontSize: '0.9rem' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Client ID:</span> <code style={{ color: 'var(--primary)' }}>{createdClient.api_client_id}</code>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={handleFinish} style={{ width: '100%' }}>
                                I have saved the secret
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
                    <button className="btn btn-primary" onClick={closeCustomModal} style={{ minWidth: '100px', justifyContent: 'center' }}>OK</button>
                }
            >
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    {customModal.message}
                </p>
            </Modal>

            <style>{`
                .spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default OnboardClient;
