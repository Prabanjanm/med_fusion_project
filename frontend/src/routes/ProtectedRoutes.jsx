import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';

/**
 * ProtectedRoutes - Route protection with role-based access
 * Redirects to login if user is not authenticated
 * Only allows users with correct role to access the route
 * Wraps protected routes in MainLayout
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.element - Component to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 */
const ProtectedRoutes = ({ element, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  console.log('=== ProtectedRoutes Debug ===');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('user object:', user);
  console.log('user.role:', user?.role);
  console.log('user.role type:', typeof user?.role);
  console.log('allowedRoles:', allowedRoles);

  // Not logged in - redirect to login
  if (!isAuthenticated) {
    console.log('❌ Not authenticated - redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  // Role-based access control with case-insensitive comparison
  if (allowedRoles.length > 0) {
    // Normalize user role to lowercase for comparison
    const userRole = user?.role ? String(user.role).toLowerCase().trim() : '';
    const normalizedAllowedRoles = allowedRoles.map(r => String(r).toLowerCase().trim());

    console.log('Normalized user role:', userRole);
    console.log('Normalized allowed roles:', normalizedAllowedRoles);
    console.log('Role match:', normalizedAllowedRoles.includes(userRole));

    if (!normalizedAllowedRoles.includes(userRole)) {
      console.log('❌ Role mismatch!');
      console.log('  User has:', userRole);
      console.log('  Needs one of:', normalizedAllowedRoles);

      // Redirect to user's correct dashboard
      const dashboardMap = {
        'csr': '/csr',
        'ngo': '/ngo',
        'clinic': '/clinic',
        'auditor': '/auditor'
      };

      const correctDashboard = dashboardMap[userRole] || '/auth/select';
      console.log('  Redirecting to:', correctDashboard);
      return <Navigate to={correctDashboard} replace />;
    }
  }

  // Authenticated and authorized - render component
  console.log('✅ Access granted - rendering component');
  return element;
};

export default ProtectedRoutes;
