import React, { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import Table from '../components/Table';
import '../styles/DashboardLayout.css'; // Inherit layout styles

/**
 * DonationHistory Component
 * Displays comprehensive donation history with filtering and search capabilities
 */
const DonationHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  const donations = [
    {
      id: 'DON-2025-001',
      donorName: 'John Healthcare Corp',
      itemType: 'PPE Kits',
      quantity: '100 boxes',
      ngoName: 'Red Cross India',
      status: 'completed',
      date: 'Jan 15, 2025',
      blockchainHash: '0x3f4d5e6a7b8c9d0e1f2a3b4c5d6e7f8a',
    },
    {
      id: 'DON-2025-002',
      donorName: 'Medical Supplies Ltd',
      itemType: 'Medical Gloves',
      quantity: '500 boxes',
      ngoName: 'WHO Partners',
      status: 'in-transit',
      date: 'Jan 18, 2025',
      blockchainHash: '0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
    },
    {
      id: 'DON-2025-003',
      donorName: 'PharmaCare Solutions',
      itemType: 'Syringes',
      quantity: '1000 units',
      ngoName: 'MSF India',
      status: 'pending',
      date: 'Jan 20, 2025',
      blockchainHash: '0x5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
    },
    {
      id: 'DON-2025-004',
      donorName: 'Tech Health Initiative',
      itemType: 'N95 Masks',
      quantity: '2000 units',
      ngoName: 'Médecins du Monde',
      status: 'completed',
      date: 'Jan 22, 2025',
      blockchainHash: '0x6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d',
    },
  ];

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.itemType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    // Export logic
    alert('Exporting to CSV...');
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
          <p className="page-subtitle">Track all your submitted donations and their blockchain status</p>
        </div>
      </div>

      <div className="table-card" style={{ marginBottom: '2rem' }}>
        {/* Controls Bar */}
        <div style={{ display: 'flex', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>

          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
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
              <Filter size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
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
                <option value="pending">Pending</option>
                <option value="in-transit">In Transit</option>
                <option value="completed">Completed</option>
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
                border: '1px solid var(--accent-cyan)',
                color: 'var(--accent-cyan)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={filteredDonations}
          renderCell={(row, key) => key === 'status' ? <StatusBadge status={row.status} /> : row[key]}
        />

        {filteredDonations.length === 0 && (
          <div className="empty-state">
            <p>No donations found matching your criteria</p>
          </div>
        )}
      </div>

      <div style={{
        background: 'rgba(0, 229, 255, 0.05)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <div style={{
          background: 'rgba(0, 229, 255, 0.1)',
          padding: '10px',
          borderRadius: '50%',
          color: 'var(--accent-cyan)'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.5rem' }}>Blockchain Verification</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Each donation is recorded on the blockchain with an immutable hash.
            Use the hash to verify authenticity and track the entire lifecycle of your donation.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default DonationHistory;
