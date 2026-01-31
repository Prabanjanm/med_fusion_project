import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Eye } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import Table from '../components/Table';
import { donationAPI } from '../services/api';
import '../styles/DashboardLayout.css';

/**
 * DonationHistory Component
 * Displays donation history with real-time updates
 */
const DonationHistory = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Fetch donations from API
  const fetchDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📥 Fetching donation history from API...');
      const data = await donationAPI.getHistory();
      console.log('✅ Received donation data:', data);

      // Transform API data to match table format
      const formattedDonations = data.map(donation => ({
        id: donation.id,
        donorName: donation.donor_name || 'CSR Donor',
        itemType: donation.item_name,
        quantity: donation.quantity,
        ngoName: donation.ngo_name || 'Pending Assignment',
        status: donation.status || 'PENDING',
        date: new Date(donation.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }));

      setDonations(formattedDonations);
      setLastRefresh(Date.now());
    } catch (err) {
      console.error('❌ Failed to fetch donations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when refresh param changes
  useEffect(() => {
    fetchDonations();
  }, [searchParams.get('refresh')]); // Re-fetch when refresh param changes

  // Manual refresh handler
  const handleRefresh = () => {
    fetchDonations();
  };

  // Filter donations based on search and status
  const filteredDonations = donations.filter(donation => {
    const matchesSearch =
      donation.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.itemType?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || donation.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    if (donations.length === 0) {
      alert('No data to export');
      return;
    }

    // Create CSV content
    const headers = ['Donation ID', 'Donor Name', 'Item Type', 'Quantity', 'NGO', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...donations.map(d => [d.id, d.donorName, d.itemType, d.quantity, d.ngoName, d.status, d.date].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donation-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => navigate(`/csr/donation/${row.id}`)}
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            color: '#3b82f6',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Eye size={16} />
          View Timeline
        </button>
      )
    }
  ];

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Donation History</h1>
          <p className="page-subtitle">
            {loading ? 'Loading...' : `${donations.length} donation${donations.length !== 1 ? 's' : ''} recorded`}
            {lastRefresh && !loading && (
              <span style={{ marginLeft: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>
                Last updated: {new Date(lastRefresh).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="btn-submit"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={18} className={loading ? 'spin-icon' : ''} />
          Refresh
        </button>
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
              placeholder="Search by ID, donor, or item..."
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
                <option value="ALLOCATED">Allocated</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              disabled={donations.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: donations.length > 0 ? 'var(--accent-cyan)' : 'transparent',
                border: '1px solid var(--border-subtle)',
                color: donations.length > 0 ? '#000' : 'var(--text-muted)',
                borderRadius: '6px',
                cursor: donations.length > 0 ? 'pointer' : 'not-allowed',
                fontWeight: 600
              }}
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table or Empty State */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <RefreshCw size={32} className="spin-icon" style={{ color: '#00d4ff', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading donation history...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: '#ff4444', marginBottom: '1rem' }}>❌ {error}</p>
            <button onClick={handleRefresh} className="btn-submit">
              Try Again
            </button>
          </div>
        ) : filteredDonations.length > 0 ? (
          <Table
            columns={columns}
            data={filteredDonations}
            renderCell={(row, key) =>
              key === 'status' ? <StatusBadge status={row.status} /> : row[key]
            }
          />
        ) : donations.length > 0 ? (
          <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
              No donations match your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
              }}
              className="btn-submit"
              style={{ marginTop: '1rem' }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
              No donation records found.
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Create your first donation to see it appear here in real-time.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DonationHistory;
