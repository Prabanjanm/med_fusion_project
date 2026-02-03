import React, { useState } from 'react';
import {
    User, Shield, Bell, Lock, Key, QrCode,
    ExternalLink, LogOut, CheckCircle, Copy, AlertTriangle
} from 'lucide-react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

/**
 * Settings Component
 * Redesigned to match the "Cyberpunk Medical" aesthetic with high-fidelity UI.
 */
const Settings = () => {
    const { user: authUser, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);

    // Dynamic User Data from Context
    const user = {
        name: authUser?.name || authUser?.username || 'Guest User',
        role: authUser?.role || 'Guest',
        roleDesc: authUser?.role === 'csr' ? 'Corporate Partner' :
            authUser?.role === 'ngo' ? 'Verified NGO' :
                authUser?.role === 'clinic' ? 'Healthcare Provider' : 'System Auditor',
        email: authUser?.email || authUser?.username || 'No Email',
        wallet: authUser?.wallet || '0x71C93F...92F8A1', // Fallback for demo
        shortWallet: authUser?.wallet ? `${authUser.wallet.substring(0, 6)}...${authUser.wallet.substring(authUser.wallet.length - 4)}` : '0x71C...92F',
        identityId: authUser?.id_number || `ID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        lastLogin: new Date().toLocaleDateString(), // Just for display
        twoFactor: true
    };

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
                            <TabButton id="notifications" label="Notifications" icon={Bell} />
                        </div>

                        <div style={{ padding: '2rem 1.5rem 1.5rem' }}>
                            <button style={{
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
                            minHeight: '600px',
                            position: 'relative'
                        }}
                    >
                        {activeTab === 'profile' && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', fontFamily: '"Outfit", sans-serif' }}>
                                        Verified Digital Identity
                                    </h2>
                                    <div style={{
                                        padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px',
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)'
                                    }}>
                                        <Shield size={14} color="#10b981" fill="#10b981" />
                                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', letterSpacing: '0.5px' }}>VERIFIED ON-CHAIN</span>
                                    </div>
                                </div>

                                {/* IDENTITY CARD */}
                                <div style={{
                                    background: '#1e293b',
                                    borderRadius: '16px',
                                    padding: '2.5rem',
                                    marginBottom: '3rem',
                                    display: 'flex', alignItems: 'center', gap: '2.5rem',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    {/* Avatar */}
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            width: '110px', height: '110px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '2.5rem', fontWeight: 'bold', color: '#fff',
                                            border: '4px solid #0f172a',
                                            boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.5)'
                                        }}>
                                            SM
                                        </div>
                                        <div style={{
                                            position: 'absolute', bottom: '5px', right: '5px',
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            background: '#10b981', border: '3px solid #0f172a',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <CheckCircle size={14} color="#0f172a" />
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div>
                                        <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: '0 0 0.5rem 0', fontWeight: '700' }}>{user.name}</h2>
                                        <p style={{ color: '#06b6d4', fontSize: '1rem', margin: 0, fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {user.role} <span style={{ opacity: 0.5 }}>•</span> {user.roleDesc}
                                        </p>

                                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                                            <div style={{
                                                background: '#020617', padding: '8px 16px', borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px'
                                            }}>
                                                <QrCode size={18} color="#64748b" />
                                                <span style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.95rem' }}>{user.shortWallet}</span>
                                            </div>
                                            <button
                                                onClick={handleCopy}
                                                style={{
                                                    width: '40px', background: '#fff', borderRadius: '8px', border: 'none',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {copied ? <CheckCircle size={18} color="#10b981" /> : <ExternalLink size={18} color="#0f172a" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* FORM FIELDS */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                                            <Lock size={12} /> Full Name
                                        </label>
                                        <input type="text" value={user.name} readOnly style={{
                                            width: '100%', padding: '14px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '8px', color: '#94a3b8', fontSize: '0.95rem', fontWeight: '500'
                                        }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                                            <Lock size={12} /> Email Address
                                        </label>
                                        <input type="text" value={user.email} readOnly style={{
                                            width: '100%', padding: '14px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '8px', color: '#94a3b8', fontSize: '0.95rem', fontWeight: '500'
                                        }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                                            <Lock size={12} /> Role Authorization
                                        </label>
                                        <input type="text" value={user.role.toUpperCase()} readOnly style={{
                                            width: '100%', padding: '14px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)',
                                            borderRadius: '8px', color: '#06b6d4', fontSize: '0.95rem', fontWeight: '700'
                                        }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                                            <Lock size={12} /> Identity Token ID
                                        </label>
                                        <input type="text" value={user.identityId} readOnly style={{
                                            width: '100%', padding: '14px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.05)',
                                            borderRadius: '8px', color: '#94a3b8', fontSize: '0.95rem', fontWeight: '500'
                                        }} />
                                    </div>
                                </div>

                                {/* FOOTER NOTE */}
                                <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                                        <strong style={{ color: '#fff' }}>Note:</strong> Your identity details are immutably recorded on the blockchain. To request changes, please contact the network administrator for a new identity issuance.
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
                                                You are viewing sensitive credentials. Ensure you are in a secure location.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', color: '#94a3b8', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Private Key (Signing)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type={showKey ? "text" : "password"} value="************************" readOnly
                                            style={{
                                                width: '100%', padding: '14px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#fff', fontFamily: 'monospace', borderRadius: '8px'
                                            }} />
                                        <button onClick={() => setShowKey(!showKey)} style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                            {showKey ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'notifications' && (
                            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b' }}>
                                <Bell size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                <p>Notification preferences coming soon.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;
