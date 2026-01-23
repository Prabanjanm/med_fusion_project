import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';

/**
 * Sidebar Component
 * Responsive navigation sidebar with role-based menu items
 */
const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    const baseItems = [];

    if (user?.role === 'csr') {
      baseItems.push(
        { path: '/csr', label: 'Dashboard', icon: '📊' },
        { path: '/csr/create-donation', label: 'Create Donation', icon: '➕' },
        { path: '/csr/history', label: 'Donation History', icon: '📋' }
      );
    } else if (user?.role === 'ngo') {
      baseItems.push(
        { path: '/ngo', label: 'Dashboard', icon: '📊' },
        { path: '/ngo/allocate', label: 'Allocate to Clinic', icon: '🔄' },
        { path: '/ngo/history', label: 'Allocation History', icon: '📋' }
      );
    } else if (user?.role === 'clinic') {
      baseItems.push(
        { path: '/clinic', label: 'Dashboard', icon: '📊' },
        { path: '/clinic/receipts', label: 'Confirm Receipt', icon: '✅' }
      );
    } else if (user?.role === 'auditor') {
      baseItems.push(
        { path: '/auditor', label: 'Dashboard', icon: '📊' },
        { path: '/auditor/trail', label: 'Audit Trail', icon: '🔍' }
      );
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {isOpen && <span className="nav-label">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
