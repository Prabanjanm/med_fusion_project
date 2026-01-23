import React, { useState } from 'react';
import { Search, Filter, Download, Shield } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Table from '../components/Table';
import '../styles/HistoryStyles.css';
import '../styles/AuditTrail.css';

/**
 * AuditTrail Component
 * Read-only audit trail showing complete donation lifecycle
 * Displays blockchain hashes for verification and transparency
 */
const AuditTrail = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);

  // Mock data with complete lifecycle
  const auditData = [
    {
      id: 'DON-2025-001',
      donorName: 'John Healthcare Corp',
      ngoName: 'Red Cross India',
      clinicName: 'City General Hospital',
      resourceType: 'PPE Kits',
      quantity: '100 boxes',
      donationTimestamp: '2025-01-15 10:30:00 UTC',
      donationHash: '0x3f4d5e6a7b8c9d0e1f2a3b4c5d6e7f8a',
      allocationTimestamp: '2025-01-15 14:45:00 UTC',
      allocationHash: '0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
      receiptTimestamp: '2025-01-16 09:20:00 UTC',
      receiptHash: '0x5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
      status: 'completed',
    },
    {
      id: 'DON-2025-002',
      donorName: 'Medical Supplies Ltd',
      ngoName: 'WHO Partners',
      clinicName: 'Emergency Care Clinic',
      resourceType: 'Medical Gloves',
      quantity: '500 boxes',
      donationTimestamp: '2025-01-18 11:15:00 UTC',
      donationHash: '0x6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d',
      allocationTimestamp: '2025-01-18 15:30:00 UTC',
      allocationHash: '0x7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
      receiptTimestamp: null,
      receiptHash: null,
      status: 'in-transit',
    },
  ];

  const filteredData = auditData.filter(item =>
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ngoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.clinicName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (donation) => {
    setSelectedDonation(selectedDonation?.id === donation.id ? null : donation);
  };

  const handleExportAudit = () => {
    const csv = [
      ['Donation ID', 'Donor', 'NGO', 'Clinic', 'Status', 'Donation Hash', 'Allocation Hash', 'Receipt Hash'],
      ...auditData.map(d => [
        d.id,
        d.donorName,
        d.ngoName,
        d.clinicName,
        d.status,
        d.donationHash,
        d.allocationHash || 'N/A',
        d.receiptHash || 'N/A',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const columns = [
    { key: 'id', label: 'Donation ID' },
    { key: 'donorName', label: 'Donor' },
    { key: 'ngoName', label: 'NGO' },
    { key: 'clinicName', label: 'Clinic' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    { key: 'resourceType', label: 'Resource Type' },
  ];

  return (
    <div className="audit-container">
      <div className="audit-header">
        <div className="header-content">
          <Shield size={32} className="header-icon" />
          <div>
            <h1>Audit Trail</h1>
            <p>Complete blockchain-verified donation lifecycle tracking</p>
          </div>
        </div>
      </div>

      <div className="audit-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by donation ID, donor, NGO, or clinic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="btn-export" onClick={handleExportAudit}>
          <Download size={18} />
          Export Audit Report
        </button>
      </div>

      <div className="table-wrapper">
        <Table
          columns={columns}
          data={filteredData}
          rowKey="id"
          expandable={true}
          onRowClick={handleViewDetails}
        />
      </div>

      {filteredData.length === 0 && (
        <div className="empty-state">
          <p>No audit records found matching your search</p>
        </div>
      )}

      {selectedDonation && (
        <div className="audit-detail-panel">
          <div className="detail-header">
            <h3>Donation Lifecycle - {selectedDonation.id}</h3>
            <button
              className="close-btn"
              onClick={() => setSelectedDonation(null)}
            >
              ✕
            </button>
          </div>

          <div className="timeline">
            {/* Donation Stage */}
            <div className="timeline-item completed">
              <div className="timeline-marker">1</div>
              <div className="timeline-content">
                <h4>Donation Created</h4>
                <p className="timestamp">{selectedDonation.donationTimestamp}</p>
                <p className="donor-info">
                  <strong>Donor:</strong> {selectedDonation.donorName}
                </p>
                <p className="resource-info">
                  <strong>Resource:</strong> {selectedDonation.resourceType} ({selectedDonation.quantity})
                </p>
                <div className="blockchain-hash">
                  <strong>Blockchain Hash:</strong>
                  <code>{selectedDonation.donationHash}</code>
                  <button className="copy-btn" title="Copy hash">📋</button>
                </div>
              </div>
            </div>

            {/* Allocation Stage */}
            <div className={`timeline-item ${selectedDonation.allocationTimestamp ? 'completed' : 'pending'}`}>
              <div className="timeline-marker">2</div>
              <div className="timeline-content">
                <h4>Allocated to Clinic</h4>
                {selectedDonation.allocationTimestamp ? (
                  <>
                    <p className="timestamp">{selectedDonation.allocationTimestamp}</p>
                    <p className="ngo-info">
                      <strong>NGO:</strong> {selectedDonation.ngoName}
                    </p>
                    <p className="clinic-info">
                      <strong>Clinic:</strong> {selectedDonation.clinicName}
                    </p>
                    <div className="blockchain-hash">
                      <strong>Blockchain Hash:</strong>
                      <code>{selectedDonation.allocationHash}</code>
                      <button className="copy-btn" title="Copy hash">📋</button>
                    </div>
                  </>
                ) : (
                  <p className="pending-status">⏳ Pending allocation</p>
                )}
              </div>
            </div>

            {/* Receipt Stage */}
            <div className={`timeline-item ${selectedDonation.receiptTimestamp ? 'completed' : 'pending'}`}>
              <div className="timeline-marker">3</div>
              <div className="timeline-content">
                <h4>Receipt Confirmed</h4>
                {selectedDonation.receiptTimestamp ? (
                  <>
                    <p className="timestamp">{selectedDonation.receiptTimestamp}</p>
                    <p className="receipt-info">
                      <strong>Status:</strong> Verified and recorded
                    </p>
                    <div className="blockchain-hash">
                      <strong>Blockchain Hash:</strong>
                      <code>{selectedDonation.receiptHash}</code>
                      <button className="copy-btn" title="Copy hash">📋</button>
                    </div>
                  </>
                ) : (
                  <p className="pending-status">⏳ Awaiting receipt confirmation</p>
                )}
              </div>
            </div>
          </div>

          <div className="audit-summary">
            <h4>Audit Summary</h4>
            <table className="summary-table">
              <tbody>
                <tr>
                  <td className="label">Total Stages:</td>
                  <td className="value">3 (Donation → Allocation → Receipt)</td>
                </tr>
                <tr>
                  <td className="label">Completed Stages:</td>
                  <td className="value">
                    {[selectedDonation.donationTimestamp, selectedDonation.allocationTimestamp, selectedDonation.receiptTimestamp].filter(Boolean).length}
                  </td>
                </tr>
                <tr>
                  <td className="label">Overall Status:</td>
                  <td className="value">
                    <StatusBadge status={selectedDonation.status} />
                  </td>
                </tr>
                <tr>
                  <td className="label">Blockchain Verified:</td>
                  <td className="value">✓ Yes - All stages immutable</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="blockchain-info">
        <h3>Blockchain Verification Details</h3>
        <ul>
          <li>Each transaction stage is recorded with a unique blockchain hash</li>
          <li>Hashes serve as cryptographic proof of authenticity and immutability</li>
          <li>Complete lifecycle tracking ensures full transparency and accountability</li>
          <li>All records are permanently stored on the distributed ledger</li>
        </ul>
      </div>
    </div>
  );
};

export default AuditTrail;
