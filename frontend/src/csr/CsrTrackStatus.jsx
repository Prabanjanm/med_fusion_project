
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import { donationAPI } from '../services/api';
import '../styles/DashboardLayout.css';

const CsrTrackStatus = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [donations, setDonations] = useState([]);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await donationAPI.getHistory();
            // Sort by date desc
            const sortedData = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setDonations(sortedData);
        } catch (error) {
            console.error("Failed to load tracking data", error);
        } finally {
            setLoading(false);
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <Layout>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
                <div className="page-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                            Live Tracking Stream
                        </h1>
                        <p className="page-subtitle">Real-time status updates of all donations</p>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#94a3b8',
                            padding: '0.5rem 1rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        Loading stream...
                    </div>
                ) : donations.length === 0 ? (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        background: 'rgba(15,23,42,0.3)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.04)'
                    }}>
                        <Zap size={32} color="#64748b" style={{ marginBottom: '1rem', display: 'inline-block' }} />
                        <p style={{ color: '#94a3b8' }}>No activity to track yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {donations.map((item, idx) => {
                            // Determine Status Style
                            let statusColor = '#94a3b8'; // default gray
                            if (['COMPLETED', 'RECEIVED', 'ACCEPTED', 'APPROVED'].includes(item.status)) statusColor = '#10b981'; // green
                            else if (['PENDING', 'AUTHORIZED'].includes(item.status)) statusColor = '#f59e0b'; // amber
                            else if (['IN_TRANSIT', 'ALLOCATED'].includes(item.status)) statusColor = '#3b82f6'; // blue
                            else if (['REJECTED', 'DENIED', 'CANCELLED'].includes(item.status)) statusColor = '#ef4444'; // red

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.02, x: 5 }}
                                    style={{
                                        background: `linear-gradient(90deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.4) 100%)`,
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderLeft: `4px solid ${statusColor}`,
                                        padding: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        boxShadow: `0 4px 20px -5px ${statusColor}15`,
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => navigate(`/csr/donation/${item.id}`)}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <span style={{ color: '#fff', fontWeight: '700', fontSize: '1.1rem', fontFamily: "'Inter', sans-serif" }}>
                                                {item.item_name}
                                            </span>
                                            <span style={{
                                                fontSize: '0.8rem',
                                                color: '#94a3b8',
                                                background: 'rgba(255,255,255,0.05)',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                border: '1px solid rgba(255,255,255,0.05)'
                                            }}>
                                                x{Number(item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{item.ngo_name || 'Pending Assignment'}</span>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            color: statusColor,
                                            fontWeight: '700',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            display: 'block',
                                            marginBottom: '4px',
                                            fontFamily: "'Orbitron', sans-serif",
                                            textShadow: `0 0 10px ${statusColor}40`
                                        }}>
                                            {item.status}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                                            #{String(item.id).padStart(6, '0')}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default CsrTrackStatus;
