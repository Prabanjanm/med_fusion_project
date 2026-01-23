import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, CheckCircle2, Users, Link } from 'lucide-react';
import Table from '../components/Table';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import '../styles/DashboardLayout.css';

/**
 * AuditDashboard Component
 * Main dashboard for Auditor role
 * Displays audit metrics and verification
 */
const AuditDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const auditData = [
    {
      id: 'DON-2025-001',
      donor_name: 'ABC Corporation',
      ngo_name: 'Hope Health Foundation',
      clinic_name: 'City General Hospital',
      status: 'completed',
    },
    {
      id: 'DON-2025-002',
      donor_name: 'XYZ Healthcare',
      ngo_name: 'Medical Relief Society',
      clinic_name: 'Rural Health Center',
      status: 'completed',
    },
    {
      id: 'DON-2025-003',
      donor_name: 'Global Charities',
      ngo_name: 'Healthcare Access Initiative',
      clinic_name: 'Emergency Care Clinic',
      status: 'in-progress',
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Auditor Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate('/auditor/trail')}>
          📋 View Audit Trail
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <SummaryCard label="Total Audited" value="32" color="#00d4ff" icon={ClipboardCheck} />
        <SummaryCard label="Completed" value="28" color="#00ff88" icon={CheckCircle2} />
        <SummaryCard label="Active NGOs" value="3" color="#ff9800" icon={Users} />
        <SummaryCard label="Blockchain Hashes" value="32" color="#b400ff" icon={Link} />
      </div>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Audit Overview
        </button>
        <button
          className={`nav-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Review
        </button>
      </nav>

      {/* Tab Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="card">
            <h2>Donation Audit Records</h2>
            <Table
              columns={[
                { key: 'id', label: 'Donation ID' },
                { key: 'donor_name', label: 'Donor' },
                { key: 'ngo_name', label: 'NGO' },
                { key: 'clinic_name', label: 'Clinic' },
                { key: 'status', label: 'Status' },
              ]}
              data={auditData}
              renderCell={(row, key) => {
                if (key === 'status') {
                  return <StatusBadge status={row.status} />;
                }
                return row[key];
              }}
            />
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="card">
            <h2>Pending Audit Review</h2>
            <p className="empty-state">All audits are currently reviewed. Next review scheduled for tomorrow.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditDashboard;
