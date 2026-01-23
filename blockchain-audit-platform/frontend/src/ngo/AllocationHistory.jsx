import React, { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Table from '../components/Table';
import '../styles/HistoryStyles.css';

/**
 * AllocationHistory Component
 * Displays comprehensive allocation history with search and filter capabilities
 */
const AllocationHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  const allocations = [
    {
      id: 'ALLOC-2025-001',
      donationId: 'DON-2025-001',
      clinicName: 'City General Hospital',
      allocatedQuantity: '50 boxes',
      status: 'confirmed',
      date: 'Jan 15, 2025',
      blockchainHash: '0x7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
    },
    {
      id: 'ALLOC-2025-002',
      donationId: 'DON-2025-001',
      clinicName: 'Rural Health Center',
      allocatedQuantity: '50 boxes',
      status: 'confirmed',
      date: 'Jan 15, 2025',
      blockchainHash: '0x8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f',
    },
    {
      id: 'ALLOC-2025-003',
      donationId: 'DON-2025-002',
      clinicName: 'Emergency Care Clinic',
      allocatedQuantity: '250 boxes',
      status: 'in-transit',
      date: 'Jan 18, 2025',
      blockchainHash: '0x9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a',
    },
    {
      id: 'ALLOC-2025-004',
      donationId: 'DON-2025-003',
      clinicName: 'Community Clinic West',
      allocatedQuantity: '500 units',
      status: 'pending-receipt',
      date: 'Jan 20, 2025',
      blockchainHash: '0xa0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
    },
  ];

  const filteredAllocations = allocations.filter(alloc => {
    const matchesSearch = alloc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alloc.donationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alloc.clinicName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || alloc.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const csv = [
      ['Allocation ID', 'Donation ID', 'Clinic Name', 'Allocated Qty', 'Status', 'Date', 'Blockchain Hash'],
      ...filteredAllocations.map(a => [
        a.id,
        a.donationId,
        a.clinicName,
        a.allocatedQuantity,
        a.status,
        a.date,
        a.blockchainHash,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `allocation-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
    <div className="history-container">
      <div className="history-header">
        <h1>Allocation History</h1>
        <p>Track all allocations to clinics and their delivery status</p>
      </div>

      <div className="history-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by allocation ID, donation ID, or clinic name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <Filter size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending-receipt">Pending Receipt</option>
            <option value="in-transit">In Transit</option>
            <option value="confirmed">Confirmed</option>
          </select>

          <button className="btn-export" onClick={handleExport}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <Table
          columns={columns}
          data={filteredAllocations}
          rowKey="id"
        />
      </div>

      {filteredAllocations.length === 0 && (
        <div className="empty-state">
          <p>No allocations found matching your criteria</p>
        </div>
      )}

      <div className="blockchain-info">
        <h3>Blockchain Verification</h3>
        <p>
          Each allocation is recorded on the blockchain ensuring transparency.
          Use the hash to verify the allocation details and track delivery status.
        </p>
      </div>
    </div>
  );
};

export default AllocationHistory;
