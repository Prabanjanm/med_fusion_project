import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Link2, Lock, Calendar, Hash, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllBlocks, getBlockchainStats } from '../services/blockchainService';
import '../styles/BlockchainLedgerView.css';

/**
 * BlockchainLedgerView Component
 * Displays the blockchain ledger with all blocks in a visual timeline
 */
const BlockchainLedgerView = () => {
    const [blocks, setBlocks] = useState([]);
    const [stats, setStats] = useState(null);
    const [expandedBlock, setExpandedBlock] = useState(null);

    useEffect(() => {
        loadBlockchain();

        // Refresh every 2 seconds to show new blocks
        const interval = setInterval(loadBlockchain, 2000);
        return () => clearInterval(interval);
    }, []);

    const loadBlockchain = () => {
        const allBlocks = getAllBlocks();
        const blockchainStats = getBlockchainStats();
        setBlocks(allBlocks.reverse()); // Show newest first
        setStats(blockchainStats);
    };

    const getEventColor = (eventType) => {
        const colors = {
            'GENESIS': '#94a3b8',
            'DONATION_CREATED': '#00d4ff',
            'ALLOCATION_APPROVED': '#00ff9d',
            'RECEIPT_CONFIRMED': '#f97316',
            'NGO_ACCEPTED': '#00ff88',
            'PRODUCT_VERIFIED': '#b400ff'
        };
        return colors[eventType] || '#64748b';
    };

    const getEventIcon = (eventType) => {
        switch (eventType) {
            case 'GENESIS':
                return <Box size={18} />;
            case 'DONATION_CREATED':
                return <FileText size={18} />;
            case 'ALLOCATION_APPROVED':
                return <Link2 size={18} />;
            case 'RECEIPT_CONFIRMED':
                return <Lock size={18} />;
            default:
                return <Box size={18} />;
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const toggleBlock = (blockId) => {
        setExpandedBlock(expandedBlock === blockId ? null : blockId);
    };

    return (
        <div className="blockchain-ledger-view">
            {/* Header */}
            <div className="ledger-header">
                <div>
                    <h2 className="ledger-title">
                        <Box size={24} />
                        Blockchain Ledger
                    </h2>
                    <p className="ledger-subtitle">Immutable record of all transactions</p>
                </div>

                {stats && (
                    <div className="ledger-stats">
                        <div className="stat-item">
                            <span className="stat-label">Total Blocks</span>
                            <span className="stat-value">{stats.totalBlocks}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Status</span>
                            <span className="stat-value" style={{ color: stats.isValid ? '#00ff88' : '#ff4444' }}>
                                {stats.isValid ? '✓ Valid' : '✗ Invalid'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Demo Mode Indicator */}
            <div className="demo-mode-banner">
                <Lock size={14} />
                <span>Blockchain Demo Mode</span>
                <span className="demo-note">
                    This is a frontend simulation to demonstrate how records will be stored on blockchain in future versions.
                </span>
            </div>

            {/* Blockchain Timeline */}
            <div className="blockchain-timeline">
                {blocks.length === 0 ? (
                    <div className="empty-state">
                        <Box size={48} />
                        <p>No blocks yet</p>
                        <p className="empty-subtitle">Blocks will appear here as events occur</p>
                    </div>
                ) : (
                    blocks.map((block, index) => {
                        const isExpanded = expandedBlock === block.blockId;
                        const eventColor = getEventColor(block.eventType);

                        return (
                            <motion.div
                                key={block.blockId}
                                className="block-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                {/* Block Header */}
                                <div
                                    className="block-header"
                                    onClick={() => toggleBlock(block.blockId)}
                                    style={{ borderLeftColor: eventColor }}
                                >
                                    <div className="block-header-left">
                                        <div className="block-icon" style={{ color: eventColor }}>
                                            {getEventIcon(block.eventType)}
                                        </div>
                                        <div className="block-info">
                                            <div className="block-id">
                                                Block #{block.blockNumber} - {block.blockId}
                                            </div>
                                            <div className="block-event" style={{ color: eventColor }}>
                                                {block.eventType.replace(/_/g, ' ')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="block-header-right">
                                        <div className="block-timestamp">
                                            <Calendar size={14} />
                                            {formatTimestamp(block.timestamp)}
                                        </div>
                                        <div className="expand-icon">
                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Block Details (Expandable) */}
                                {isExpanded && (
                                    <motion.div
                                        className="block-details"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                    >
                                        <div className="detail-row">
                                            <span className="detail-label">
                                                <Hash size={14} />
                                                Block Hash
                                            </span>
                                            <span className="detail-value hash-value">{block.hash}</span>
                                        </div>

                                        <div className="detail-row">
                                            <span className="detail-label">
                                                <Link2 size={14} />
                                                Previous Hash
                                            </span>
                                            <span className="detail-value hash-value">{block.previousBlockHash}</span>
                                        </div>

                                        <div className="detail-row">
                                            <span className="detail-label">
                                                <Lock size={14} />
                                                Status
                                            </span>
                                            <span className="detail-value">
                                                <span className="immutable-badge">
                                                    <Lock size={12} />
                                                    Immutable
                                                </span>
                                            </span>
                                        </div>

                                        {block.data && Object.keys(block.data).length > 0 && (
                                            <div className="detail-row">
                                                <span className="detail-label">
                                                    <FileText size={14} />
                                                    Data
                                                </span>
                                                <pre className="detail-value data-value">
                                                    {JSON.stringify(block.data, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* Connection Line to Next Block */}
                                {index < blocks.length - 1 && (
                                    <div className="block-connector">
                                        <div className="connector-line" />
                                        <div className="connector-arrow">↓</div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default BlockchainLedgerView;
