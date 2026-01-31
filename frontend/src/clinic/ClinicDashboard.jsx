import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownCircle, CheckSquare, Truck, Clock, Package, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import { clinicAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/DashboardLayout.css';

const CLINIC_REQUESTS_KEY = 'csr_tracker_clinic_requests';

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
      // Fetch allocations
      const allocData = await clinicAPI.getReceipts().catch(() => []);
      setAllocations(allocData.map(d => ({
        id: d.allocation_id || d.id,
        donation_id: d.donation_id,
        ngo_name: d.ngo_name,
        resource_type: d.item_name || 'Medical Supplies',
        quantity: d.quantity,
        status: d.status
      })));

      // Fetch clinic requests from localStorage
      const allRequests = JSON.parse(localStorage.getItem(CLINIC_REQUESTS_KEY) || '[]');
      const clinicRequests = allRequests.filter(r => r.clinic_name === user?.companyName);
      setRequests(clinicRequests);

      // Compute stats
      setStats({
        incoming: allocData.length,
        received: allocData.filter(d => ['RECEIVED', 'COMPLETED'].includes(d.status)).length,
        transit: allocData.filter(d => ['IN_TRANSIT', 'ALLOCATED'].includes(d.status)).length,
        pending: allocData.filter(d => d.status === 'PENDING').length,
        requestsPending: clinicRequests.filter(r => r.status === 'PENDING').length,
        requestsApproved: clinicRequests.filter(r => r.status === 'APPROVED').length
      });

    } catch (error) {
      console.error("Failed to load Clinic data", error);
    } finally {
      setLoading(false);
    }
  };

  const getRequestStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return '#10b981';
      case 'DENIED': return '#ef4444';
      case 'PENDING': return '#f59e0b';
      default: return '#64748b';
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinic Dashboard</h1>
          <p className="page-subtitle">Track incoming supplies and manage product requests</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="btn-submit"
            onClick={() => navigate('/clinic/receipts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: '200px',
              justifyContent: 'center',
              borderRadius: '12px',
              letterSpacing: '0.05em'
            }}
          >
            <CheckSquare size={18} />
            CONFIRM RECEIPT
          </button>
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
      </div>



      {/* Incoming Allocations */}
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
    </Layout >
  );
};

export default ClinicDashboard;
