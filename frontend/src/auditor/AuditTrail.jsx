import React, { useState } from 'react';
import { Search, Filter, Download, Shield } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import Table from '../components/Table';
import '../styles/DashboardLayout.css';
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
    // Export logic
    alert('Exporting Audit Trail...');
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
    <Layout>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Shield size={32} className="text-cyan" />
          <div>
            <h1 className="page-title">Audit Trail</h1>
            <p className="page-subtitle">Complete blockchain-verified donation lifecycle</p>
          </div>
        </div>
      </div>

      {/* Blockchain Demo Disclaimer */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
        border: '2px solid rgba(251, 191, 36, 0.4)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          background: 'rgba(251, 191, 36, 0.2)',
          borderRadius: '50%',
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Shield size={24} color="#fbbf24" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#fcd34d', fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>
            🔬 Demo Mode: Simulated Blockchain Integration
          </h3>
          <p style={{ color: '#fde68a', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
            All blockchain transaction hashes displayed below are <strong>simulated for demonstration purposes</strong>.
            This represents the planned future enhancement where all CSR transactions will be immutably recorded on a distributed ledger for complete transparency and auditability.
          </p>
        </div>
      </div>

      <div className="table-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button className="btn-logout" style={{ border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={handleExportAudit}>
            <Download size={18} />
            <span>Export</span>
          </button>
        </div>

        <Table
          columns={columns}
          data={filteredData}
          rowKey="id"
          onRowClick={handleViewDetails}
        />

        {filteredData.length === 0 && (
          <div className="empty-state">
            <p>No audit records found.</p>
          </div>
        )}
      </div>

      {selectedDonation && (
        <div className="form-card" style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <h3 className="form-section-title" style={{ margin: 0 }}>Lifecycle Details: {selectedDonation.id}</h3>
            <button className="btn-cancel" onClick={() => setSelectedDonation(null)}>Close X</button>
          </div>

          <div className="timeline">
            {/* Donation Stage */}
            <div className="timeline-item completed">
              <div className="timeline-marker">1</div>
              <div className="timeline-content">
                <h4>Donation Created</h4>
                <p className="timestamp">{selectedDonation.donationTimestamp}</p>
                <div className="blockchain-hash" style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                  <strong style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Simulated Blockchain Hash:</strong>
                  <code style={{ display: 'block', overflowWrap: 'break-word', color: 'var(--accent-cyan)' }}>{selectedDonation.donationHash}</code>
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
                    <div className="blockchain-hash" style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                      <strong style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Simulated Blockchain Hash:</strong>
                      <code style={{ display: 'block', overflowWrap: 'break-word', color: 'var(--accent-cyan)' }}>{selectedDonation.allocationHash}</code>
                    </div>
                  </>
                ) : <p className="text-muted">Pending Allocation</p>}
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
                    <div className="blockchain-hash" style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                      <strong style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Simulated Blockchain Hash:</strong>
                      <code style={{ display: 'block', overflowWrap: 'break-word', color: 'var(--accent-cyan)' }}>{selectedDonation.receiptHash}</code>
                    </div>
                  </>
                ) : <p className="text-muted">Pending Receipt</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: 'rgba(0, 229, 255, 0.05)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>Blockchain Verification Details</h3>
        <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', paddingLeft: '1.5rem' }}>
          <li>Each transaction stage is recorded with a unique blockchain hash</li>
          <li>Hashes serve as cryptographic proof of authenticity and immutability</li>
          <li>Complete lifecycle tracking ensures full transparency and accountability</li>
        </ul>
      </div>
    </Layout>
  );
};

export default AuditTrail;
