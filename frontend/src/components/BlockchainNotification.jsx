import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Lock, CheckCircle, Loader } from 'lucide-react';
import '../styles/BlockchainNotification.css';

/**
 * BlockchainNotification Component
 * Shows animated block creation process when events occur
 */
const BlockchainNotification = ({ show, eventType, onComplete }) => {
    const [stage, setStage] = useState('generating'); // generating -> linking -> stored

    useEffect(() => {
        if (!show) return;

        // Stage progression
        const timer1 = setTimeout(() => setStage('linking'), 1000);
        const timer2 = setTimeout(() => setStage('stored'), 2000);
        const timer3 = setTimeout(() => {
            if (onComplete) onComplete();
        }, 3500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [show, onComplete]);

    const getEventLabel = (type) => {
        const labels = {
            'DONATION_CREATED': 'Donation Record',
            'ALLOCATION_APPROVED': 'Allocation Record',
            'RECEIPT_CONFIRMED': 'Receipt Confirmation',
            'NGO_ACCEPTED': 'NGO Acceptance',
            'PRODUCT_VERIFIED': 'Product Verification'
        };
        return labels[type] || 'Transaction';
    };

    const getStageInfo = () => {
        switch (stage) {
            case 'generating':
                return {
                    icon: <Loader className="spin-icon" size={20} />,
                    text: 'Generating Block...',
                    color: '#00d4ff'
                };
            case 'linking':
                return {
                    icon: <Link2 size={20} />,
                    text: 'Linking to Previous Block...',
                    color: '#00ff9d'
                };
            case 'stored':
                return {
                    icon: <CheckCircle size={20} />,
                    text: 'Block Stored on Blockchain',
                    color: '#00ff88'
                };
            default:
                return { icon: null, text: '', color: '#fff' };
        }
    };

    const stageInfo = getStageInfo();

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="blockchain-notification"
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="notification-content">
                        {/* Icon */}
                        <motion.div
                            className="notification-icon"
                            style={{ color: stageInfo.color }}
                            animate={{ rotate: stage === 'generating' ? 360 : 0 }}
                            transition={{ duration: 1, repeat: stage === 'generating' ? Infinity : 0, ease: 'linear' }}
                        >
                            {stageInfo.icon}
                        </motion.div>

                        {/* Text */}
                        <div className="notification-text">
                            <div className="notification-title">{getEventLabel(eventType)}</div>
                            <motion.div
                                className="notification-stage"
                                key={stage}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{ color: stageInfo.color }}
                            >
                                {stageInfo.text}
                            </motion.div>
                        </div>

                        {/* Demo Badge */}
                        <div className="demo-badge">
                            <Lock size={12} />
                            <span>Demo Mode</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <motion.div
                        className="notification-progress"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 3.5, ease: 'linear' }}
                        style={{
                            background: `linear-gradient(90deg, ${stageInfo.color}, ${stageInfo.color}80)`,
                            transformOrigin: 'left'
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BlockchainNotification;
