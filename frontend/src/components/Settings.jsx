import React, { useState, useEffect } from 'react';
import {
    User, Shield, Lock, Key, QrCode,
    ExternalLink, LogOut, CheckCircle, Copy, AlertTriangle, Building, Mail, MapPin, Hash
} from 'lucide-react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../services/api';

/**
 * Settings Component
 * Redesigned to match the "Cyberpunk Medical" aesthetic with high-fidelity UI.
 */
const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await authAPI.getMe();
                // Map Backend Data to UI State - Filter out empty values
                const profileData = {
                    name: data.organization_name,
                    role: data.role === 'CSR' ? 'CSR Manager' : (data.role === 'NGO' ? 'NGO Officer' : (data.role === 'CLINIC' ? 'Clinic Head' : 'Network Auditor')),
                    email: data.email,
                    identityId: data.identity_token,
                    org_details: data.organization_details
                };

                // Clean data - Remove anything empty/null
                const cleanUser = {};
                Object.keys(profileData).forEach(key => {
                    if (profileData[key] && profileData[key] !== 'N/A' && profileData[key] !== 'Unknown') {
                        cleanUser[key] = profileData[key];
                    }
                });

                setUser(cleanUser);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(user.wallet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                background: activeTab === id ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%)' : 'transparent',
                border: 'none',
                borderLeft: activeTab === id ? '3px solid #06b6d4' : '3px solid transparent',
                color: activeTab === id ? '#fff' : '#94a3b8',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                width: '100%',
                textAlign: 'left',
                transition: 'all 0.2s',
                marginBottom: '4px'
            }}
        >
            <Icon size={18} color={activeTab === id ? '#06b6d4' : '#64748b'} />
            {label}
        </button>
    );

    return (
        <Layout>
            <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: '"Inter", sans-serif' }}>

                {/* Page Header */}
                <div style={{ marginBottom: '3rem' }}>
                    <h1 style={{
                        fontSize: '2rem', fontWeight: '700', color: '#fff',
                        letterSpacing: '1px', marginBottom: '0.5rem',
                        textTransform: 'uppercase', fontFamily: '"Outfit", sans-serif'
                    }}>
                        Settings & Identity
                    </h1>
                    <p style={{
                        color: '#06b6d4', fontSize: '0.9rem', fontWeight: '600',
                        letterSpacing: '0.5px', textTransform: 'uppercase'
                    }}>
                        Manage Verified Identity & Security Preferences
                    </p>
                    <div style={{ height: '1px', width: '100%', background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.5) 0%, transparent 100%)', marginTop: '1.5rem' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '2rem', alignItems: 'start' }}>

                    {/* LEFT PANEL: ACCOUNT MANAGEMENT */}
                    <div style={{
                        background: '#0f172a',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                    }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <h3 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700' }}>
                                Account Management
                            </h3>
                        </div>

                        <div style={{ padding: '1rem 0' }}>
                            <TabButton id="profile" label="Profile & Identity" icon={User} />
                            <TabButton id="security" label="Security & Access" icon={Shield} />
                        </div>

                        <div style={{ padding: '2rem 1.5rem 1.5rem' }}>
                            <button
                                onClick={() => {
                                    authAPI.logout?.(); // Optional backend call
                                    localStorage.clear();
                                    window.location.href = '/login';
                                }}
                                style={{
                                    width: '100%', padding: '12px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '8px',
                                    color: '#ef4444',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                                onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    </div>

                    {/* RIGHT PANEL: CONTENT */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            background: '#0f172a',
                            borderRadius: '16px',
                            border: '1px solid rgba(6, 182, 212, 0.2)', // Cyan border glow
                            boxShadow: '0 0 40px rgba(6, 182, 212, 0.05)',
                            padding: '2.5rem',
                            minHeight: '400px',
                            position: 'relative'
                        }}
                    >
                        {loading ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Consulting Blockchain Records...</div>
                        ) : !user ? (
                            <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Identity Not Found</div>
                        ) : (
                            <>
                                {activeTab === 'profile' && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', fontFamily: '"Outfit", sans-serif' }}>
                                                Verified Digital Identity
                                            </h2>
                                            <div style={{
                                                padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)',
                                                border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px',
                                                display: 'flex', alignItems: 'center', gap: '6px'
                                            }}>
                                                <Shield size={14} color="#10b981" fill="#10b981" />
                                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', letterSpacing: '0.5px' }}>VERIFIED</span>
                                            </div>
                                        </div>

                                        {/* IDENTITY HEADER */}
                                        <div style={{ marginBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: '2rem' }}>
                                            <h2 style={{ fontSize: '2rem', color: '#fff', margin: '0 0 0.5rem 0', fontWeight: '700' }}>{user.name}</h2>
                                            <p style={{ color: '#06b6d4', fontSize: '1rem', margin: 0, fontWeight: '600', letterSpacing: '0.5px' }}>
                                                {user.role}
                                            </p>
                                        </div>

                                        {/* DYNAMIC DATA GRID: SHOW ONLY IF DATA EXISTS */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                                            {user.email && (
                                                <div>
                                                    <label style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '800', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                                                        <Mail size={12} /> Registered Email
                                                    </label>
                                                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '500' }}>{user.email}</div>
                                                </div>
                                            )}

                                            {user.identityId && (
                                                <div>
                                                    <label style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '800', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                                                        <Hash size={12} /> Network ID
                                                    </label>
                                                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '500' }}>{user.identityId}</div>
                                                </div>
                                            )}

                                            {user.org_details?.cin && (
                                                <div>
                                                    <label style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '800', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                                                        <Building size={12} /> Corporate CIN
                                                    </label>
                                                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '500' }}>{user.org_details.cin}</div>
                                                </div>
                                            )}

                                            {user.org_details?.csr_1 && (
                                                <div>
                                                    <label style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '800', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                                                        <Building size={12} /> CSR-1 Registration
                                                    </label>
                                                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '500' }}>{user.org_details.csr_1}</div>
                                                </div>
                                            )}

                                            {user.org_details?.address && (
                                                <div>
                                                    <label style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '800', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                                                        <MapPin size={12} /> Office Location
                                                    </label>
                                                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '500', lineHeight: '1.4' }}>{user.org_details.address}</div>
                                                </div>
                                            )}

                                            {user.wallet && (
                                                <div style={{ gridColumn: 'span 2' }}>
                                                    <label style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: '800', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                                                        <QrCode size={12} /> Blockchain Public Address
                                                    </label>
                                                    <div style={{
                                                        background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px',
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                        border: '1px solid rgba(255,255,255,0.05)'
                                                    }}>
                                                        <span style={{ color: '#06b6d4', fontFamily: 'monospace', fontSize: '1rem' }}>{user.wallet}</span>
                                                        <button onClick={handleCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                                            {copied ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} color="#475569" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* FOOTER NOTE */}
                                        <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                            <p style={{ color: '#475569', fontSize: '0.8rem', lineHeight: '1.6', margin: 0 }}>
                                                Digital Identity v1.0 • All data is strictly read-only and verified by the central health network.
                                            </p>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'security' && (
                                    <>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', fontFamily: '"Outfit", sans-serif', marginBottom: '2rem' }}>
                                            Security & Access
                                        </h2>

                                        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <AlertTriangle size={24} color="#ef4444" />
                                                <div>
                                                    <h4 style={{ color: '#ef4444', margin: '0 0 0.5rem 0' }}>SENSITIVE AREA</h4>
                                                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>
                                                        Private credentials are for recovery purposes only. Do not share.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '2rem' }}>
                                            <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Security Signature</label>
                                            <div style={{ position: 'relative' }}>
                                                <input type="text" value={user.identityId || 'HIDDEN'} readOnly
                                                    style={{
                                                        width: '100%', padding: '14px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                                                        color: '#fff', fontFamily: 'monospace', borderRadius: '8px'
                                                    }} />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
