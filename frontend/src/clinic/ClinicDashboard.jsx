import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownCircle, CheckSquare, Truck, Clock, Package, AlertTriangle, History } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import Table from '../components/Table';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import { clinicAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/DashboardLayout.css';

const ClinicDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    incoming: 0,
    received: 0,
    transit: 0,
    pending: 0,
    requestsPending: 0,
    requestsApproved: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Allocations (Pending Receipts)
      // Note: getPendingAllocations returns only pending. 
      // getHistory returns all. We probably want All for statistics.
      // But let's use getHistory for dashboard general stats, or pending for the table.
      // We'll try getHistory first if it exists, otherwise getPending.
      const allocData = await clinicAPI.getHistory().catch(() => []);

      setAllocations(allocData.map(d => ({
        id: d.allocation_id || d.id,
        donation_id: d.donation_id,
        ngo_name: d.ngo_name,
        resource_type: d.item_name || 'Medical Supplies',
        quantity: d.quantity,
        status: d.status
      })));

      // 2. Fetch Requests (Tracking)
      const requestsData = await clinicAPI.getRequests().catch(() => []);

      const myRequests = requestsData || [];
      setRequests(myRequests);

      // Compute stats
      setStats({
        incoming: allocData.length,
        received: allocData.filter(d => ['RECEIVED', 'COMPLETED'].includes(d.status)).length,
        transit: allocData.filter(d => ['IN_TRANSIT', 'ALLOCATED', 'ACCEPTED'].includes(d.status)).length,
        pending: allocData.filter(d => d.status === 'PENDING').length,
        requestsPending: myRequests.filter(r => r.status === 'PENDING').length,
        requestsApproved: myRequests.filter(r => r.status === 'APPROVED' || r.status === 'ALLOCATED').length
      });

    } catch (error) {
      console.error("Failed to load Clinic data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div style={{
        marginBottom: '1rem',
        paddingTop: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingBottom: '1rem',
        position: 'relative'
      }}>
        <div>
          <h1 className="page-title" style={{
            fontSize: '2rem',
            marginBottom: '0.25rem',
            textShadow: '0 0 20px rgba(6, 182, 212, 0.2)'
          }}>
            Clinic Inventory Dashboard
          </h1>
          <p className="page-subtitle" style={{
            fontSize: '1.1rem',
            opacity: 0.6,
            color: '#94a3b8',
            fontWeight: '400'
          }}>
            Welcome back, {user?.organization_name || 'Health Facility'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/clinic/request-products')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.25rem', fontSize: '0.9rem',
              borderRadius: '10px', fontWeight: '600',
              border: '1px solid #00e5ff', background: 'rgba(0, 229, 255, 0.05)',
              color: '#00e5ff', cursor: 'pointer'
            }}
          >
            <Package size={18} /> REQUEST
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/clinic/request-status')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.25rem', fontSize: '0.9rem',
              borderRadius: '10px', fontWeight: '600',
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.6)',
              color: '#fff', cursor: 'pointer'
            }}
          >
            <History size={18} /> MY STATUS
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 255, 148, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/clinic/receipts')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', fontSize: '0.9rem',
              borderRadius: '10px', fontWeight: '700',
              border: 'none', background: 'linear-gradient(135deg, #00ff94 0%, #00e5ff 100%)',
              color: '#000', cursor: 'pointer'
            }}
          >
            <CheckSquare size={18} /> CONFIRM RECEIPT
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <SummaryCard
          label="Incoming Allocations"
          value={loading ? "-" : stats.incoming}
          color="#00E5FF"
          icon={ArrowDownCircle}
        />
        <SummaryCard
          label="Received"
          value={loading ? "-" : stats.received}
          color="#00ff88"
          icon={CheckSquare}
        />
        <SummaryCard
          label="Pending Requests"
          value={loading ? "-" : stats.requestsPending}
          color="#f59e0b"
          icon={Clock}
        />
      </div>

      {/* Incoming Allocations */}
      <div className="table-card">
        <h2 className="table-header-title">Incoming Allocations (History)</h2>
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
    </Layout >
  );
};

export default ClinicDashboard;
