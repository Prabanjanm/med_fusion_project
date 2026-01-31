import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Lock, Link as LinkIcon } from 'lucide-react';
import '../styles/BlockchainBlock.css';

/**
 * BlockchainBlock Component
 * Visual representation of a single blockchain block (MOCK/DEMO)
 * 
 * Props:
 * - blockData: { id, eventType, timestamp, prevHash, hash, status }
 * - index: Position in the chain
 * - isAnimating: Whether to show creation animation
 */
const BlockchainBlock = ({ blockData, index, isAnimating = false }) => {
    const [status, setStatus] = useState(isAnimating ? 'creating' : 'verified');

    useEffect(() => {
        if (isAnimating) {
            // Simulate block creation process
            const timer1 = setTimeout(() => setStatus('verifying'), 1000);
            const timer2 = setTimeout(() => setStatus('verified'), 2500);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [isAnimating]);

    const getEventIcon = (eventType) => {
        switch (eventType) {
            case 'DONATION_CREATED':
                return '💰';
            case 'ALLOCATION_APPROVED':
                return '🤝';
            case 'RECEIPT_CONFIRMED':
                return '✅';
            default:
                return '📦';
        }
    };

    const getEventLabel = (eventType) => {
        switch (eventType) {
            case 'DONATION_CREATED':
                return 'Donation Created';
            case 'ALLOCATION_APPROVED':
                return 'Allocation Approved';
            case 'RECEIPT_CONFIRMED':
                return 'Receipt Confirmed';
            default:
                return 'Event Recorded';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'creating':
                return '#FFD700'; // Gold
            case 'verifying':
                return '#06b6d4'; // Cyan
            case 'verified':
                return '#10b981'; // Green
            default:
                return '#64748b'; // Gray
        }
    };

    const getStatusLabel = () => {
        switch (status) {
            case 'creating':
                return 'Creating Block...';
            case 'verifying':
                return 'Verifying...';
            case 'verified':
                return 'Verified & Immutable';
            default:
                return 'Pending';
        }
    };

    return (
        <motion.div
            className="blockchain-block"
            initial={isAnimating ? { opacity: 0, scale: 0.8, y: -20 } : {}}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            style={{ borderColor: getStatusColor() }}
        >
            {/* Block Header */}
            <div className="block-header">
                <div className="block-id">
                    <Package size={16} />
                    <span>{blockData.id}</span>
                </div>
                <div className="block-status" style={{ color: getStatusColor() }}>
                    {status === 'verified' ? (
                        <Lock size={14} />
                    ) : (
                        <motion.div
                            className="status-spinner"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                            ⟳
                        </motion.div>
                    )}
                    <span className="status-label">{getStatusLabel()}</span>
                </div>
            </div>

            {/* Block Content */}
            <div className="block-content">
                <div className="block-event">
                    <span className="event-icon">{getEventIcon(blockData.eventType)}</span>
                    <span className="event-label">{getEventLabel(blockData.eventType)}</span>
                </div>

                <div className="block-details">
                    <div className="detail-row">
                        <span className="detail-label">Timestamp:</span>
                        <span className="detail-value">{new Date(blockData.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Prev Hash:</span>
                        <span className="detail-value hash-value">
                            {blockData.prevHash ? `${blockData.prevHash.substring(0, 12)}...` : 'Genesis'}
                        </span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Block Hash:</span>
                        <span className="detail-value hash-value">
                            {blockData.hash.substring(0, 12)}...
                        </span>
                    </div>
                </div>
            </div>

            {/* Block Footer */}
            <div className="block-footer">
                <div className="demo-badge">
                    <span>🔗 Simulated Blockchain</span>
                </div>
                {status === 'verified' && (
                    <div className="verified-badge">
                        <CheckCircle size={14} />
                        <span>Immutable</span>
                    </div>
                )}
            </div>

            {/* Connection Line to Next Block */}
            {index !== undefined && (
                <div className="block-connector">
                    <LinkIcon size={16} />
                </div>
            )}
        </motion.div>
    );
};

export default BlockchainBlock;
