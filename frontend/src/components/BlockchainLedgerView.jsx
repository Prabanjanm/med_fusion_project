import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Box, Link2, Lock, Calendar, Hash, FileText, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { auditorAPI } from '../services/api';
import '../styles/BlockchainLedgerView.css';

/**
 * BlockchainLedgerView Component
 * Now displays REAL Donation Audit Logs from the backend.
 * Replaces simulation with actual verified data.
 */
const BlockchainLedgerView = () => {
    const [blocks, setBlocks] = useState([]);
    const [expandedBlock, setExpandedBlock] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLedger();
    }, []);

    const loadLedger = async () => {
        try {
            const logs = await auditorAPI.getDonationLogs();
            // Map logs to "Block-like" structure for the UI
            const mapped = logs.map(log => {
                let eventType = 'DONATION_CREATED';
                if (log.status === 'NGO_ACCEPTED') eventType = 'NGO_ACCEPTED';
                if (log.status === 'CLINIC_ACCEPTED') eventType = 'RECEIPT_CONFIRMED';
                // Backend might send 'ALLOCATED' implicitly in future versions
                if (log.status === 'ALLOCATED') eventType = 'ALLOCATION_APPROVED';

                return {
                    blockId: `TX-${log.id}`,
                    blockNumber: log.id,
                    eventType: eventType,
                    timestamp: log.authorized_at,
                    // Backend schema doesn't expose hash in list view, using placeholder or omitting
                    hash: `Verified-Log-${log.id}`,
                    status: log.status,
                    data: {
                        item: log.item_name,
                        qty: log.quantity,
                        purpose: log.purpose,
                        company: log.company_id
                    }
                };
            });
            setBlocks(mapped.reverse());
        } catch (error) {
            console.error("Failed to load ledger", error);
        } finally {
            setLoading(false);
        }
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
            case 'NGO_ACCEPTED':
                return <CheckCircle size={18} />;
            default:
                return <Box size={18} />;
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const toggleBlock = (blockId) => {
        setExpandedBlock(expandedBlock === blockId ? null : blockId);
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading Ledger...</div>;

    return (
        <div className="blockchain-ledger-view">
            <div className="ledger-header">
                <div>
                    <h2 className="ledger-title">
                        <Box size={24} />
                        Audit Ledger
                    </h2>
                    <p className="ledger-subtitle">Verified record of CSR transactions</p>
                </div>
            </div>

            <div className="blockchain-timeline">
                {blocks.length === 0 ? (
                    <div className="empty-state">
                        <Box size={48} />
                        <p>No transactions yet</p>
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
                                <div
                                    className="block-header"
                                    onClick={() => toggleBlock(block.blockId)}
                                    style={{ borderLeftColor: eventColor }}
                                >
                                    <div className="block-header-left">
                                        <div className="block-icon" style={{ color: eventColor }}>
                                            <FileText size={18} />
                                        </div>
                                        <div className="block-info">
                                            <div className="block-id">
                                                ID: {block.blockId}
                                            </div>
                                            <div className="block-event" style={{ color: eventColor }}>
                                                {block.status?.toUpperCase() || 'RECORDED'}
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

                                {isExpanded && (
                                    <motion.div
                                        className="block-details"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                    >
                                        <div className="detail-row">
                                            <span className="detail-label"><Hash size={14} /> Verification ID</span>
                                            <span className="detail-value hash-value">{block.hash}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label"><FileText size={14} /> Details</span>
                                            <pre className="detail-value data-value">
                                                {JSON.stringify(block.data, null, 2)}
                                            </pre>
                                        </div>
                                    </motion.div>
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
