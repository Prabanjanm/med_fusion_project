import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Loader2, Star, MessageSquare } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import Table from '../components/Table';
import { ngoAPI } from '../services/api';
import '../styles/DashboardLayout.css';

const AllocationHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllocations();
  }, []);

  const fetchAllocations = async () => {
    try {
      const data = await ngoAPI.getAllocationHistory();
      setAllocations(data || []);
    } catch (error) {
      console.error("Failed to fetch allocations", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAllocations = allocations.filter(alloc => {
    const searchStr = `${alloc.id} ${alloc.donation_id} ${alloc.item_name} ${alloc.clinic_name}`.toLowerCase();
    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || alloc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'id', label: 'Allocation ID' },
    { key: 'donation_id', label: 'Donation ID' },
    { key: 'item_name', label: 'Item Name' },
    { key: 'clinic_name', label: 'Clinic Name' },
    { key: 'quantity', label: 'Allocated Qty' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'allocated_at',
      label: 'Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      key: 'quality_rating',
      label: 'Clinic Rating',
      render: (value, row) => row.received ? (
        <div style={{ display: 'flex', gap: '2px' }}>
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={12} fill={s <= value ? '#eab308' : 'none'} color={s <= value ? '#eab308' : '#334155'} />
          ))}
        </div>
      ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Pending</span>
    },
    {
      key: 'feedback',
      label: 'Feedback',
      render: (value, row) => row.received ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={value}>
          <MessageSquare size={12} />
          {value || 'No feedback'}
        </div>
      ) : '-'
    }
  ];

  const handleExport = () => {
    alert('Exporting Allocation History...');
  };

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
