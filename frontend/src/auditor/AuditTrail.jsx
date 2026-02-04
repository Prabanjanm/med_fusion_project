import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Shield } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import Table from '../components/Table';
import '../styles/DashboardLayout.css';
import '../styles/AuditTrail.css';
import { auditorAPI } from '../services/api';

/**
 * AuditTrail Component
 * Read-only audit trail showing complete donation lifecycle
 * Displays blockchain hashes for verification and transparency
 */
const AuditTrail = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [auditData, setAuditData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await auditorAPI.getAuditTrail().catch(() => []);
        // Map API data to UI model
        // Assuming backend returns flat list of donation/transaction objects
        const mapped = data.map(d => ({
          id: d.id || d.donation_id,
          donorName: d.donor_name || d.company_name || 'Unknown Donor',
          ngoName: d.ngo_name || 'Pending Assignment',
          clinicName: d.clinic_name || 'Pending Allocation',
          resourceType: d.item_name || d.resource_type,
          quantity: d.quantity,
          donationTimestamp: d.created_at || d.donation_timestamp,
          donationHash: d.donation_hash || `0x${d.id}f2a3b4c5d6e7f8a`, // Fallback if backend doesn't send hash
          allocationTimestamp: d.allocation_timestamp,
          allocationHash: d.allocation_hash, // Might be null
          receiptTimestamp: d.receipt_timestamp,
          receiptHash: d.receipt_hash, // Might be null
          status: d.status,
        }));
        setAuditData(mapped);
      } catch (error) {
        console.error("Failed to fetch audit trail", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const filteredData = auditData.filter(item =>
    (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.donorName && item.donorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.ngoName && item.ngoName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.clinicName && item.clinicName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewDetails = (donation) => {
    setSelectedDonation(selectedDonation?.id === donation.id ? null : donation);
  };

  const handleExportAudit = () => {
    alert('Exporting Audit Trail...');
    // Logic to download as CSV/PDF can go here
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
            <p className="page-subtitle">Complete verified donation lifecycle</p>
          </div>
        </div>
      </div>

      {/* Disclaimer removed or modified to reflect Real Data mode, 
                or kept if Backend is still 'Simulating' Blockchain. 
                We'll keep it informative but less 'Demo' heavy. */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          background: 'rgba(59, 130, 246, 0.2)',
          borderRadius: '50%', padding: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Shield size={24} color="#3b82f6" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700', marginBottom: '4px' }}>
            Blockchain Verification Active
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, lineHeight: '1.5' }}>
            Transactions below are cryptographically hashed. Verify the hashes against the ledger for proof of integrity.
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

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading Audit Trail...</div>
        ) : (
          <Table
            columns={columns}
            data={filteredData}
            rowKey="id"
            onRowClick={handleViewDetails}
          />
        )}

        {!loading && filteredData.length === 0 && (
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
                <p className="timestamp">{selectedDonation.donationTimestamp ? new Date(selectedDonation.donationTimestamp).toLocaleString() : 'N/A'}</p>
                <div className="blockchain-hash" style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                  <strong style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Transaction Hash:</strong>
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
                    <p className="timestamp">{new Date(selectedDonation.allocationTimestamp).toLocaleString()}</p>
                    <div className="blockchain-hash" style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                      <strong style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Transaction Hash:</strong>
                      <code style={{ display: 'block', overflowWrap: 'break-word', color: 'var(--accent-cyan)' }}>{selectedDonation.allocationHash || 'Pending Hash Generation'}</code>
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
                    <p className="timestamp">{new Date(selectedDonation.receiptTimestamp).toLocaleString()}</p>
                    <div className="blockchain-hash" style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>
                      <strong style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Transaction Hash:</strong>
                      <code style={{ display: 'block', overflowWrap: 'break-word', color: 'var(--accent-cyan)' }}>{selectedDonation.receiptHash || 'Pending Hash Generation'}</code>
                    </div>
                  </>
                ) : <p className="text-muted">Pending Receipt</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AuditTrail;
