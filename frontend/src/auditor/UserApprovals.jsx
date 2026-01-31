
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';
import { auditorAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';

const UserApprovals = ({ roleFilter }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // ID of item being processed

    useEffect(() => {
        fetchRequests();
    }, [roleFilter]);

    const fetchRequests = async () => {
        try {
            const data = await auditorAPI.getPendingRegistrations();
            const filtered = roleFilter ? data.filter(r => r.role === roleFilter) : data;
            setRequests(filtered);
        } catch (error) {
            console.error("Failed to load registrations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDecision = async (email, decision) => {
        setActionLoading(email);
        try {
            await auditorAPI.processRegistration(email, decision);
            // Remove from list or update locally
            setRequests(prev => prev.filter(r => r.email !== email));
        } catch (error) {
            alert("Failed to process request: " + error.message);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div style={{ color: '#94a3b8', padding: '1rem', textAlign: 'center' }}>Loading pending approvals...</div>;

    if (requests.length === 0) {
        return (
            <div style={{
                background: 'rgba(15, 23, 42, 0.4)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '2rem',
                textAlign: 'center',
                color: '#64748b'
            }}>
                <CheckCircle size={40} color="#22c55e" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3>All Clear</h3>
                <p>No pending user registrations requires your attention.</p>
            </div>
        );
    }

    return (
        <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            overflow: 'hidden',
            marginBottom: '2rem'
        }}>
            <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldAlert color="#ff9800" size={20} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#fff' }}>Pending Approvals</h3>
                </div>
                <span style={{
                    background: '#ff9800', color: '#000',
                    padding: '2px 8px', borderRadius: '12px',
                    fontSize: '0.75rem', fontWeight: 'bold'
                }}>
                    {requests.length} Requests
                </span>
            </div>

            <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '1rem' }}>ENTITY</th>
                            <th style={{ padding: '1rem' }}>ROLE</th>
                            <th style={{ padding: '1rem' }}>ID / REG NO</th>
                            <th style={{ padding: '1rem' }}>SUBMITTED</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req) => (
                            <tr key={req.email} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: '500', color: '#f8fafc' }}>{req.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{req.email}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        textTransform: 'uppercase',
                                        fontSize: '0.7rem',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: req.role === 'csr' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(20, 184, 166, 0.15)',
                                        color: req.role === 'csr' ? '#06b6d4' : '#14b8a6'
                                    }}>
                                        {req.role}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: '#cbd5e1', fontFamily: 'monospace' }}>{req.id_number}</td>
                                <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Clock size={14} />
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                        <button
                                            disabled={actionLoading === req.email}
                                            onClick={() => handleDecision(req.email, 'reject')}
                                            style={{
                                                background: 'transparent',
                                                border: '1px solid #ef4444',
                                                color: '#ef4444',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                display: 'flex', alignItems: 'center', gap: '5px',
                                                opacity: actionLoading === req.email ? 0.5 : 1
                                            }}
                                        >
                                            <XCircle size={14} /> Reject
                                        </button>
                                        <button
                                            disabled={actionLoading === req.email}
                                            onClick={() => handleDecision(req.email, 'approve')}
                                            style={{
                                                background: '#22c55e',
                                                border: 'none',
                                                color: '#000',
                                                padding: '6px 16px',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                fontSize: '0.8rem',
                                                display: 'flex', alignItems: 'center', gap: '5px',
                                                opacity: actionLoading === req.email ? 0.5 : 1
                                            }}
                                        >
                                            <CheckCircle size={14} /> Approve
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserApprovals;
