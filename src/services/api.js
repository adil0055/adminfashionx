const BASE_URL = '/api/internal';

const getHeaders = () => {
    const token = localStorage.getItem('nexus_token');
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (response) => {
    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch (e) {
        data = { detail: text };
    }

    if (!response.ok) {
        if (response.status === 401) {
            // Auto-logout on 401
            localStorage.removeItem('nexus_token');
            localStorage.removeItem('nexus_admin_user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        const error = new Error(data.detail || data.message || `Error ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
};

const request = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
        ...options,
        headers: {
            ...getHeaders(),
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, config);
        return handleResponse(response);
    } catch (error) {
        console.error(`API Request Failed: ${endpoint}`, error);
        throw error;
    }
};

export const api = {
    auth: {
        login: (email, password) => request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),
        me: () => request('/auth/me')
    },
    health: {
        diagnostic: async () => {
            try {
                const response = await fetch('/health/diagnostic');
                // Even 500s return JSON in this specific endpoint design, so we always try to parse
                const data = await response.json();
                return { success: true, data }; // Standardize response format
            } catch (error) {
                // If the fetch fails entirely (network error), mock a "down" state for the UI
                console.error("Health check failed connectivity:", error);
                return {
                    success: false,
                    data: {
                        status: "unhealthy",
                        dependencies: {},
                        integrations: {},
                        system: {},
                        error: error.message || "Network unreachable or service error"
                    }
                };
            }
        }
    },
    clients: {
        list: () => request('/clients'),
        /**
         * Create Client
         * POST /clients
         * Body: { display_name, client_type, contact_email, tier_id, timezone, hq_street, ... image_specs }
         */
        create: (data) => request('/clients', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        /**
         * Client Details
         * GET /clients/{id}
         */
        getDetails: (id) => request(`/clients/${id}`),
        addLocation: (clientId, data) => request(`/clients/${clientId}/locations`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        regenerateSecret: (clientId) => request(`/clients/${clientId}/regenerate-secret`, {
            method: 'POST'
        }),
        updateStatus: (id, status) => request(`/clients/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        }),
        delete: (id) => request(`/clients/${id}`, {
            method: 'DELETE'
        }),
        /**
         * Update Client (Unified)
         * PUT /clients/{id}
         * Body: { display_name, client_type, tier_id, daily_quota, image_specs, ... }
         */
        update: (id, data) => request(`/clients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        })
    },
    kiosks: {
        listStock: () => request('/kiosks/stock'),
        listAssigned: () => request('/kiosks/assigned'),
        addStock: (data) => request('/kiosks/stock', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        assign: (kioskId, data) => request(`/kiosks/${kioskId}/assign`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        unassign: (kioskId) => request(`/kiosks/${kioskId}/assign`, {
            method: 'DELETE'
        }),
        updateStatus: (kioskId, status) => request(`/kiosks/${kioskId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        }),
        updateStock: (id, data) => request(`/kiosks/stock/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        deleteStock: (id) => request(`/kiosks/stock/${id}`, {
            method: 'DELETE'
        })
    },
    users: {
        list: () => request('/users'),
        create: (data) => request('/users', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => request(`/users/${id}`, {
            method: 'DELETE'
        })
    },
    roles: {
        list: () => request('/roles'),
        create: (data) => request('/roles', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id, data) => request(`/roles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id) => request(`/roles/${id}`, {
            method: 'DELETE'
        })
    },
    config: {
        /**
         * List Subscription Tiers
         * GET /config/tiers
         */
        listTiers: () => request('/config/tiers'),
        /**
         * Create Tier
         * POST /config/tiers
         * Body: { name, price_monthly, period, description, features, recommended, color, daily_quota, ... }
         */
        createTier: (data) => request('/config/tiers', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        /**
         * Edit Existing Tier
         * PUT /config/tiers/{id}
         * Body: { name, price_monthly, daily_quota, features, ... } (Partial update)
         */
        updateTier: (id, data) => request(`/config/tiers/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        /**
         * Delete Tier
         * DELETE /config/tiers/{id}
         */
        deleteTier: (id) => request(`/config/tiers/${id}`, {
            method: 'DELETE'
        })
    },
    audit: {
        getLogs: () => request('/audit-logs')
    }
};
