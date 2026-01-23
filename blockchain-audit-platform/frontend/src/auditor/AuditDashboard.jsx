import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, CheckCircle2, Users, Link } from 'lucide-react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import '../styles/DashboardLayout.css';

const AuditDashboard = () => {
  const navigate = useNavigate();

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
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Auditor Dashboard</h1>
          <p className="page-subtitle">Verify compliance and view immutable audit trails</p>
        </div>
        <button className="btn-submit" onClick={() => navigate('/auditor/trail')}>
          📋 View Full Trail
        </button>
      </div>

      <div className="stats-grid">
        <SummaryCard label="Total Audited" value="32" color="#00E5FF" icon={ClipboardCheck} />
        <SummaryCard label="Compliant" value="28" color="#00ff88" icon={CheckCircle2} />
        <SummaryCard label="Active NGOs" value="3" color="#ff9800" icon={Users} />
        <SummaryCard label="Hash Verified" value="32" color="#b400ff" icon={Link} />
      </div>

      <div className="table-card">
        <h2 className="table-header-title">Recent Audit Records</h2>
        <Table
          columns={[
            { key: 'id', label: 'Donation ID' },
            { key: 'donor_name', label: 'Donor' },
            { key: 'ngo_name', label: 'NGO' },
            { key: 'clinic_name', label: 'Clinic' },
            { key: 'status', label: 'Status' },
          ]}
          data={auditData}
          renderCell={(row, key) =>
            key === 'status' ? <StatusBadge status={row.status} /> : row[key]
          }
        />
      </div>
    </Layout>
  );
};

export default AuditDashboard;
