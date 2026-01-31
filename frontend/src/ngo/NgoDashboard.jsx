import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, Send, FileSearch, Activity, Package, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import { ngoAPI } from '../services/api';
import '../styles/DashboardLayout.css';

const MOCK_DONATIONS_KEY = 'csr_tracker_mock_donations';
const CLINIC_REQUESTS_KEY = 'csr_tracker_clinic_requests';

const NgoDashboard = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [clinicRequests, setClinicRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingDonations: 0,
    acceptedDonations: 0,
    pendingRequests: 0,
    emergencyRequests: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Load donations from localStorage
      const allDonations = JSON.parse(localStorage.getItem(MOCK_DONATIONS_KEY) || '[]');
      const pending = allDonations.filter(d => d.status === 'PENDING');
      const accepted = allDonations.filter(d => d.status === 'ACCEPTED');

      setDonations(pending.map(d => ({
        id: d.id,
        donor_name: d.donor_name || 'CSR Partner',
        resource_type: d.item_name,
        quantity: d.quantity,
        status: d.status,
        created_at: d.created_at
      })));

      // Load clinic requests from localStorage
      // Load clinic requests from localStorage
      let allRequests = JSON.parse(localStorage.getItem(CLINIC_REQUESTS_KEY) || '[]');
      let pendingRequests = allRequests.filter(r => r.status === 'PENDING');

      // Inject Dummy Data if empty (User Request)
      if (pendingRequests.length === 0) {
        pendingRequests = [
          {
            id: 'REQ-001-DEMO',
            clinic_name: 'Hope Community Clinic',
            priority: 'emergency',
            items: ['PPE Kits', 'Gloves'],
            created_at: new Date().toISOString(),
            status: 'PENDING'
          },
          {
            id: 'REQ-002-DEMO',
            clinic_name: 'Urban Health Center',
            priority: 'high',
            items: ['Syringes'],
            created_at: new Date(Date.now() - 86400000).toISOString(),
            status: 'PENDING'
          },
          {
            id: 'REQ-003-DEMO',
            clinic_name: 'Metro Relief Camp',
            priority: 'medium',
            items: ['Masks', 'Sanitizers'],
            created_at: new Date(Date.now() - 172800000).toISOString(),
            status: 'PENDING'
          }
        ];
      }

      const emergencyRequests = pendingRequests.filter(r => r.priority === 'emergency');

      setClinicRequests(pendingRequests);

      setStats({
        pendingDonations: pending.length,
        acceptedDonations: accepted.length,
        pendingRequests: pendingRequests.length,
        emergencyRequests: emergencyRequests.length
      });

    } catch (error) {
      console.error("Failed to load NGO data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">NGO Dashboard</h1>
          <p className="page-subtitle">Manage incoming donations and clinic requests</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            className="btn-secondary"
            onClick={() => navigate('/ngo/pending-donations')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: '200px',
              justifyContent: 'center',
              borderRadius: '12px',
              fontFamily: "'Orbitron', sans-serif"
            }}
          >
            <Inbox size={18} />
            REVIEW DONATIONS
          </button>
          <button
            className="btn-submit"
            onClick={() => navigate('/ngo/clinic-requests')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: '200px',
              justifyContent: 'center',
              letterSpacing: '0.05em',
              borderRadius: '12px'
            }}
          >
            <Package size={18} />
            CLINIC REQUESTS
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <SummaryCard
          label="Pending Donations"
          value={loading ? "-" : stats.pendingDonations}
          color="#f59e0b"
          icon={Inbox}
        />
        <SummaryCard
          label="Accepted Stock"
          value={loading ? "-" : stats.acceptedDonations}
          color="#10b981"
          icon={Package}
        />
        <SummaryCard
          label="Clinic Requests"
          value={loading ? "-" : stats.pendingRequests}
          color="#3b82f6"
          icon={FileSearch}
        />
        <SummaryCard
          label="Emergency Requests"
          value={loading ? "-" : stats.emergencyRequests}
          color="#ef4444"
          icon={AlertTriangle}
        />
      </div>

      {/* Pending Donations Section */}
      <div className="table-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="table-header-title">Pending Donations</h2>
          <button
            onClick={() => navigate('/ngo/pending-donations')}
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
            Review All
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading data...</div>
        ) : donations.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <Inbox size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
            <p>No pending donations to review.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Donations from CSR partners will appear here.</p>
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
            data={donations.slice(0, 5)}
            renderCell={(row, key) =>
              key === 'status' ? <StatusBadge status={row.status} /> : row[key]
            }
          />
        )}
      </div>

      {/* Pending Clinic Requests Section */}
      <div className="table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="table-header-title">Pending Clinic Requests</h2>
          <button
            onClick={() => navigate('/ngo/clinic-requests')}
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
            Review All
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading requests...</div>
        ) : clinicRequests.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <Package size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
            <p>No pending clinic requests.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Clinic product requests will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {clinicRequests.slice(0, 3).map(request => (
              <div
                key={request.id}
                style={{
                  padding: '1.5rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: request.priority === 'emergency'
                    ? '2px solid rgba(239, 68, 68, 0.5)'
                    : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ color: '#fff', margin: 0 }}>{request.clinic_name}</h4>
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
                <button
                  onClick={() => navigate('/ngo/clinic-requests')}
                  style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    color: '#3b82f6',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NgoDashboard;
