import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import '../styles/DashboardLayout.css';

const CLINIC_REQUESTS_KEY = 'csr_tracker_clinic_requests';

const ClinicRequestStatus = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, approved, denied

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = () => {
        setLoading(true);
        try {
            const allRequests = JSON.parse(localStorage.getItem(CLINIC_REQUESTS_KEY) || '[]');
            // Filter by clinic name
            const clinicRequests = allRequests.filter(r => r.clinic_name === user?.companyName);
            setRequests(clinicRequests);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        if (filter === 'pending') return req.status === 'PENDING';
        if (filter === 'approved') return req.status === 'APPROVED';
        if (filter === 'denied') return req.status === 'DENIED';
        return true;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return '#10b981';
            case 'DENIED': return '#ef4444';
            case 'PENDING': return '#f59e0b';
            default: return '#64748b';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle size={20} />;
            case 'DENIED': return <XCircle size={20} />;
            case 'PENDING': return <Clock size={20} />;
            default: return <Package size={20} />;
        }
    };

    const getPriorityColor = (priority) => {
        return priority === 'emergency' ? '#ef4444' : '#10b981';
    };

    return (
        <Layout>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">My Request Status</h1>
                        <p className="page-subtitle">
                            {loading ? 'Loading...' : `${requests.length} request${requests.length !== 1 ? 's' : ''} submitted`}
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    paddingBottom: '1rem'
                }}>
                    {[
                        { value: 'all', label: 'All Requests' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'approved', label: 'Approved' },
                        { value: 'denied', label: 'Denied' }
                    ].map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setFilter(tab.value)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: filter === tab.value ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                border: filter === tab.value ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: filter === tab.value ? '#3b82f6' : '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Requests List */}
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: '#94a3b8' }}>Loading your requests...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.4)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '24px',
                        padding: '3rem',
                        textAlign: 'center'
                    }}>
                        <Package size={48} color="#64748b" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Requests Found</h3>
                        <p style={{ color: '#94a3b8' }}>
                            {filter === 'all'
                                ? 'You haven\'t submitted any requests yet'
                                : `No ${filter} requests`}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {filteredRequests.map(request => (
                            <div
                                key={request.id}
                                style={{
                                    background: 'rgba(15, 23, 42, 0.4)',
                                    backdropFilter: 'blur(20px)',
                                    border: request.status === 'APPROVED'
                                        ? '2px solid rgba(16, 185, 129, 0.3)'
                                        : request.status === 'DENIED'
                                            ? '2px solid rgba(239, 68, 68, 0.3)'
                                            : '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '24px',
                                    padding: '2rem'
                                }}
                            >
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
                                            Request #{request.id}
                                        </h3>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                            Submitted: {new Date(request.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                        {/* Priority Badge */}
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
                                            {request.priority === 'emergency' ? 'EMERGENCY' : 'Not Urgent'}
                                        </div>
                                        {/* Status Badge */}
                                        <div style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '20px',
                                            background: `rgba(${getStatusColor(request.status)}, 0.1)`,
                                            border: `1px solid ${getStatusColor(request.status)}`,
                                            color: getStatusColor(request.status),
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            {getStatusIcon(request.status)}
                                            {request.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Requested Items */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
                                        Requested Items
                                    </h4>
                                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                                        {request.items.map((item, idx) => (
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
                                                        Requested: {item.requested_quantity.toLocaleString()} units
                                                    </p>
                                                </div>
                                                {request.status === 'APPROVED' && item.allocated_quantity !== undefined && (
                                                    <div style={{
                                                        padding: '0.5rem 1rem',
                                                        background: 'rgba(16, 185, 129, 0.1)',
                                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <p style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>
                                                            Approved: {item.allocated_quantity.toLocaleString()} units
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Purpose */}
                                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Purpose</p>
                                    <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{request.purpose}</p>
                                </div>

                                {/* Status-specific Messages */}
                                {request.status === 'PENDING' && (
                                    <div style={{
                                        padding: '1rem',
                                        background: 'rgba(245, 158, 11, 0.05)',
                                        border: '1px solid rgba(245, 158, 11, 0.2)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}>
                                        <Clock size={24} color="#f59e0b" />
                                        <div>
                                            <p style={{ color: '#f59e0b', fontWeight: 600, margin: 0, marginBottom: '0.25rem' }}>
                                                Under Review
                                            </p>
                                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
                                                NGO is reviewing your request. You'll be notified once processed.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {request.status === 'APPROVED' && (
                                    <div style={{
                                        padding: '1rem',
                                        background: 'rgba(16, 185, 129, 0.05)',
                                        border: '1px solid rgba(16, 185, 129, 0.2)',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}>
                                        <CheckCircle size={24} color="#10b981" />
                                        <div>
                                            <p style={{ color: '#10b981', fontWeight: 600, margin: 0, marginBottom: '0.25rem' }}>
                                                Request Approved!
                                            </p>
                                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
                                                Approved on {new Date(request.approved_at).toLocaleDateString()}. Products will be delivered soon.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {request.status === 'DENIED' && (
                                    <div style={{
                                        padding: '1rem',
                                        background: 'rgba(239, 68, 68, 0.05)',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        borderRadius: '12px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                            <XCircle size={24} color="#ef4444" />
                                            <div>
                                                <p style={{ color: '#ef4444', fontWeight: 600, margin: 0 }}>
                                                    Request Denied
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ paddingLeft: '2.5rem' }}>
                                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Reason:</p>
                                            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{request.denial_reason || 'No reason provided'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ClinicRequestStatus;
