import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Handshake, Stethoscope, FileCheck, ArrowRight, ShieldCheck, Info } from 'lucide-react';
import WelcomeCharacter from '../components/WelcomeCharacter';
import '../styles/Auth.css';

/**
 * Login Component - Cinematic Split Layout
 * Solves "Too Long" issue by using a horizontal landscape design.
 */
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState('csr');
  const [formData, setFormData] = useState({ identifier: '', secret: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeField, setActiveField] = useState('idle');

  // Role Configurations
  const roles = [
    { id: 'csr', label: 'CSR Donor', icon: <Building2 size={22} />, color: '#00d4ff' },
    { id: 'ngo', label: 'NGO Partner', icon: <Handshake size={22} />, color: '#00ff9d' },
    { id: 'clinic', label: 'Clinic', icon: <Stethoscope size={22} />, color: '#f97316' },
    { id: 'auditor', label: 'Auditor', icon: <FileCheck size={22} />, color: '#94a3b8' },
  ];

  const getRoleConfig = (role) => {
    switch (role) {
      case 'ngo': return { emailLabel: 'ORGANIZATION EMAIL', emailPlaceholder: 'ngo@org.com', secretLabel: 'NGO ID / PASSWORD', secretPlaceholder: 'NGO-XXXXXX', btnText: 'LOGIN AS NGO' };
      case 'clinic': return { emailLabel: 'HOSPITAL EMAIL', emailPlaceholder: 'admin@hotel.com', secretLabel: 'CLINIC REG ID', secretPlaceholder: 'LIC-XXXXXX', btnText: 'LOGIN AS CLINIC' };
      case 'auditor': return { emailLabel: 'GOV / AUDITOR EMAIL', emailPlaceholder: 'auditor@gov.in', secretLabel: 'LICENSE ID', secretPlaceholder: 'AUD-XXXXXX', btnText: 'LOGIN AS AUDITOR' };
      default: return { emailLabel: 'CORPORATE EMAIL', emailPlaceholder: 'csr@company.com', secretLabel: 'ACCESS KEY', secretPlaceholder: '••••••••', btnText: 'LOGIN AS CSR' };
    }
  };

  const config = getRoleConfig(selectedRole);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!formData.identifier || !formData.secret) throw new Error('CREDENTIALS REQUIRED');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setActiveField('success');
      setTimeout(() => {
        login(formData.identifier, selectedRole);
        navigate(`/${selectedRole}`);
      }, 800);
    } catch (err) {
      setError(err.message || 'AUTHENTICATION FAILED');
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
          display: 'flex',
          width: '100%',
          maxWidth: '900px',
          height: '550px', // Fixed nice cinematic height
          background: 'rgba(15, 23, 42, 0.70)', // Matches RegisterCompany
          backdropFilter: 'blur(24px)', // Matches RegisterCompany
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)', // Matches RegisterCompany
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6)', // Matches RegisterCompany
          overflow: 'hidden',
          flexDirection: 'row' // Default horizontal
        }}
        className="login-card-responsive" // Use CSS class for mobile stack overriding
      >

        {/* LEFT PANEL: BRANDING & VISUAL (40%) */}
        <div style={{
          flex: '0 0 40%',
          background: `radial-gradient(circle at center, ${roles.find(r => r.id === selectedRole).color}15 0%, rgba(15, 23, 42, 0.5) 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '2rem',
          position: 'relative',
          transition: 'background 0.5s ease'
        }}>

          {/* Heart Animation - Large and Centered */}
          <div style={{ width: '160px', height: '160px', position: 'relative', marginBottom: '1.5rem' }}>
            <svg viewBox="0 0 200 200" className="heart-visual-svg" style={{ width: '100%', height: '100%', dropShadow: '0 0 20px rgba(0,0,0,0.6)' }}>
              {/* Blue Curve Underneath - Breathy Glow */}
              <motion.path
                d="M40,140 Q100,190 160,140"
                stroke="#00d4ff"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: [0.6, 1, 0.6],
                  filter: activeField === 'identifier' ? "drop-shadow(0 0 8px #00d4ff)" : "drop-shadow(0 0 3px #00d4ff)"
                }}
                transition={{
                  pathLength: { duration: 1.5, delay: 0.5 },
                  opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  filter: { duration: 0.5 }
                }}
              />

              {/* Heart Shape - Red Fixed Color */}
              <motion.path
                d="M100,165 C100,165 50,130 50,90 C50,60 75,50 100,80 C125,50 150,60 150,90 C150,130 100,165 100,165 Z"
                stroke="#ff004c"
                strokeWidth="4"
                fill={activeField === 'secret' ? `${roles.find(r => r.id === selectedRole).color}20` : "none"}
                strokeLinecap="round"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  filter: activeField === 'secret' ? 'blur(1px)' : 'none',
                  stroke: "#ff004c"
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />

              {/* SHIELD OVERLAY (Password Mode - Privacy) */}
              {activeField === 'secret' && (
                <motion.path
                  d="M100,75 L120,90 L120,110 C120,125 100,140 100,140 C100,140 80,125 80,110 L80,90 Z"
                  stroke="#00ff88"
                  strokeWidth="2"
                  fill="rgba(0, 255, 136, 0.15)"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              {/* ECG Pulse - Continuous Animation */}
              <motion.path
                d="M70,110 L90,110 L95,85 L105,135 L115,110 L130,110"
                stroke="#e2e8f0"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="100"
                strokeDashoffset="100"
                animate={
                  activeField === 'success' ? { scale: 1.5, opacity: 0 } :
                    { strokeDashoffset: [100, -100], opacity: activeField === 'secret' ? 0.5 : 1 }
                }
                transition={
                  activeField === 'success' ? { duration: 0.5 } :
                    {
                      strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" },
                      opacity: { duration: 0.3 }
                    }
                }
              />
            </svg>
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '2px', color: '#fff', margin: 0 }}>CSR TRACKER</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem', letterSpacing: '1px' }}>Global Trust Network</p>

          {/* Dynamic Role Badge */}
          <div style={{
            marginTop: '2rem',
            padding: '6px 16px',
            borderRadius: '20px',
            background: `${roles.find(r => r.id === selectedRole).color}20`,
            color: roles.find(r => r.id === selectedRole).color,
            border: `1px solid ${roles.find(r => r.id === selectedRole).color}60`,
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <ShieldCheck size={14} /> SECURE GATEWAY
          </div>
        </div>

        {/* RIGHT PANEL: INTERACTION (60%) */}
        <div style={{ flex: '1', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>

          {/* COMPACT ROLE TABS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '12px' }}>
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                style={{
                  flex: 1,
                  background: selectedRole === role.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  color: selectedRole === role.id ? role.color : '#64748b',
                  fontSize: '0.8rem',
                  fontWeight: selectedRole === role.id ? '600' : '400',
                  transition: 'all 0.3s'
                }}
              >
                {role.icon}
                <span className="role-label-text">{role.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="login-form-simple" style={{ flex: 1 }}>
            <AnimatePresence mode="wait">
              <motion.div key={selectedRole} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600' }}>{config.emailLabel}</label>
                  <input
                    type="text"
                    name="identifier"
                    className="form-input"
                    placeholder={config.emailPlaceholder}
                    value={formData.identifier}
                    onChange={handleInputChange}
                    onFocus={() => setActiveField('identifier')}
                    onBlur={() => setActiveField('idle')}
                    style={{ background: 'rgba(0,0,0,0.2)', height: '45px' }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: '600' }}>{config.secretLabel}</label>
                  <input
                    type="password"
                    name="secret"
                    className="form-input"
                    placeholder={config.secretPlaceholder}
                    value={formData.secret}
                    onChange={handleInputChange}
                    onFocus={() => setActiveField('secret')}
                    onBlur={() => setActiveField('idle')}
                    style={{ background: 'rgba(0,0,0,0.2)', height: '45px' }}
                    required
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {error && <div className="error-message-modern" style={{ height: 'auto', padding: '0.5rem' }}>⚠ {error}</div>}

            <button
              type="submit"
              className="btn-login-modern"
              style={{
                background: `linear-gradient(90deg, ${roles.find(r => r.id === selectedRole).color} 0%, ${roles.find(r => r.id === selectedRole).color}dd 100%)`,
                color: '#000', fontWeight: 'bold', marginTop: '1rem', height: '50px'
              }}
            >
              {loading ? 'VERIFYING...' : config.btnText} <ArrowRight size={18} />
            </button>
          </form>

          {/* Footer Area */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
            <span onClick={() => navigate('/register')} style={{ color: '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              Create New Account <ArrowRight size={14} />
            </span>

            {/* Tiny Demo Links */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {roles.map(r => (
                <div key={r.id} onClick={() => { setSelectedRole(r.id); login(`demo@${r.id}.com`, r.id); navigate(`/${r.id}`) }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color, cursor: 'pointer', opacity: 0.5 }} title={`Demo ${r.label}`} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Responsive CSS Override */}
      <style>{`
        @media (max-width: 768px) {
           .login-card-responsive {
              flex-direction: column !important;
              height: auto !important;
           }
           .role-label-text { display: none; }
        }
      `}</style>
    </div>
  );
};

export default Login;
