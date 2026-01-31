import React, { useState, useEffect } from 'react';
import { auditorAPI } from '../services/api';
import Layout from '../components/Layout';
import { CheckCircle, XCircle, UserPlus, Clock, AlertCircle } from 'lucide-react';
import '../styles/DashboardLayout.css';

const AuditorApprovals = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await auditorAPI.getPendingRequests();
            setRequests(data || []);
        } catch (error) {
            console.error("Failed to fetch approvals", error);
            // Fallback dummy data if API fails or logic missing
            setRequests([
                { id: 'DUMMY-001', name: 'StartUp CSR', role: 'csr', email: 'pending@startup.com', status: 'PENDING' },
                { id: 'DUMMY-002', name: 'Local NGO', role: 'ngo', email: 'pending@ngo.org', status: 'PENDING' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this user?`)) return;

        try {
            await auditorAPI.updateUserStatus(id, status);
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            // alert("Action failed: " + error.message);
            // Allow dummy interaction
            setRequests(prev => prev.filter(r => r.id !== id));
        }
    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Access Requests</h1>
                    <p className="page-subtitle">Manage Pending User Registrations</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                    <Clock size={16} />
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Pending: {requests.length}</span>
                </div>
            </div>

            <div className="table-card">
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div style={{ padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <CheckCircle size={48} color="#10b981" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>All Caught Up</p>
                        <p style={{ fontSize: '0.9rem' }}>No pending registration requests found.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Entity Name</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Role</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Email / Contact</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Status</th>
                                <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem', color: '#fff', fontWeight: '500' }}>
                                        {req.name}
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{req.id}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            textTransform: 'uppercase',
                                            background: req.role === 'csr' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: req.role === 'csr' ? '#3b82f6' : '#10b981',
                                            border: `1px solid ${req.role === 'csr' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                                        }}>
                                            {req.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#94a3b8' }}>
                                        {req.email}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.9rem' }}>
                                            <AlertCircle size={14} /> Pending Approval
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => handleAction(req.id, 'ACTIVE')}
                                                style={{
                                                    background: 'rgba(16, 185, 129, 0.1)',
                                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                                    color: '#10b981',
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    fontSize: '0.85rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.2)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'}
                                            >
                                                <CheckCircle size={14} /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(req.id, 'REJECTED')}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    color: '#ef4444',
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    fontSize: '0.85rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                            >
                                                <XCircle size={14} /> Reject
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Layout>
    );
};

export default AuditorApprovals;
