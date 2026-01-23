import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import '../styles/BackgroundEffects.css';

/**
 * BackgroundEffects Component
 * ===========================
 * Creates premium background animations:
 * - Floating blob elements with glassmorphism
 * - Particle system that reacts to cursor movement
 * - Gradient mesh background
 * - Subtle parallax effects
 *
 * This component is background-only and doesn't block interactions.
 */

const BackgroundEffects = () => {
  const canvasRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });

  // CURSOR TRACKING LOGIC: Track mouse position for particle reactions
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // PARTICLE ANIMATION LOGIC: Canvas-based particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    const particles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.3 + 0.1,
    }));

    const animate = () => {
      // Clear canvas with subtle trail
      ctx.fillStyle = 'rgba(15, 23, 42, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // INTERACTION LOGIC: Particles react to cursor proximity
        const dx = mousePos.current.x - particle.x;
        const dy = mousePos.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        if (distance < maxDistance) {
          const angle = Math.atan2(dy, dx);
          const force = (1 - distance / maxDistance) * 0.5;
          particle.vx -= Math.cos(angle) * force;
          particle.vy -= Math.sin(angle) * force;
        }

        // Apply velocity with damping
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Keep in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Draw particle with glow
        ctx.fillStyle = `rgba(255, 200, 100, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();

        // Particle glow
        ctx.strokeStyle = `rgba(255, 180, 50, ${particle.opacity * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="background-effects">
      {/* Canvas for particle system */}
      <canvas ref={canvasRef} className="particles-canvas"></canvas>

      {/* Floating Blob 1 - Top left */}
      <motion.div
        className="blob blob-1"
        animate={{
          x: [0, 30, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      ></motion.div>

      {/* Floating Blob 2 - Top right */}
      <motion.div
        className="blob blob-2"
        animate={{
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      ></motion.div>

      {/* Floating Blob 3 - Bottom center */}
      <motion.div
        className="blob blob-3"
        animate={{
          x: [0, 40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      ></motion.div>

      {/* Gradient Overlay - Creates depth */}
      <div className="gradient-overlay"></div>

      {/* Vignette Effect - Darkens edges */}
      <div className="vignette"></div>
    </div>
  );
};

export default BackgroundEffects;
