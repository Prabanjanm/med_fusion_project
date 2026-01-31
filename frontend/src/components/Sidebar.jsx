import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Send, Link, Settings, FileText, CheckCircle, Truck, ClipboardCheck, ShieldCheck, Hexagon, Boxes, Activity, Building, Users } from 'lucide-react';
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
        <div className="logo-icon" style={{ position: 'relative', width: '48px', height: '48px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Hexagon
            size={48}
            color="#3b82f6"
            fill="rgba(59, 130, 246, 0.1)"
            strokeWidth={1.5}
          />
          <div style={{ position: 'absolute' }}>
            <Boxes
              size={24}
              color="#22d3ee"
              strokeWidth={2}
            />
          </div>
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
            <NavLink to="/csr/status" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Activity size={20} className="nav-icon" />
              <span className="nav-label">Track Status</span>
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
            <NavLink to="/auditor/csr-registry" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Building size={20} className="nav-icon" />
              <span className="nav-label">CSR History</span>
            </NavLink>
            <NavLink to="/auditor/ngo-registry" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Users size={20} className="nav-icon" />
              <span className="nav-label">NGO History</span>
            </NavLink>
            <NavLink to="/auditor/pending-requests" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ClipboardCheck size={20} className="nav-icon" />
              <span className="nav-label">Pending Requests</span>
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
