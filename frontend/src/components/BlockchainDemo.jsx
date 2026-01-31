import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle, Clock } from 'lucide-react';
import '../styles/BlockchainDemo.css';

/**
 * BlockchainDemo Component
 * Shows animated flow of how an event becomes a block
 * 
 * Props:
 * - eventType: Type of event being processed
 * - onComplete: Callback when animation completes
 */
const BlockchainDemo = ({ eventType, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            id: 1,
            label: 'Event Triggered',
            description: `${getEventLabel(eventType)} initiated`,
            icon: '📝',
            color: '#3b82f6',
        },
        {
            id: 2,
            label: 'Creating Block',
            description: 'Packaging data into blockchain block',
            icon: '📦',
            color: '#fbbf24',
        },
        {
            id: 3,
            label: 'Verifying',
            description: 'Validating block integrity',
            icon: '🔍',
            color: '#06b6d4',
        },
        {
            id: 4,
            label: 'Block Added',
            description: 'Block permanently added to chain',
            icon: '✅',
            color: '#10b981',
        },
    ];

    useEffect(() => {
        if (currentStep < steps.length) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 1200);
            return () => clearTimeout(timer);
        } else if (onComplete) {
            setTimeout(onComplete, 500);
        }
    }, [currentStep, steps.length, onComplete]);

    function getEventLabel(type) {
        switch (type) {
            case 'DONATION_CREATED':
                return 'Donation';
            case 'ALLOCATION_APPROVED':
                return 'Allocation';
            case 'RECEIPT_CONFIRMED':
                return 'Receipt';
            default:
                return 'Event';
        }
    }

    return (
        <div className="blockchain-demo-overlay">
            <motion.div
                className="blockchain-demo-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
            >
                <div className="demo-header">
                    <h3>🔗 Blockchain Processing</h3>
                    <p className="demo-subtitle">Simulated Blockchain Flow</p>
                </div>

                <div className="demo-steps">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <motion.div
                                className={`demo-step ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <div className="step-icon" style={{ borderColor: step.color }}>
                                    {index < currentStep ? (
                                        <CheckCircle size={24} color={step.color} />
                                    ) : index === currentStep ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        >
                                            <Clock size={24} color={step.color} />
                                        </motion.div>
                                    ) : (
                                        <span style={{ fontSize: '1.5rem' }}>{step.icon}</span>
                                    )}
                                </div>
                                <div className="step-content">
                                    <h4 style={{ color: index <= currentStep ? step.color : '#64748b' }}>
                                        {step.label}
                                    </h4>
                                    <p>{step.description}</p>
                                </div>
                            </motion.div>

                            {index < steps.length - 1 && (
                                <div className="step-connector">
                                    <motion.div
                                        className="connector-progress"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: index < currentStep ? 1 : 0 }}
                                        transition={{ duration: 0.5 }}
                                        style={{ backgroundColor: step.color }}
                                    />
                                    <ArrowRight size={16} className="connector-arrow" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="demo-footer">
                    <div className="progress-bar">
                        <motion.div
                            className="progress-fill"
                            initial={{ width: '0%' }}
                            animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <p className="demo-note">
                        <span>ℹ️</span> This is a demonstration of blockchain flow. No actual blockchain transaction is occurring.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default BlockchainDemo;
