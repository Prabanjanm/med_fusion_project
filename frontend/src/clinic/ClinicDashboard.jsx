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
            className="btn-secondary"
            onClick={() => navigate('/clinic/request-products')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: '200px',
              justifyContent: 'center',
              borderRadius: '12px'
            }}
          >
            <Package size={18} />
            REQUEST PRODUCTS
          </button>
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
        <SummaryCard
          label="Requests Pending"
          value={loading ? "-" : stats.requestsPending}
          color="#f59e0b"
          icon={Clock}
        />
        <SummaryCard
          label="Requests Approved"
          value={loading ? "-" : stats.requestsApproved}
          color="#10b981"
          icon={CheckSquare}
        />
      </div>

      {/* Recent Requests Section */}
      <div className="table-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="table-header-title">My Recent Requests</h2>
          <button
            onClick={() => navigate('/clinic/request-status')}
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600
            }}
          >
            View All Requests
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <Package size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
            <p>No product requests yet.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Click "Request Products" to submit your first request.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {requests.slice(0, 3).map(request => (
              <div
                key={request.id}
                style={{
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ color: '#fff', margin: 0 }}>{request.id}</h4>
                    {request.priority === 'emergency' && (
                      <div style={{
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '12px',
                        color: '#ef4444',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <AlertTriangle size={12} />
                        EMERGENCY
                      </div>
                    )}
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                    {request.items.length} item{request.items.length !== 1 ? 's' : ''} •
                    Submitted {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div style={{
                  padding: '0.5rem 1rem',
                  background: `rgba(${getRequestStatusColor(request.status)}, 0.1)`,
                  border: `1px solid ${getRequestStatusColor(request.status)}`,
                  borderRadius: '8px',
                  color: getRequestStatusColor(request.status),
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  {request.status}
                </div>
              </div>
            ))}
          </div>
        )}
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
    </Layout>
  );
};

export default ClinicDashboard;
