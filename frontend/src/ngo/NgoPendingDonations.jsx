import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Package, User, Calendar, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import '../styles/DashboardLayout.css';

// Mock data storage helpers
const MOCK_DONATIONS_KEY = 'csr_tracker_mock_donations';

const getMockDonations = () => {
    try {
        const stored = localStorage.getItem(MOCK_DONATIONS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        return [];
    }
};

const updateDonationStatus = (donationId, updates) => {
    try {
        const donations = getMockDonations();
        const updatedDonations = donations.map(d =>
            d.id === donationId ? { ...d, ...updates } : d
        );
        localStorage.setItem(MOCK_DONATIONS_KEY, JSON.stringify(updatedDonations));
        return true;
    } catch (error) {
        console.error('Error updating donation:', error);
        return false;
    }
};

const NgoPendingDonations = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchPendingDonations();
    }, []);

    const fetchPendingDonations = () => {
        setLoading(true);
        const allDonations = getMockDonations();
        // Filter for pending donations only
        const pending = allDonations.filter(d => d.status === 'PENDING');
        setDonations(pending);
        setLoading(false);
    };

    const handleAccept = (donation) => {
        const success = updateDonationStatus(donation.id, {
            status: 'ACCEPTED',
            ngo_accepted_at: new Date().toISOString(),
            ngo_status: 'accepted',
            ngo_verified: true
        });

        if (success) {
            alert(`✅ Donation ${donation.id} accepted successfully!`);
            fetchPendingDonations();
        }
    };

    const handleReject = (donation) => {
        setSelectedDonation(donation);
        setShowModal(true);
    };

    const confirmReject = () => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        const success = updateDonationStatus(selectedDonation.id, {
            status: 'REJECTED',
            ngo_rejected_at: new Date().toISOString(),
            ngo_status: 'rejected',
            rejection_reason: rejectReason,
            ngo_verified: false
        });

        if (success) {
            alert(`❌ Donation ${selectedDonation.id} rejected`);
            setShowModal(false);
            setRejectReason('');
            setSelectedDonation(null);
            fetchPendingDonations();
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Pending Donations</h1>
                        <p className="page-subtitle">
                            {loading ? 'Loading...' : `${donations.length} donation${donations.length !== 1 ? 's' : ''} awaiting verification`}
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: '#94a3b8' }}>Loading pending donations...</p>
                    </div>
                ) : donations.length === 0 ? (
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.4)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '24px',
                        padding: '3rem',
                        textAlign: 'center'
                    }}>
                        <Package size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Pending Donations</h3>
                        <p style={{ color: '#94a3b8' }}>All donations have been processed</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {donations.map(donation => (
                            <div
                                key={donation.id}
                                style={{
                                    background: 'rgba(15, 23, 42, 0.4)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '24px',
                                    padding: '2rem',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
                                            {donation.item_name}
                                        </h3>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{donation.id}</p>
                                    </div>
                                    <StatusBadge status={donation.status} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <User size={16} color="#64748b" />
                                            <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Donor</span>
                                        </div>
                                        <p style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>{donation.donor_name || 'CSR Partner'}</p>
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <Package size={16} color="#64748b" />
                                            <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Quantity</span>
                                        </div>
                                        <p style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>{donation.quantity?.toLocaleString()}</p>
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <Calendar size={16} color="#64748b" />
                                            <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Created</span>
                                        </div>
                                        <p style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>
                                            {new Date(donation.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {donation.purpose && (
                                    <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Purpose</p>
                                        <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{donation.purpose}</p>
                                    </div>
                                )}

                                {donation.supportingDocument && (
                                    <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '12px' }}>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Supporting Document</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Package size={16} color="#3b82f6" />
                                            <p style={{ color: '#3b82f6', margin: 0 }}>{donation.supportingDocument.name || 'Document attached'}</p>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => handleReject(donation)}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                            borderRadius: '12px',
                                            padding: '0.75rem 1.5rem',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.95rem',
                                            fontWeight: 600,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <XCircle size={18} />
                                        Reject
                                    </button>

                                    <button
                                        onClick={() => handleAccept(donation)}
                                        style={{
                                            background: 'rgba(16, 185, 129, 0.1)',
                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                            borderRadius: '12px',
                                            padding: '0.75rem 1.5rem',
                                            color: '#10b981',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.95rem',
                                            fontWeight: 600,
                                            transition: 'all 0.2s',
                                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.1)'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)';
                                            e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.2)';
                                            e.currentTarget.style.borderColor = '#10b981';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                                            e.currentTarget.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.1)';
                                            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                                        }}
                                    >
                                        <CheckCircle size={18} />
                                        Verify & Accept
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reject Modal */}
                {showModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '2rem'
                    }}>
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px',
                            padding: '2rem',
                            maxWidth: '500px',
                            width: '100%'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <AlertCircle size={24} color="#ef4444" />
                                </div>
                                <div>
                                    <h3 style={{ color: '#fff', margin: 0 }}>Reject Donation</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>{selectedDonation?.id}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    Reason for Rejection *
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Please provide a detailed reason..."
                                    style={{
                                        width: '100%',
                                        minHeight: '120px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        color: '#fff',
                                        fontSize: '0.95rem',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setRejectReason('');
                                        setSelectedDonation(null);
                                    }}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '0.75rem 1.5rem',
                                        color: '#94a3b8',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem',
                                        fontWeight: 600
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmReject}
                                    style={{
                                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '0.75rem 1.5rem',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem',
                                        fontWeight: 600
                                    }}
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default NgoPendingDonations;
