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
    clients: {
        list: () => request('/clients'),
        create: (data) => request('/clients', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        getDetails: (id) => request(`/clients/${id}`),
        addLocation: (clientId, data) => request(`/clients/${clientId}/locations`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        regenerateSecret: (clientId) => request(`/clients/${clientId}/regenerate-secret`, {
            method: 'POST'
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
        })
    },
    config: {
        listTiers: () => request('/config/tiers'),
        createTier: (data) => request('/config/tiers', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    },
    audit: {
        getLogs: () => request('/audit-logs'),
        getRoles: () => request('/roles'),
        createRole: (data) => request('/roles', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    }
};
