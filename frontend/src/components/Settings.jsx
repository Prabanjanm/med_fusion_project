import React, { useState } from 'react';
import {
    User, Shield, Bell, Lock, Key, QrCode,
    Smartphone, Eye, EyeOff, Save, LogOut, CheckCircle, ExternalLink
} from 'lucide-react';
import Layout from '../components/Layout';
import '../styles/FormStyles.css';

/**
 * Settings Component
 * Enterprise-grade settings page separating Immutable Identity from User Preferences.
 */
const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [showKey, setShowKey] = useState(false);

    // Mock User Data representing Immutable Blockchain Identity
    const [user, setUser] = useState({
        name: 'Dr. Sarah Mitchell',
        role: 'CSR Manager',
        email: 'sarah.m@healthcorp.com',
        org: 'Health Corp Global',
        wallet: '0x71C...92F',
        fullWallet: '0x71C93F...92F8A1',
        privateKey: '********************************',
        twoFactor: true,
        lastLogin: '2025-01-24 08:30 AM UTC',
        notifications: {
            email: true,
            push: false,
            weeklyReport: true,
            securityAlerts: true
        }
    });

    const [message, setMessage] = useState(null);

    const handleToggle = (key) => {
        setUser(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };

    const handleSave = () => {
        setMessage({ type: 'success', text: 'Preferences updated successfully.' });
        setTimeout(() => setMessage(null), 3000);
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 20px',
                background: activeTab === id ? 'rgba(67, 97, 238, 0.1)' : 'transparent',
                border: 'none',
                borderLeft: activeTab === id ? '3px solid var(--accent-blue)' : '3px solid transparent',
                color: activeTab === id ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                width: '100%',
                textAlign: 'left'
            }}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings & Identity</h1>
                    <p className="page-subtitle">Manage Verified Identity & Security Preferences</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', alignItems: 'start' }}>

                {/* Navigation Sidebar */}
                <div className="form-card" style={{ padding: '1rem 0', overflow: 'hidden', height: 'fit-content' }}>
                    <div style={{ padding: '0 1.5rem 1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.5rem' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Account Management</p>
                    </div>
                    <TabButton id="profile" label="Profile & Identity" icon={User} />
                    <TabButton id="security" label="Security & Access" icon={Shield} />
                    <TabButton id="notifications" label="Notifications" icon={Bell} />

                    <div style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
                        <button style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
                            background: 'rgba(255, 68, 68, 0.05)', border: '1px solid rgba(255, 68, 68, 0.1)',
                            borderRadius: '8px', color: '#ff4444', cursor: 'pointer', fontSize: '0.9rem',
                            fontWeight: 500, width: '100%', justifyContent: 'center', transition: 'all 0.2s'
                        }}>
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>
                </div>

                {/* Content Panel */}
                <div style={{ minHeight: '600px' }}>

                    {message && (
                        <div className="animate-fade-in" style={{
                            background: message.type === 'success' ? 'rgba(0, 255, 148, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                            color: message.type === 'success' ? '#00ff94' : '#ff4444',
                            padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            border: message.type === 'success' ? '1px solid rgba(0, 255, 148, 0.2)' : '1px solid rgba(255, 68, 68, 0.2)'
                        }}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <Lock size={18} />}
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="form-card animate-fade-in">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 className="form-section-title" style={{ margin: 0 }}>Verified Digital Identity</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 255, 148, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(0, 255, 148, 0.2)' }}>
                                    <Shield size={14} color="#00ff94" fill="#00ff94" fillOpacity={0.2} />
                                    <span style={{ fontSize: '0.75rem', color: '#00ff94', fontWeight: 600 }}>VERIFIED ON-CHAIN</span>
                                </div>
                            </div>

                            {/* ID Card Visual */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '2rem',
                                display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem'
                            }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        width: '100px', height: '100px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #4361EE 0%, #7209B7 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '2.5rem', fontWeight: 'bold', color: '#fff',
                                        boxShadow: '0 0 20px rgba(67, 97, 238, 0.3)',
                                        border: '3px solid rgba(255,255,255,0.1)'
                                    }}>
                                        SM
                                    </div>
                                    <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#00ff94', borderRadius: '50%', padding: '4px', border: '3px solid #0F172A' }}>
                                        <CheckCircle size={14} color="#000" />
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h2 style={{ fontSize: '1.5rem', color: '#fff', margin: '0 0 0.5rem 0', fontWeight: 600 }}>{user.name}</h2>
                                    <p style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem', margin: 0, fontWeight: 500 }}>{user.role}  •  {user.org}</p>

                                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ background: '#020617', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <QrCode size={16} color="#64748B" />
                                            <code style={{ fontFamily: 'monospace', color: '#94A3B8', fontSize: '0.9rem' }}>{user.wallet}</code>
                                        </div>
                                        <button className="btn-outline" style={{ padding: '8px 12px' }} title="View on Explorer">
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Read-Only Details Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={12} /> Full Name</label>
                                    <input type="text" className="form-input" value={user.name} readOnly disabled style={{ opacity: 0.6, cursor: 'not-allowed', background: 'rgba(0,0,0,0.2)' }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={12} /> Email Address</label>
                                    <input type="text" className="form-input" value={user.email} readOnly disabled style={{ opacity: 0.6, cursor: 'not-allowed', background: 'rgba(0,0,0,0.2)' }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={12} /> Role Authorization</label>
                                    <input type="text" className="form-input" value={user.role.toUpperCase()} readOnly disabled style={{ opacity: 0.6, cursor: 'not-allowed', background: 'rgba(0,0,0,0.2)', color: 'var(--accent-cyan)', fontWeight: 600 }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lock size={12} /> Identity Token ID</label>
                                    <input type="text" className="form-input" value="ID-8829-XJ-29" readOnly disabled style={{ opacity: 0.6, cursor: 'not-allowed', background: 'rgba(0,0,0,0.2)' }} />
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(67, 97, 238, 0.05)', borderRadius: '8px', borderLeft: '3px solid var(--accent-blue)' }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                                    <span style={{ color: '#fff', fontWeight: 600 }}>Note:</span> Your identity details are immutably recorded on the blockchain. To request changes, please contact the network administrator for a new identity issuance.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="form-card animate-fade-in">
                            <h3 className="form-section-title">Security & Access Control</h3>

                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Credential Management</h4>
                                <div className="form-group">
                                    <label className="form-label">Private Key (Signing Authority)</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showKey ? "text" : "password"}
                                            className="form-input"
                                            value={showKey ? "e4a19901...f9b2d8" : "************************************************"}
                                            readOnly
                                            style={{ fontFamily: 'monospace', paddingRight: '40px', background: showKey ? 'rgba(255, 68, 68, 0.05)' : '' }}
                                        />
                                        <button
                                            onClick={() => setShowKey(!showKey)}
                                            style={{
                                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                                            }}
                                        >
                                            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {showKey && (
                                        <p style={{ fontSize: '0.8rem', color: '#ff4444', marginTop: '0.5rem' }}>
                                            ⚠️ WARNING: Do not share this key. Anyone with this key can sign transactions on your behalf.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '1.25rem', border: '1px solid var(--border-subtle)', borderRadius: '8px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                                            <Key size={20} className="text-cyan" />
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: 600 }}>Password</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last changed 45 days ago</div>
                                        </div>
                                    </div>
                                    <button className="btn-outline" style={{ fontSize: '0.85rem' }}>Change</button>
                                </div>

                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '1.25rem', border: '1px solid var(--border-subtle)', borderRadius: '8px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                                            <Smartphone size={20} className="text-cyan" />
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: 600 }}>Two-Factor Authentication</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Google Authenticator</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff94' }}></div>
                                        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>Enabled</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Session Activity</h4>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff94' }}></div>
                                    Last Login: <span style={{ fontFamily: 'monospace', color: '#fff' }}>{user.lastLogin}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="form-card animate-fade-in">
                            <h3 className="form-section-title">Notifications & Alerts</h3>

                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.25rem' }}>Transaction Updates</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email me when donation status changes</div>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={user.notifications.email} onChange={() => handleToggle('email')} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.25rem' }}>Security Alerts</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Notify for unknown login attempts</div>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={user.notifications.securityAlerts} onChange={() => handleToggle('securityAlerts')} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.25rem' }}>Weekly Impact Report</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Summary of network activity</div>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" checked={user.notifications.weeklyReport} onChange={() => handleToggle('weeklyReport')} />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="btn-submit" onClick={handleSave} style={{ width: 'auto', padding: '0.75rem 2rem' }}>
                                    Save Preferences
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #334155; transition: .4s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--accent-blue); }
        input:checked + .slider:before { transform: translateX(20px); }
      `}</style>
        </Layout>
    );
};

export default Settings;
