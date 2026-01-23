import React, { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Table from '../components/Table';
import '../styles/HistoryStyles.css';

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
    const csv = [
      ['Donation ID', 'Donor Name', 'Item Type', 'Quantity', 'NGO', 'Status', 'Date', 'Blockchain Hash'],
      ...filteredDonations.map(d => [
        d.id,
        d.donorName,
        d.itemType,
        d.quantity,
        d.ngoName,
        d.status,
        d.date,
        d.blockchainHash,
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
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
  ];

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>Donation History</h1>
        <p>Track all your submitted donations and their blockchain status</p>
      </div>

      <div className="history-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by donation ID, donor name, or item type..."
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
            <option value="pending">Pending</option>
            <option value="in-transit">In Transit</option>
            <option value="completed">Completed</option>
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
          data={filteredDonations}
          rowKey="id"
        />
      </div>

      {filteredDonations.length === 0 && (
        <div className="empty-state">
          <p>No donations found matching your criteria</p>
        </div>
      )}

      <div className="blockchain-info">
        <h3>Blockchain Verification</h3>
        <p>
          Each donation is recorded on the blockchain with an immutable hash.
          Use the hash to verify authenticity and track the entire lifecycle of your donation.
        </p>
      </div>
    </div>
  );
};

export default DonationHistory;
