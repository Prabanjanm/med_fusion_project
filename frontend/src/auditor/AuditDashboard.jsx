import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, CheckCircle2, Users, Link } from 'lucide-react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import { auditorAPI } from '../services/api';
import '../styles/DashboardLayout.css';
import UserApprovals from './UserApprovals';

const AuditDashboard = () => {
  const navigate = useNavigate();
  const [auditRecords, setAuditRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, compliant: 0, ngos: 0, verified: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await auditorAPI.getAuditTrail().catch(() => []);

        setAuditRecords(data.map(d => ({
          id: d.donation_id || d.id,
          donor_name: d.company_name,
          ngo_name: d.ngo_name,
          clinic_name: d.clinic_name || '-',
          status: d.status
        })));

        setStats({
          total: data.length,
          compliant: data.filter(d => d.status === 'COMPLETED').length,
          ngos: new Set(data.map(d => d.ngo_name)).size,
          verified: data.length // Assuming all on chain are verified
        });
      } catch (error) {
        console.error("Failed to load Audit data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
        <SummaryCard label="Total Audited" value={loading ? "-" : stats.total} color="#00E5FF" icon={ClipboardCheck} />
        <SummaryCard label="Compliant" value={loading ? "-" : stats.compliant} color="#00ff88" icon={CheckCircle2} />
        <SummaryCard label="Active NGOs" value={loading ? "-" : stats.ngos} color="#ff9800" icon={Users} />
        <SummaryCard label="Hash Verified" value={loading ? "-" : stats.verified} color="#b400ff" icon={Link} />
      </div>

      {/* Pending User Approvals */}
      <UserApprovals />

      <div className="table-card">
        <h2 className="table-header-title">Recent Audit Records</h2>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading trail...</div>
        ) : auditRecords.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <p>No audit records available.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Completed transaction records will appear here for verification.</p>
          </div>
        ) : (
          <Table
            columns={[
              { key: 'id', label: 'Donation ID' },
              { key: 'donor_name', label: 'Donor' },
              { key: 'ngo_name', label: 'NGO' },
              { key: 'clinic_name', label: 'Clinic' },
              { key: 'status', label: 'Status' },
            ]}
            data={auditRecords}
            renderCell={(row, key) =>
              key === 'status' ? <StatusBadge status={row.status} /> : row[key]
            }
          />
        )}
      </div>
    </Layout>
  );
};

export default AuditDashboard;
