
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, Zap, Building2 } from 'lucide-react';
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
            setDonations(data);
        } catch (error) {
            console.error("Failed to load tracking data", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
                <div className="page-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(90deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Donation Journey
                        </h1>
                        <p className="page-subtitle" style={{ color: '#64748b' }}>Complete lifecycle tracking of your contributions</p>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#94a3b8',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        <RefreshCw size={16} className={loading ? 'spin-icon' : ''} />
                        Sync Registry
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ height: '100px', background: 'rgba(15,23,42,0.3)', borderRadius: '16px', animate: 'pulse 2s infinite' }} />
                        ))}
                    </div>
                ) : donations.length === 0 ? (
                    <div style={{
                        padding: '4rem 2rem',
                        textAlign: 'center',
                        background: 'rgba(15,23,42,0.3)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.04)',
                        color: '#64748b'
                    }}>
                        <Zap size={48} style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                        <h3>No Active Journeys</h3>
                        <p>Start a new donation to begin tracking its journey.</p>
                        <button
                            onClick={() => navigate('/csr/create-donation')}
                            className="btn btn-primary"
                            style={{ marginTop: '2rem' }}
                        >
                            Create Donation
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {donations.map((item, idx) => {
                            const isCompleted = ['COMPLETED', 'RECEIVED'].includes(item.status);
                            const pending = ['PENDING', 'AUTHORIZED'].includes(item.status);

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ x: 10, background: 'rgba(30, 41, 59, 0.4)' }}
                                    style={{
                                        background: 'rgba(15, 23, 42, 0.4)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '20px',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        padding: '1.5rem 2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '2rem',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onClick={() => navigate(`/csr/donation/${item.id}`)}
                                >
                                    {/* Left Accent */}
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: '4px',
                                        background: isCompleted ? '#10b981' : (pending ? '#f59e0b' : '#3b82f6')
                                    }} />

                                    {/* Item Info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{item.item_name}</h3>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: '4px' }}>
                                                #{String(item.id).padStart(5, '0')}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.85rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Building2 size={14} /> {item.ngo_name || 'Assignment Pending'}
                                            </span>
                                            <span>•</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Zap size={14} /> {item.quantity} units
                                            </span>
                                        </div>
                                    </div>

                                    {/* Mini Progress */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0 1rem' }}>
                                        {[1, 2, 3].map((step) => {
                                            const active = (step === 1) ||
                                                (step === 2 && !pending) ||
                                                (step === 3 && isCompleted);
                                            return (
                                                <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{
                                                        width: '12px',
                                                        height: '12px',
                                                        borderRadius: '50%',
                                                        background: active ? (isCompleted ? '#10b981' : '#3b82f6') : 'rgba(255,255,255,0.05)',
                                                        boxShadow: active ? `0 0 10px ${isCompleted ? '#10b98140' : '#3b82f640'}` : 'none'
                                                    }} />
                                                    {step < 3 && (
                                                        <div style={{ width: '20px', height: '2px', background: active ? (isCompleted ? '#10b98140' : '#3b82f640') : 'rgba(255,255,255,0.05)' }} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Action */}
                                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                        <span style={{
                                            display: 'block',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            color: isCompleted ? '#10b981' : (pending ? '#f59e0b' : '#3b82f6'),
                                            marginBottom: '0.25rem'
                                        }}>
                                            {item.status}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            View Journey →
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
