import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Package, CheckCircle, XCircle, AlertTriangle, FileText, Download } from 'lucide-react';
import Layout from '../components/Layout';
import { ngoAPI } from '../services/api'; // Import API
import '../styles/DashboardLayout.css';

const NgoClinicRequests = () => {
    const [requests, setRequests] = useState([]);
    const [availableDonations, setAvailableDonations] = useState([]); // List of specific donation records
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('approve'); // 'approve' or 'deny'
    const [selectedDonationIds, setSelectedDonationIds] = useState([]); // Now an array for multi-batch
    const [denialReason, setDenialReason] = useState('');
    const { state } = useLocation();
    const filterClinicId = state?.clinicId;
    const filterClinicName = state?.clinicName;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Maxwell: Use Real API calls
            const [dashboardData, donations] = await Promise.all([
                ngoAPI.getDashboardData(),
                ngoAPI.getAvailableDonations()
            ]);

            // Clinic Requirements from Dashboard Data
            let requirements = dashboardData.clinic_requirements || [];

            // Filter by navigation state if provided
            if (filterClinicId) {
                requirements = requirements.filter(r => r.clinic_id === filterClinicId);
            }

            // Filter only pending if backend returns all history
            setRequests(requirements.filter(r =>
                r.status === 'PENDING' ||
                r.status === 'CLINIC_REQUESTED' ||
                r.status === 'NGO_APPROVED' ||
                r.status === 'PARTIALLY_ALLOCATED'
            ));

            // Accepted Donations (Inventory)
            // Note: getAvailableDonations might return 'AUTHORIZED' (available to request) 
            // We need 'ACCEPTED' donations (Inventory) to allocate.
            // But Contract doesn't specify an endpoint for Inventory. 
            // Prompt says: "Step 4: Approved CSR donation appears in NGO inventory"
            // We will assume 'getAvailableDonations' returns ALL, and we filter by 'ACCEPTED'.
            // OR we use the 'accepted_donations' from dashboardData if available.
            const accepted = dashboardData.accepted_donations || [];

            // Fallback: Check if donations list has accepted ones
            // 🛡️ Extra check: Ensure we only show 'ACCEPTED' items in inventory
            const inventory = (accepted.length > 0 ? accepted : (donations || [])).filter(d => d.status === 'ACCEPTED');

            setAvailableDonations(inventory);

        } catch (error) {
            console.error("Failed to fetch NGO data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (request) => {
        setSelectedRequest(request);
        setModalType('approve');
        setSelectedDonationIds([]);
        setShowModal(true);
    };

    const handleDeny = (request) => {
        setSelectedRequest(request);
        setModalType('deny');
        setDenialReason('');
        setShowModal(true);
    };

    const getMatchingDonations = (productType) => {
        // Simple case-insensitive match
        return availableDonations.filter(d =>
            d.item_name.toLowerCase().includes(productType.toLowerCase()) ||
            productType.toLowerCase().includes(d.item_name.toLowerCase())
        );
    };

    const toggleDonationSelection = (id) => {
        setSelectedDonationIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const selectedTotal = availableDonations
        .filter(d => selectedDonationIds.includes(d.donation_id))
        .reduce((sum, d) => sum + d.quantity, 0);

    const confirmApprove = async () => {
        if (selectedDonationIds.length === 0) {
            alert('Please select at least one donation batch to allocate');
            return;
        }

        try {
            // Sequential allocation of all selected batches
            for (const donationId of selectedDonationIds) {
                await ngoAPI.allocate(donationId, selectedRequest.id);
            }

            alert(`✅ Allocation in progress! ${selectedDonationIds.length} batches linked to Audit.`);
            setShowModal(false);
            setSelectedRequest(null);
            fetchData(); // Refresh list
        } catch (error) {
            alert("Allocation Failed: " + error.message);
        }
    };

    const confirmDeny = async () => {
        if (!denialReason.trim()) {
            alert('Please provide a reason for denial');
            return;
        }
        // Backend for Deny is not strict in Contract (AllocationCreate only allows allocation).
        // If no endpoint exists, we can't 'Deny' via API officially. 
        // We will alert user or just skip API for safety if backend doesn't support it.
        // But Prompt says "NGO reviews... Allocates". Rejection might be implicit (ignore).
        // We'll simulate success for UI or strictly call an endpoint if we found one.
        alert('Request Rejected locally (Backend update pending implementation)');

        setShowModal(false);
        setSelectedRequest(null);
        setDenialReason('');
        // Ensure UI updates
        setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 1: return 'CRITICAL';
            case 2: return 'HIGH';
            case 3: return 'MEDIUM';
            case 4: return 'ROUTINE';
            default: return 'NORMAL';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 1: return '#ef4444';
            case 2: return '#f59e0b';
            case 3: return '#3b82f6';
            default: return '#10b981';
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">
                            {filterClinicName ? `Requirements: ${filterClinicName}` : 'Clinic Requests'}
                        </h1>
                        <p className="page-subtitle">
                            {loading ? 'Loading...' : `${requests.length} pending request${requests.length !== 1 ? 's' : ''}`}
                            {filterClinicName && ' for this clinic'}
                        </p>
                    </div>
                    {filterClinicName && (
                        <button
                            onClick={() => window.history.replaceState({}, document.title)} // Clear state
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            Show All Clinics
                        </button>
                    )}
                </div>

                {/* Requests List */}
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: '#94a3b8' }}>Loading requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.4)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '24px',
                        padding: '3rem',
                        textAlign: 'center'
                    }}>
                        <Package size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Pending Requests</h3>
                        <p style={{ color: '#94a3b8' }}>All clinic requests have been processed</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {requests.map(request => (
                            <div
                                key={request.id}
                                style={{
                                    background: 'rgba(15, 23, 42, 0.4)',
                                    backdropFilter: 'blur(20px)',
                                    border: request.priority === 1 ? '2px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '24px',
                                    padding: '2rem'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
                                            {request.item_name}
                                        </h3>
                                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                            Clinic: <strong style={{ color: '#00e5ff' }}>{request.clinic_name || 'Clinic ' + request.clinic_id}</strong> <br />
                                            Required: {request.quantity} units
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        background: `rgba(${request.priority === 1 ? '239, 68, 68' : '16, 185, 129'}, 0.1)`,
                                        border: `1px solid ${getPriorityColor(request.priority)}`,
                                        color: getPriorityColor(request.priority),
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        {request.priority === 1 && <AlertTriangle size={14} />}
                                        {getPriorityLabel(request.priority)}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Purpose</p>
                                    <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{request.purpose}</p>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    {request.status !== 'NGO_APPROVED' && (
                                        <button
                                            onClick={() => handleDeny(request)}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '12px',
                                                padding: '0.75rem 1.5rem',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '0.5rem'
                                            }}
                                        >
                                            <XCircle size={18} /> Deny
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleApprove(request)}
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '0.75rem 1.5rem',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        <CheckCircle size={18} /> Allocate Stock
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Allocation Modal */}
                {showModal && selectedRequest && modalType === 'approve' && (
                    <div style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                    }}>
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px', padding: '2rem',
                            maxWidth: '600px', width: '100%'
                        }}>
                            <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Select Donation Source</h3>
                            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                                Fulfilling request for <strong>{selectedRequest.clinic_name}</strong>: <br />
                                Need <strong>{selectedRequest.quantity} {selectedRequest.item_name}</strong>.
                            </p>

                            {getMatchingDonations(selectedRequest.item_name).length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                    <XCircle size={48} color="#ef4444" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                    <p style={{ color: '#ef4444', margin: 0 }}>No inventory found for {selectedRequest.item_name}.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                    {getMatchingDonations(selectedRequest.item_name).map(donation => {
                                        const isSelected = selectedDonationIds.includes(donation.donation_id);
                                        return (
                                            <div
                                                key={donation.donation_id}
                                                onClick={() => toggleDonationSelection(donation.donation_id)}
                                                style={{
                                                    padding: '1rem',
                                                    background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                                                    border: isSelected ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ color: '#fff', fontWeight: 'bold' }}>{donation.company_name}</div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Batch ID: {donation.donation_id}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ color: isSelected ? '#10b981' : '#94a3b8', fontSize: '1.2rem', fontWeight: 'bold' }}>{donation.quantity}</div>
                                                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Available</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                padding: '1rem', borderRadius: '12px',
                                marginBottom: '2rem', display: 'flex',
                                justifyContent: 'space-between', alignItems: 'center',
                                border: `1px solid ${selectedTotal >= selectedRequest.quantity ? '#10b981' : 'rgba(16, 185, 129, 0.2)'}`
                            }}>
                                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Total Selected:</span>
                                <span style={{ color: selectedTotal >= selectedRequest.quantity ? '#10b981' : '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    {selectedTotal} / {selectedRequest.quantity}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowModal(false)} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px' }}>Cannot Fulfill</button>
                                <button
                                    onClick={confirmApprove}
                                    disabled={selectedDonationIds.length === 0}
                                    style={{
                                        background: selectedDonationIds.length > 0 ? '#10b981' : '#64748b',
                                        padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', color: '#fff', cursor: selectedDonationIds.length > 0 ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    Confirm {selectedDonationIds.length > 1 ? `Multi-Batch` : ''} Allocation
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default NgoClinicRequests;
