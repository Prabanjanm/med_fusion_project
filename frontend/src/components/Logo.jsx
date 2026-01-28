import React from 'react';
import { Heart, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Logo = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            {/* Icon Group - Optically Aligned */}
            <div style={{ position: 'relative', width: '38px', height: '38px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2px' }}>
                {/* Heart Outline */}
                <Heart
                    size={36}
                    color="#f43f5e" // Rose-500
                    strokeWidth={1.5}
                    style={{ filter: 'drop-shadow(0 0 5px rgba(244, 63, 94, 0.5))' }}
                />

                {/* Pulse Line */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', marginTop: '1px' }}>
                    <Activity
                        size={20}
                        color="#ffffff"
                        strokeWidth={2.5}
                    />
                </div>

                {/* Cyan Curve Underneath */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{
                        position: 'absolute',
                        bottom: '-2px', // Adjusted for smaller size
                        width: '36px',
                        height: '10px',
                        borderBottom: '2.5px solid #06b6d4', // Cyan-500
                        borderRadius: '50%',
                        filter: 'drop-shadow(0 0 4px rgba(6, 182, 212, 0.6))'
                    }}
                />
            </div>

            {/* Text Group */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                <div style={{
                    fontFamily: "'Orbitron', 'Inter', sans-serif",
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    color: '#f8fafc',
                    textTransform: 'uppercase',
                    lineHeight: '1',
                    marginBottom: '3px', // Increased space between title and subtitle
                    textShadow: '0 0 10px rgba(255,255,255,0.1)'
                }}>
                    CSR Tracker
                </div>
                <div style={{
                    fontSize: '0.6rem',
                    color: '#94A3B8', // Lighter, more visible (Slate-400)
                    letterSpacing: '2px', // Increased spacing
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    opacity: 0.9
                }}>
                    Global Trust Network
                </div>
            </div>
        </div>
    );
};

export default Logo;
