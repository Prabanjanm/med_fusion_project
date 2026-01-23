import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, CheckCircle, Truck, Clock } from 'lucide-react';
import Layout from '../components/Layout'; // New Layout wrapper
import Table from '../components/Table';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import '../styles/DashboardLayout.css'; // Ensure grid styles are avail

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
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">CSR Dashboard</h1>
          <p className="page-subtitle">Track and manage your philanthropic contributions</p>
        </div>
        <button
          className="btn-submit" // Use new form styled button for consistency
          onClick={() => navigate('/csr/create-donation')}
        >
          ➕ Create Donation
        </button>
      </div>

      <div className="stats-grid">
        <SummaryCard label="Total Donations" value="45" color="#00E5FF" icon={Package} />
        <SummaryCard label="Completed" value="32" color="#00ff88" icon={CheckCircle} />
        <SummaryCard label="In Transit" value="8" color="#ff9800" icon={Truck} />
        <SummaryCard label="Pending" value="5" color="#b400ff" icon={Clock} />
      </div>

      {/* Tabs or Sections - keeping minimal for now */}
      <div className="table-card">
        <h2 className="table-header-title">Recent Donations</h2>
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
    </Layout>
  );
};

export default CsrDashboard;
