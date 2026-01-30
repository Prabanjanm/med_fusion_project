import React, { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import Table from '../components/Table';
import '../styles/DashboardLayout.css';

/**
 * DonationHistory Component
 * Displays donation history (empty until real data is integrated)
 */
const DonationHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // 🚫 NO MOCK DATA
  // This will later be replaced with real API data
  const donations = [];

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
    alert('Export will be available once real data is connected.');
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
            Donation records will appear here once activity begins
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
              disabled
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: '#fff',
                opacity: 0.5,
                cursor: 'not-allowed'
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
                disabled
                style={{
                  padding: '10px 10px 10px 40px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: '#fff',
                  opacity: 0.5,
                  cursor: 'not-allowed'
                }}
              >
                <option value="all">All Status</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              disabled
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                borderRadius: '6px',
                cursor: 'not-allowed'
              }}
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* EMPTY STATE */}
        <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
            No donation history available yet.
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Once donations are made, they will appear here with blockchain verification.
          </p>
        </div>
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
            Donation records will be immutably stored on the blockchain once activity begins.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default DonationHistory;
