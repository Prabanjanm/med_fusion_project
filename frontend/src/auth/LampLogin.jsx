import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { TextField, Button, Box, Container, Typography, Paper } from '@mui/material';
import '../styles/LampLogin.css';

/**
 * Lamp-Based Creative Login Component
 * Features: Interactive lamp with eyes, rope pull interaction, smooth animations
 */
const LampLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'csr',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lampOn, setLampOn] = useState(true);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const [passwordFocused, setPasswordFocused] = useState(false);
  const containerRef = useRef(null);

  // Track mouse position for eye following effect
  const handleMouseMove = (e) => {
    if (passwordFocused || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const lampCenterX = rect.width / 2;
    const lampCenterY = rect.height / 3;

    const angle = Math.atan2(e.clientY - rect.top - lampCenterY, e.clientX - rect.left - lampCenterX);
    const distance = 8;

    setEyePosition({
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
    });
  };

  const handleRopeClick = () => {
    setLampOn(!lampOn);
    setIsLoginMode(!isLoginMode);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    if (formData.password === '') {
      setPasswordFocused(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.username.trim()) {
        throw new Error('Please enter your username');
      }
      if (!formData.password.trim()) {
        throw new Error('Please enter a password');
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
      login(formData.username, formData.role);
      navigate(`/${formData.role}`);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, staggerChildren: 0.2 },
    },
  };

  const lampVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8 } },
  };

  const formVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } },
  };

  const lampSwayVariants = {
    sway: {
      y: [0, -5, 0],
      rotate: [-1, 1, -1],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const ropeVariants = {
    idle: { y: 0 },
    pulled: {
      y: 30,
      transition: { duration: 0.3, type: 'spring', stiffness: 100 },
    },
  };

  const eyeVariants = {
    open: { scaleY: 1 },
    closed: { scaleY: 0.1 },
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`lamp-login-wrapper ${lampOn ? 'lamp-on' : 'lamp-off'}`}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: lampOn 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
        transition: 'background 0.8s ease',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px',
      }}
    >
      <motion.div
        className="lamp-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: lampOn ? 0.2 : 0.8 }}
        transition={{ duration: 0.8 }}
      />

      <Container maxWidth="md" className="lamp-container">
        <motion.div
          className="lamp-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* LAMP SECTION */}
          <motion.div
            className="lamp-section"
            animate="sway"
            variants={lampSwayVariants}
          >
            <div className="lamp-wrapper">
              {/* Rope */}
              <motion.div
                className="rope"
                variants={ropeVariants}
                animate={lampOn ? 'idle' : 'pulled'}
                onClick={handleRopeClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleRopeClick();
                }}
                aria-label="Toggle lamp and switch mode"
              >
                <div className="rope-knot"></div>
              </motion.div>

              {/* Lamp Bulb Container */}
              <motion.div
                className="lamp-bulb-container"
                animate={{
                  boxShadow: lampOn
                    ? [
                        '0 0 20px rgba(255, 223, 87, 0.5)',
                        '0 0 40px rgba(255, 223, 87, 0.7)',
                        '0 0 20px rgba(255, 223, 87, 0.5)',
                      ]
                    : 'none',
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* Lamp Bulb */}
                <svg className="lamp-bulb" viewBox="0 0 100 140">
                  {/* Bulb Glow Background */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill={lampOn ? 'rgba(255, 223, 87, 0.3)' : 'rgba(100, 100, 100, 0.1)'}
                  />

                  {/* Bulb Main Shape */}
                  <path
                    d="M 30 50 Q 30 30 50 25 Q 70 30 70 50 Q 70 75 50 85 Q 30 75 30 50"
                    fill={lampOn ? '#FFDF57' : '#666'}
                    stroke={lampOn ? '#FFC107' : '#333'}
                    strokeWidth="2"
                  />

                  {/* Left Eye */}
                  <g className="eye left-eye">
                    <ellipse cx="40" cy="48" rx="8" ry="12" fill="white" />
                    <motion.circle
                      cx={40 + eyePosition.x * 0.6}
                      cy={48 + eyePosition.y * 0.6}
                      r="6"
                      fill="black"
                      animate={passwordFocused ? 'closed' : 'open'}
                      variants={eyeVariants}
                    />
                  </g>

                  {/* Right Eye */}
                  <g className="eye right-eye">
                    <ellipse cx="60" cy="48" rx="8" ry="12" fill="white" />
                    <motion.circle
                      cx={60 + eyePosition.x * 0.6}
                      cy={48 + eyePosition.y * 0.6}
                      r="6"
                      fill="black"
                      animate={passwordFocused ? 'closed' : 'open'}
                      variants={eyeVariants}
                    />
                  </g>

                  {/* Highlight for bulb shine */}
                  <ellipse cx="40" cy="35" rx="8" ry="10" fill="white" opacity="0.4" />
                </svg>

                {/* Lamp Base */}
                <div className="lamp-base">
                  <div className="base-top"></div>
                  <div className="base-middle"></div>
                  <div className="base-bottom"></div>
                </div>
              </motion.div>

              {/* Mode Indicator */}
              <motion.div
                className="mode-indicator"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {lampOn ? '💡 Login' : '🔐 Signup'}
              </motion.div>
            </div>

            {/* Rope Pull Hint */}
            <motion.p
              className="rope-hint"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Pull the rope to switch mode
            </motion.p>
          </motion.div>

          {/* FORM SECTION */}
          <motion.div
            className="form-section"
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            <Paper elevation={3} className="form-paper">
              <div className="form-header">
                <Typography variant="h5" className="form-title">
                  {lampOn ? 'Welcome Back' : 'Join Us'}
                </Typography>
                <Typography variant="body2" className="form-subtitle">
                  {lampOn ? 'Sign in to your account' : 'Create a new account'}
                </Typography>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                {/* Username Field */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <TextField
                    fullWidth
                    label="Username or Email"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="john.doe"
                    disabled={loading}
                    variant="outlined"
                    className="form-input"
                    autoFocus
                  />
                </motion.div>

                {/* Password Field with Privacy Joke */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    variant="outlined"
                    className="form-input"
                    onFocus={handlePasswordFocus}
                    onBlur={handlePasswordBlur}
                  />
                  {passwordFocused && (
                    <motion.p
                      className="privacy-hint"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      👀 I'll look away while you type
                    </motion.p>
                  )}
                </motion.div>

                {/* Role Selection (Minimal for form) */}
                <motion.div
                  className="role-selection-compact"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Typography variant="body2" className="role-label">
                    Select Role:
                  </Typography>
                  <div className="role-buttons-compact">
                    {[
                      { value: 'csr', label: 'CSR', icon: '👤' },
                      { value: 'ngo', label: 'NGO', icon: '🤝' },
                      { value: 'clinic', label: 'Clinic', icon: '⚕️' },
                      { value: 'auditor', label: 'Auditor', icon: '✓' },
                    ].map((role) => (
                      <motion.button
                        key={role.value}
                        type="button"
                        className={`role-btn-compact ${
                          formData.role === role.value ? 'active' : ''
                        }`}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, role: role.value }))
                        }
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="role-icon-compact">{role.icon}</span>
                        <span className="role-text-compact">{role.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    className="error-alert"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="error-icon">⚠️</span>
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="submit-button"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 600,
                      padding: '12px 20px',
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                      },
                    }}
                  >
                    {loading ? (
                      <>
                        <motion.span
                          className="spinner-inline"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, linear: true }}
                        >
                          ⟳
                        </motion.span>
                        {lampOn ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : lampOn ? (
                      'Sign In'
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </motion.div>

                {/* Demo Notice */}
                <motion.div
                  className="demo-notice-lamp"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Typography variant="caption">
                    💡 Demo: Use any username/password • Pull rope to toggle mode
                  </Typography>
                </motion.div>
              </form>
            </Paper>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
};

export default LampLogin;
