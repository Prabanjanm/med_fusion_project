import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Send, Link, Settings, FileText, CheckCircle, Truck, ClipboardCheck, ShieldCheck } from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ role }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  // Normalize role to lowercase for consistent comparison
  const normalizedRole = role ? String(role).toLowerCase().trim() : '';

  // Debug logging to help identify role issues
  console.log('=== Sidebar Debug ===');
  console.log('Raw role prop:', role);
  console.log('Normalized role:', normalizedRole);
  console.log('Will show navigation for:', normalizedRole || 'NONE (no role)');

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
        {normalizedRole === 'csr' && (
          <>
            <NavLink to="/csr" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
              <LayoutDashboard size={20} className="nav-icon" />
              <span className="nav-label">Dashboard</span>
            </NavLink>
            <NavLink to="/csr/create-donation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <PlusCircle size={20} className="nav-icon" />
              <span className="nav-label">New Donation</span>
            </NavLink>
            <NavLink to="/csr/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <History size={20} className="nav-icon" />
              <span className="nav-label">History</span>
            </NavLink>
          </>
        )}

        {normalizedRole === 'ngo' && (
          <>
            <NavLink to="/ngo" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
              <LayoutDashboard size={20} className="nav-icon" />
              <span className="nav-label">Dashboard</span>
            </NavLink>
            <NavLink to="/ngo/allocate" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Truck size={20} className="nav-icon" />
              <span className="nav-label">Allocate</span>
            </NavLink>
            <NavLink to="/ngo/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <History size={20} className="nav-icon" />
              <span className="nav-label">History</span>
            </NavLink>
          </>
        )}

        {normalizedRole === 'clinic' && (
          <>
            <NavLink to="/clinic" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
              <LayoutDashboard size={20} className="nav-icon" />
              <span className="nav-label">Dashboard</span>
            </NavLink>
            <NavLink to="/clinic/receipts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ClipboardCheck size={20} className="nav-icon" />
              <span className="nav-label">Confirm Receipt</span>
            </NavLink>
          </>
        )}

        {normalizedRole === 'auditor' && (
          <>
            <NavLink to="/auditor" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
              <LayoutDashboard size={20} className="nav-icon" />
              <span className="nav-label">Dashboard</span>
            </NavLink>
            <NavLink to="/auditor/trail" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <FileText size={20} className="nav-icon" />
              <span className="nav-label">Audit Trail</span>
            </NavLink>
          </>
        )}

        <div className="nav-divider"></div>

        <NavLink to="/verify" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShieldCheck size={20} className="nav-icon" />
          <span className="nav-label">Verify Record</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} className="nav-icon" />
          <span className="nav-label">Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <p>© 2026 CSR Tracker</p>
      </div>
    </aside>
  );
};

export default Sidebar;
