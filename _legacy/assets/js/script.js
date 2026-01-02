document.addEventListener('DOMContentLoaded', () => {
    // --- Common Features (Toggles) ---
    const toggles = document.querySelectorAll('.toggle-switch');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
        });
    });

    // --- Page Routing Logic ---
    const clientsTableBody = document.getElementById('clients-table-body');
    if (clientsTableBody) {
        initClientsPage();
    }

    const wizardForm = document.getElementById('wizard-form');
    if (wizardForm) {
        initWizard();
    }

    if (document.getElementById('client-details-view')) {
        initClientDetails();
    }

    // Initialize pages based on which elements are present
    if (document.getElementById('kiosks-table-body')) {
        initKiosksPage();
    } else if (document.getElementById('users-table-body')) {
        initUsersPage();
    } else if (document.getElementById('roles-grid')) {
        initRolesPage();
    } else if (document.getElementById('policies-table-body')) {
        initPoliciesPage();
    }

    const assignedKiosksTableBody = document.getElementById('assigned-kiosks-table-body');
    if (assignedKiosksTableBody) {
        initAssignedKiosksPage();
    }

    const stockKiosksTableBody = document.getElementById('stock-kiosks-table-body');
    if (stockKiosksTableBody) {
        initStockKiosksPage();
    }

});

// Initial Data
const initialClients = [
    {
        id: 'c1',
        name: 'Luxe Fashion',
        tier: 'Enterprise',
        status: 'Active',
        locations: [
            { name: 'NY Flagship', kiosks: 50 },
            { name: 'LA Mall', kiosks: 30 }
        ]
    },
    {
        id: 'c2',
        name: 'Urban Threads',
        tier: 'Growth',
        status: 'Active',
        locations: [
            { name: 'London Central', kiosks: 20 }
        ]
    }
];

