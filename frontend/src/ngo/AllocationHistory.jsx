import React, { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import Table from '../components/Table';
import '../styles/DashboardLayout.css'; // Inherit layout styles

/**
 * AllocationHistory Component
 * Displays comprehensive allocation history with search and filter capabilities
 */
const AllocationHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  // No mock data - waiting for backend integration
  const allocations = [];

  const filteredAllocations = allocations.filter(alloc => {
    const matchesSearch = (alloc.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alloc.donationId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alloc.clinicName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || alloc.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    // Export logic
    alert('Exporting Allocation History...');
  };

  const columns = [
    { key: 'id', label: 'Allocation ID' },
    { key: 'donationId', label: 'Donation ID' },
    { key: 'clinicName', label: 'Clinic Name' },
    { key: 'allocatedQuantity', label: 'Allocated Qty' },
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
          <h1 className="page-title">Allocation History</h1>
          <p className="page-subtitle">Track all allocations to clinics and their delivery status</p>
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
                <option value="pending-receipt">Pending Receipt</option>
                <option value="in-transit">In Transit</option>
                <option value="confirmed">Confirmed</option>
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
          data={filteredAllocations}
          rowKey="id"
          renderCell={(row, key) => key === 'status' ? <StatusBadge status={row.status} /> : row[key]}
        />

        {filteredAllocations.length === 0 && (
          <div className="empty-state">
            <p>No allocations found matching your criteria</p>
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
            Each allocation is recorded on the blockchain ensuring transparency.
            Use the hash to verify the allocation details and track delivery status.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AllocationHistory;
