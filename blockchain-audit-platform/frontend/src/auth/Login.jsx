import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Auth.css';

/**
 * Login Component - Medical Trust Edition
 * "Helping Hands holding a Heart with ECG" - Futuristic Neon Outline
 */
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState('idle'); // idle, email, password

  // Determine role based on email domain (Simulation Logic)
  const determineRole = (email) => {
    if (email.includes('csr')) return 'csr';
    if (email.includes('ngo')) return 'ngo';
    if (email.includes('clinic')) return 'clinic';
    if (email.includes('audit')) return 'auditor';
    return 'csr'; // Default fallback
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Basic validation
      if (!formData.email || !formData.password) {
        throw new Error('CREDENTIALS REQUIRED');
      }

      // Simulate Authentication Handshake
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const role = determineRole(formData.email);
      login(formData.email, role);

      // Animation: Login Success - ECG Expands
      setActiveField('success');

      // Delay navigation to show success animation
      setTimeout(() => {
        navigate(`/${role}`);
      }, 800);

    } catch (err) {
      setError(err.message || 'AUTHENTICATION FAILED');
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <motion.div
        className="login-card-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >

        {/* CENTRAL VISUAL: Heart + ECG + Curve Underneath */}
        <div className="medical-visual">
          <svg viewBox="0 0 200 200" className="heart-visual-svg">
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
                filter: activeField === 'email' ? "drop-shadow(0 0 8px #00d4ff)" : "drop-shadow(0 0 3px #00d4ff)"
              }}
              transition={{
                pathLength: { duration: 1.5, delay: 0.5 },
                opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                filter: { duration: 0.5 }
              }}
            />

            {/* Heart Shape - Red/Pink */}
            <motion.path
              d="M100,165 C100,165 50,130 50,90 C50,60 75,50 100,80 C125,50 150,60 150,90 C150,130 100,165 100,165 Z"
              stroke="#ff004c"
              strokeWidth="4"
              fill={activeField === 'password' ? "rgba(255, 0, 76, 0.1)" : "none"}
              strokeLinecap="round"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                filter: activeField === 'password' ? 'blur(1px)' : 'none'
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />

            {/* SHIELD OVERLAY (Password Mode - Privacy) */}
            {activeField === 'password' && (
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

            {/* ECG Pulse - Interactive Animations */}
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
                  activeField === 'email' ? { strokeDashoffset: [100, -100], opacity: 1 } :
                    activeField === 'password' ? { opacity: 0.3 } :
                      { strokeDashoffset: 0, opacity: 1 }
              }
              transition={
                activeField === 'success' ? { duration: 0.5 } :
                  activeField === 'email' ? { duration: 1.5, repeat: Infinity, ease: "linear" } :
                    { duration: 1, delay: activeField === 'idle' ? 1 : 0 }
              }
            />
          </svg>
        </div>

        <h2 className="login-title">CSR TRACKER</h2>
        <p className="login-subtitle">SECURE DONATION PORTAL</p>

        {/* Dynamic Privacy Indicator */}
        <AnimatePresence>
          {activeField === 'password' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                color: '#00ff88',
                fontSize: '0.75rem',
                marginBottom: '1rem',
                fontWeight: '600',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'Orbitron, sans-serif'
              }}
            >
              🔒 PRIVACY PROTECTED
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="login-form-simple">
          <div className="input-group-modern">
            <input
              type="email"
              name="email"
              placeholder="OPERATOR EMAIL"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => setActiveField('email')}
              onBlur={() => setActiveField('idle')}
              required
              autoComplete="off"
            />
          </div>

          <div className="input-group-modern">
            <input
              type="password"
              name="password"
              placeholder="ACCESS KEY"
              value={formData.password}
              onChange={handleInputChange}
              onFocus={() => setActiveField('password')}
              onBlur={() => setActiveField('idle')}
              required
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="error-message-modern"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                ⚠ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="btn-login-modern"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? 'ESTABLISHING...' : 'ESTABLISH LINK'}
          </motion.button>
        </form>

        <div className="login-footer-modern">
          <p>AUTHORIZED PERSONNEL ONLY // V.3.1.0</p>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;
