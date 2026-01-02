import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-dark)',
                color: 'var(--text-muted)'
            }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // User is logged in but doesn't have permission
        return (
            <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--text-main)',
                background: 'var(--bg-dark)',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Access Denied</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You do not have permission to view this page.</p>
                <button
                    className="btn btn-secondary"
                    onClick={() => window.history.back()}
                >
                    Go Back
                </button>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
