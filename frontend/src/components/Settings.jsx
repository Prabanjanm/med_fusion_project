import React, { useState } from 'react';
import {
    User, Shield, Bell, Lock, Key, QrCode,
    Smartphone, Moon, Eye, EyeOff, Save, LogOut
} from 'lucide-react';
import Layout from '../components/Layout';
import WizardModal from '../components/WizardModal'; // Reusing for "Confirm Changes"
import '../styles/FormStyles.css';

/**
 * Settings Component
 * Manages user profile, security preferences, and application settings.
 * Uses a tabbed interface for organization.
 */
const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [showKey, setShowKey] = useState(false);

    // Mock User Data
    const [user, setUser] = useState({
        name: 'Dr. Sarah Mitchell',
        role: 'CSR Manager',
        email: 'sarah.m@healthcorp.com',
        org: 'Health Corp Global',
        wallet: '0x71C...92F',
        privateKey: '********************************',
        twoFactor: true,
        notifications: {
            email: true,
            push: false,
            weeklyReport: true
        }
    });

    const [message, setMessage] = useState(null);

    const handleSave = () => {
        setMessage({ type: 'success', text: 'Settings saved successfully.' });
        setTimeout(() => setMessage(null), 3000);
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 20px',
                background: activeTab === id ? 'rgba(67, 97, 238, 0.1)' : 'transparent',
                border: 'none',
                // borderBottom: activeTab === id ? '2px solid var(--accent-blue)' : '2px solid transparent',
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
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage Identity & Security Preferences</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', alignItems: 'start' }}>

                {/* Sidebar Tabs */}
                <div className="form-card" style={{ padding: '1rem 0', overflow: 'hidden' }}>
                    <TabButton id="profile" label="Profile & Identity" icon={User} />
                    <TabButton id="security" label="Security & Keys" icon={Shield} />
                    <TabButton id="notifications" label="Notifications" icon={Bell} />
                    <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '1rem 0' }} />
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px',
                        background: 'transparent', border: 'none', color: '#ff4444',
                        cursor: 'pointer', fontSize: '0.95rem', width: '100%', textAlign: 'left'
                    }}>
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>

                {/* Content Area */}
                <div className="form-card" style={{ minHeight: '500px' }}>

                    {message && (
                        <div style={{
                            background: message.type === 'success' ? 'rgba(0, 255, 148, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                            color: message.type === 'success' ? '#00ff94' : '#ff4444',
                            padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem',
                            display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            {message.type === 'success' ? <Shield size={18} /> : <Lock size={18} />}
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="settings-panel animate-fade-in">
                            <h3 className="form-section-title">My Digital Identity</h3>

                            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                                <div style={{
                                    width: '100px', height: '100px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #4361EE 0%, #7209B7 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2rem', fontWeight: 'bold', color: '#fff',
                                    boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                                }}>
                                    SM
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input type="text" className="form-input" value={user.name} readOnly style={{ opacity: 0.7 }} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input type="text" className="form-input" value={user.email} readOnly style={{ opacity: 0.7 }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.5rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <div>
                                    <h4 style={{ color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <QrCode size={18} className="text-cyan" /> Wallet Address
                                    </h4>
                                    <code style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '1rem' }}>{user.wallet}</code>
                                </div>
                                <button className="btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Copy</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="settings-panel animate-fade-in">
                            <h3 className="form-section-title">Security & Encryption</h3>

                            <div className="form-group">
                                <label className="form-label">Private Key (Secret)</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showKey ? "text" : "password"}
                                        className="form-input"
                                        value={showKey ? "e4a1...f9b2" : "********************************"}
                                        readOnly
                                    />
                                    <button
                                        onClick={() => setShowKey(!showKey)}
                                        style={{
                                            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                                        }}
                                    >
                                        {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#ff4444', marginTop: '0.5rem' }}>
                                    Never share your private key. It controls your digital signature on the blockchain.
                                </p>
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <h4 style={{ color: '#fff', marginBottom: '1rem' }}>Authentication Methods</h4>

                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: '8px', marginBottom: '1rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Key size={20} className="text-cyan" />
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: 500 }}>Password</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last changed 30 days ago</div>
                                        </div>
                                    </div>
                                    <button className="btn-outline" style={{ fontSize: '0.8rem' }}>Update</button>
                                </div>

                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: '8px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Smartphone size={20} className="text-cyan" />
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: 500 }}>Two-Factor Authentication (2FA)</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enabled via Authenticator App</div>
                                        </div>
                                    </div>
                                    <div style={{ color: '#00ff94', fontWeight: 600, fontSize: '0.9rem' }}>Active</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-panel animate-fade-in">
                            <h3 className="form-section-title">Notification Preferences</h3>

                            <div className="form-group">
                                <label className="checkbox-wrapper" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={user.notifications.email} readOnly />
                                    <div>
                                        <div style={{ color: '#fff' }}>Email Alerts</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Receive updates about shipment status</div>
                                    </div>
                                </label>

                                <label className="checkbox-wrapper" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={user.notifications.weeklyReport} readOnly />
                                    <div>
                                        <div style={{ color: '#fff' }}>Weekly Impact Report</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Summary of donations processed</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Global Save Button */}
                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <button className="btn-submit" onClick={handleSave} style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <Save size={18} /> Save Changes
                        </button>
                    </div>

                </div>
            </div>

            <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </Layout>
    );
};

export default Settings;
