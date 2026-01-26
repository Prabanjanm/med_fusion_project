import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoutes from './routes/ProtectedRoutes';
// PREMIUM AUTH PAGE: New animated authentication component replacing LampLogin
import Login from './auth/Login';
import SetPassword from './auth/SetPassword';
import RegisterCompany from './auth/RegisterCompany';
import Welcome from './auth/Welcome';
import Home from './pages/Home';

// ...

// CSR Components
import CsrDashboard from './csr/CsrDashboard';
import CreateDonation from './csr/CreateDonation';
import DonationHistory from './csr/DonationHistory';

// NGO Components
import NgoDashboard from './ngo/NgoDashboard';
import AllocateToClinic from './ngo/AllocateToClinic';
import AllocationHistory from './ngo/AllocationHistory';

// Clinic Components
import ClinicDashboard from './clinic/ClinicDashboard';
import ConfirmReceipt from './clinic/ConfirmReceipt';

// Auditor Components
import AuditDashboard from './auditor/AuditDashboard';
import AuditTrail from './auditor/AuditTrail';
import Settings from './components/Settings';
import BlockchainVerify from './components/BlockchainVerify';

import './styles/global.css';
import './App.css';

/**
 * App Component
 * Main routing configuration for the application
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterCompany />} />
          <Route path="/auth/set-password" element={<SetPassword />} />

          {/* CSR Routes */}
          <Route
            path="/csr"
            element={<ProtectedRoutes element={<CsrDashboard />} allowedRoles={['csr']} />}
          />
          <Route
            path="/csr/create-donation"
            element={<ProtectedRoutes element={<CreateDonation />} allowedRoles={['csr']} />}
          />
          <Route
            path="/csr/history"
            element={<ProtectedRoutes element={<DonationHistory />} allowedRoles={['csr']} />}
          />

          {/* NGO Routes */}
          <Route
            path="/ngo"
            element={<ProtectedRoutes element={<NgoDashboard />} allowedRoles={['ngo']} />}
          />
          <Route
            path="/ngo/allocate"
            element={<ProtectedRoutes element={<AllocateToClinic />} allowedRoles={['ngo']} />}
          />
          <Route
            path="/ngo/history"
            element={<ProtectedRoutes element={<AllocationHistory />} allowedRoles={['ngo']} />}
          />

          {/* Clinic Routes */}
          <Route
            path="/clinic"
            element={<ProtectedRoutes element={<ClinicDashboard />} allowedRoles={['clinic']} />}
          />
          <Route
            path="/clinic/receipts"
            element={<ProtectedRoutes element={<ConfirmReceipt />} allowedRoles={['clinic']} />}
          />

          {/* Auditor Routes */}
          <Route
            path="/auditor"
            element={<ProtectedRoutes element={<AuditDashboard />} allowedRoles={['auditor']} />}
          />
          <Route
            path="/auditor/trail"
            element={<ProtectedRoutes element={<AuditTrail />} allowedRoles={['auditor']} />}
          />

          {/* Universal Shared Routes (But protected) */}
          <Route
            path="/settings"
            element={<ProtectedRoutes element={<Settings />} allowedRoles={['csr', 'ngo', 'clinic', 'auditor']} />}
          />
          <Route
            path="/verify"
            element={<ProtectedRoutes element={<BlockchainVerify />} allowedRoles={['csr', 'ngo', 'clinic', 'auditor']} />}
          />

          {/* 404 - Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

