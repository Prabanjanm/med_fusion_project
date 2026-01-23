import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, Send, FileSearch, Activity } from 'lucide-react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import '../styles/DashboardLayout.css';

const NgoDashboard = () => {
  const navigate = useNavigate();

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

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">NGO Dashboard</h1>
          <p className="page-subtitle">Manage incoming resources and clinic allocations</p>
        </div>
        <button className="btn-submit" onClick={() => navigate('/ngo/allocate')}>
          ➕ Allocate Items
        </button>
      </div>

      <div className="stats-grid">
        <SummaryCard label="Incoming Resources" value="24" color="#00E5FF" icon={Inbox} />
        <SummaryCard label="Allocated" value="18" color="#00ff88" icon={Send} />
        <SummaryCard label="In Review" value="4" color="#ff9800" icon={FileSearch} />
        <SummaryCard label="Active Clinics" value="12" color="#b400ff" icon={Activity} />
      </div>

      <div className="table-card">
        <h2 className="table-header-title">Incoming Donations</h2>
        <Table
          columns={[
            { key: 'id', label: 'Donation ID' },
            { key: 'donor_name', label: 'Donor' },
            { key: 'resource_type', label: 'Resource Type' },
            { key: 'quantity', label: 'Quantity' },
            { key: 'status', label: 'Status' },
          ]}
          data={incomingDonations}
          renderCell={(row, key) =>
            key === 'status' ? <StatusBadge status={row.status} /> : row[key]
          }
        />
      </div>
    </Layout>
  );
};

export default NgoDashboard;
