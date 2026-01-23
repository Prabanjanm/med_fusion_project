import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, CheckCircle, Truck, Clock } from 'lucide-react';
import Table from '../components/Table';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import '../styles/DashboardLayout.css';

const CsrDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const donationHistory = [
    {
      id: 'DON-2025-001',
      item_type: 'PPE Kits',
      quantity: '100 boxes',
      status: 'completed',
      date: 'Jan 15, 2025',
    },
    {
      id: 'DON-2025-002',
      item_type: 'Medical Gloves',
      quantity: '500 boxes',
      status: 'in-transit',
      date: 'Jan 18, 2025',
    },
    {
      id: 'DON-2025-003',
      item_type: 'Syringes',
      quantity: '1000 pieces',
      status: 'pending',
      date: 'Jan 20, 2025',
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>CSR Donor Dashboard</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/csr/create-donation')}
        >
          ➕ Create Donation
        </button>
      </div>

      <div className="summary-grid">
        <SummaryCard label="Total Donations" value="45" color="#00d4ff" icon={Package} />
        <SummaryCard label="Completed" value="32" color="#00ff88" icon={CheckCircle} />
        <SummaryCard label="In Transit" value="8" color="#ff9800" icon={Truck} />
        <SummaryCard label="Pending" value="5" color="#b400ff" icon={Clock} />
      </div>

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
          Donation History
        </button>
      </nav>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="card">
            <h2>Recent Donations</h2>
            <Table
              columns={[
                { key: 'id', label: 'Donation ID' },
                { key: 'item_type', label: 'Item Type' },
                { key: 'quantity', label: 'Quantity' },
                { key: 'status', label: 'Status' },
                { key: 'date', label: 'Date' },
              ]}
              data={donationHistory}
              renderCell={(row, key) =>
                key === 'status' ? (
                  <StatusBadge status={row.status} />
                ) : (
                  row[key]
                )
              }
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card">
            <h2>Complete Donation History</h2>
            <Table
              columns={[
                { key: 'id', label: 'Donation ID' },
                { key: 'item_type', label: 'Item Type' },
                { key: 'quantity', label: 'Quantity' },
                { key: 'status', label: 'Status' },
                { key: 'date', label: 'Date' },
              ]}
              data={donationHistory}
              renderCell={(row, key) =>
                key === 'status' ? (
                  <StatusBadge status={row.status} />
                ) : (
                  row[key]
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CsrDashboard;