// --- Clients Page Functionality ---
function initClientsPage() {
    let clients = JSON.parse(localStorage.getItem('nexus_clients')) || initialClients;
    let filteredClients = [...clients];

    // Filter State
    let filterState = {
        search: '',
        status: '',
        tier: ''
    };

    // Render Function
    const renderClients = () => {
        const clientsTableBody = document.getElementById('clients-table-body');

        // Apply filters
        filteredClients = clients.filter(client => {
            const matchesSearch = !filterState.search ||
                client.name.toLowerCase().includes(filterState.search.toLowerCase());
            const matchesStatus = !filterState.status || client.status === filterState.status;
            const matchesTier = !filterState.tier || client.tier === filterState.tier;

            return matchesSearch && matchesStatus && matchesTier;
        });

        // Update results count
        const resultsEl = document.getElementById('client-filter-results');
        if (resultsEl) {
            const total = clients.length;
            const filtered = filteredClients.length;
            if (filterState.search || filterState.status || filterState.tier) {
                resultsEl.textContent = `Showing ${filtered} of ${total} clients`;
            } else {
                resultsEl.textContent = `${total} clients`;
            }
        }

        if (filteredClients.length === 0) {
            clientsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="padding:1rem; text-align:center; color:var(--text-muted);">
                        No clients match the current filters.
                    </td>
                </tr>
            `;
            return;
        }

        clientsTableBody.innerHTML = filteredClients.map(client => {
            const totalKiosks = client.locations ? client.locations.reduce((acc, loc) => acc + parseInt(loc.kiosks || 0), 0) : 0;
            const locTooltip = client.locations ? client.locations.map(l => `${l.name}: ${l.kiosks || 0}`).join('\n') : '';

            return `
            <tr>
                <td><span style="font-weight:600;">${client.name}</span></td>
                <td>${client.tier}</td>
                <td>
                    <span title="${locTooltip}" style="cursor:help; border-bottom:1px dotted var(--text-muted);">
                        ${client.locations ? client.locations.length : 0} Locs / ${totalKiosks} Kiosks
                    </span>
                </td>
                <td><span class="status-capsule ${client.status === 'Active' ? 'status-active' : 'status-neutral'}">${client.status}</span></td>
                <td style="text-align:right;">
                    <a href="client-details.html?id=${client.id}" class="btn btn-secondary" style="font-size:0.75rem; padding: 4px 10px; text-decoration:none; display:inline-block;">Manage</a>
                </td>
            </tr>
            `;
        }).join('');
    };

    // Filter Event Handlers
    const searchInput = document.getElementById('client-search');
    const statusFilter = document.getElementById('client-status-filter');
    const tierFilter = document.getElementById('client-tier-filter');
    const clearBtn = document.getElementById('client-filter-clear');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterState.search = e.target.value;
            renderClients();
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            filterState.status = e.target.value;
            renderClients();
        });
    }

    if (tierFilter) {
        tierFilter.addEventListener('change', (e) => {
            filterState.tier = e.target.value;
            renderClients();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            filterState.search = '';
            filterState.status = '';
            filterState.tier = '';
            if (searchInput) searchInput.value = '';
            if (statusFilter) statusFilter.value = '';
            if (tierFilter) tierFilter.value = '';
            renderClients();
        });
    }

    renderClients();

    // Modal Handling (Legacy but kept if needed)
    // The "Onboard" button should now redirect to the wizard page
    const openBtn = document.getElementById('onboard-btn');
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'onboard-client.html';
        });
    }

}

// --- Wizard Functionality ---
function initWizard() {
    let currentStep = 1;
    const totalSteps = 5;
    const form = document.getElementById('wizard-form');
    const nextBtn = document.getElementById('btn-next');
    const prevBtn = document.getElementById('btn-prev');
    const steps = document.querySelectorAll('.step-indicator');
    const contents = document.querySelectorAll('.step-content');

    // Populate Timezone Datalist
    if (window.Intl && typeof window.Intl.supportedValuesOf === 'function') {
        const datalist = document.getElementById('timezones');
        if (datalist && datalist.options.length === 0) {
            const zones = Intl.supportedValuesOf('timeZone');
            zones.forEach(zone => {
                const option = document.createElement('option');
                option.value = zone;
                datalist.appendChild(option);
            });
        }
    }

    // Wizard Data State
    let wizardData = {
        company_name: '',
        timezone: '',
        hq_address: {},
        billing: {},
        tier: 'Growth',
        locations: []
    };

    // Helper: Update View
    const updateWizardView = () => {
        // Steps
        steps.forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum === currentStep);
            step.classList.toggle('completed', stepNum < currentStep);
        });

        // Content
        contents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `step-${currentStep}`) {
                content.classList.add('active');
            }
        });

        // Buttons
        prevBtn.disabled = currentStep === 1;
        nextBtn.textContent = currentStep === totalSteps ? 'Confirm Onboarding' : 'Next Step';

        // Populate Review if last step
        if (currentStep === totalSteps) {
            populateReview();
        }
    };

    // Helper: Select Tier
    window.selectTier = (card, tierValue) => {
        document.querySelectorAll('.tier-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        document.getElementById('selected-tier').value = tierValue;
        wizardData.tier = tierValue;
    };

    // Helper: Populate Review Data
    const populateReview = () => {
        // Gather Form Data
        const formData = new FormData(form);
        wizardData.company_name = formData.get('company_name');
        wizardData.timezone = formData.get('timezone');

        // HQ Address
        wizardData.hq_address = {
            street: formData.get('hq_street'),
            city: formData.get('hq_city'),
            state: formData.get('hq_state'),
            zip: formData.get('hq_zip'),
            country: formData.get('hq_country')
        };

        wizardData.tier = formData.get('tier');

        // Locations Logic
        const locationCards = document.querySelectorAll('.location-card');
        wizardData.locations = [];

        // Clean list
        const reviewList = document.getElementById('review-locations-list');
        reviewList.innerHTML = '';

        locationCards.forEach(card => {
            const name = card.querySelector('input[name="location_name"]').value;
            const address = card.querySelector('input[name="location_address"]').value;
            const isPrimary = card.querySelector('input[name="primary_location"]').checked;

            if (name) {
                wizardData.locations.push({ name, address, isPrimary });

                const li = document.createElement('li');
                li.style.marginBottom = '0.5rem';
                li.innerHTML = `
                    <div style="display:flex; justify-content:space-between;">
                        <span style="font-weight:600;">${name} ${isPrimary ? '<span style="color:var(--accent); font-size:0.75rem; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px; margin-left:6px;">PRIMARY</span>' : ''}</span>
                    </div>
                    <div style="color:var(--text-muted); font-size:0.8rem;">${address || 'No address provided'}</div>
                `;
                reviewList.appendChild(li);
            }
        });

        // Populate Review UI
        document.getElementById('review-company').textContent = wizardData.company_name;

        const addressStr = [wizardData.hq_address.street, wizardData.hq_address.city, wizardData.hq_address.state, wizardData.hq_address.country].filter(Boolean).join(', ');
        document.getElementById('review-address').textContent = addressStr || '-';

        document.getElementById('review-tier').textContent = wizardData.tier;
    };

    // Event: Next Button
    nextBtn.addEventListener('click', () => {
        if (currentStep < totalSteps) {
            // Validate Step 1
            if (currentStep === 1) {
                const nameInput = form.querySelector('input[name="company_name"]');
                if (!nameInput.value) {
                    nameInput.style.borderColor = 'var(--danger)';
                    nameInput.focus();
                    return;
                } else {
                    nameInput.style.borderColor = '';
                }
            }
            // Basic Validation Step 2 (Optional - check HQ Address)
            if (currentStep === 2) {
                // Just ensuring street/city is roughly there, usually required
                // skipping strict validation for demo smoothness unless requested
            }

            currentStep++;
            updateWizardView();
        } else {
            // Finish / Submit
            // Save to LocalStorage
            let clients = JSON.parse(localStorage.getItem('nexus_clients')) || initialClients;
            const newClient = {
                id: 'c' + Date.now(),
                name: wizardData.company_name,
                tier: wizardData.tier,
                timezone: wizardData.timezone,
                status: 'Active',
                locations: wizardData.locations,
                // Store full details
                details: {
                    hq_address: wizardData.hq_address,
                    billing: wizardData.billing
                }
            };
            clients.unshift(newClient);
            localStorage.setItem('nexus_clients', JSON.stringify(clients));

            // Redirect
            window.location.href = 'clients.html';
        }
    });

    // Event: Prev Button
    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateWizardView();
        }
    });

    // Dynamic Locations logic for Wizard
    const addLocBtn = document.getElementById('wizard-add-location');
    const locContainer = document.getElementById('wizard-locations-container');
    const noLocMsg = document.getElementById('no-locations-msg');

    // Modal Elements for Wizard Location
    const locModal = document.getElementById('location-modal');
    const closeLocModalBtn = document.getElementById('close-location-modal');
    const cancelLocBtn = document.getElementById('cancel-location-btn');
    const saveLocBtn = document.getElementById('save-location-btn');
    const locNameInput = document.getElementById('modal-loc-name');
    const locAddrInput = document.getElementById('modal-loc-address');
    const locPrimaryInput = document.getElementById('modal-loc-primary');

    // Render Wizard Locations List
    const renderWizardLocations = () => {
        if (!locContainer) return;

        locContainer.innerHTML = '';
        if (wizardData.locations.length === 0) {
            locContainer.innerHTML = `
                <div style="text-align:center; padding:2rem; color:var(--text-muted); border:1px dashed var(--border-color); border-radius:8px;" id="no-locations-msg">
                    No locations added yet. Click 'Add New Location' to define one.
                </div>
            `;
            return;
        }

        wizardData.locations.forEach((loc, index) => {
            const div = document.createElement('div');
            div.className = 'fade-in';
            div.style.cssText = 'background:rgba(255,255,255,0.03); border:1px solid var(--border-color); border-radius:8px; padding:1rem; display:flex; justify-content:space-between; align-items:center;';
            div.innerHTML = `
                <div>
                    <div style="font-weight:600; display:flex; align-items:center; gap:0.5rem;">
                        ${loc.name}
                        ${loc.isPrimary ? '<span style="color:var(--accent); font-size:0.75rem; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px;">PRIMARY</span>' : ''}
                    </div>
                    <div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">${loc.address || 'No address'}</div>
                </div>
                <button type="button" onclick="removeWizardLocation(${index})" style="background:transparent; border:none; color:var(--danger); cursor:pointer;">
                    <i class="ph ph-trash" style="font-size:1.2rem;"></i>
                </button>
            `;
            locContainer.appendChild(div);
        });
    };

    // Remove Handler
    window.removeWizardLocation = (index) => {
        wizardData.locations.splice(index, 1);
        renderWizardLocations();
    };

    // Open Modal
    if (addLocBtn && locModal) {
        addLocBtn.addEventListener('click', () => {
            locModal.classList.add('active');
            locNameInput.value = '';
            locAddrInput.value = '';
            locPrimaryInput.checked = wizardData.locations.length === 0; // Auto check if first
            locNameInput.focus();
        });
    }

    // Close Modal Logic
    const closeLocModal = () => {
        if (locModal) locModal.classList.remove('active');
    };
    if (closeLocModalBtn) closeLocModalBtn.addEventListener('click', closeLocModal);
    if (cancelLocBtn) cancelLocBtn.addEventListener('click', closeLocModal);

    // Save Location Logic
    if (saveLocBtn) {
        saveLocBtn.addEventListener('click', () => {
            const name = locNameInput.value.trim();
            const address = locAddrInput.value.trim();
            const isPrimary = locPrimaryInput.checked;

            if (!name) {
                alert('Location Name is required');
                return;
            }

            // If primary is selected, unmark others
            if (isPrimary) {
                wizardData.locations.forEach(l => l.isPrimary = false);
            }

            wizardData.locations.push({ name, address, isPrimary });
            renderWizardLocations();
            closeLocModal();
        });
    }
}

// --- Client Details / Edit Page ---
function initClientDetails() {
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get('id');
    const clients = JSON.parse(localStorage.getItem('nexus_clients')) || initialClients;
    const client = clients.find(c => c.id === clientId);

    if (!client) {
        alert('Client not found');
        window.location.href = 'clients.html';
        return;
    }

    // Populate Title
    document.getElementById('client-page-title').textContent = client.name;

    // Populate Snapshot
    if (document.getElementById('snap-tier')) document.getElementById('snap-tier').textContent = client.tier;
    if (document.getElementById('snap-locs')) document.getElementById('snap-locs').textContent = (client.locations || []).length;
    // Kiosk Status (Online/Total) from client.kiosks
    const kiosks = client.kiosks || [];
    const totalKiosks = kiosks.length;
    const onlineKiosks = kiosks.filter(k => k.status === 'Online').length;
    if (document.getElementById('snap-kiosks')) document.getElementById('snap-kiosks').textContent = `${onlineKiosks} / ${totalKiosks}`;

    // Populate Form Fields
    const form = document.getElementById('client-details-form');

    // Core
    if (form.elements['company_name']) form.elements['company_name'].value = client.name || '';
    if (form.elements['status']) form.elements['status'].value = client.status || 'Active';
    if (form.elements['tier']) form.elements['tier'].value = client.tier || 'Starter';
    if (form.elements['timezone']) form.elements['timezone'].value = client.timezone || '';

    // Client Types (multi-select)
    client.clientTypes = client.clientTypes || [];
    const clientTypeCheckboxes = form.querySelectorAll('input[name="client_type"]');
    clientTypeCheckboxes.forEach(checkbox => {
        checkbox.checked = client.clientTypes.includes(checkbox.value);
    });
    // Update display text
    if (typeof updateClientTypeDisplay === 'function') {
        updateClientTypeDisplay();
    }

    // Details (if they exist)
    const details = client.details || {};
    const hq = details.hq_address || {};
    const bill = details.billing || {};

    if (form.elements['billing_contact']) form.elements['billing_contact'].value = bill.contact || '';
    if (form.elements['billing_email']) form.elements['billing_email'].value = bill.email || '';

    if (form.elements['hq_street']) form.elements['hq_street'].value = hq.street || '';
    if (form.elements['hq_city']) form.elements['hq_city'].value = hq.city || '';
    if (form.elements['hq_state']) form.elements['hq_state'].value = hq.state || '';
    if (form.elements['hq_zip']) form.elements['hq_zip'].value = hq.zip || '';
    if (form.elements['hq_country']) form.elements['hq_country'].value = hq.country || '';

    // Populate Locations
    const locList = document.getElementById('locations-list');

    const renderLocation = (loc, index) => {
        const item = document.createElement('div');
        item.className = 'location-item';
        item.innerHTML = `
            <div>
                <div style="font-weight:600; display:flex; align-items:center; gap:0.5rem;">
                    <input type="text" class="form-input" value="${loc.name}" 
                           onchange="updateLoc(${index}, 'name', this.value)"
                           style="padding:4px 8px; font-size:0.9rem; width:140px;">
                    ${loc.isPrimary ? '<span style="color:var(--accent); font-size:0.75rem; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px;">PRIMARY</span>' : ''}
                </div>
                <div style="margin-top:0.5rem;">
                    <input type="text" class="form-input" value="${loc.address || ''}" 
                           placeholder="Address"
                           onchange="updateLoc(${index}, 'address', this.value)"
                           style="padding:4px 8px; font-size:0.8rem; width:200px;">
                </div>
            </div>
            <button type="button" class="btn btn-secondary" onclick="removeLoc(${index})" style="color:var(--danger); border-color:var(--danger); padding:4px 8px;"><i class="ph ph-trash"></i></button>
        `;
        locList.appendChild(item);
    };

    client.locations = client.locations || [];
    const refreshLocs = () => {
        locList.innerHTML = '';
        client.locations.forEach((loc, i) => renderLocation(loc, i));
    };
    refreshLocs();

    // Global helpers for inline onclicks (hacky but quick)
    window.updateLoc = (index, field, val) => {
        client.locations[index][field] = val;
    };
    window.removeLoc = (index) => {
        if (confirm('Remove this location?')) {
            client.locations.splice(index, 1);
            refreshLocs();
        }
    };

    document.getElementById('add-loc-btn').addEventListener('click', () => {
        client.locations.push({ name: 'New Location', address: '', isPrimary: false });
        refreshLocs();
    });

    // --- Image Specs Logic ---
    client.imageSpecs = client.imageSpecs || {
        inputFormat: 'JPEG',
        maxFileSize: 10,
        inputResolution: '1920x1080',
        outputFormat: 'JPEG',
        quality: 85,
        outputResolution: '1920x1080'
    };

    // Populate Specs Form
    if (form.elements['spec_input_max_size']) form.elements['spec_input_max_size'].value = client.imageSpecs.maxFileSize;
    if (form.elements['spec_input_res']) form.elements['spec_input_res'].value = client.imageSpecs.inputResolution || '1920x1080';

    // Input Format
    if (form.elements['spec_input_fmt']) form.elements['spec_input_fmt'].value = client.imageSpecs.inputFormat || 'JPEG';

    // Output
    if (form.elements['spec_output_fmt']) form.elements['spec_output_fmt'].value = client.imageSpecs.outputFormat;
    if (form.elements['spec_output_quality']) {
        form.elements['spec_output_quality'].value = client.imageSpecs.quality;
        const qDisp = document.getElementById('quality-val-disp');
        if (qDisp) qDisp.textContent = client.imageSpecs.quality;
    }
    if (form.elements['spec_output_res']) form.elements['spec_output_res'].value = client.imageSpecs.outputResolution || '1920x1080';


    // --- Kiosk Management Logic ---
    client.kiosks = client.kiosks || []; // Ensure array exists
    const kioskListBody = document.getElementById('kiosk-list-body');

    const renderKiosks = () => {
        if (!kioskListBody) return;
        kioskListBody.innerHTML = '';
        if (client.kiosks.length === 0) {
            kioskListBody.innerHTML = '<tr><td colspan="4" style="padding:1rem; text-align:center; color:var(--text-muted);">No kiosks assigned.</td></tr>';
            return;
        }
        client.kiosks.forEach((k, i) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            const statusColor = k.status === 'Online' ? 'var(--success)' : 'var(--text-muted)';
            const statusBg = k.status === 'Online' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)';

            // Build Location Options for this Kiosk
            let locOptions = client.locations.map(l => `<option value="${l.name}" ${l.name === k.location ? 'selected' : ''}>${l.name}</option>`).join('');
            if (!locOptions) locOptions = '<option value="">No Locations</option>';

            tr.innerHTML = `
                <td style="padding:10px;">
                    <input type="text" class="form-input" value="${k.id}" onchange="updateKiosk(${i}, 'id', this.value)" style="width:120px; padding:4px 8px; font-family:monospace;">
                </td>
                <td style="padding:10px;">
                    <select class="form-input" onchange="updateKiosk(${i}, 'location', this.value)" style="padding:4px 8px;">
                        <option value="">Unassigned</option>
                        ${locOptions}
                    </select>
                </td>
                <td style="padding:10px;">
                    <span style="display:inline-block; padding:2px 8px; border-radius:4px; background:${statusBg}; color:${statusColor}; font-size:0.8rem; cursor:pointer;" onclick="toggleKioskStatus(${i})">
                        ${k.status}
                    </span>
                </td>
                <td style="padding:10px; text-align:right;">
                    <button type="button" class="btn btn-secondary" onclick="removeKiosk(${i})" style="color:var(--danger); border-color:var(--danger); padding:4px 8px;">
                        <i class="ph ph-trash"></i>
                    </button>
                </td>
            `;
            kioskListBody.appendChild(tr);
        });
    };

    // Global Kiosk Helpers
    window.updateKiosk = (index, field, val) => {
        client.kiosks[index][field] = val;
    };
    window.toggleKioskStatus = (index) => {
        client.kiosks[index].status = client.kiosks[index].status === 'Online' ? 'Offline' : 'Online';
        renderKiosks();
    };
    window.removeKiosk = (index) => {
        if (confirm('Remove this kiosk?')) {
            client.kiosks.splice(index, 1);
            renderKiosks();
        }
    };
    window.addMockKiosk = () => {
        const id = 'KSK-' + Math.floor(1000 + Math.random() * 9000);
        client.kiosks.push({ id: id, location: '', status: 'Offline' });
        renderKiosks();
    };

    const addKioskBtn = document.getElementById('add-kiosk-btn');
    if (addKioskBtn) {
        addKioskBtn.addEventListener('click', window.addMockKiosk);
    }

    renderKiosks();

    // --- API Tab Logic ---
    const apiKeyInput = document.getElementById('api-secret-key');
    const regenBtn = document.getElementById('regenerate-key-btn');
    const toggleSecretBtn = document.getElementById('toggle-secret-btn');
    const webhookInput = document.querySelector('input[name="webhook_url"]');
    const dailyLimitInput = document.querySelector('input[name="api_limit_daily"]');
    const monthlyLimitInput = document.querySelector('input[name="api_limit_monthly"]');
    const burstLimitInput = document.querySelector('input[name="api_limit_burst"]');

    // UI Elements
    const usageDailyCurrent = document.getElementById('usage-current-daily');
    const usageDailyMax = document.getElementById('usage-max-daily');
    const usageDailyBar = document.getElementById('usage-progress-daily');

    const usageMonthlyCurrent = document.getElementById('usage-current-monthly');
    const usageMonthlyMax = document.getElementById('usage-max-monthly');
    const usageMonthlyBar = document.getElementById('usage-progress-monthly');

    // Init API Data
    client.api = client.api || {};
    client.api.clientId = client.api.clientId || 'client_' + Math.random().toString(36).substr(2, 9);
    client.api.secretKey = client.api.secretKey || 'sk_live_' + Array(32).fill(0).map(() => Math.random().toString(36)[2]).join('');
    client.api.webhook = client.api.webhook || '';
    client.api.limits = client.api.limits || { daily: 10000, monthly: 250000, burst: 50 };
    if (!client.api.limits.monthly) client.api.limits.monthly = 250000; // Backfill

    if (document.getElementById('api-client-id')) {
        document.getElementById('api-client-id').value = client.api.clientId;
    }
    if (apiKeyInput) {
        apiKeyInput.value = client.api.secretKey;
    }
    if (webhookInput) {
        webhookInput.value = client.api.webhook;
    }

    // Bind Inputs & Limits
    if (dailyLimitInput) {
        dailyLimitInput.value = client.api.limits.daily;
        dailyLimitInput.addEventListener('input', updateUsageUI);
    }
    if (monthlyLimitInput) {
        monthlyLimitInput.value = client.api.limits.monthly;
        monthlyLimitInput.addEventListener('input', updateUsageUI);
    }
    if (burstLimitInput) {
        burstLimitInput.value = client.api.limits.burst;
    }

    // Mock Usage Data
    const mockDailyUsage = 1245;
    const mockMonthlyUsage = 45210;

    function updateUsageUI() {
        // Daily
        if (usageDailyMax && dailyLimitInput) {
            const limit = parseInt(dailyLimitInput.value) || 10000;
            usageDailyMax.textContent = limit.toLocaleString();
            usageDailyCurrent.textContent = mockDailyUsage.toLocaleString();

            const pct = Math.min((mockDailyUsage / limit) * 100, 100);
            usageDailyBar.style.width = `${pct}%`;

            if (pct > 90) usageDailyBar.style.background = 'var(--danger)';
            else if (pct > 75) usageDailyBar.style.background = 'var(--warning)';
            else usageDailyBar.style.background = 'var(--success)';
        }

        // Monthly
        if (usageMonthlyMax && monthlyLimitInput) {
            const limit = parseInt(monthlyLimitInput.value) || 250000;
            usageMonthlyMax.textContent = limit.toLocaleString();
            usageMonthlyCurrent.textContent = mockMonthlyUsage.toLocaleString();

            const pct = Math.min((mockMonthlyUsage / limit) * 100, 100);
            usageMonthlyBar.style.width = `${pct}%`;

            // Different color scheme for monthly? Using accent/brand color usually good
            if (pct > 90) usageMonthlyBar.style.background = 'var(--danger)';
            else if (pct > 75) usageMonthlyBar.style.background = 'var(--warning)';
            else usageMonthlyBar.style.background = 'var(--accent)';
        }
    }

    // Initial render
    updateUsageUI();

    // Toggle Visibility
    if (toggleSecretBtn && apiKeyInput) {
        toggleSecretBtn.addEventListener('click', () => {
            if (apiKeyInput.type === 'password') {
                apiKeyInput.type = 'text';
                toggleSecretBtn.innerHTML = '<i class="ph ph-eye-slash"></i>';
            } else {
                apiKeyInput.type = 'password';
                toggleSecretBtn.innerHTML = '<i class="ph ph-eye"></i>';
            }
        });
    }

    // Regenerate
    if (regenBtn && apiKeyInput) {
        regenBtn.addEventListener('click', () => {
            if (confirm('Are you sure? This will invalidate the existing secret key immediately.')) {
                const newKey = 'sk_live_' + Array(32).fill(0).map(() => Math.random().toString(36)[2]).join('');
                client.api.secretKey = newKey;
                apiKeyInput.value = newKey;
                alert('New secret key generated. Don\'t forget to save.');
            }
        });
    }

    // Timezone Datalist
    if (window.Intl && typeof window.Intl.supportedValuesOf === 'function') {
        const datalist = document.getElementById('timezones');
        if (datalist && datalist.options.length === 0) {
            const zones = Intl.supportedValuesOf('timeZone');
            zones.forEach(zone => {
                const option = document.createElement('option');
                option.value = zone;
                datalist.appendChild(option);
            });
        }
    }

    // --- Activity Log Logic ---
    const logContainer = document.getElementById('activity-log-container');
    const logDateFrom = document.getElementById('log-date-from');
    const logDateTo = document.getElementById('log-date-to');
    const logFilterBtn = document.getElementById('log-filter-btn');
    const logClearBtn = document.getElementById('log-clear-btn');

    // Initialize client activity log if not exists
    client.activityLog = client.activityLog || generateMockActivityLog(client.name);

    let filteredLogs = [...client.activityLog];

    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    if (logDateFrom) logDateFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
    if (logDateTo) logDateTo.value = today.toISOString().split('T')[0];

    function renderActivityLog() {
        if (!logContainer) return;

        if (filteredLogs.length === 0) {
            logContainer.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i class="ph ph-clock-counter-clockwise" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    <p>No activity logs found for the selected date range.</p>
                </div>
            `;
            return;
        }

        const logHTML = filteredLogs.map(log => {
            const iconMap = {
                'created': 'ph-plus-circle',
                'updated': 'ph-pencil-simple',
                'status_change': 'ph-arrow-clockwise',
                'kiosk_added': 'ph-desktop',
                'kiosk_removed': 'ph-trash',
                'location_added': 'ph-map-pin',
                'api_key_generated': 'ph-key',
                'settings_changed': 'ph-gear',
                'login': 'ph-sign-in',
                'export': 'ph-download-simple'
            };

            const colorMap = {
                'created': 'var(--success)',
                'updated': 'var(--accent)',
                'status_change': 'var(--warning)',
                'kiosk_added': 'var(--success)',
                'kiosk_removed': 'var(--danger)',
                'location_added': 'var(--success)',
                'api_key_generated': 'var(--warning)',
                'settings_changed': 'var(--primary)',
                'login': 'var(--accent)',
                'export': 'var(--primary)'
            };

            const icon = iconMap[log.type] || 'ph-info';
            const color = colorMap[log.type] || 'var(--text-muted)';

            return `
                <div style="display: flex; gap: 1rem; padding: 1rem; border-bottom: 1px solid var(--border-color); transition: background 0.2s;"
                     onmouseover="this.style.background='rgba(255,255,255,0.02)'" 
                     onmouseout="this.style.background='transparent'">
                    <div style="flex-shrink: 0;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center;">
                            <i class="${icon}" style="font-size: 1.25rem; color: ${color};"></i>
                        </div>
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.25rem;">
                            <span style="font-weight: 600; color: var(--text-main);">${log.action}</span>
                            <span style="font-size: 0.75rem; color: var(--text-muted);">${formatLogDate(log.timestamp)}</span>
                        </div>
                        <p style="color: var(--text-muted); font-size: 0.875rem; margin: 0;">${log.description}</p>
                        ${log.user ? `<p style="color: var(--text-muted); font-size: 0.75rem; margin-top: 0.25rem; font-style: italic;">by ${log.user}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        logContainer.innerHTML = logHTML;
    }

    function formatLogDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function filterLogs() {
        const fromDate = logDateFrom ? new Date(logDateFrom.value) : null;
        const toDate = logDateTo ? new Date(logDateTo.value) : null;

        if (toDate) toDate.setHours(23, 59, 59, 999); // Include entire end date

        filteredLogs = client.activityLog.filter(log => {
            const logDate = new Date(log.timestamp);
            if (fromDate && logDate < fromDate) return false;
            if (toDate && logDate > toDate) return false;
            return true;
        });

        renderActivityLog();
    }

    if (logFilterBtn) {
        logFilterBtn.addEventListener('click', filterLogs);
    }

    if (logClearBtn) {
        logClearBtn.addEventListener('click', () => {
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);

            if (logDateFrom) logDateFrom.value = thirtyDaysAgo.toISOString().split('T')[0];
            if (logDateTo) logDateTo.value = today.toISOString().split('T')[0];

            filterLogs();
        });
    }

    // Initial render
    filterLogs();

    // Generate mock activity log
    function generateMockActivityLog(clientName) {
        const activities = [
            { type: 'created', action: 'Client Created', description: `${clientName} was onboarded to the platform.`, user: 'Admin User' },
            { type: 'kiosk_added', action: 'Kiosk Added', description: 'New kiosk KSK-1234 assigned to NY Flagship location.', user: 'Admin User' },
            { type: 'location_added', action: 'Location Added', description: 'New location "LA Mall" added to client.', user: 'Admin User' },
            { type: 'settings_changed', action: 'Settings Updated', description: 'Image specifications updated: Input resolution changed to 1920x1080.', user: 'Admin User' },
            { type: 'api_key_generated', action: 'API Key Regenerated', description: 'New API secret key generated for security purposes.', user: 'Admin User' },
            { type: 'status_change', action: 'Status Changed', description: 'Client status changed from Inactive to Active.', user: 'System' },
            { type: 'updated', action: 'Billing Information Updated', description: 'Billing contact and email address updated.', user: 'Admin User' },
            { type: 'kiosk_removed', action: 'Kiosk Removed', description: 'Kiosk KSK-5678 removed from inventory.', user: 'Admin User' },
            { type: 'export', action: 'Data Exported', description: 'Client data exported to CSV format.', user: 'Admin User' },
            { type: 'login', action: 'Client Portal Access', description: 'Client accessed their portal dashboard.', user: clientName }
        ];

        const logs = [];
        const now = new Date();

        for (let i = 0; i < 15; i++) {
            const activity = activities[Math.floor(Math.random() * activities.length)];
            const daysAgo = Math.floor(Math.random() * 60);
            const timestamp = new Date(now);
            timestamp.setDate(timestamp.getDate() - daysAgo);
            timestamp.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

            logs.push({
                ...activity,
                timestamp: timestamp.toISOString(),
                id: `log_${Date.now()}_${i}`
            });
        }

        return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Save
    document.getElementById('save-client-btn').addEventListener('click', () => {
        // Collect Main Form Data
        const formData = new FormData(form);
        client.name = formData.get('company_name');
        client.status = formData.get('status');
        client.tier = formData.get('tier');
        client.timezone = formData.get('timezone');

        // Save Client Types (multi-select)
        const selectedTypes = Array.from(form.querySelectorAll('input[name="client_type"]:checked'))
            .map(cb => cb.value);
        client.clientTypes = selectedTypes;

        client.details = client.details || {};
        client.details.billing = {
            contact: formData.get('billing_contact'),
            email: formData.get('billing_email')
        };
        client.details.hq_address = {
            street: formData.get('hq_street'),
            city: formData.get('hq_city'),
            state: formData.get('hq_state'),
            zip: formData.get('hq_zip'),
            country: formData.get('hq_country')
        };

        if (webhookInput) {
            client.api.webhook = webhookInput.value;
            // Secret key and Client ID are already in client.api state from generation logic
        }

        if (dailyLimitInput && burstLimitInput && monthlyLimitInput) {
            client.api.limits = {
                daily: parseInt(dailyLimitInput.value) || 10000,
                monthly: parseInt(monthlyLimitInput.value) || 250000,
                burst: parseInt(burstLimitInput.value) || 50
            };
        }



        client.imageSpecs = {
            inputFormat: form.elements['spec_input_fmt'].value,
            maxFileSize: parseInt(form.elements['spec_input_max_size'].value) || 10,
            inputResolution: form.elements['spec_input_res'].value,
            outputFormat: form.elements['spec_output_fmt'].value,
            quality: parseInt(form.elements['spec_output_quality'].value) || 85,
            outputResolution: form.elements['spec_output_res'].value
        };

        // Save to LS
        const index = clients.findIndex(c => c.id === clientId);
        if (index !== -1) {
            clients[index] = client;
            localStorage.setItem('nexus_clients', JSON.stringify(clients));
            alert('Client saved successfully');
            // Update title just in case
            document.getElementById('client-page-title').textContent = client.name;
        }
    });

}

// --- Assigned Kiosks Page ---
function initAssignedKiosksPage() {
    const assignedKiosksTableBody = document.getElementById('assigned-kiosks-table-body');
    if (!assignedKiosksTableBody) return;

    const clients = JSON.parse(localStorage.getItem('nexus_clients')) || initialClients;

    // Collect all assigned kiosks with client info
    let allKiosks = [];
    clients.forEach(client => {
        const kiosks = client.kiosks || [];
        kiosks.forEach(kiosk => {
            allKiosks.push({
                ...kiosk,
                clientId: client.id,
                clientName: client.name
            });
        });
    });

    // Filter State
    let filterState = {
        search: '',
        client: '',
        status: '',
        location: ''
    };

    // Populate Client Filter
    const clientFilter = document.getElementById('assigned-client-filter');
    if (clientFilter) {
        const uniqueClients = [...new Set(clients.map(c => c.name))].sort();
        uniqueClients.forEach(clientName => {
            const option = document.createElement('option');
            option.value = clientName;
            option.textContent = clientName;
            clientFilter.appendChild(option);
        });
    }

    const render = () => {
        // Apply filters
        let filteredKiosks = allKiosks.filter(kiosk => {
            const matchesSearch = !filterState.search ||
                (kiosk.id && kiosk.id.toLowerCase().includes(filterState.search.toLowerCase())) ||
                kiosk.clientName.toLowerCase().includes(filterState.search.toLowerCase());
            const matchesClient = !filterState.client || kiosk.clientName === filterState.client;
            const matchesStatus = !filterState.status || kiosk.status === filterState.status;
            const matchesLocation = !filterState.location ||
                (kiosk.location && kiosk.location.toLowerCase().includes(filterState.location.toLowerCase()));

            return matchesSearch && matchesClient && matchesStatus && matchesLocation;
        });

        // Update results count
        const resultsEl = document.getElementById('assigned-filter-results');
        if (resultsEl) {
            const total = allKiosks.length;
            const filtered = filteredKiosks.length;
            if (filterState.search || filterState.client || filterState.status || filterState.location) {
                resultsEl.textContent = `Showing ${filtered} of ${total} kiosks`;
            } else {
                resultsEl.textContent = `${total} kiosks`;
            }
        }

        const rows = [];

        if (filteredKiosks.length === 0) {
            rows.push(`
                <tr>
                    <td colspan="5" style="padding:1rem; text-align:center; color:var(--text-muted);">
                        ${allKiosks.length === 0
                    ? 'No kiosks are assigned to clients yet. Assign kiosks from the <a href="kiosks-stock.html" style="color:var(--primary);">Stock</a> page or from individual client pages.'
                    : 'No kiosks match the current filters.'}
                    </td>
                </tr>
            `);
        } else {
            filteredKiosks.forEach(kiosk => {
                const status = kiosk.status || 'Offline';
                const statusClass = status === 'Online' ? 'status-active' : 'status-neutral';

                // Use unique identifier for onclick (composite match since we Flattened the list)
                // simpler to just pass the ID string
                const kioskId = kiosk.id || 'Unknown';

                rows.push(`
                    <tr>
                        <td><span style="font-family:monospace;">${kioskId}</span></td>
                        <td>${kiosk.clientName}</td>
                        <td>${kiosk.location || '-'}</td>
                        <td>
                            <span class="status-capsule ${statusClass}">${status}</span>
                        </td>
                        <td style="text-align:right;">
                            <button class="btn btn-secondary" onclick="viewKioskHistory('${kioskId}', '${kiosk.clientName}')" style="font-size:0.75rem; padding: 4px 10px; margin-right:4px;">
                                <i class="ph ph-clock-counter-clockwise"></i> History
                            </button>
                            <a href="client-details.html?id=${kiosk.clientId}" class="btn btn-secondary" style="font-size:0.75rem; padding: 4px 10px; text-decoration:none; display:inline-block;">
                                Manage Client
                            </a>
                        </td>
                    </tr>
                `);
            });
        }

        assignedKiosksTableBody.innerHTML = rows.join('');
    };

    // History Modal Logic
    const historyModal = document.getElementById('history-modal');
    const closeHistoryBtn = document.getElementById('close-history-modal');
    const closeHistoryBtnFooter = document.getElementById('close-history-btn');
    const historySubtitle = document.getElementById('history-modal-subtitle');
    const historyTimeline = document.getElementById('history-timeline');

    // Close Handler
    const closeHistory = () => {
        if (historyModal) historyModal.classList.remove('active');
    };
    if (closeHistoryBtn) closeHistoryBtn.addEventListener('click', closeHistory);
    if (closeHistoryBtnFooter) closeHistoryBtnFooter.addEventListener('click', closeHistory);
    if (historyModal) {
        historyModal.addEventListener('click', (e) => {
            if (e.target === historyModal) closeHistory();
        });
    }

    // Expose View Function
    window.viewKioskHistory = (kioskId, clientName) => {
        if (!historyModal) return;

        // Update Header
        historySubtitle.textContent = `History for ${kioskId} • Assigned to ${clientName}`;

        // Generate Mock History
        const events = generateMockHistory(kioskId);

        // Render Timeline
        historyTimeline.innerHTML = events.map(event => `
            <div class="timeline-item">
                <div class="timeline-date">${event.date} • ${event.time}</div>
                <div class="timeline-content">
                    <div class="timeline-title" style="display:flex; align-items:center; gap:8px;">
                        <i class="${event.icon}" style="color:var(--primary);"></i>
                        ${event.title}
                    </div>
                    <div class="timeline-desc">${event.desc}</div>
                </div>
            </div>
        `).join('');

        historyModal.classList.add('active');
    };

    // Mock History Generator
    function generateMockHistory(kioskId) {
        // Deterministic-ish random based on ID length
        const count = 3 + (kioskId.length % 4);
        const events = [];
        const types = [
            { title: 'Status Changed', desc: 'Kiosk went Online.', icon: 'ph-wifi-high' },
            { title: 'Software Update', desc: 'Successfully updated to v2.4.1.', icon: 'ph-arrows-clockwise' },
            { title: 'Maintenance Mode', desc: 'Manual maintenance mode enabled by admin.', icon: 'ph-wrench' },
            { title: 'Heartbeat Missed', desc: 'Failed to receive heartbeat signal > 5min.', icon: 'ph-warning' },
            { title: 'Assignment', desc: 'Kiosk assigned to current location.', icon: 'ph-map-pin' }
        ];

        let date = new Date();

        for (let i = 0; i < count; i++) {
            // Go back in time
            date.setHours(date.getHours() - (Math.floor(Math.random() * 48) + 1));
            const type = types[Math.floor(Math.random() * types.length)];

            events.push({
                date: date.toLocaleDateString(),
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                title: type.title,
                desc: type.desc,
                icon: type.icon // needs ph- prefix usually handled by class
            });
        }

        // Always add "Created" at the end
        events.push({
            date: '12/01/2024',
            time: '09:00 AM',
            title: 'Provisioned',
            desc: `Kiosk ${kioskId} added to inventory.`,
            icon: 'ph-plus-circle'
        });

        return events;
    }

    // Filter Event Handlers
    const searchInput = document.getElementById('assigned-search');
    const clientFilterSelect = document.getElementById('assigned-client-filter');
    const statusFilter = document.getElementById('assigned-status-filter');
    const locationFilter = document.getElementById('assigned-location-filter');
    const clearBtn = document.getElementById('assigned-filter-clear');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterState.search = e.target.value;
            render();
        });
    }

    if (clientFilterSelect) {
        clientFilterSelect.addEventListener('change', (e) => {
            filterState.client = e.target.value;
            render();
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            filterState.status = e.target.value;
            render();
        });
    }

    if (locationFilter) {
        locationFilter.addEventListener('input', (e) => {
            filterState.location = e.target.value;
            render();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            filterState.search = '';
            filterState.client = '';
            filterState.status = '';
            filterState.location = '';
            if (searchInput) searchInput.value = '';
            if (clientFilterSelect) clientFilterSelect.value = '';
            if (statusFilter) statusFilter.value = '';
            if (locationFilter) locationFilter.value = '';
            render();
        });
    }

    render();
}

