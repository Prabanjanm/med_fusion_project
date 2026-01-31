import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, AlertTriangle, FileText, Download } from 'lucide-react';
import Layout from '../components/Layout';
import '../styles/DashboardLayout.css';

const CLINIC_REQUESTS_KEY = 'csr_tracker_clinic_requests';
const MOCK_DONATIONS_KEY = 'csr_tracker_mock_donations';

const getClinicRequests = () => {
    try {
        return JSON.parse(localStorage.getItem(CLINIC_REQUESTS_KEY) || '[]');
    } catch (error) {
        return [];
    }
};

const getMockDonations = () => {
    try {
        return JSON.parse(localStorage.getItem(MOCK_DONATIONS_KEY) || '[]');
    } catch (error) {
        return [];
    }
};

const updateRequest = (requestId, updates) => {
    try {
        const requests = getClinicRequests();
        const updated = requests.map(r => r.id === requestId ? { ...r, ...updates } : r);
        localStorage.setItem(CLINIC_REQUESTS_KEY, JSON.stringify(updated));
        return true;
    } catch (error) {
        return false;
    }
};

const NgoClinicRequests = () => {
    const [requests, setRequests] = useState([]);
    const [availableStock, setAvailableStock] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('approve'); // 'approve' or 'deny'
    const [allocations, setAllocations] = useState({});
    const [denialReason, setDenialReason] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);

        // Get pending clinic requests
        const allRequests = getClinicRequests();
        const pending = allRequests.filter(r => r.status === 'PENDING');
        setRequests(pending);

        // Calculate available stock from accepted donations
        const donations = getMockDonations();
        const accepted = donations.filter(d => d.status === 'ACCEPTED');

        const stock = {};
        accepted.forEach(d => {
            const itemName = d.item_name;
            stock[itemName] = (stock[itemName] || 0) + (d.quantity || 0);
        });

        setAvailableStock(stock);
        setLoading(false);
    };

    const handleApprove = (request) => {
        setSelectedRequest(request);
        setModalType('approve');

        // Initialize allocations with requested quantities (capped by available stock)
        const initialAllocations = {};
        request.items.forEach(item => {
            const available = availableStock[item.product_type] || 0;
            initialAllocations[item.product_type] = Math.min(item.requested_quantity, available);
        });
        setAllocations(initialAllocations);
        setShowModal(true);
    };

    const handleDeny = (request) => {
        setSelectedRequest(request);
        setModalType('deny');
        setDenialReason('');
        setShowModal(true);
    };

    const confirmApprove = () => {
        // Validate allocations
        const hasInvalidQty = Object.entries(allocations).some(([item, qty]) => {
            const available = availableStock[item] || 0;
            return qty <= 0 || qty > available;
        });

        if (hasInvalidQty) {
            alert('Please enter valid quantities within available stock');
            return;
        }

        const approvedItems = selectedRequest.items.map(item => ({
            ...item,
            allocated_quantity: allocations[item.product_type] || 0
        }));

        const success = updateRequest(selectedRequest.id, {
            status: 'APPROVED',
            ngo_status: 'approved',
            approved_at: new Date().toISOString(),
            approved_items: approvedItems
        });

        if (success) {
            alert(`✅ Request approved for ${selectedRequest.clinic_name}`);
            setShowModal(false);
            setSelectedRequest(null);
            setAllocations({});
            fetchData();
        }
    };

    const confirmDeny = () => {
        if (!denialReason.trim()) {
            alert('Please provide a reason for denial');
            return;
        }

        const success = updateRequest(selectedRequest.id, {
            status: 'DENIED',
            ngo_status: 'denied',
            denied_at: new Date().toISOString(),
            denial_reason: denialReason
        });

        if (success) {
            alert(`❌ Request denied`);
            setShowModal(false);
            setSelectedRequest(null);
            setDenialReason('');
            fetchData();
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'emergency': return '#ef4444';
            case 'not_urgent': return '#10b981';
            default: return '#64748b';
        }
    };

    const getPriorityLabel = (priority) => {
        switch (priority) {
            case 'emergency': return 'EMERGENCY';
            case 'not_urgent': return 'Not Urgent';
            default: return priority;
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">Clinic Requests</h1>
                        <p className="page-subtitle">
                            {loading ? 'Loading...' : `${requests.length} pending request${requests.length !== 1 ? 's' : ''}`}
                        </p>
                    </div>
                </div>

                {/* Available Stock Summary */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.1rem' }}>Available Stock</h3>
                    {Object.keys(availableStock).length === 0 ? (
                        <p style={{ color: '#64748b' }}>No stock available. Accept donations first.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {Object.entries(availableStock).map(([item, qty]) => (
                                <div key={item} style={{
                                    padding: '1rem',
                                    background: 'rgba(16, 185, 129, 0.05)',
                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                    borderRadius: '12px'
                                }}>
                                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{item}</p>
                                    <p style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: 700 }}>{qty.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
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
                                    border: request.priority === 'emergency' ? '2px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '24px',
                                    padding: '2rem'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
                                            {request.clinic_name}
                                        </h3>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{request.id}</p>
                                    </div>
                                    <div style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        background: `rgba(${request.priority === 'emergency' ? '239, 68, 68' : '16, 185, 129'}, 0.1)`,
                                        border: `1px solid ${getPriorityColor(request.priority)}`,
                                        color: getPriorityColor(request.priority),
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        {request.priority === 'emergency' && <AlertTriangle size={14} />}
                                        {getPriorityLabel(request.priority)}
                                    </div>
                                </div>

                                {/* Requested Items */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
                                        Requested Items
                                    </h4>
                                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                                        {request.items.map((item, idx) => {
                                            const available = availableStock[item.product_type] || 0;
                                            const canFulfill = available >= item.requested_quantity;

                                            return (
                                                <div key={idx} style={{
                                                    padding: '1rem',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div>
                                                        <p style={{ color: '#fff', fontWeight: 600, marginBottom: '0.25rem' }}>{item.product_type}</p>
                                                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                                            Requested: {item.requested_quantity.toLocaleString()} |
                                                            Available: <span style={{ color: canFulfill ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                                                {available.toLocaleString()}
                                                            </span>
                                                        </p>
                                                    </div>
                                                    {!canFulfill && (
                                                        <div style={{
                                                            padding: '0.5rem 1rem',
                                                            background: 'rgba(239, 68, 68, 0.1)',
                                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                                            borderRadius: '8px',
                                                            color: '#ef4444',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 600
                                                        }}>
                                                            Insufficient Stock
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Emergency Details */}
                                {request.priority === 'emergency' && (
                                    <div style={{
                                        marginBottom: '1.5rem',
                                        padding: '1.5rem',
                                        background: 'rgba(239, 68, 68, 0.05)',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        borderRadius: '12px'
                                    }}>
                                        <h4 style={{ color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <AlertTriangle size={18} />
                                            Emergency Details
                                        </h4>
                                        <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: '1rem' }}>
                                            {request.emergency_reason}
                                        </p>
                                        {request.emergency_document && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                padding: '1rem',
                                                background: 'rgba(255,255,255,0.02)',
                                                borderRadius: '8px'
                                            }}>
                                                <FileText size={24} color="#3b82f6" />
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ color: '#fff', margin: 0, fontWeight: 600 }}>{request.emergency_document.name}</p>
                                                    <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>
                                                        {(request.emergency_document.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                                <button
                                                    style={{
                                                        background: 'rgba(59, 130, 246, 0.1)',
                                                        border: '1px solid rgba(59, 130, 246, 0.3)',
                                                        borderRadius: '8px',
                                                        padding: '0.5rem 1rem',
                                                        color: '#3b82f6',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    <Download size={16} />
                                                    View
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Purpose */}
                                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Purpose</p>
                                    <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{request.purpose}</p>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => handleDeny(request)}
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
                                            fontWeight: 600
                                        }}
                                    >
                                        <XCircle size={18} />
                                        Deny Request
                                    </button>

                                    <button
                                        onClick={() => handleApprove(request)}
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '0.75rem 1.5rem',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.95rem',
                                            fontWeight: 600,
                                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                                        }}
                                    >
                                        <CheckCircle size={18} />
                                        Approve & Allocate
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Approve/Deny Modal */}
                {showModal && selectedRequest && (
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
                            maxWidth: '600px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflowY: 'auto'
                        }}>
                            {modalType === 'approve' ? (
                                <>
                                    <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Approve Request & Allocate Quantities</h3>
                                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                                        Set the quantity to allocate for each requested item
                                    </p>

                                    <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                                        {selectedRequest.items.map((item, idx) => {
                                            const available = availableStock[item.product_type] || 0;
                                            return (
                                                <div key={idx} style={{
                                                    padding: '1rem',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    borderRadius: '12px'
                                                }}>
                                                    <p style={{ color: '#fff', fontWeight: 600, marginBottom: '0.5rem' }}>{item.product_type}</p>
                                                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                                        Requested: {item.requested_quantity} | Available: {available}
                                                    </p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Allocate:</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={available}
                                                            value={allocations[item.product_type] || 0}
                                                            onChange={(e) => setAllocations({
                                                                ...allocations,
                                                                [item.product_type]: parseInt(e.target.value) || 0
                                                            })}
                                                            style={{
                                                                flex: 1,
                                                                padding: '0.75rem',
                                                                background: 'rgba(255,255,255,0.05)',
                                                                border: '1px solid rgba(255,255,255,0.1)',
                                                                borderRadius: '8px',
                                                                color: '#fff',
                                                                fontSize: '1rem'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => {
                                                setShowModal(false);
                                                setSelectedRequest(null);
                                                setAllocations({});
                                            }}
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
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
                                            onClick={confirmApprove}
                                            style={{
                                                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: '0.75rem 1.5rem',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                fontSize: '0.95rem',
                                                fontWeight: 600
                                            }}
                                        >
                                            Confirm Approval
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Deny Request</h3>
                                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                                        Please provide a reason for denying this request
                                    </p>

                                    <textarea
                                        value={denialReason}
                                        onChange={(e) => setDenialReason(e.target.value)}
                                        placeholder="Enter denial reason..."
                                        style={{
                                            width: '100%',
                                            minHeight: '120px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            padding: '1rem',
                                            color: '#fff',
                                            fontSize: '0.95rem',
                                            resize: 'vertical',
                                            marginBottom: '1.5rem'
                                        }}
                                    />

                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => {
                                                setShowModal(false);
                                                setSelectedRequest(null);
                                                setDenialReason('');
                                            }}
                                            style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
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
                                            onClick={confirmDeny}
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
                                            Confirm Denial
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default NgoClinicRequests;
