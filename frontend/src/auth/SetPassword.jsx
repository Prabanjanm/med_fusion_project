import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, Key, ArrowRight } from 'lucide-react';
import '../styles/Auth.css';

const SetPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        setLoading(true);

        // Simulate API call to set password
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);

            // Auto redirect after success
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        }, 1500);
    };

    return (
        <div className="login-wrapper">
            <motion.div
                className="login-card-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ maxWidth: '450px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '60px', height: '60px', margin: '0 auto 1rem',
                        background: 'rgba(0, 255, 136, 0.1)', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)'
                    }}>
                        <Key size={28} color="#00ff88" />
                    </div>
                    <h2 className="login-title">ACTIVATE ACCOUNT</h2>
                    <p className="login-subtitle">SET YOUR SECURE ACCESS CREDENTIALS</p>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} className="login-form-simple">
                        <div className="input-group-modern">
                            <label className="input-label" style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', alignItems: 'center' }}>
                                <Lock size={14} /> NEW PASSWORD
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="input-group-modern">
                            <label className="input-label" style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', alignItems: 'center' }}>
                                <ShieldCheck size={14} /> CONFIRM PASSWORD
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>

                        {/* Password Strength Mock Visual */}
                        {formData.password.length > 0 && (
                            <div style={{ margin: '1rem 0' }}>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: formData.password.length > 8 ? '100%' : '50%', background: formData.password.length > 8 ? '#00ff88' : '#f59e0b' }}
                                        style={{ height: '100%' }}
                                    />
                                </div>
                                <p style={{ fontSize: '0.7rem', color: formData.password.length > 8 ? '#00ff88' : '#f59e0b', marginTop: '0.3rem', textAlign: 'right' }}>
                                    {formData.password.length > 8 ? 'STRONG SECURITY' : 'WEAK PASSWORD'}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-login-modern"
                            disabled={loading}
                            style={{ marginTop: '2rem' }}
                        >
                            {loading ? 'ENCRYPTING & SAVING...' : 'ESTABLISH SECURE LINK'}
                        </button>
                    </form>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ textAlign: 'center', padding: '2rem 0' }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                        <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>ALL SET!</h3>
                        <p style={{ color: '#94a3b8' }}>Your secure password has been updated.</p>
                        <p style={{ color: '#00d4ff', fontSize: '0.9rem', marginTop: '1rem' }}>Redirecting to login...</p>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default SetPassword;
