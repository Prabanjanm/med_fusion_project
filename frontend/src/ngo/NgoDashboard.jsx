import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, Send, FileSearch, Activity } from 'lucide-react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import { ngoAPI } from '../services/api';
import '../styles/DashboardLayout.css';

const NgoDashboard = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ incoming: 0, allocated: 0, review: 0, clinics: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load pending donations
        const pending = await ngoAPI.getPendingDonations().catch(() => []);
        // Ideally we also fetch allocated history to populate full stats
        // For now, we only have pending endpoint confirmed

        setDonations(pending.map(d => ({
          id: d.donation_id,
          donor_name: d.company_name,
          resource_type: d.item_name,
          quantity: d.quantity,
          status: d.status
        })));

        setStats({
          incoming: pending.length,
          allocated: 0, // Placeholder until history API available
          review: 0,
          clinics: 0
        });

      } catch (error) {
        console.error("Failed to load NGO data", error);
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
          <h1 className="page-title">NGO Dashboard</h1>
          <p className="page-subtitle">Manage incoming resources and clinic allocations</p>
        </div>
        <button className="btn-submit" onClick={() => navigate('/ngo/allocate')}>
          ➕ Allocate Items
        </button>
      </div>

      <div className="stats-grid">
        <SummaryCard label="Incoming Resources" value={loading ? "-" : stats.incoming} color="#00E5FF" icon={Inbox} />
        <SummaryCard label="Allocated" value={loading ? "-" : stats.allocated} color="#00ff88" icon={Send} />
        <SummaryCard label="In Review" value={loading ? "-" : stats.review} color="#ff9800" icon={FileSearch} />
        <SummaryCard label="Active Clinics" value={loading ? "-" : stats.clinics} color="#b400ff" icon={Activity} />
      </div>

      <div className="table-card">
        <h2 className="table-header-title">Incoming Donations</h2>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading data...</div>
        ) : donations.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <p>No incoming donations to review.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Donations pending review will appear here.</p>
          </div>
        ) : (
          <Table
            columns={[
              { key: 'id', label: 'Donation ID' },
              { key: 'donor_name', label: 'Donor' },
              { key: 'resource_type', label: 'Resource Type' },
              { key: 'quantity', label: 'Quantity' },
              { key: 'status', label: 'Status' },
            ]}
            data={donations}
            renderCell={(row, key) =>
              key === 'status' ? <StatusBadge status={row.status} /> : row[key]
            }
          />
        )}
      </div>
    </Layout>
  );
};

export default NgoDashboard;
