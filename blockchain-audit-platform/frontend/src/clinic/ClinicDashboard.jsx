import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownCircle, CheckSquare, Truck, Clock } from 'lucide-react';
import Table from '../components/Table';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import '../styles/DashboardLayout.css';

/**
 * ClinicDashboard Component
 * Main dashboard for Clinic role
 * Displays incoming allocations and receipt management
 */
const ClinicDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const incomingAllocations = [
    {
      id: 'ALL-2025-001',
      donation_id: 'DON-2025-001',
      ngo_name: 'Hope Foundation',
      resource_type: 'PPE Kits',
      quantity: '50 boxes',
      status: 'in-transit',
    },
    {
      id: 'ALL-2025-004',
      donation_id: 'DON-2025-002',
      ngo_name: 'Medical Relief',
      resource_type: 'Medical Gloves',
      quantity: '250 boxes',
      status: 'in-transit',
    },
    {
      id: 'ALL-2025-005',
      donation_id: 'DON-2025-003',
      ngo_name: 'Healthcare Plus',
      resource_type: 'Syringes',
      quantity: '500 pieces',
      status: 'pending',
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Clinic Dashboard</h1>
        <button className="btn btn-primary" onClick={() => navigate('/clinic/receipts')}>
          ✅ Confirm Receipt
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <SummaryCard label="Incoming Allocations" value="12" color="#00d4ff" icon={ArrowDownCircle} />
        <SummaryCard label="Received" value="8" color="#00ff88" icon={CheckSquare} />
        <SummaryCard label="In Transit" value="3" color="#ff9800" icon={Truck} />
        <SummaryCard label="Pending" value="1" color="#b400ff" icon={Clock} />
      </div>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Incoming Allocations
        </button>
        <button
          className={`nav-btn ${activeTab === 'receipts' ? 'active' : ''}`}
          onClick={() => setActiveTab('receipts')}
        >
          Confirmed Receipts
        </button>
      </nav>

      {/* Tab Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="card">
            <h2>Incoming Allocations</h2>
            <Table
              columns={[
                { key: 'id', label: 'Allocation ID' },
                { key: 'donation_id', label: 'Donation ID' },
                { key: 'ngo_name', label: 'NGO' },
                { key: 'resource_type', label: 'Resource Type' },
                { key: 'quantity', label: 'Quantity' },
                { key: 'status', label: 'Status' },
              ]}
              data={incomingAllocations}
              renderCell={(row, key) => {
                if (key === 'status') {
                  return <StatusBadge status={row.status} />;
                }
                return row[key];
              }}
            />
          </div>
        )}

        {activeTab === 'receipts' && (
          <div className="card">
            <h2>Confirmed Receipts</h2>
            <p className="empty-state">No confirmed receipts yet. Confirm allocation receipts to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicDashboard;
