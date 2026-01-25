import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, Handshake, Stethoscope, ArrowRight, CheckCircle2, ShieldCheck, Mail, Lock, FileText, BadgeCheck, FileCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import '../styles/Auth.css';

/**
 * RegisterCompany Component - Multi-Step Wizard
 * Solves "Lengthy Form" issue by breaking registration into bit-sized steps:
 * 1. Role & Identity
 * 2. Compliance
 * 3. Security
 */
const RegisterCompany = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('csr');
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        id_number: '',
        secondary_id: '',
        password: ''
    });

    // Roles allowed for registration
    const roles = [
        { id: 'csr', label: 'Corporate', icon: <Building2 size={18} />, color: '#00d4ff', desc: 'Donor' },
        { id: 'ngo', label: 'NGO', icon: <Handshake size={18} />, color: '#00ff9d', desc: 'Partner' },
        { id: 'clinic', label: 'Clinic', icon: <Stethoscope size={18} />, color: '#f97316', desc: 'Provider' },
        { id: 'auditor', label: 'Auditor', icon: <FileCheck size={18} />, color: '#94a3b8', desc: 'Verifier' },
    ];

    // Dynamic Config
    const getRoleConfig = (role) => {
        switch (role) {
            case 'ngo':
                return {
                    title: 'REGISTER NGO',
                    fields: {
                        name: { label: 'NGO NAME', placeholder: 'e.g. Hope Foundation' },
                        id: { label: 'DARPAN / REG ID', placeholder: 'NGO/2024/...' },
                    },
                    hideSecondary: true
                };
            case 'clinic':
                return {
                    title: 'REGISTER CLINIC',
                    fields: {
                        name: { label: 'CLINIC NAME', placeholder: 'e.g. City General' },
                        id: { label: 'LICENSE NUMBER', placeholder: 'LIC-998877' },
                    },
                    hideSecondary: true
                };
            case 'auditor':
                return {
                    title: 'REGISTER AUDITOR',
                    fields: {
                        name: { label: 'FIRM NAME', placeholder: 'e.g. Global Audit Services' },
                        id: { label: 'LICENSE / REG NO', placeholder: 'AUD-998877' },
                    },
                    hideSecondary: true
                };
            case 'csr':
            default:
                return {
                    title: 'REGISTER CORPORATE',
                    fields: {
                        name: { label: 'COMPANY NAME', placeholder: 'e.g. Acme Ltd' },
                        id: { label: 'CIN NUMBER', placeholder: 'L12345...' },
                        sec_id: { label: 'PAN NUMBER', placeholder: 'ABCDE...' }
                    },
                    hideSecondary: false
                };
        }
    };

    const config = getRoleConfig(selectedRole);
    const activeColor = roles.find(r => r.id === selectedRole).color;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
        else handleSubmit();
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = () => {
        setCurrentStep(4); // 4 = processing
        setTimeout(() => {
            setCurrentStep(5); // 5 = success
        }, 2000);
    };

    return (
        <div className="login-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem' }}>
            <motion.div
                className="login-card-responsive"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    width: '100%', maxWidth: '600px',
                    background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)',
                    borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
                    overflow: 'hidden', display: 'flex', flexDirection: 'column'
                }}
            >
                {/* HEADER & STEPS */}
                <div style={{ padding: '2rem 2rem 0', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#fff', letterSpacing: '1px' }}>{config.title}</h2>

                    {/* Progress Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '2rem' }}>
                        {[1, 2, 3].map(step => (
                            <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{
                                    width: '30px', height: '30px', borderRadius: '50%',
                                    background: currentStep >= step ? activeColor : 'rgba(255,255,255,0.1)',
                                    color: currentStep >= step ? '#000' : '#64748b',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.8rem', fontWeight: 'bold',
                                    transition: 'all 0.3s'
                                }}>
                                    {currentStep > step ? '✓' : step}
                                </div>
                                {step < 3 && <div style={{ width: '40px', height: '2px', background: currentStep > step ? activeColor : 'rgba(255,255,255,0.1)', margin: '0 8px' }} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div style={{ padding: '0 3rem 3rem', flex: 1, position: 'relative' }}>
                    <AnimatePresence mode="wait">

                        {/* STEP 1: IDENTITY */}
                        {currentStep === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                {/* Role Tabs */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '2rem' }}>
                                    {roles.map((role) => (
                                        <button key={role.id} onClick={() => setSelectedRole(role.id)}
                                            style={{
                                                padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                                background: selectedRole === role.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                color: selectedRole === role.id ? role.color : '#64748b',
                                                fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'
                                            }}>
                                            {role.icon} {role.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="input-group-modern">
                                    <label className="input-label" style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem' }}>{config.fields.name.label}</label>
                                    <input type="text" name="name" className="form-input" placeholder={config.fields.name.placeholder} value={formData.name} onChange={handleChange} />
                                </div>
                                <div className="input-group-modern" style={{ marginTop: '1rem' }}>
                                    <label className="input-label" style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem' }}>OFFICIAL EMAIL</label>
                                    <input type="email" name="email" className="form-input" placeholder="admin@org.com" value={formData.email} onChange={handleChange} />
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: VERIFICATION */}
                        {currentStep === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                    Please provide official registration details for verification.
                                </div>
                                <div className="input-group-modern">
                                    <label className="input-label" style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem' }}>{config.fields.id.label}</label>
                                    <input type="text" name="id_number" className="form-input" placeholder={config.fields.id.placeholder} value={formData.id_number} onChange={handleChange} />
                                </div>
                                {!config.hideSecondary && (
                                    <div className="input-group-modern" style={{ marginTop: '1rem' }}>
                                        <label className="input-label" style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem' }}>{config.fields.sec_id.label}</label>
                                        <input type="text" name="secondary_id" className="form-input" placeholder={config.fields.sec_id.placeholder} value={formData.secondary_id} onChange={handleChange} />
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 3: SECURITY */}
                        {currentStep === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                                    Secure your account with a strong password.
                                </div>
                                <div className="input-group-modern">
                                    <label className="input-label" style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem' }}>CREATE PASSWORD</label>
                                    <input type="password" name="password" className="form-input" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                                </div>
                                <ul style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1rem', paddingLeft: '1.2rem', lineHeight: '1.5' }}>
                                    <li>At least 8 characters</li>
                                    <li>One special character</li>
                                    <li>One number</li>
                                </ul>
                            </motion.div>
                        )}

                        {/* PROCESSING & SUCCESS STATES */}
                        {currentStep >= 4 && (
                            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '2rem 0' }}>
                                {currentStep === 4 ? (
                                    <>
                                        <div className="spinner-container" style={{ margin: '0 auto 2rem' }}>
                                            <motion.div style={{ width: '50px', height: '50px', border: '3px solid rgba(255,255,255,0.1)', borderTop: `3px solid ${activeColor}`, borderRadius: '50%', margin: '0 auto' }}
                                                animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                                        </div>
                                        <h3>VERIFYING...</h3>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={50} color={activeColor} style={{ margin: '0 auto 1rem' }} />
                                        <h3 style={{ color: activeColor }}>REGISTRATION COMPLETE</h3>
                                        <button onClick={() => navigate('/login')} className="btn-login-modern" style={{ background: activeColor, color: '#000', marginTop: '2rem', width: 'auto', padding: '10px 30px' }}>PROCEED TO LOGIN</button>
                                    </>
                                )}
                            </motion.div>
                        )}

                    </AnimatePresence>

                    {/* FOOTER ACTIONS */}
                    {currentStep <= 3 && (
                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                            {currentStep > 1 ? (
                                <button onClick={prevStep} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <ChevronLeft size={16} /> Back
                                </button>
                            ) : <div />}

                            <button onClick={nextStep}
                                style={{
                                    background: activeColor, color: '#000', border: 'none', borderRadius: '30px',
                                    padding: '10px 24px', fontWeight: 'bold', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    boxShadow: `0 0 15px ${activeColor}40`
                                }}>
                                {currentStep === 3 ? 'Register' : 'Next'} <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <span onClick={() => navigate('/login')} style={{ fontSize: '0.8rem', color: '#64748b', cursor: 'pointer' }}>Already have an account? Login</span>
                        </div>
                    )}

                </div>
            </motion.div>
        </div>
    );
};

export default RegisterCompany;