// --- Stock Kiosks Page ---
function initStockKiosksPage() {
    const stockKiosksTableBody = document.getElementById('stock-kiosks-table-body');
    if (!stockKiosksTableBody) return;

    let stockKiosks = JSON.parse(localStorage.getItem('nexus_stock_kiosks')) || [];

    // Filter State
    let filterState = {
        search: '',
        status: '',
        location: ''
    };

    const saveStockKiosks = () => {
        localStorage.setItem('nexus_stock_kiosks', JSON.stringify(stockKiosks));
    };

    const render = () => {
        // Apply filters
        let filteredKiosks = stockKiosks.filter(kiosk => {
            const matchesSearch = !filterState.search ||
                (kiosk.id && kiosk.id.toLowerCase().includes(filterState.search.toLowerCase()));
            const matchesStatus = !filterState.status || kiosk.status === filterState.status;
            const matchesLocation = !filterState.location ||
                (kiosk.location && kiosk.location.toLowerCase().includes(filterState.location.toLowerCase()));

            return matchesSearch && matchesStatus && matchesLocation;
        });

        // Update results count
        const resultsEl = document.getElementById('stock-filter-results');
        if (resultsEl) {
            const total = stockKiosks.length;
            const filtered = filteredKiosks.length;
            if (filterState.search || filterState.status || filterState.location) {
                resultsEl.textContent = `Showing ${filtered} of ${total} kiosks`;
            } else {
                resultsEl.textContent = `${total} kiosks`;
            }
        }

        const rows = [];

        if (filteredKiosks.length === 0) {
            rows.push(`
                <tr>
                    <td colspan="5" style="padding:1rem; text-align:center; color:var(--text-muted);">
                        ${stockKiosks.length === 0
                    ? 'No stock kiosks yet. Click <strong>Add Stock Kiosk</strong> to create inventory.'
                    : 'No kiosks match the current filters.'}
                    </td>
                </tr>
            `);
        } else {
            // Map filtered indices back to original array indices for update handlers
            filteredKiosks.forEach((kiosk, filteredIndex) => {
                const originalIndex = stockKiosks.findIndex(k => k.id === kiosk.id && k.location === kiosk.location);
                const status = kiosk.status || 'In Stock';
                const lastUpdated = kiosk.lastUpdated || new Date().toLocaleDateString();
                const statusClass = status === 'In Stock' ? 'status-active' : status === 'Reserved' ? 'status-warning' : 'status-neutral';

                rows.push(`
                    <tr>
                        <td style="padding:10px;">
                            <input type="text" class="form-input" value="${kiosk.id || ''}" 
                                   placeholder="KSK-0000"
                                   onchange="updateStockKiosk(${originalIndex}, 'id', this.value)"
                                   style="width:140px; padding:4px 8px; font-family:monospace;">
                        </td>
                        <td style="padding:10px;">
                            <input type="text" class="form-input" value="${kiosk.location || ''}" 
                                   placeholder="e.g. Warehouse A"
                                   onchange="updateStockKiosk(${originalIndex}, 'location', this.value)"
                                   style="width:180px; padding:4px 8px;">
                        </td>
                        <td style="padding:10px;">
                            <select class="form-input" onchange="updateStockKiosk(${originalIndex}, 'status', this.value)" style="padding:4px 8px; width:130px;">
                                <option value="In Stock" ${status === 'In Stock' ? 'selected' : ''}>In Stock</option>
                                <option value="Reserved" ${status === 'Reserved' ? 'selected' : ''}>Reserved</option>
                                <option value="RMA / Repair" ${status === 'RMA / Repair' ? 'selected' : ''}>RMA / Repair</option>
                                <option value="Retired" ${status === 'Retired' ? 'selected' : ''}>Retired</option>
                            </select>
                        </td>
                        <td style="padding:10px; color:var(--text-muted); font-size:0.85rem;">
                            ${lastUpdated}
                        </td>
                        <td style="padding:10px; text-align:right;">
                            <button type="button" class="btn btn-secondary" onclick="removeStockKiosk(${originalIndex})" style="color:var(--danger); border-color:var(--danger); padding:4px 8px;">
                                <i class="ph ph-trash"></i>
                            </button>
                        </td>
                    </tr>
                `);
            });
        }

        stockKiosksTableBody.innerHTML = rows.join('');
    };

    // Expose handlers for inline events
    window.updateStockKiosk = (index, field, value) => {
        stockKiosks[index][field] = value;
        if (field === 'status' || field === 'location') {
            stockKiosks[index].lastUpdated = new Date().toLocaleDateString();
        }
        saveStockKiosks();
        render();
    };

    window.removeStockKiosk = (index) => {
        if (confirm('Remove this stock kiosk from inventory?')) {
            stockKiosks.splice(index, 1);
            saveStockKiosks();
            render();
        }
    };

    // window.addStockKiosk removed in favor of modal workflow

    // Filter Event Handlers
    const searchInput = document.getElementById('stock-search');
    const statusFilter = document.getElementById('stock-status-filter');
    const locationFilter = document.getElementById('stock-location-filter');
    const clearBtn = document.getElementById('stock-filter-clear');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterState.search = e.target.value;
            render();
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            filterState.status = e.target.value;
            render();
        });
    }

    if (locationFilter) {
        locationFilter.addEventListener('input', (e) => {
            filterState.location = e.target.value;
            render();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            filterState.search = '';
            filterState.status = '';
            filterState.location = '';
            if (searchInput) searchInput.value = '';
            if (statusFilter) statusFilter.value = '';
            if (locationFilter) locationFilter.value = '';
            render();
        });
    }

    // Modal Elements
    const modal = document.getElementById('add-kiosk-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-modal-btn');
    const confirmBtn = document.getElementById('confirm-add-kiosk-btn');
    const openBtn = document.getElementById('add-stock-kiosk-btn');

    // Inputs
    const newIdInput = document.getElementById('new-kiosk-id');
    const newLocInput = document.getElementById('new-kiosk-location');
    const newStatusInput = document.getElementById('new-kiosk-status');

    // Open Modal
    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            modal.classList.add('active');
            newIdInput.value = '';
            newLocInput.value = '';
            newStatusInput.value = 'In Stock';
            newIdInput.focus();
        });
    }

    // Close Modal
    const closeModal = () => {
        if (modal) modal.classList.remove('active');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Confirm Add
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            let id = newIdInput.value.trim();
            const location = newLocInput.value.trim();
            const status = newStatusInput.value;

            // Auto-generate ID if empty
            if (!id) {
                id = 'KSK-' + Math.floor(1000 + Math.random() * 9000);
            }

            // Optional: Check uniqueness
            if (stockKiosks.some(k => k.id === id)) {
                alert('Kiosk ID already exists. Please choose a different one.');
                return;
            }

            stockKiosks.unshift({
                id,
                location,
                status,
                lastUpdated: new Date().toLocaleDateString()
            });

            saveStockKiosks();
            render();
            closeModal();

            // Show toast or slight feedback? (Optional, skipping for now)
        });
    }

    render();
}

