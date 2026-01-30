import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownCircle, CheckSquare, Truck, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import { clinicAPI } from '../services/api';
import '../styles/DashboardLayout.css';

const ClinicDashboard = () => {
  const navigate = useNavigate();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ incoming: 0, received: 0, transit: 0, pending: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Attempt to fetch allocations/receipts
        const data = await clinicAPI.getReceipts().catch(() => []);

        // Map data
        setAllocations(data.map(d => ({
          id: d.allocation_id || d.id,
          donation_id: d.donation_id,
          ngo_name: d.ngo_name,
          resource_type: d.item_name || 'Medical Supplies', // Fallback
          quantity: d.quantity,
          status: d.status
        })));

        // Compute stats
        setStats({
          incoming: data.length,
          received: data.filter(d => ['RECEIVED', 'COMPLETED'].includes(d.status)).length,
          transit: data.filter(d => ['IN_TRANSIT', 'ALLOCATED'].includes(d.status)).length,
          pending: data.filter(d => d.status === 'PENDING').length
        });

      } catch (error) {
        console.error("Failed to load Clinic data", error);
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
          <h1 className="page-title">Clinic Dashboard</h1>
          <p className="page-subtitle">Track incoming supplies and confirm receipts</p>
        </div>
        <button className="btn-submit" onClick={() => navigate('/clinic/receipts')}>
          ✅ Confirm Receipt
        </button>
      </div>

      <div className="stats-grid">
        <SummaryCard label="Incoming Allocations" value={loading ? "-" : stats.incoming} color="#00E5FF" icon={ArrowDownCircle} />
        <SummaryCard label="Received" value={loading ? "-" : stats.received} color="#00ff88" icon={CheckSquare} />
        <SummaryCard label="In Transit" value={loading ? "-" : stats.transit} color="#ff9800" icon={Truck} />
        <SummaryCard label="Pending" value={loading ? "-" : stats.pending} color="#b400ff" icon={Clock} />
      </div>

      <div className="table-card">
        <h2 className="table-header-title">Incoming Allocations</h2>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading data...</div>
        ) : allocations.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <p>No incoming allocations.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Allocations from NGOs will be listed here.</p>
          </div>
        ) : (
          <Table
            columns={[
              { key: 'id', label: 'Allocation ID' },
              { key: 'donation_id', label: 'Donation ID' },
              { key: 'ngo_name', label: 'NGO' },
              { key: 'resource_type', label: 'Resource Type' },
              { key: 'quantity', label: 'Quantity' },
              { key: 'status', label: 'Status' },
            ]}
            data={allocations}
            renderCell={(row, key) =>
              key === 'status' ? <StatusBadge status={row.status} /> : row[key]
            }
          />
        )}
      </div>
    </Layout>
  );
};

export default ClinicDashboard;
