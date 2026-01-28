import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Landmark, HeartHandshake, Stethoscope, ShieldCheck, ArrowRight, Truck } from 'lucide-react';

const steps = [
    {
        id: 'donor',
        label: 'Corporate / CSR Donor',
        icon: Building2,
        color: '#60a5fa', // Blue
    },
    {
        id: 'ngo',
        label: 'NGO / Community',
        icon: HeartHandshake,
        color: '#fbbf24', // Amber
    },
    {
        id: 'clinic',
        label: 'Clinic / Site',
        icon: Stethoscope,
        color: '#f87171', // Red
    },
    {
        id: 'auditor',
        label: 'Auditor Office',
        icon: ShieldCheck,
        color: '#818cf8', // Indigo
    }
];

const CSRJourneyMap = () => {
    return (
        <div className="csr-journey-container">
            {/* Road/Path Background */}
            <div className="journey-path-track"></div>

            <div className="journey-steps">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        {/* Step Node */}
                        <div className="journey-step">
                            <motion.div
                                className="step-icon-box"
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2, duration: 0.5 }}
                                style={{ borderColor: step.color, boxShadow: `0 0 15px ${step.color}20` }}
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
                                <h4 className="step-label">{step.label}</h4>
                            </motion.div>
                        </div>

                        {/* Connector (Arrow) - Not after last item */}
                        {index < steps.length - 1 && (
                            <div className="step-connector">
                                <ArrowRight size={20} className="connector-arrow" />
                                {/* Mobile Flow Line */}
                                <div className="connector-line"></div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Moving Truck/delivery Indicator */}
            <motion.div
                className="journey-truck"
                animate={{
                    left: ["0%", "90%"],
                    opacity: [0, 1, 1, 0]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                <div className="truck-glow"></div>
                <Truck size={24} color="#f8fafc" />
            </motion.div>
        </div>
    );
};

export default CSRJourneyMap;
