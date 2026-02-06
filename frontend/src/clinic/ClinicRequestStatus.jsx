import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, Clock, AlertTriangle, ArrowLeft, Trash2, Truck } from 'lucide-react';
import Layout from '../components/Layout';
import { clinicAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import '../styles/DashboardLayout.css';

const ClinicRequestStatus = () => {
    const [allocations, setAllocations] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch both allocations (actual shipments) and requests (clinic needs)
            const [allocData, reqData] = await Promise.all([
                clinicAPI.getHistory(),
                clinicAPI.getRequests()
            ]);
            setAllocations(allocData || []);
            setRequests(reqData || []);
        } catch (error) {
            console.error('Error fetching clinic data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRequest = async (id) => {
        if (!window.confirm("Are you sure you want to delete this requirement?")) return;
        try {
            await clinicAPI.deleteRequirement(id);
            fetchData();
        } catch (error) {
            alert("Failed to delete: " + error.message);
        }
    };

    const filteredAllocations = allocations.filter(alloc => {
        if (filter === 'all') return true;
        const status = (alloc.status || '').toLowerCase();
        if (filter === 'received') return status === 'received';
        if (filter === 'not_received') return status === 'allocated' || status === 'in_transit';
        return false;
    });

    const pendingRequests = requests.filter(r =>
        filter === 'all' || filter === 'pending'
    ).filter(r => r.status === 'CLINIC_REQUESTED' || r.status === 'PENDING');

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
                        <h1 className="page-title">My Allocations & Requests</h1>
                        <p className="page-subtitle">
                            {loading ? 'Loading...' : `Tracking NGO shipments and your pending requirements`}
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
                        { value: 'all', label: 'All History' },
                        { value: 'not_received', label: 'Incoming Shipments' },
                        { value: 'received', label: 'Received' },
                        { value: 'pending', label: 'My Unfulfilled Requests' }
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
                        <div className="animate-pulse">Loading tracking data...</div>
                    </div>
                ) : (
                    <>
                        {/* 1. NGO Shipments (Allocations) */}
                        {(filter !== 'pending') && (
                            <div style={{ marginBottom: '3rem' }}>
                                <h2 style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Truck size={18} /> NGO Shipments (Actual Allocations)
                                </h2>
                                {filteredAllocations.length === 0 ? (
                                    <div className="table-card" style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>
                                        <p style={{ color: '#64748b' }}>No confirmed shipments found for this filter.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        {filteredAllocations.map(alloc => (
                                            <div key={`alloc-${alloc.allocation_id}`} className="table-card" style={{
                                                padding: '1.5rem',
                                                borderLeft: `4px solid ${getPriorityColor(alloc.priority)}`,
                                                background: 'linear-gradient(to right, rgba(0, 229, 255, 0.05), rgba(15, 23, 42, 0.4))'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                                        <div style={{
                                                            width: '50px', height: '50px',
                                                            background: 'rgba(0, 229, 255, 0.1)',
                                                            borderRadius: '12px',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: '#00e5ff'
                                                        }}>
                                                            <Package size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                                                                {alloc.item_name}
                                                            </h3>
                                                            <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                                <span>Qty: <strong>{alloc.quantity}</strong></span>
                                                                <span>•</span>
                                                                <span>Allocated by: <strong style={{ color: '#00e5ff' }}>{alloc.ngo_name}</strong></span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ textAlign: 'right' }}>
                                                        <StatusBadge status={alloc.status} />
                                                        {alloc.received_at && (
                                                            <p style={{ color: '#10b981', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                                                                Received: {new Date(alloc.received_at).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                        <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                                                            Shipment Date: {new Date(alloc.allocated_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 2. My Pending Requirements */}
                        {(filter === 'all' || filter === 'pending') && (
                            <div>
                                <h2 style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Clock size={18} /> My Pending Requirements (Not yet allocated)
                                </h2>
                                {pendingRequests.length === 0 ? (
                                    <div className="table-card" style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>
                                        <p style={{ color: '#64748b' }}>No pending requirements. All are either allocated or none were made.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        {pendingRequests.map(request => (
                                            <div key={`req-${request.id}`} className="table-card" style={{
                                                padding: '1.5rem',
                                                borderLeft: `4px solid ${getPriorityColor(request.priority)}`,
                                                background: 'rgba(15, 23, 42, 0.2)'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                                        <div style={{
                                                            width: '40px', height: '40px',
                                                            background: 'rgba(255, 255, 255, 0.03)',
                                                            borderRadius: '10px',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: '#64748b'
                                                        }}>
                                                            <Clock size={20} />
                                                        </div>
                                                        <div>
                                                            <h3 style={{ color: '#cbd5e1', fontSize: '1rem', marginBottom: '0.2rem' }}>
                                                                {request.item_name}
                                                            </h3>
                                                            <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.8rem' }}>
                                                                <span>Quantity Requested: {request.quantity}</span>
                                                                <span>•</span>
                                                                <span>Priority: <span style={{ color: getPriorityColor(request.priority) }}>{getPriorityLabel(request.priority)}</span></span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                        <button
                                                            onClick={() => handleDeleteRequest(request.id)}
                                                            style={{
                                                                background: 'rgba(239, 68, 68, 0.1)',
                                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                                color: '#ef4444',
                                                                padding: '0.4rem',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer'
                                                            }}
                                                            title="Delete Unfulfilled Request"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                        <StatusBadge status={request.status} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
};

export default ClinicRequestStatus;
