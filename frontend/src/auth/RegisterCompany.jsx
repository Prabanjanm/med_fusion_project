import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, FileText, BadgeCheck, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import '../styles/Auth.css'; // Reusing Auth styles for consistency

const RegisterCompany = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('form'); // form, processing, success
    const [formData, setFormData] = useState({
        company_name: '',
        cin: '',
        pan: '',
        official_email: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStep('processing');

        // Simulate Backend Verification Delay
        setTimeout(() => {
            setStep('success');
        }, 2000);
    };

    return (
        <div className="login-wrapper">
            <motion.div
                className="login-card-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ maxWidth: '500px' }}
            >
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '60px', height: '60px', margin: '0 auto 1rem',
                        background: 'rgba(0, 212, 255, 0.1)', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        boxShadow: '0 0 20px rgba(0, 212, 255, 0.1)'
                    }}>
                        <Building2 size={32} color="#00d4ff" />
                    </div>
                    <h2 className="login-title">NEW ENTITY REGISTRATION</h2>
                    <p className="login-subtitle">CSR COMPLIANCE NETWORK</p>
                </div>

                <AnimatePresence mode="wait">

                    {/* STEP 1: REGISTRATION FORM */}
                    {step === 'form' && (
                        <motion.form
                            key="form"
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="login-form-simple"
                        >
                            <div className="input-group-modern">
                                <label className="input-label" style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', alignItems: 'center' }}>
                                    <Building2 size={14} /> COMPANY NAME
                                </label>
                                <input
                                    type="text"
                                    name="company_name"
                                    className="form-input"
                                    placeholder="e.g. Acme Healthcare Ltd"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="input-group-modern">
                                    <label className="input-label" style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <FileText size={14} /> CIN NUMBER
                                    </label>
                                    <input
                                        type="text"
                                        name="cin"
                                        className="form-input"
                                        placeholder="L12345..."
                                        value={formData.cin}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="input-group-modern">
                                    <label className="input-label" style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <BadgeCheck size={14} /> PAN NUMBER
                                    </label>
                                    <input
                                        type="text"
                                        name="pan"
                                        className="form-input"
                                        placeholder="ABCDE1234F"
                                        value={formData.pan}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group-modern">
                                <label className="input-label" style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', alignItems: 'center' }}>
                                    <Mail size={14} /> OFFICIAL EMAIL
                                </label>
                                <input
                                    type="email"
                                    name="official_email"
                                    className="form-input"
                                    placeholder="csr@company.com"
                                    value={formData.official_email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <button
                                    type="submit"
                                    className="btn-login-modern"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        width: '100%',
                                        padding: '12px',
                                        fontSize: '1rem'
                                    }}
                                >
                                    INITIATE VERIFICATION <ArrowRight size={20} />
                                </button>
                            </div>

                            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                <button type="button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>
                                    Return to Login
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {/* STEP 2: PROCESSING STATE */}
                    {step === 'processing' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ textAlign: 'center', padding: '2rem 0' }}
                        >
                            <div className="spinner-container" style={{ margin: '0 auto 2rem' }}>
                                <motion.div
                                    style={{ width: '50px', height: '50px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #00d4ff', borderRadius: '50%', margin: '0 auto' }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                />
                            </div>
                            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>VERIFYING ENTITY CREDENTIALS</h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Checking MCA Database & PAN Records...</p>

                            <div style={{ marginTop: '2rem', textAlign: 'left', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>✓ Connecting to Secure Gateway...</motion.div>
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 }}>✓ Validating CIN Format (L12345TN...)</motion.div>
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }}>✓ Verifying PAN Status...</motion.div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: SUCCESS STATE */}
                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ textAlign: 'center', padding: '1rem 0' }}
                        >
                            <div style={{ width: '80px', height: '80px', background: 'rgba(0, 255, 136, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid #00ff88' }}>
                                <CheckCircle2 size={42} color="#00ff88" />
                            </div>

                            <h3 style={{ color: '#00ff88', marginBottom: '1rem', fontSize: '1.5rem' }}>REGISTRATION SUCCESSFUL</h3>

                            <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '2rem' }}>
                                We have verified <strong>{formData.company_name}</strong>.
                                <br /><br />
                                An activation link has been sent to <br />
                                <span style={{ color: '#00d4ff', fontFamily: 'monospace' }}>{formData.official_email}</span>
                            </p>

                            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b', textAlign: 'left', marginBottom: '2rem' }}>
                                <p style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>NEXT STEP:</p>
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Check your inbox and click the <strong>"Set Password"</strong> link to activate your digital identity and access the dashboard.</p>
                            </div>

                            <button onClick={() => navigate('/login')} className="btn-login-modern" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                RETURN TO LOGIN
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default RegisterCompany;
