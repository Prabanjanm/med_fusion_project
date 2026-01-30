import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Landmark, HeartHandshake, Stethoscope, ShieldCheck, ArrowRight, Truck } from 'lucide-react';

const steps = [
    {
        id: 'donor',
        label: 'Corporate',
        icon: Building2,
        color: '#3b82f6', // Blue
    },
    {
        id: 'ngo',
        label: 'NGO',
        icon: HeartHandshake,
        color: '#10b981', // Emerald
    },
    {
        id: 'clinic',
        label: 'Clinic',
        icon: Stethoscope,
        color: '#f59e0b', // Amber
    },
    {
        id: 'auditor',
        label: 'Auditor',
        icon: ShieldCheck,
        color: '#8b5cf6', // Violet
    }
];

const CSRJourneyMap = () => {
    return (
        <div className="csr-journey-container" style={{ overflow: 'visible' }}>
            {/* Road/Path Background */}
            <div className="journey-path-track" style={{
                background: 'linear-gradient(90deg, #1e293b 0%, #475569 50%, #1e293b 100%)',
                height: '1px'
            }}></div>

            {/* Digital Pulse Animation */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '5%',
                    width: '60px',
                    height: '4px',
                    background: 'linear-gradient(90deg, transparent, #3b82f6, #fff, #3b82f6, transparent)',
                    borderRadius: '4px',
                    zIndex: 1,
                    boxShadow: '0 0 20px #3b82f6',
                    transform: 'translateY(-50%)'
                }}
                animate={{
                    left: ["0%", "95%"],
                    opacity: [0, 1, 1, 0]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Moving Truck Animation */}
            <motion.div
                className="journey-truck"
                style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-75%)', // Sit ON the line
                    zIndex: 20,
                    color: '#60a5fa', // Lighter blue for visibility
                    filter: 'drop-shadow(0 -5px 10px rgba(59, 130, 246, 0.5))',
                }}
                animate={{
                    left: ["0%", "92%"],
                    opacity: [0, 1, 1, 0]
                }}
                transition={{
                    duration: 4, // Faster movement
                    repeat: Infinity,
                    ease: "linear",
                    times: [0, 0.1, 0.9, 1]
                }}
            >
                <Truck size={38} strokeWidth={1.5} />

                {/* Trail/Glow on the line */}
                <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    left: '-20px',
                    width: '50px',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #3b82f6)',
                    boxShadow: '0 0 10px #3b82f6',
                    opacity: 0.8
                }} />

                {/* Grounding Shadow */}
                <div style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: '4px',
                    width: '30px',
                    height: '6px',
                    background: 'rgba(59, 130, 246, 0.3)',
                    borderRadius: '50%',
                    filter: 'blur(4px)'
                }} />
            </motion.div>

            <div className="journey-steps">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        {/* Step Node */}
                        <div
                            className="journey-step"
                            style={{
                                // Remove padding and background from all to eliminate double border effect
                                padding: '0',
                                background: 'transparent'
                            }}
                        >
                            <motion.div
                                className="step-icon-box"
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{
                                    delay: index * 0.2,
                                    duration: 0.5,
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 20
                                }}
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    // NGO and Clinic get circular borders, others get rounded squares
                                    borderRadius: (step.id === 'ngo' || step.id === 'clinic') ? '50%' : '16px',
                                    border: `2px solid ${step.color}`,
                                    background: '#0f172a', // Solid background
                                    boxShadow: `0 0 20px -5px ${step.color}30`,
                                    zIndex: 10,
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                whileHover={{
                                    scale: 1.1,
                                    borderColor: step.color,
                                    boxShadow: `0 0 30px ${step.color}60`,
                                    zIndex: 20
                                }}
                            >
                                <step.icon size={32} color={step.color} strokeWidth={1.5} />
                            </motion.div>
                            <motion.div
                                className="step-info"
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 + 0.2 }}
                            >
                                <h4 className="step-label" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: '600', letterSpacing: '0.5px' }}>{step.label}</h4>
                            </motion.div>
                        </div>


                        {/* Connector (Arrow) - Not after last item */}
                        {index < steps.length - 1 && (
                            <div className="step-connector">
                                <ArrowRight size={16} className="connector-arrow" style={{ opacity: 0.2 }} />
                            </div>
                        )}
                    </React.Fragment>
                ))
                }
            </div >
        </div >
    );
};

export default CSRJourneyMap;
