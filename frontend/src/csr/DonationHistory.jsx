import React, { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import Table from '../components/Table';
import { donationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/DashboardLayout.css';

/**
 * DonationHistory Component
 * Displays real donation history from the backend.
 */
const DonationHistory = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await donationAPI.getHistory();

        // Map backend data to UI format
        const formattedData = data.map(d => ({
          id: d.donation_id || d.id,
          itemType: d.item_name,
          quantity: d.quantity,
          status: d.status,
          date: new Date(d.created_at).toLocaleDateString(),
          timestamp: new Date(d.created_at).getTime(), // for sorting
          // Derive NGO from purpose if needed
          ngoName: d.purpose && d.purpose.includes('Donation to ') ? d.purpose.replace('Donation to ', '') : 'N/A',
          donorName: user?.company_name || 'My Company'
        }));

        // Sort by latest first
        formattedData.sort((a, b) => b.timestamp - a.timestamp);

        setDonations(formattedData);
      } catch (error) {
        console.error("Failed to load donation history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const filteredDonations = donations.filter(donation => {
    const matchesSearch =
      String(donation.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(donation.donorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(donation.itemType || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || donation.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    alert('Export functionality coming soon (requires backend support).');
  };

  const columns = [
    { key: 'id', label: 'Donation ID' },
    { key: 'donorName', label: 'Donor Name' },
    { key: 'itemType', label: 'Item Type' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'ngoName', label: 'NGO' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    { key: 'date', label: 'Date' },
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Donation History</h1>
          <p className="page-subtitle">
            View and track all your contributions
          </p>
        </div>
      </div>

      <div className="table-card" style={{ marginBottom: '2rem' }}>
        {/* Controls Bar */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '12px',
                color: 'var(--text-muted)'
              }}
            />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: '#fff'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Filter
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '12px',
                  color: 'var(--text-muted)'
                }}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: '10px 10px 10px 40px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="RECEIVED">Received</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading history...</div>
        ) : filteredDonations.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
              No donation records found.
            </p>
            {searchTerm || filterStatus !== 'all' ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Try adjusting your filters.
              </p>
            ) : (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Your contributions will appear here once you make a donation.
              </p>
            )}
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredDonations}
          />
        )}
      </div>

      {/* Blockchain Info Card */}
      <div
        style={{
          background: 'rgba(0, 229, 255, 0.05)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem'
        }}
      >
        <div
          style={{
            background: 'rgba(0, 229, 255, 0.1)',
            padding: '10px',
            borderRadius: '50%',
            color: 'var(--accent-cyan)'
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.5rem' }}>
            Blockchain Verification
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            All donation records above are immutably stored and verified on the blockchain.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default DonationHistory;
