import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, Send, FileSearch, Activity } from 'lucide-react';
import Table from '../components/Table';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import '../styles/DashboardLayout.css';

/**
 * NgoDashboard Component
 * Main dashboard for NGO role
 * Displays incoming donations and allocation management
 */
const NgoDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const incomingDonations = [
    {
      id: 'DON-2025-001',
      donor_name: 'ABC Corporation',
      resource_type: 'PPE Kits',
      quantity: '100 boxes',
      status: 'received',
    },
    {
      id: 'DON-2025-002',
      donor_name: 'XYZ Healthcare',
      resource_type: 'Medical Gloves',
      quantity: '500 boxes',
      status: 'in-review',
    },
    {
      id: 'DON-2025-003',
      donor_name: 'Global Charities',
      resource_type: 'Syringes',
      quantity: '1000 pieces',
      status: 'pending',
    },
  ];

  const allocationHistory = [
    {
      id: 'ALL-2025-001',
      donation_id: 'DON-2025-001',
      clinic_name: 'City General Hospital',
      quantity: '50 boxes',
      status: 'confirmed',
    },
    {
      id: 'ALL-2025-002',
      donation_id: 'DON-2025-001',
      clinic_name: 'Rural Health Center',
      quantity: '50 boxes',
      status: 'confirmed',
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>NGO Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate('/ngo/allocate')}>
          ➕ Allocate to Clinic
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <SummaryCard label="Incoming Donations" value="24" color="#00d4ff" icon={Inbox} />
        <SummaryCard label="Allocated" value="18" color="#00ff88" icon={Send} />
        <SummaryCard label="In Review" value="4" color="#ff9800" icon={FileSearch} />
        <SummaryCard label="Clinics" value="12" color="#b400ff" icon={Activity} />
      </div>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Dashboard
        </button>
        <button
          className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Allocation History
        </button>
      </nav>

      {/* Tab Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="card">
            <h2>Incoming Donations</h2>
            <Table
              columns={[
                { key: 'id', label: 'Donation ID' },
                { key: 'donor_name', label: 'Donor' },
                { key: 'resource_type', label: 'Resource Type' },
                { key: 'quantity', label: 'Quantity' },
                { key: 'status', label: 'Status' },
              ]}
              data={incomingDonations}
              renderCell={(row, key) => {
                if (key === 'status') {
                  return <StatusBadge status={row.status} />;
                }
                return row[key];
              }}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card">
            <h2>Allocation History</h2>
            <Table
              columns={[
                { key: 'id', label: 'Allocation ID' },
                { key: 'donation_id', label: 'Donation ID' },
                { key: 'clinic_name', label: 'Clinic' },
                { key: 'quantity', label: 'Quantity' },
                { key: 'status', label: 'Status' },
              ]}
              data={allocationHistory}
              renderCell={(row, key) => {
                if (key === 'status') {
                  return <StatusBadge status={row.status} />;
                }
                return row[key];
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NgoDashboard;
