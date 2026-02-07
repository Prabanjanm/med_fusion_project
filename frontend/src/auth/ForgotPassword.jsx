import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Send } from 'lucide-react';
import { authAPI } from '../services/api';
import Logo from '../components/Logo';
import '../styles/Auth.css';

/**
 * ForgotPassword Component
 * Allows users to request a password reset link.
 */
const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authAPI.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            console.error('Forgot password error:', err);
            setError(err.message || 'Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    width: '100%',
                    maxWidth: '450px',
                    background: 'rgba(15, 23, 42, 0.70)',
                    backdropFilter: 'blur(24px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6)',
                    padding: '3rem',
                    textAlign: 'center'
                }}
            >
                <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <Logo />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', margin: 0, letterSpacing: '1px' }}>FORGOT PASSWORD?</h2>
                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.75rem' }}>
                        No worries! Enter your official email and we'll send you a recovery link.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {!success ? (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubmit}
                            style={{ textAlign: 'left' }}
                        >
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600' }}>OFFICIAL EMAIL ADDRESS</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="e.g. admin@organization.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ background: 'rgba(0,0,0,0.2)', height: '50px', paddingLeft: '45px' }}
                                        required
                                    />
                                    <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                                </div>
                            </div>

                            {error && (
                                <div className="error-message-modern" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                                    ⚠ {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn-login-modern"
                                disabled={loading}
                                style={{
                                    background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                                    color: '#fff', fontWeight: 'bold', height: '50px', width: '100%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                }}
                            >
                                {loading ? 'SENDING...' : (
                                    <>SEND RECOVERY LINK <Send size={18} /></>
                                )}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ padding: '1rem 0' }}
                        >
                            <div style={{
                                width: '60px', height: '60px',
                                background: 'rgba(34, 197, 94, 0.1)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                                border: '1px solid rgba(34, 197, 94, 0.2)'
                            }}>
                                <ArrowRight size={30} color="#22c55e" />
                            </div>
                            <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '0.5rem' }}>Link Sent!</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                Please check your inbox at <b>{email}</b>. If you don't see it, check your spam folder.
                            </p>
                            <button
                                onClick={() => navigate('/auth/select')}
                                className="btn-login-modern"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff', marginTop: '2rem', height: '50px'
                                }}
                            >
                                RETURN TO LOGIN
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!success && (
                    <div style={{ marginTop: '2.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                        <span
                            onClick={() => navigate(-1)}
                            style={{ color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <ArrowLeft size={16} /> Back to Login
                        </span>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
