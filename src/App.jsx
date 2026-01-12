import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetails from './pages/ClientDetails';
import OnboardClient from './pages/OnboardClient';
import KiosksAssigned from './pages/KiosksAssigned';
import KiosksStock from './pages/KiosksStock';

import GlobalConfig from './pages/GlobalConfig';
import Policies from './pages/Policies';
import Features from './pages/Features';
import Roles from './pages/Roles';
import Users from './pages/Users';
import Audit from './pages/Audit';
import SubscriptionTiers from './pages/SubscriptionTiers';
import LoginPage from './pages/LoginPage';
import SystemHealth from './pages/SystemHealth';
import Catalogues from './pages/Catalogues';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Placeholder for pages not yet implemented
const Placeholder = ({ title }) => (
  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
    <h2>{title}</h2>
    <p>This page is under construction.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetails />} />
            <Route path="onboard-client" element={<OnboardClient />} />
            <Route path="kiosks-assigned" element={<KiosksAssigned />} />
            <Route path="kiosks-stock" element={<KiosksStock />} />

            {/* Settings Routes - Removed nested ProtectedRoute for now */}
            <Route path="global-config" element={<GlobalConfig />} />
            <Route path="policies" element={<Policies />} />
            <Route path="features" element={<Features />} />
            <Route path="roles" element={<Roles />} />
            <Route path="users" element={<Users />} />
            <Route path="subscription-tiers" element={<SubscriptionTiers />} />
            <Route path="catalogues" element={<Catalogues />} />
            <Route path="audit" element={<Audit />} />
            <Route path="system-health" element={<SystemHealth />} />
            <Route path="*" element={<Placeholder title="404 Not Found" />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
