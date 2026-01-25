import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginForm.css';
import AnimatedButton from './AnimatedButton';

/**
 * LoginForm Component
 * ===================
 * Premium authentication form with:
 * - Real-time password validation
 * - Input focus feedback
 * - Smooth field transitions
 * - Backend integration points for API calls
 *
 * Props:
 * - isSignIn: Boolean - toggle between sign in/sign up mode
 * - onPasswordChange: Function - callback when password changes
 * - onInputFocus: Function - callback when input gains focus
 * - onInputBlur: Function - callback when input loses focus
 * - onSubmit: Function - callback on form submission
 */

const LoginForm = ({
  isSignIn = true,
  onPasswordChange,
  onInputFocus,
  onInputBlur,
  onInputBlur,
  onSubmit,
}) => {
  const navigate = useNavigate();
  // STATE MANAGEMENT FOR AUTH: Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // VALIDATION LOGIC: Password requirements
  // - Minimum 8 characters
  // - At least one uppercase
  // - At least one number
  const isPasswordValid = (pwd) => {
    if (!pwd) return false;
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /\d/.test(pwd);
  };

  // VALIDATION LOGIC: Email format
  const isEmailValid = (mail) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
  };

  // HANDLER: Email input change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    // BACKEND INTEGRATION POINT: Email validation could be deferred to backend
  };

  // HANDLER: Password input change
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    // VALIDATION LOGIC: Trigger password validation callback
    onPasswordChange?.(isPasswordValid(value));
  };

  // HANDLER: Confirm password (sign up only)
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  // HANDLER: Input focus
  const handleInputFocus = () => {
    setIsFocused(true);
    onInputFocus?.();
  };

  // HANDLER: Input blur
  const handleInputBlur = () => {
    setIsFocused(false);
    onInputBlur?.();
  };

  // HANDLER: Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // VALIDATION LOGIC: Pre-flight validation before API call
    if (!isEmailValid(email)) {
      setError('Invalid email address');
      return;
    }

    if (!isPasswordValid(password)) {
      setError('Password must be at least 8 characters with uppercase and number');
      return;
    }

    if (!isSignIn && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // API CALL PLACEHOLDER: This is where authentication happens
      // const response = await api.auth[isSignIn ? 'login' : 'signup']({
      //   email,
      //   password,
      // });
      // BACKEND INTEGRATION POINT: Handle authentication token storage
      // localStorage.setItem('authToken', response.token);
      // localStorage.setItem('userId', response.userId);

      // CALLBACK: Notify parent component of successful auth
      onSubmit?.({
        email,
        password,
        isSignIn,
      });
    } catch (err) {
      // BACKEND INTEGRATION POINT: Display backend error messages
      // setError(err.response?.data?.message || 'Authentication failed');
      setError('Authentication service unavailable - check backend connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      className="login-form"
      onSubmit={handleSubmit}
      animate={{
        opacity: 1,
        y: 0,
      }}
      initial={{
        opacity: 0,
        y: 20,
      }}
      transition={{
        duration: 0.6,
        ease: 'easeOut',
      }}
    >
      {/* FORM TITLE - Changes based on mode */}
      <motion.h1
        className="form-title"
        key={isSignIn ? 'signin' : 'signup'}
        animate={{
          opacity: 1,
          x: 0,
        }}
        initial={{
          opacity: 0,
          x: -20,
        }}
        transition={{
          duration: 0.4,
        }}
      >
        {isSignIn ? 'Welcome Back' : 'Join Us'}
      </motion.h1>

      {/* SUBTITLE */}
      <motion.p className="form-subtitle">
        {isSignIn
          ? 'Light up your audit experience'
          : 'Start your blockchain journey'}
      </motion.p>

      {/* ERROR MESSAGE - Backend integration point */}
      {error && (
        <motion.div
          className="form-error"
          animate={{
            opacity: 1,
            y: 0,
          }}
          initial={{
            opacity: 0,
            y: -10,
          }}
          exit={{
            opacity: 0,
            y: -10,
          }}
        >
          {error}
        </motion.div>
      )}

      {/* EMAIL INPUT FIELD */}
      <motion.div
        className="form-group"
        animate={{
          opacity: 1,
        }}
        initial={{
          opacity: 0,
        }}
        transition={{
          delay: 0.1,
          duration: 0.4,
        }}
      >
        <label htmlFor="email" className="form-label">
          Email Address
        </label>
        <div className="input-wrapper">
          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
            value={email}
            onChange={handleEmailChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            disabled={loading}
            required
          />
          <div className="input-border"></div>
        </div>
      </motion.div>

      {/* PASSWORD INPUT FIELD */}
      <motion.div
        className="form-group"
        animate={{
          opacity: 1,
        }}
        initial={{
          opacity: 0,
        }}
        transition={{
          delay: 0.15,
          duration: 0.4,
        }}
      >
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <div className="input-wrapper">
          <input
            id="password"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={handlePasswordChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            disabled={loading}
            required
          />
          <div className="input-border"></div>
          {/* PASSWORD STRENGTH INDICATOR */}
          <motion.div
            className="password-strength"
            animate={{
              width: isPasswordValid(password) ? '100%' : `${(password.length / 8) * 50}%`,
              backgroundColor: isPasswordValid(password)
                ? 'rgb(34, 197, 94)'
                : 'rgb(239, 68, 68)',
            }}
            transition={{
              duration: 0.3,
            }}
          ></motion.div>
        </div>
        {/* PASSWORD VALIDATION HINT */}
        <motion.div className="password-hint">
          {password.length > 0 && (
            <>
              <span className={password.length >= 8 ? 'valid' : 'invalid'}>
                ✓ 8+ characters
              </span>
              <span className={/[A-Z]/.test(password) ? 'valid' : 'invalid'}>
                ✓ Uppercase letter
              </span>
              <span className={/\d/.test(password) ? 'valid' : 'invalid'}>
                ✓ Number
              </span>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* CONFIRM PASSWORD (Sign Up Only) */}
      {!isSignIn && (
        <motion.div
          className="form-group"
          animate={{
            opacity: 1,
            height: 'auto',
          }}
          initial={{
            opacity: 0,
            height: 0,
          }}
          transition={{
            delay: 0.2,
            duration: 0.4,
          }}
        >
          <label htmlFor="confirm-password" className="form-label">
            Confirm Password
          </label>
          <div className="input-wrapper">
            <input
              id="confirm-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              disabled={loading}
              required={!isSignIn}
            />
            <div className="input-border"></div>
          </div>
        </motion.div>
      )}

      {/* SUBMIT BUTTON */}
      <motion.div
        animate={{
          opacity: 1,
        }}
        initial={{
          opacity: 0,
        }}
        transition={{
          delay: 0.25,
          duration: 0.4,
        }}
      >
        <AnimatedButton
          type="submit"
          loading={loading}
          disabled={loading}
          variant="primary"
        >
          {isSignIn ? 'Sign In' : 'Create Account'}
        </AnimatedButton>
      </motion.div>

      {/* FORM FOOTER - Additional info or links */}
      <motion.p className="form-footer" animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
        {isSignIn ? (
          <>
            Don't have an account?{' '}
            <span className="footer-link" onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>Create one</span>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <span className="footer-link" onClick={() => onSubmit({ isSignIn: true })} style={{ cursor: 'pointer' }}>Sign in</span>
          </>
        )}
      </motion.p>
    </motion.form>
  );
};

export default LoginForm;
