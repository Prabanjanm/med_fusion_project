import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

/**
 * Navbar Component
 * Displays user information and provides logout functionality
 */
const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    const labels = {
      csr: 'CSR Donor',
      ngo: 'NGO',
      clinic: 'Clinic',
      auditor: 'Auditor',
    };
    return labels[role] || role;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand">
          <button className="menu-toggle" onClick={onMenuClick}>
            ☰
          </button>
          <h1 className="brand-title">Healthcare Donations</h1>
        </div>

        {/* User Info */}
        <div className="navbar-user">
          <div className="user-info">
            <span className="username">{user?.username}</span>
            <span className="role-badge">{getRoleLabel(user?.role)}</span>
          </div>
          <button className="btn btn-outline btn-small" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
