import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Send, Link, Settings, FileText } from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ role }) => {
  const location = useLocation();

  // Define menu items based on role
  const getMenuItems = (role) => {
    const common = [
      { label: 'Settings', path: '/settings', icon: Settings },
    ];

    switch (role) {
      case 'csr':
        return [
          { label: 'Dashboard', path: '/csr', icon: LayoutDashboard, exact: true },
          { label: 'Create Donation', path: '/csr/create-donation', icon: PlusCircle },
          { label: 'Donation History', path: '/csr/history', icon: History },
          ...common
        ];
      case 'ngo':
        return [
          { label: 'Dashboard', path: '/ngo', icon: LayoutDashboard, exact: true },
          { label: 'Allocate to Clinic', path: '/ngo/allocate', icon: Send },
          { label: 'Allocation History', path: '/ngo/history', icon: History },
          ...common
        ];
      case 'clinic':
        return [
          { label: 'Dashboard', path: '/clinic', icon: LayoutDashboard, exact: true },
          { label: 'Confirm Receipts', path: '/clinic/receipts', icon: FileText },
          ...common
        ];
      case 'auditor':
        return [
          { label: 'Dashboard', path: '/auditor', icon: LayoutDashboard, exact: true },
          { label: 'Audit Trail', path: '/auditor/trail', icon: Link },
          ...common
        ];
      default:
        return common;
    }
  };

  const menuItems = getMenuItems(role);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </div>
        <span className="brand-name">CSR TRACKER</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon className="nav-icon" size={20} />
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}

        {/* Blockchain Verification Link (Global) */}
        <div className="nav-divider"></div>
        <NavLink to="/blockchain" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Link className="nav-icon" size={20} />
          <span className="nav-label">Blockchain Verify</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p>© 2026 CSR Tracker</p>
      </div>
    </aside>
  );
};

export default Sidebar;
