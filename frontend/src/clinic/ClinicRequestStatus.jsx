import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { clinicAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import '../styles/DashboardLayout.css';

const ClinicRequestStatus = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await clinicAPI.getRequests();
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        const status = (req.status || '').toLowerCase();
        if (filter === 'pending') return status === 'clinic_requested' || status === 'pending';
        if (filter === 'allocated') return status === 'ngo_approved' || status === 'allocated' || status === 'partially_allocated';
        if (filter === 'received') return status === 'received' || status === 'confirmed';
        if (filter === 'denied') return status === 'denied';
        return true;
    });

    const getPriorityLabel = (p) => {
        switch (parseInt(p)) {
            case 1: return 'CRITICAL';
            case 2: return 'HIGH';
            case 3: return 'STANDARD';
            case 4: return 'LOW';
            default: return 'UNKNOWN';
        }
    };

    const getPriorityColor = (p) => {
        switch (parseInt(p)) {
            case 1: return '#ef4444';
            case 2: return '#f97316';
            case 3: return '#3b82f6';
            case 4: return '#10b981';
            default: return '#64748b';
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <div className="page-header">
                    <div>
                        <h1 className="page-title">My Allocations</h1>
                        <p className="page-subtitle">
                            {loading ? 'Loading...' : `Tracking items allocated by NGO`}
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '2rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    paddingBottom: '1rem'
                }}>
                    {[
                        { value: 'all', label: 'All' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'approved', label: 'Allocated' },
                        { value: 'denied', label: 'Denied' }
                    ].map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setFilter(tab.value)}
                            style={{
                                padding: '0.6rem 1.2rem',
                                background: filter === tab.value ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                                border: filter === tab.value ? '1px solid #00e5ff' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                color: filter === tab.value ? '#00e5ff' : '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ padding: '5rem', textAlign: 'center', color: '#64748b' }}>
                        <div className="animate-pulse">Fetching your allocations...</div>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="table-card" style={{ padding: '5rem', textAlign: 'center' }}>
                        <Package size={48} color="#64748b" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                        <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Allocations Found</h3>
                        <p style={{ color: '#64748b' }}>There are no items matching your current filter.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {filteredRequests.map(request => (
                            <div key={request.id} className="table-card" style={{
                                padding: '1.5rem',
                                borderLeft: `4px solid ${getPriorityColor(request.priority)}`,
                                background: 'rgba(15, 23, 42, 0.4)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        <div style={{
                                            width: '50px', height: '50px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '12px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#00e5ff'
                                        }}>
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                                                {request.item_name}
                                            </h3>
                                            <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                                                <span>Quantity: <strong>{request.quantity}</strong></span>
                                                <span>•</span>
                                                <span>Priority: <strong style={{ color: getPriorityColor(request.priority) }}>{getPriorityLabel(request.priority)}</strong></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <StatusBadge status={request.status} />
                                        </div>
                                        <p style={{ color: '#475569', fontSize: '0.75rem' }}>
                                            Date: {new Date(request.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    marginTop: '1.2rem',
                                    padding: '0.8rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    color: '#94a3b8',
                                    border: '1px solid rgba(255,255,255,0.03)'
                                }}>
                                    <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', marginRight: '10px' }}>Purpose:</span>
                                    {request.purpose}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ClinicRequestStatus;