// --- User Management Page ---
function initUsersPage() {
    const usersTableBody = document.getElementById('users-table-body');
    if (!usersTableBody) return;

    // Role-based permissions configuration
    const rolePermissions = {
        'Super Admin': {
            description: 'Full system access with all permissions',
            permissions: ['manage_users', 'manage_clients', 'manage_kiosks', 'manage_config', 'view_audit', 'manage_policies', 'manage_features']
        },
        'Admin': {
            description: 'Administrative access with limited system configuration',
            permissions: ['manage_clients', 'manage_kiosks', 'view_audit', 'manage_policies']
        },
        'Manager': {
            description: 'Manage clients and kiosks, view reports',
            permissions: ['manage_clients', 'manage_kiosks', 'view_audit']
        },
        'Viewer': {
            description: 'Read-only access to view data',
            permissions: ['view_clients', 'view_kiosks', 'view_audit']
        }
    };

    const permissionLabels = {
        'manage_users': 'Manage Users',
        'manage_clients': 'Manage Clients',
        'manage_kiosks': 'Manage Kiosks',
        'manage_config': 'Manage Global Config',
        'view_audit': 'View Audit Logs',
        'manage_policies': 'Manage Policies',
        'manage_features': 'Manage Feature Flags',
        'view_clients': 'View Clients',
        'view_kiosks': 'View Kiosks'
    };

    // Load users from localStorage or use initial data
    let users = JSON.parse(localStorage.getItem('nexus_users')) || [
        {
            id: 'u1',
            name: 'Super Admin',
            email: 'admin@nexus.com',
            role: 'Super Admin',
            status: 'Active',
            lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            createdAt: '2024-01-15'
        },
        {
            id: 'u2',
            name: 'John Manager',
            email: 'john@nexus.com',
            role: 'Manager',
            status: 'Active',
            lastLogin: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            createdAt: '2024-03-20'
        },
        {
            id: 'u3',
            name: 'Sarah Admin',
            email: 'sarah@nexus.com',
            role: 'Admin',
            status: 'Active',
            lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            createdAt: '2024-02-10'
        },
        {
            id: 'u4',
            name: 'Mike Viewer',
            email: 'mike@nexus.com',
            role: 'Viewer',
            status: 'Inactive',
            lastLogin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: '2024-04-05'
        }
    ];

    // Filter state
    let filterState = {
        search: '',
        role: '',
        status: ''
    };

    let editingUserId = null;

    const saveUsers = () => {
        localStorage.setItem('nexus_users', JSON.stringify(users));
    };

    const render = () => {
        // Apply filters
        let filteredUsers = users.filter(user => {
            const matchesSearch = !filterState.search ||
                user.name.toLowerCase().includes(filterState.search.toLowerCase()) ||
                user.email.toLowerCase().includes(filterState.search.toLowerCase());
            const matchesRole = !filterState.role || user.role === filterState.role;
            const matchesStatus = !filterState.status || user.status === filterState.status;

            return matchesSearch && matchesRole && matchesStatus;
        });

        // Update results count
        const resultsEl = document.getElementById('filter-results');
        if (resultsEl) {
            resultsEl.textContent = `${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''}`;
        }

        const usersTableBody = document.getElementById('users-table-body');
        if (!usersTableBody) return;

        if (filteredUsers.length === 0) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="padding: 3rem; text-align: center; color: var(--text-muted);">
                        <i class="ph ph-users" style="font-size: 3rem; opacity: 0.3;"></i>
                        <p style="margin-top: 1rem;">No users found matching the current filters.</p>
                    </td>
                </tr>
            `;
            return;
        }

        const rows = filteredUsers.map(user => {
            const roleColor = {
                'Super Admin': 'var(--danger)',
                'Admin': 'var(--warning)',
                'Manager': 'var(--accent)',
                'Viewer': 'var(--text-muted)'
            }[user.role] || 'var(--text-muted)';

            const statusClass = user.status === 'Active' ? 'status-active' : 'status-neutral';

            const lastLogin = new Date(user.lastLogin);
            const now = new Date();
            const diffMs = now - lastLogin;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            let lastLoginText = '';
            if (diffMins < 60) lastLoginText = `${diffMins}m ago`;
            else if (diffHours < 24) lastLoginText = `${diffHours}h ago`;
            else if (diffDays < 7) lastLoginText = `${diffDays}d ago`;
            else lastLoginText = lastLogin.toLocaleDateString();

            const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            return `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: ${roleColor}; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; color: white;">
                                ${initials}
                            </div>
                            <span style="font-weight: 500;">${user.name}</span>
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td>
                        <span style="color: ${roleColor}; font-weight: 500;">
                            <i class="ph ph-shield-check"></i> ${user.role}
                        </span>
                    </td>
                    <td><span class="status-capsule ${statusClass}">${user.status}</span></td>
                    <td style="color: var(--text-muted);">${lastLoginText}</td>
                    <td style="text-align: right;">
                        <button class="btn btn-secondary btn-sm" onclick="editUser('${user.id}')" style="margin-right: 0.5rem;">
                            <i class="ph ph-pencil-simple"></i> Edit
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="deleteUser('${user.id}')" style="color: var(--danger); border-color: var(--danger);">
                            <i class="ph ph-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        usersTableBody.innerHTML = rows;
    };

    // Modal elements
    const modal = document.getElementById('user-modal');
    const deleteModal = document.getElementById('delete-user-modal');
    const form = document.getElementById('user-form');
    const roleSelect = document.getElementById('user-role-select');
    const permissionsDisplay = document.getElementById('permissions-display');
    const permissionsList = document.getElementById('permissions-list');

    // Update permissions display based on role
    function updatePermissionsDisplay() {
        const selectedRole = roleSelect.value;
        if (!selectedRole) {
            permissionsDisplay.style.display = 'none';
            return;
        }

        const roleConfig = rolePermissions[selectedRole];
        if (!roleConfig) {
            permissionsDisplay.style.display = 'none';
            return;
        }

        permissionsDisplay.style.display = 'block';

        const permissionsHTML = roleConfig.permissions.map(perm => `
            <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem;">
                <i class="ph ph-check-circle" style="color: var(--success);"></i>
                <span>${permissionLabels[perm] || perm}</span>
            </div>
        `).join('');

        permissionsList.innerHTML = permissionsHTML;
    }

    if (roleSelect) {
        roleSelect.addEventListener('change', updatePermissionsDisplay);
    }

    // Open modal for adding user
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            editingUserId = null;
            document.getElementById('user-modal-title').textContent = 'Add User';
            form.reset();
            updatePermissionsDisplay();
            modal.classList.add('active');
        });
    }

    // Edit user function (exposed globally)
    window.editUser = (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        editingUserId = userId;
        document.getElementById('user-modal-title').textContent = 'Edit User';

        form.elements['name'].value = user.name;
        form.elements['email'].value = user.email;
        form.elements['role'].value = user.role;
        form.elements['status'].value = user.status;

        updatePermissionsDisplay();
        modal.classList.add('active');
    };

    // Delete user function (exposed globally)
    window.deleteUser = (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        editingUserId = userId;
        document.getElementById('delete-user-name').textContent = `${user.name} (${user.email})`;
        deleteModal.classList.add('active');
    };

    // Save user
    const saveUserBtn = document.getElementById('save-user-btn');
    if (saveUserBtn) {
        saveUserBtn.addEventListener('click', () => {
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                role: formData.get('role'),
                status: formData.get('status')
            };

            if (editingUserId) {
                // Update existing user
                const index = users.findIndex(u => u.id === editingUserId);
                if (index !== -1) {
                    users[index] = { ...users[index], ...userData };
                }
            } else {
                // Add new user
                const newUser = {
                    id: 'u' + Date.now(),
                    ...userData,
                    lastLogin: new Date().toISOString(),
                    createdAt: new Date().toISOString().split('T')[0]
                };
                users.push(newUser);
            }

            saveUsers();
            render();
            modal.classList.remove('active');
        });
    }

    // Confirm delete
    const confirmDeleteBtn = document.getElementById('confirm-delete-user-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', () => {
            users = users.filter(u => u.id !== editingUserId);
            saveUsers();
            render();
            deleteModal.classList.remove('active');
        });
    }

    // Close modals
    const closeUserModal = () => modal.classList.remove('active');
    const closeDeleteModal = () => deleteModal.classList.remove('active');

    document.getElementById('close-user-modal')?.addEventListener('click', closeUserModal);
    document.getElementById('cancel-user-btn')?.addEventListener('click', closeUserModal);
    document.getElementById('close-delete-user-modal')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancel-delete-user-btn')?.addEventListener('click', closeDeleteModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeUserModal();
        });
    }

    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) closeDeleteModal();
        });
    }

    // Filter handlers
    const searchInput = document.getElementById('user-search');
    const roleFilter = document.getElementById('role-filter');
    const statusFilter = document.getElementById('status-filter');
    const clearFiltersBtn = document.getElementById('filter-clear');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterState.search = e.target.value;
            render();
        });
    }

    if (roleFilter) {
        roleFilter.addEventListener('change', (e) => {
            filterState.role = e.target.value;
            render();
        });
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            filterState.status = e.target.value;
            render();
        });
    }

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            filterState = { search: '', role: '', status: '' };
            if (searchInput) searchInput.value = '';
            if (roleFilter) roleFilter.value = '';
            if (statusFilter) statusFilter.value = '';
            render();
        });
    }

    render();
}

