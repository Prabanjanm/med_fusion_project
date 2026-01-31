import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    const labels = {
      csr: 'CSR Partner',
      ngo: 'NGO Coordinator',
      clinic: 'Clinic Admin',
      auditor: 'Compliance Auditor',
    };
    return labels[role] || role;
  };

  return (
    <header className="dashboard-navbar">
      <div className="navbar-content">
        {/* Empty left side - logo only in sidebar */}
        <div></div>

        {/* Right Side: User Profile & Actions */}
        <div className="navbar-actions">
          <div className="user-profile">
            <div className="user-info">
              <span className="user-email">{user?.username || 'user@csrtracker.io'}</span>
              <span className="user-role-badge">{getRoleLabel(user?.role)}</span>
            </div>
            <div className="user-avatar">
              <User size={20} color="#fff" />
            </div>
          </div>

          <div className="divider-vertical"></div>

          <button className="btn-logout" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
