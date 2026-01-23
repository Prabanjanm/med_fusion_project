import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownCircle, CheckSquare, Truck, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import '../styles/DashboardLayout.css';

const ClinicDashboard = () => {
  const navigate = useNavigate();

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
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinic Dashboard</h1>
          <p className="page-subtitle">Track incoming supplies and confirm receipts</p>
        </div>
        <button className="btn-submit" onClick={() => navigate('/clinic/receipts')}>
          ✅ Confirm Receipt
        </button>
      </div>

      <div className="stats-grid">
        <SummaryCard label="Incoming Allocations" value="12" color="#00E5FF" icon={ArrowDownCircle} />
        <SummaryCard label="Received" value="8" color="#00ff88" icon={CheckSquare} />
        <SummaryCard label="In Transit" value="3" color="#ff9800" icon={Truck} />
        <SummaryCard label="Pending" value="1" color="#b400ff" icon={Clock} />
      </div>

      <div className="table-card">
        <h2 className="table-header-title">Incoming Allocations</h2>
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
          renderCell={(row, key) =>
            key === 'status' ? <StatusBadge status={row.status} /> : row[key]
          }
        />
      </div>
    </Layout>
  );
};

export default ClinicDashboard;
