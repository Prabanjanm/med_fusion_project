import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/LampCharacter.css';

/**
 * LampCharacter Component - Cute Friendly Cartoon Lamp
 * ====================================================
 * A cute, friendly cartoon table lamp character with expressive eyes on the lampshade.
 *
 * Features:
 * - Standing desk lamp with articulated arm
 * - Cute smiling face on the lampshade (big expressive anime-style eyes)
 * - Warm yellow/orange color palette
 * - Cozy light cone that emits warmth
 * - Eyes react to password validation
 * - Gentle animations that feel alive and friendly
 *
 * Props:
 * - isSignIn: Boolean - controls light intensity (Sign In = full light, Sign Up = dim)
 * - passwordValid: Boolean - controls eye expression (happy/neutral)
 * - isFocused: Boolean - controls lampshade tilt and glow intensity
 *
 * Interactions:
 * - Eyes open wide and smile when password is valid
 * - Eyes look neutral when password is weak
 * - Lampshade tilts slightly when focused on form
 * - Glow intensifies when inputs are active
 * - Light cone appears when in Sign In mode
 */

const LampCharacter = ({ isSignIn = true, passwordValid = false, isFocused = false }) => {
  const [lightIntensity, setLightIntensity] = useState(isSignIn ? 1 : 0.3);

  // ANIMATION LOGIC: Update light intensity based on auth mode
  useEffect(() => {
    setLightIntensity(isSignIn ? 1 : 0.3);
  }, [isSignIn]);

  // Calculate glow values based on focus state
  const glowIntensity = isFocused ? 1.3 : 1;

  return (
    <div className="lamp-container">
      {/* COZY BACKGROUND GLOW - Ambient light around lamp */}
      <motion.div
        className="ambient-glow"
        animate={{
          opacity: [0.4, 0.6, 0.4],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          filter: `blur(60px)`,
        }}
      ></motion.div>

      {/* LAMP BASE - Round, friendly, solid base */}
      <motion.div
        className="lamp-base"
        animate={{
          boxShadow: [
            `0 12px 30px rgba(0, 0, 0, 0.2)`,
            `0 15px 40px rgba(0, 0, 0, 0.3)`,
            `0 12px 30px rgba(0, 0, 0, 0.2)`,
          ],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Base shadow - subtle depth */}
        <div className="base-shadow"></div>
      </motion.div>

      {/* LAMP ARM - Articulated, jointed arm */}
      <motion.div
        className="lamp-arm"
        animate={{
          rotateZ: isFocused ? -12 : 0,
        }}
        transition={{
          duration: 0.7,
          type: 'spring',
          stiffness: 180,
          damping: 20,
        }}
      >
        {/* Upper arm segment */}
        <div className="arm-segment upper-arm"></div>

        {/* Arm joint - connection point */}
        <motion.div
          className="arm-joint"
          animate={{
            scale: isFocused ? 1.15 : 1,
          }}
          transition={{
            duration: 0.5,
            type: 'spring',
            stiffness: 300,
          }}
        ></motion.div>

        {/* Lower arm segment */}
        <motion.div
          className="arm-segment lower-arm"
          animate={{
            rotateZ: isFocused ? 15 : 0,
          }}
          transition={{
            duration: 0.7,
            type: 'spring',
            stiffness: 180,
            damping: 20,
          }}
        ></motion.div>

        {/* Head mount connector */}
        <div className="head-connector"></div>
      </motion.div>

      {/* LAMPSHADE - The cute character face */}
      <motion.div
        className="lampshade-container"
        animate={{
          rotateZ: isFocused ? 8 : 0,
          y: isFocused ? -6 : 0,
        }}
        transition={{
          duration: 0.6,
          type: 'spring',
          stiffness: 200,
          damping: 18,
        }}
      >
        {/* Lampshade outer */}
        <div className="lampshade">
          {/* Inner gradient - warm glow */}
          <div className="lampshade-inner"></div>

          {/* Face container */}
          <motion.div className="face-container">
            {/* Eyes container */}
            <div>
              {/* LEFT EYE - Simple dot eye */}
              <motion.div
                className="eye-group left-eye"
                animate={{
                  scale: passwordValid ? 1.15 : 1,
                }}
                transition={{
                  duration: 0.3,
                  type: 'spring',
                  stiffness: 300,
                }}
              >
                {/* Eye dot */}
                <div className="eye-white">
                  {/* White shine dot */}
                  <div className="pupil">
                    <div className="pupil-shine"></div>
                  </div>
                </div>
              </motion.div>

              {/* RIGHT EYE - Simple dot eye */}
              <motion.div
                className="eye-group right-eye"
                animate={{
                  scale: passwordValid ? 1.15 : 1,
                }}
                transition={{
                  duration: 0.3,
                  type: 'spring',
                  stiffness: 300,
                }}
              >
                <div className="eye-white">
                  <div className="pupil">
                    <div className="pupil-shine"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* MOUTH - Friendly curved smile */}
          <motion.div className="mouth-container">
            <motion.svg
              className="mouth"
              viewBox="0 0 50 25"
              animate={{
                scaleY: passwordValid ? 1.1 : 1,
              }}
              transition={{
                duration: 0.3,
              }}
            >
              {/* Simple curved smile */}
              <path
                d="M 12 8 Q 25 18 38 8"
                stroke="#8B5A3C"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </motion.svg>
          </motion.div>
        </div>

        {/* BULB - Visible inside lampshade */}
        <motion.div
          className="visible-bulb"
          animate={{
            boxShadow: [
              `0 0 ${15 * lightIntensity * glowIntensity}px rgba(255, 180, 60, ${0.5 * lightIntensity
              })`,
              `0 0 ${25 * lightIntensity * glowIntensity}px rgba(255, 160, 40, ${0.6 * lightIntensity
              })`,
              `0 0 ${15 * lightIntensity * glowIntensity}px rgba(255, 180, 60, ${0.5 * lightIntensity
              })`,
            ],
            opacity: 0.8 + 0.2 * lightIntensity,
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="bulb-filament"></div>
        </motion.div>

        {/* LIGHT CONE - Warm cozy light beam */}
        <motion.div
          className="light-cone"
          animate={{
            opacity: lightIntensity,
            height: [140, 180, 140],
            filter: [
              `blur(${20 + glowIntensity * 10}px)`,
              `blur(${25 + glowIntensity * 10}px)`,
              `blur(${20 + glowIntensity * 10}px)`,
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Light gradient layers */}
          <div className="light-gradient-1"></div>
          <div className="light-gradient-2"></div>
          <div className="light-gradient-3"></div>
        </motion.div>
      </motion.div>

      {/* AMBIENT LIGHT PARTICLES - Warm floating lights when Sign In */}
      {isSignIn && lightIntensity > 0.7 && (
        <>
          {[0, 1, 2].map((index) => (
            <motion.div
              key={`particle-${index}`}
              className="light-particle"
              animate={{
                y: [0, -60, 0],
                x: [0, Math.sin(index) * 40, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 4 + index * 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.4,
              }}
              style={{
                left: `${45 + index * 10}%`,
                bottom: '35%',
              }}
            ></motion.div>
          ))}
        </>
      )}

      {/* FLOOR SHADOW - Depth indicator */}
      <motion.div
        className="floor-shadow"
        animate={{
          opacity: [0.15, 0.25, 0.15],
          scaleX: [1, 1.1, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      ></motion.div>
    </div>
  );
};

export default LampCharacter;
