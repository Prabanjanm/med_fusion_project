import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoutes from './routes/ProtectedRoutes';
// PREMIUM AUTH PAGE: New animated authentication component replacing LampLogin
import Login from './auth/Login';
import SetPassword from './auth/SetPassword';
import RegisterCompany from './auth/RegisterCompany';
import RoleSelection from './auth/RoleSelection';
import Home from './pages/Home';

// ...

// CSR Components
import CsrDashboard from './csr/CsrDashboard';
import CreateDonation from './csr/CreateDonation';
import DonationHistory from './csr/DonationHistory';
import DonationDetails from './csr/DonationDetails';
import CsrTrackStatus from './csr/CsrTrackStatus';
import ProductDeclaration from './csr/ProductDeclaration';

// NGO Components
import NgoDashboard from './ngo/NgoDashboard';
import NgoPendingDonations from './ngo/NgoPendingDonations';
import NgoClinicRequests from './ngo/NgoClinicRequests';
import AllocateToClinic from './ngo/AllocateToClinic';
import AllocationHistory from './ngo/AllocationHistory';
import ProductVerification from './ngo/ProductVerification';
import RequestValidation from './ngo/RequestValidation';

// Clinic Components
import ClinicDashboard from './clinic/ClinicDashboard';
import ClinicProductRequest from './clinic/ClinicProductRequest';
import ClinicRequestStatus from './clinic/ClinicRequestStatus';
import ConfirmReceipt from './clinic/ConfirmReceipt';
import ProductCatalog from './clinic/ProductCatalog';

// Auditor Components
import AuditDashboard from './auditor/AuditDashboard';
import AuditTrail from './auditor/AuditTrail';
import AuditorCsrRegistry from './auditor/AuditorCsrRegistry';
import AuditorNgoRegistry from './auditor/AuditorNgoRegistry';
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

          {/* Role Selection acts as the Auth Entry Portal */}
          <Route path="/auth/select" element={<RoleSelection />} />

          {/* Redirect Generic Login/Register to Role Selection */}
          {/* Redirect Generic Login/Register to Role Selection */}
          <Route path="/login" element={<Navigate to="/auth/select?mode=login" replace />} />
          <Route path="/register" element={<Navigate to="/auth/select?mode=register" replace />} />

          <Route path="/auth/set-password" element={<SetPassword />} />

          {/* Role Specific Auth Routes */}
          <Route path="/:roleId/login" element={<Login />} />
          <Route path="/login/:roleId" element={<Login />} />
          {/* Support both patterns: /role/register and /register/role */}
          <Route path="/:roleId/register" element={<RegisterCompany />} />
          <Route path="/register/:roleId" element={<RegisterCompany />} />

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
          <Route
            path="/csr/status"
            element={<ProtectedRoutes element={<CsrTrackStatus />} allowedRoles={['csr']} />}
          />
          <Route
            path="/csr/donation/:id"
            element={<ProtectedRoutes element={<DonationDetails />} allowedRoles={['csr']} />}
          />
          <Route
            path="/csr/declare-product"
            element={<ProtectedRoutes element={<ProductDeclaration />} allowedRoles={['csr']} />}
          />


          {/* NGO Routes */}
          <Route
            path="/ngo"
            element={<ProtectedRoutes element={<NgoDashboard />} allowedRoles={['ngo']} />}
          />
          <Route
            path="/ngo/pending-donations"
            element={<ProtectedRoutes element={<NgoPendingDonations />} allowedRoles={['ngo']} />}
          />
          <Route
            path="/ngo/clinic-requests"
            element={<ProtectedRoutes element={<NgoClinicRequests />} allowedRoles={['ngo']} />}
          />
          <Route
            path="/ngo/allocate"
            element={<ProtectedRoutes element={<AllocateToClinic />} allowedRoles={['ngo']} />}
          />
          <Route
            path="/ngo/history"
            element={<ProtectedRoutes element={<AllocationHistory />} allowedRoles={['ngo']} />}
          />
          <Route
            path="/ngo/verify-products"
            element={<ProtectedRoutes element={<ProductVerification />} allowedRoles={['ngo']} />}
          />
          <Route
            path="/ngo/validate-requests"
            element={<ProtectedRoutes element={<RequestValidation />} allowedRoles={['ngo']} />}
          />

          {/* Clinic Routes */}
          <Route
            path="/clinic"
            element={<ProtectedRoutes element={<ClinicDashboard />} allowedRoles={['clinic']} />}
          />
          <Route
            path="/clinic/request-products"
            element={<ProtectedRoutes element={<ClinicProductRequest />} allowedRoles={['clinic']} />}
          />
          <Route
            path="/clinic/request-status"
            element={<ProtectedRoutes element={<ClinicRequestStatus />} allowedRoles={['clinic']} />}
          />
          <Route
            path="/clinic/receipts"
            element={<ProtectedRoutes element={<ConfirmReceipt />} allowedRoles={['clinic']} />}
          />
          <Route
            path="/clinic/catalog"
            element={<ProtectedRoutes element={<ProductCatalog />} allowedRoles={['clinic']} />}
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
          <Route
            path="/auditor/csr-registry"
            element={<ProtectedRoutes element={<AuditorCsrRegistry />} allowedRoles={['auditor']} />}
          />
          <Route
            path="/auditor/ngo-registry"
            element={<ProtectedRoutes element={<AuditorNgoRegistry />} allowedRoles={['auditor']} />}
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

