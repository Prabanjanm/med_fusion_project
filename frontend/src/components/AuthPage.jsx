import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthPage.css';
import LampCharacter from './LampCharacter';
import LoginForm from './LoginForm';
import BackgroundEffects from './BackgroundEffects';

/**
 * AuthPage Component
 * ==================
 * Main authentication page combining:
 * - Premium background animations
 * - Interactive lamp character
 * - Responsive login/signup form
 * - Smooth mode transitions
 *
 * This is the main entry point for authentication.
 * All backend integration happens through callbacks.
 */

const AuthPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // STATE MANAGEMENT FOR AUTH: Authentication mode and interaction state
  const [isSignIn, setIsSignIn] = useState(true);
  const [passwordValid, setPasswordValid] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedRole, setSelectedRole] = useState('csr');

  // Available roles
  const ROLES = [
    { value: 'csr', label: 'CSR Donor', icon: '💼' },
    { value: 'ngo', label: 'NGO Partner', icon: '🤝' },
    { value: 'clinic', label: 'Clinic', icon: '⚕️' },
    { value: 'auditor', label: 'Auditor', icon: '✓' },
  ];

  // HANDLER: Toggle between sign in and sign up mode
  const handleModeToggle = () => {
    setIsSignIn(!isSignIn);
    setPasswordValid(false);
  };

  // HANDLER: Update password validation state (controls lamp eyes)
  const handlePasswordChange = (isValid) => {
    setPasswordValid(isValid);
  };

  // HANDLER: Input focus state (controls lamp glow)
  const handleInputFocus = () => {
    setIsFocused(true);
  };

  // HANDLER: Input blur state
  const handleInputBlur = () => {
    setIsFocused(false);
  };

  // HANDLER: Form submission
  // BACKEND INTEGRATION POINT: This is where we handle successful authentication
  const handleFormSubmit = async (data) => {
    console.log('Auth attempt:', data);

    try {
      // Extract username from email (before @)
      const username = data.email.split('@')[0];

      // Login user with selected role
      login(username, selectedRole);

      // Navigate to role-specific dashboard
      navigate(`/${selectedRole}`);
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <div className="auth-page">
      {/* BACKGROUND EFFECTS - Non-interactive layer */}
      <BackgroundEffects />

      {/* MAIN CONTENT CONTAINER */}
      <motion.div
        className="auth-container"
        animate={{
          opacity: 1,
        }}
        initial={{
          opacity: 0,
        }}
        transition={{
          duration: 0.8,
          ease: 'easeOut',
        }}
      >
        {/* LEFT SIDE - Lamp Character */}
        <motion.div
          className="auth-left"
          animate={{
            x: 0,
            opacity: 1,
          }}
          initial={{
            x: -50,
            opacity: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: 'easeOut',
          }}
        >
          {/* LAMP CHARACTER - Interactive focal point */}
          <LampCharacter
            isSignIn={isSignIn}
            passwordValid={passwordValid}
            isFocused={isFocused}
          />
        </motion.div>

        {/* RIGHT SIDE - Authentication Form */}
        <motion.div
          className="auth-right"
          animate={{
            x: 0,
            opacity: 1,
          }}
          initial={{
            x: 50,
            opacity: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: 'easeOut',
          }}
        >
          {/* MODE TOGGLE - Switch between Sign In / Sign Up */}
          <motion.div className="mode-toggle">
            <motion.div
              className={`toggle-option ${isSignIn ? 'active' : ''}`}
              onClick={handleModeToggle}
              animate={{
                color: isSignIn ? '#fff' : '#94a3b8',
              }}
            >
              Sign In
            </motion.div>
            <div className="toggle-separator"></div>
            <motion.div
              className={`toggle-option ${!isSignIn ? 'active' : ''}`}
              onClick={handleModeToggle}
              animate={{
                color: !isSignIn ? '#fff' : '#94a3b8',
              }}
            >
              Sign Up
            </motion.div>
          </motion.div>

          {/* ROLE SELECTOR - Choose user role */}
          <motion.div
            className="role-selector"
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="role-label">Select Your Role:</p>
            <div className="role-buttons">
              {ROLES.map((role) => (
                <motion.button
                  key={role.value}
                  type="button"
                  className={`role-btn ${selectedRole === role.value ? 'active' : ''}`}
                  onClick={() => setSelectedRole(role.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="role-icon">{role.icon}</span>
                  <span className="role-text">{role.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* FORM CONTAINER - Animated form switching */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isSignIn ? 'signin' : 'signup'}
              animate={{
                opacity: 1,
                y: 0,
              }}
              initial={{
                opacity: 0,
                y: 20,
              }}
              exit={{
                opacity: 0,
                y: -20,
              }}
              transition={{
                duration: 0.4,
                ease: 'easeInOut',
              }}
            >
              <LoginForm
                isSignIn={isSignIn}
                onPasswordChange={handlePasswordChange}
                onInputFocus={handleInputFocus}
                onInputBlur={handleInputBlur}
                onSubmit={handleFormSubmit}
              />
            </motion.div>
          </AnimatePresence>

          {/* DECORATIVE LINE - Visual separator */}
          <motion.div className="decorative-line"></motion.div>
        </motion.div>
      </motion.div>

      {/* RESPONSIVE INDICATOR - Shows current breakpoint (development) */}
      <motion.div className="responsive-indicator">
        <span className="mobile">Mobile</span>
        <span className="tablet">Tablet</span>
        <span className="desktop">Desktop</span>
      </motion.div>
    </div>
  );
};

export default AuthPage;