// --- Roles & Permissions Management Page ---
function initRolesPage() {
    const rolesContainer = document.getElementById('roles-container');
    if (!rolesContainer) return;

    // Available permissions
    const availablePermissions = [
        { id: 'manage_users', label: 'Manage Users', description: 'Create, edit, and delete users' },
        { id: 'manage_clients', label: 'Manage Clients', description: 'Full client management access' },
        { id: 'view_clients', label: 'View Clients', description: 'Read-only client access' },
        { id: 'manage_kiosks', label: 'Manage Kiosks', description: 'Assign and configure kiosks' },
        { id: 'view_kiosks', label: 'View Kiosks', description: 'Read-only kiosk access' },
        { id: 'manage_config', label: 'Manage Global Config', description: 'Edit system-wide settings' },
        { id: 'view_audit', label: 'View Audit Logs', description: 'Access audit trail' },
        { id: 'manage_policies', label: 'Manage Policies', description: 'Configure governance policies' },
        { id: 'manage_features', label: 'Manage Feature Flags', description: 'Toggle system features' },
        { id: 'manage_roles', label: 'Manage Roles', description: 'Create and edit roles' }
    ];

    // Load roles from localStorage or use defaults
    let roles = JSON.parse(localStorage.getItem('nexus_roles')) || [
        {
            id: 'r1',
            name: 'Super Admin',
            description: 'Full system access with all permissions',
            color: 'var(--danger)',
            permissions: ['manage_users', 'manage_clients', 'manage_kiosks', 'manage_config', 'view_audit', 'manage_policies', 'manage_features', 'manage_roles'],
            isSystem: true
        },
        {
            id: 'r2',
            name: 'Admin',
            description: 'Administrative access with limited system configuration',
            color: 'var(--warning)',
            permissions: ['manage_clients', 'manage_kiosks', 'view_audit', 'manage_policies'],
            isSystem: false
        },
        {
            id: 'r3',
            name: 'Manager',
            description: 'Manage clients and kiosks, view reports',
            color: 'var(--accent)',
            permissions: ['manage_clients', 'manage_kiosks', 'view_audit'],
            isSystem: false
        },
        {
            id: 'r4',
            name: 'Viewer',
            description: 'Read-only access to view data',
            color: 'var(--text-muted)',
            permissions: ['view_clients', 'view_kiosks', 'view_audit'],
            isSystem: false
        }
    ];

    let editingRoleId = null;

    const saveRoles = () => {
        localStorage.setItem('nexus_roles', JSON.stringify(roles));
        // Also update the rolePermissions in user management
        updateUserManagementRoles();
    };

    const updateUserManagementRoles = () => {
        // Convert roles to the format used by user management
        const rolePermissions = {};
        roles.forEach(role => {
            rolePermissions[role.name] = {
                description: role.description,
                permissions: role.permissions
            };
        });
        localStorage.setItem('nexus_role_permissions', JSON.stringify(rolePermissions));
    };

    const render = () => {
        const cards = roles.map(role => {
            const permissionCount = role.permissions.length;
            const permissionsList = role.permissions.slice(0, 5).map(permId => {
                const perm = availablePermissions.find(p => p.id === permId);
                return perm ? perm.label : permId;
            });
            const moreCount = permissionCount > 5 ? permissionCount - 5 : 0;

            return `
                <div class="card" style="position: relative;">
                    ${role.isSystem ? '<div style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; color: var(--text-muted);">System Role</div>' : ''}
                    
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <div style="width: 50px; height: 50px; border-radius: 12px; background: ${role.color}; display: flex; align-items: center; justify-content: center;">
                            <i class="ph ph-shield-check" style="font-size: 1.5rem; color: white;"></i>
                        </div>
                        <div style="flex: 1;">
                            <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600;">${role.name}</h3>
                            <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: var(--text-muted);">${role.description}</p>
                        </div>
                    </div>

                    <div style="margin-bottom: 1rem;">
                        <div style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem;">
                            Permissions (${permissionCount})
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${permissionsList.map(perm => `
                                <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem;">
                                    <i class="ph ph-check-circle" style="color: var(--success);"></i>
                                    <span>${perm}</span>
                                </div>
                            `).join('')}
                            ${moreCount > 0 ? `<div style="font-size: 0.875rem; color: var(--text-muted); margin-left: 1.5rem;">+ ${moreCount} more...</div>` : ''}
                        </div>
                    </div>

                    <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                        <button class="btn btn-secondary" onclick="editRole('${role.id}')" style="flex: 1;">
                            <i class="ph ph-pencil-simple"></i> Edit
                        </button>
                        ${!role.isSystem ? `
                            <button class="btn btn-secondary" onclick="deleteRole('${role.id}')" style="color: var(--danger); border-color: var(--danger);">
                                <i class="ph ph-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        rolesContainer.innerHTML = cards;
    };

    // Modal elements
    const modal = document.getElementById('role-modal');
    const deleteModal = document.getElementById('delete-role-modal');
    const form = document.getElementById('role-form');
    const permissionsGrid = document.getElementById('permissions-grid');

    // Populate permissions checkboxes
    const populatePermissions = (selectedPermissions = []) => {
        const checkboxes = availablePermissions.map(perm => `
            <label style="display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border-radius: 6px; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
                <input type="checkbox" name="permission" value="${perm.id}" ${selectedPermissions.includes(perm.id) ? 'checked' : ''} style="margin-top: 2px;">
                <div>
                    <div style="font-weight: 500; font-size: 0.875rem;">${perm.label}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${perm.description}</div>
                </div>
            </label>
        `).join('');
        permissionsGrid.innerHTML = checkboxes;
    };

    // Open modal for adding role
    const addRoleBtn = document.getElementById('add-role-btn');
    if (addRoleBtn) {
        addRoleBtn.addEventListener('click', () => {
            editingRoleId = null;
            document.getElementById('modal-title').textContent = 'Add Role';
            form.reset();
            populatePermissions();
            modal.classList.add('active');
        });
    }

    // Edit role function (exposed globally)
    window.editRole = (roleId) => {
        const role = roles.find(r => r.id === roleId);
        if (!role) return;

        editingRoleId = roleId;
        document.getElementById('modal-title').textContent = 'Edit Role';

        form.elements['name'].value = role.name;
        form.elements['description'].value = role.description;
        form.elements['color'].value = role.color;

        populatePermissions(role.permissions);
        modal.classList.add('active');
    };

    // Delete role function (exposed globally)
    window.deleteRole = (roleId) => {
        const role = roles.find(r => r.id === roleId);
        if (!role || role.isSystem) return;

        editingRoleId = roleId;
        document.getElementById('delete-role-name').textContent = role.name;
        deleteModal.classList.add('active');
    };

    // Save role
    const saveRoleBtn = document.getElementById('save-role-btn');
    if (saveRoleBtn) {
        saveRoleBtn.addEventListener('click', () => {
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const selectedPermissions = Array.from(form.querySelectorAll('input[name="permission"]:checked'))
                .map(cb => cb.value);

            const roleData = {
                name: formData.get('name'),
                description: formData.get('description'),
                color: formData.get('color'),
                permissions: selectedPermissions,
                isSystem: false
            };

            if (editingRoleId) {
                // Update existing role
                const index = roles.findIndex(r => r.id === editingRoleId);
                if (index !== -1) {
                    roles[index] = { ...roles[index], ...roleData };
                }
            } else {
                // Add new role
                const newRole = {
                    id: 'r' + Date.now(),
                    ...roleData
                };
                roles.push(newRole);
            }

            saveRoles();
            render();
            modal.classList.remove('active');
        });
    }

    // Confirm delete
    const confirmDeleteRoleBtn = document.getElementById('confirm-delete-role-btn');
    if (confirmDeleteRoleBtn) {
        confirmDeleteRoleBtn.addEventListener('click', () => {
            roles = roles.filter(r => r.id !== editingRoleId);
            saveRoles();
            render();
            deleteModal.classList.remove('active');
        });
    }

    // Close modals
    const closeRoleModal = () => modal.classList.remove('active');
    const closeDeleteRoleModal = () => deleteModal.classList.remove('active');

    document.getElementById('close-role-modal')?.addEventListener('click', closeRoleModal);
    document.getElementById('cancel-role-btn')?.addEventListener('click', closeRoleModal);
    document.getElementById('close-delete-role-modal')?.addEventListener('click', closeDeleteRoleModal);
    document.getElementById('cancel-delete-role-btn')?.addEventListener('click', closeDeleteRoleModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeRoleModal();
        });
    }

    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) closeDeleteRoleModal();
        });
    }

    // Initialize
    updateUserManagementRoles();
    render();
}
