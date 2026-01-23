import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/AnimatedButton.css';

/**
 * AnimatedButton Component
 * =======================
 * Premium interactive button with:
 * - Ripple effect on click
 * - Glow animation on hover
 * - Smooth state transitions
 * - Loading state support
 *
 * Props:
 * - children: React.ReactNode - button text/content
 * - onClick: Function - click handler
 * - variant: String - 'primary' | 'secondary' (default: 'primary')
 * - loading: Boolean - shows loading state
 * - disabled: Boolean - disabled state
 * - type: String - button type (default: 'button')
 */

const AnimatedButton = ({
  children,
  onClick,
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
}) => {
  const [ripples, setRipples] = useState([]);

  // INTERACTION LOGIC: Create ripple effect on click
  const handleClick = (e) => {
    if (loading || disabled) return;

    // Calculate ripple position relative to button
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = Date.now();
    const newRipple = { id, x, y };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    // BACKEND INTEGRATION POINT: Execute parent click handler
    onClick?.(e);
  };

  return (
    <motion.button
      type={type}
      className={`animated-button animated-button--${variant}`}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.05 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      transition={{
        duration: 0.2,
        ease: 'easeOut',
      }}
    >
      {/* RIPPLE EFFECTS - Emanating from click point */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="ripple"
          initial={{
            width: 0,
            height: 0,
            opacity: 1,
            top: ripple.y,
            left: ripple.x,
          }}
          animate={{
            width: 300,
            height: 300,
            opacity: 0,
            top: ripple.y - 150,
            left: ripple.x - 150,
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
          }}
        ></motion.span>
      ))}

      {/* BUTTON CONTENT */}
      <motion.span
        className="button-text"
        animate={{
          opacity: loading ? 0.5 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        {loading ? '...' : children}
      </motion.span>

      {/* GLOW BACKGROUND - Animated gradient shine */}
      <motion.div
        className="button-glow"
        animate={{
          opacity: loading ? 0.3 : 0,
          scale: loading ? 1 : 1.1,
        }}
        transition={{
          duration: 0.3,
        }}
      ></motion.div>
    </motion.button>
  );
};

export default AnimatedButton;
