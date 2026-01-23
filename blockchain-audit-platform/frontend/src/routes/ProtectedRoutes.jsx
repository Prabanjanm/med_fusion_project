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

  // Not logged in - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated and authorized - render with layout
  return <MainLayout>{element}</MainLayout>;
};

export default ProtectedRoutes;
