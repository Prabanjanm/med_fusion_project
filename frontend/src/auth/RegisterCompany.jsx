import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Handshake, Stethoscope, ArrowRight, CheckCircle2, ShieldCheck, Mail, Lock, FileText, BadgeCheck, FileCheck, ChevronRight, ChevronLeft } from 'lucide-react';
import WelcomeCharacter from '../components/WelcomeCharacter';
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
    const location = useLocation();

    // Get role from URL query params (default to 'csr' if not found or invalid)
    const getInitialRole = () => {
        const searchParams = new URLSearchParams(location.search);
        const roleParam = searchParams.get('role');
        const validRoles = ['csr', 'ngo', 'clinic', 'auditor'];
        return validRoles.includes(roleParam) ? roleParam : 'csr';
    };

    const [selectedRole, setSelectedRole] = useState(getInitialRole());
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
                    width: '100%', maxWidth: '1000px', // Wider formatting for split view
                    height: '650px',
                    background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(20px)',
                    borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
                    overflow: 'hidden', display: 'flex', flexDirection: 'row',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                {/* --- LEFT PANEL: CHARACTER --- */}
                <div style={{
                    flex: '0 0 40%',
                    background: 'radial-gradient(circle at center, #1e3a8a30 0%, #0f172a 100%)',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '2rem', position: 'relative'
                }}>
                    {/* Character Container */}
                    <div style={{ width: '100%', height: '400px', position: 'relative' }}>
                        <WelcomeCharacter animation="greeting" />
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '-20px', zIndex: 10 }}>
                        <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Join the Network</h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>Secure, Transparent CSR Compliance</p>
                    </div>
                </div>

                {/* --- RIGHT PANEL: FORM --- */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', padding: '0' }}>

                    {/* Header Area */}
                    <div style={{ padding: '2rem 3rem 0', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#fff', letterSpacing: '0.5px' }}>{config.title}</h2>

                        {/* Progress Steps */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '1.5rem', marginBottom: '1rem' }}>
                            {[1, 2, 3].map(step => (
                                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: currentStep >= step ? activeColor : 'rgba(255,255,255,0.1)',
                                        color: currentStep >= step ? '#000' : '#64748b',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px',
                                        transition: 'all 0.3s'
                                    }}>
                                        {currentStep > step ? '✓' : step}
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: currentStep >= step ? activeColor : '#475569', fontWeight: '500' }}>
                                        {step === 1 ? 'Identity' : step === 2 ? 'Details' : 'Review'}
                                    </span>
                                </div>
                            ))}
                            {/* Connecting Lines */}
                            <div style={{ position: 'absolute', height: '2px', background: 'rgba(255,255,255,0.1)', width: '140px', top: '103px', zIndex: 0 }} />
                        </div>
                    </div>

                    {/* Scrollable Form Content */}
                    <div style={{ padding: '1rem 3rem 3rem', flex: 1, overflowY: 'auto' }}>
                        <AnimatePresence mode="wait">

                            {/* STEP 1: IDENTITY */}
                            {currentStep === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

                                    <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1.5rem' }}>Role Identification</h3>

                                    {/* Role Tabs */}
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                                        {roles.map((role) => (
                                            <button key={role.id} onClick={() => setSelectedRole(role.id)}
                                                style={{
                                                    flex: '1 1 40%',
                                                    padding: '10px', borderRadius: '8px', border: '1px solid transparent', cursor: 'pointer',
                                                    background: selectedRole === role.id ? `${activeColor}20` : 'rgba(255,255,255,0.05)',
                                                    borderColor: selectedRole === role.id ? activeColor : 'transparent',
                                                    color: selectedRole === role.id ? activeColor : '#94a3b8',
                                                    fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifySelf: 'center', gap: '8px'
                                                }}>
                                                {role.icon} {role.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="input-group-modern">
                                        <label className="input-label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{config.fields.name.label}</label>
                                        <input type="text" name="name" className="form-input" placeholder={config.fields.name.placeholder} value={formData.name} onChange={handleChange} style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.1)' }} />
                                    </div>
                                    <div className="input-group-modern" style={{ marginTop: '1.2rem' }}>
                                        <label className="input-label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>OFFICIAL EMAIL</label>
                                        <input type="email" name="email" className="form-input" placeholder="admin@org.com" value={formData.email} onChange={handleChange} style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.1)' }} />
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: VERIFICATION */}
                            {currentStep === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem' }}>Verification Details</h3>
                                    <div style={{ marginBottom: '1.5rem', color: '#94a3b8', fontSize: '0.85rem', background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #3b82f6' }}>
                                        Provide registration numbers for automated vetting.
                                    </div>
                                    <div className="input-group-modern">
                                        <label className="input-label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{config.fields.id.label}</label>
                                        <input type="text" name="id_number" className="form-input" placeholder={config.fields.id.placeholder} value={formData.id_number} onChange={handleChange} style={{ background: 'rgba(0,0,0,0.3)' }} />
                                    </div>
                                    {!config.hideSecondary && (
                                        <div className="input-group-modern" style={{ marginTop: '1.2rem' }}>
                                            <label className="input-label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{config.fields.sec_id.label}</label>
                                            <input type="text" name="secondary_id" className="form-input" placeholder={config.fields.sec_id.placeholder} value={formData.secondary_id} onChange={handleChange} style={{ background: 'rgba(0,0,0,0.3)' }} />
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* STEP 3: SECURITY */}
                            {currentStep === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem' }}>Account Security</h3>
                                    <div className="input-group-modern">
                                        <label className="input-label" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>CREATE PASSWORD</label>
                                        <input type="password" name="password" className="form-input" placeholder="••••••••" value={formData.password} onChange={handleChange} style={{ background: 'rgba(0,0,0,0.3)' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '1rem' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: formData.password.length >= 8 ? '#22c55e' : '#64748b' }} /> 8+ Characters
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: /[0-9]/.test(formData.password) ? '#22c55e' : '#64748b' }} /> Number
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* PROCESSING */}
                            {currentStep >= 4 && (
                                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '4rem 0' }}>
                                    {currentStep === 4 ? (
                                        <>
                                            <div className="spinner-container" style={{ margin: '0 auto 2rem' }}>
                                                <motion.div style={{ width: '60px', height: '60px', border: '4px solid rgba(255,255,255,0.1)', borderTop: `4px solid ${activeColor}`, borderRadius: '50%', margin: '0 auto' }}
                                                    animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                                            </div>
                                            <h3>VERIFYING CREDENTIALS...</h3>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={60} color={activeColor} style={{ margin: '0 auto 1.5rem' }} />
                                            <h3 style={{ color: activeColor, fontSize: '1.5rem' }}>Welcome Aboard!</h3>
                                            <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Your account has been successfully created.</p>
                                            <button onClick={() => navigate('/login')} className="btn-login-modern" style={{ background: activeColor, color: '#000', marginTop: '2.5rem', width: '100%', padding: '12px' }}>PROCEED TO LOGIN</button>
                                        </>
                                    )}
                                </motion.div>
                            )}

                        </AnimatePresence>

                        {/* NAVIGATION BUTTONS */}
                        {currentStep <= 3 && (
                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                {currentStep > 1 ? (
                                    <button onClick={prevStep} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.9rem' }}>
                                        Back
                                    </button>
                                ) : <div />}

                                <button onClick={nextStep}
                                    style={{
                                        background: activeColor, color: '#000', border: 'none', borderRadius: '8px',
                                        padding: '10px 30px', fontWeight: 'bold', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem',
                                        boxShadow: `0 4px 12px ${activeColor}30`
                                    }}>
                                    {currentStep === 3 ? 'Complete Registration' : 'Next Step'} <ArrowRight size={16} />
                                </button>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                <span onClick={() => navigate('/login')} style={{ fontSize: '0.85rem', color: '#64748b', cursor: 'pointer' }}>Already have an account? Login</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* CSS Override for Responsive */}
                <style>{`
                    @media (max-width: 900px) {
                        .login-card-responsive {
                            flex-direction: column !important;
                            height: auto !important;
                            max-width: 500px !important;
                        }
                        .login-card-responsive > div:first-child {
                            flex: 0 0 250px !important;
                            width: 100% !important;
                            border-right: none !important;
                            border-bottom: 1px solid rgba(255,255,255,0.1);
                        }
                    }
                `}</style>

            </motion.div>
        </div>
    );
};

export default RegisterCompany;
