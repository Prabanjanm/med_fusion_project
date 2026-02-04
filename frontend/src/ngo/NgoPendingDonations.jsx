import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Package, User, Calendar, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { ngoAPI } from '../services/api';
import '../styles/DashboardLayout.css';

const NgoPendingDonations = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchPendingDonations();
    }, []);

    const fetchPendingDonations = async () => {
        setLoading(true);
        try {
            // Fetch real available donations from backend
            const data = await ngoAPI.getAvailableDonations();
            // Backend returns list of donations suitable for acceptance
            // They typically have status 'AUTHORIZED' or 'CSR_APPROVED'
            setDonations(data || []);
        } catch (error) {
            console.error("Failed to fetch pending donations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (donation) => {
        if (!window.confirm(`Accept donation of ${donation.quantity} ${donation.item_name}?`)) return;

        try {
            // Call API to accept
            await ngoAPI.acceptDonation(donation.donation_id || donation.id);
            alert(`✅ Donation accepted successfully!`);
            fetchPendingDonations();
        } catch (error) {
            alert("Failed to accept donation: " + error.message);
        }
    };

    const handleReject = (donation) => {
        // Backend logic for rejection isn't explicitly in the contract for NGO.
        // It might be 'Auditor' who rejects. Or NGO can just Ignore it.
        // For UI compliance, we'll confirm rejection but if API is missing, we simulate or warn.
        setSelectedDonation(donation);
        setShowModal(true);
    };

    const confirmReject = async () => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        // Simulating Rejection if endpoint missing, or call specific endpoint if added later
        // Currently contract has no 'Reject' for NGO.
        alert("Donation marked as Ignored/Rejected locally.");
        setShowModal(false);
        setRejectReason('');
        setSelectedDonation(null);
        // Refresh or filter out locally
        setDonations(prev => prev.filter(d => d.donation_id !== selectedDonation.donation_id));
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
                                key={donation.donation_id || donation.id}
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
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>ID: {donation.donation_id || donation.id}</p>
                                    </div>
                                    <StatusBadge status={donation.status} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <User size={16} color="#64748b" />
                                            <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Company</span>
                                        </div>
                                        <p style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>{donation.company_name || 'CSR Partner'}</p>
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
                                            {donation.created_at ? new Date(donation.created_at).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {donation.purpose && (
                                    <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Purpose</p>
                                        <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{donation.purpose}</p>
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
                                    >
                                        <CheckCircle size={18} />
                                        Request Donation
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* Reject Modal exists but not fully wired to backend since endpoint missing */}
                {showModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                        <div style={{ background: '#1e293b', padding: '2rem', borderRadius: '1rem', width: '400px' }}>
                            <h3 style={{ color: 'white', marginTop: 0 }}>Reject Donation (Local)</h3>
                            <p style={{ color: '#94a3b8' }}>Reason:</p>
                            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ width: '100%', minHeight: '100px', background: '#334155', color: 'white', borderRadius: '8px' }}></textarea>
                            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button onClick={() => setShowModal(false)}>Cancel</button>
                                <button onClick={confirmReject} style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>Confirm</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default NgoPendingDonations;
