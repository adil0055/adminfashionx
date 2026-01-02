import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext({
    user: null,
    loading: true,
    login: async () => { },
    logout: () => { }
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const token = localStorage.getItem('nexus_token');
                const storedUser = localStorage.getItem('nexus_admin_user');

                if (token) {
                    // Optimistically set user from storage for speed
                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }

                    // Verify session with backend
                    const result = await api.auth.me();

                    if (result.success) {
                        const { user } = result.data;
                        // Normalize role
                        let role = user.role;
                        if (role === 'Super Admin') role = 'SUPER_ADMIN';
                        else if (role === 'Platform Owner') role = 'PLATFORM_OWNER';

                        const appUser = {
                            ...user,
                            role,
                            avatar: user.name ? user.name.charAt(0).toUpperCase() : 'U'
                        };

                        setUser(appUser);
                        localStorage.setItem('nexus_admin_user', JSON.stringify(appUser));
                    } else {
                        throw new Error('Session invalid');
                    }
                }
            } catch (error) {
                console.error('Session check failed', error);
                // Clear invalid session
                localStorage.removeItem('nexus_admin_user');
                localStorage.removeItem('nexus_token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    const login = async (email, password) => {
        try {
            const result = await api.auth.login(email, password);

            if (result.success && result.data) {
                const { token, user } = result.data;

                if (!token) {
                    throw new Error('Login successful but no token received');
                }

                // Normalize role to match RBAC constants
                let role = user.role;
                if (role === 'Super Admin') role = 'SUPER_ADMIN';
                else if (role === 'Platform Owner') role = 'PLATFORM_OWNER';

                const appUser = {
                    ...user,
                    role,
                    avatar: user.name ? user.name.charAt(0).toUpperCase() : 'U'
                };

                setUser(appUser);
                localStorage.setItem('nexus_admin_user', JSON.stringify(appUser));
                localStorage.setItem('nexus_token', token);
                return appUser;
            } else {
                throw new Error(result.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('nexus_admin_user');
        localStorage.removeItem('nexus_token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
