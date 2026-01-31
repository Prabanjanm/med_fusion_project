import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Info, ChevronDown, ChevronUp } from 'lucide-react';
import BlockchainBlock from './BlockchainBlock';
import '../styles/BlockchainLedger.css';

/**
 * BlockchainLedger Component
 * Visual representation of the blockchain ledger (MOCK/DEMO)
 * Shows all blocks in chronological order
 * 
 * Props:
 * - blocks: Array of block data
 * - isExpanded: Whether the ledger is expanded
 * - onToggle: Callback to toggle expansion
 */
const BlockchainLedger = ({ blocks = [], isExpanded = false, onToggle }) => {
    const [displayedBlocks, setDisplayedBlocks] = useState([]);
    const [newBlockIndex, setNewBlockIndex] = useState(null);

    useEffect(() => {
        if (blocks.length > displayedBlocks.length) {
            // New block added
            setNewBlockIndex(blocks.length - 1);
            setDisplayedBlocks(blocks);

            // Reset animation flag after animation completes
            setTimeout(() => setNewBlockIndex(null), 3000);
        } else {
            setDisplayedBlocks(blocks);
        }
    }, [blocks]);

    return (
        <div className={`blockchain-ledger ${isExpanded ? 'expanded' : 'collapsed'}`}>
            {/* Ledger Header */}
            <div className="ledger-header" onClick={onToggle}>
                <div className="ledger-title">
                    <Database size={20} />
                    <h3>Blockchain Ledger</h3>
                    <span className="block-count">{displayedBlocks.length} Blocks</span>
                </div>
                <div className="ledger-controls">
                    <div className="demo-indicator">
                        <Info size={14} />
                        <span>Demo Mode</span>
                    </div>
                    <button className="toggle-btn">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
            </div>

            {/* Ledger Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className="ledger-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Info Banner */}
                        <div className="ledger-info">
                            <Info size={16} />
                            <p>
                                This visualization demonstrates how donation records will be stored on blockchain.
                                Each block represents a verified, immutable transaction in the CSR flow.
                            </p>
                        </div>

                        {/* Blocks Container */}
                        <div className="blocks-container">
                            {displayedBlocks.length === 0 ? (
                                <div className="empty-state">
                                    <Database size={48} />
                                    <p>No blocks in the chain yet</p>
                                    <span>Blocks will appear here as donations are processed</span>
                                </div>
                            ) : (
                                <div className="blocks-timeline">
                                    {displayedBlocks.map((block, index) => (
                                        <div key={block.id} className="block-wrapper">
                                            <div className="block-number">
                                                <span>Block #{index + 1}</span>
                                            </div>
                                            <BlockchainBlock
                                                blockData={block}
                                                index={index}
                                                isAnimating={index === newBlockIndex}
                                            />
                                            {index < displayedBlocks.length - 1 && (
                                                <div className="timeline-connector">
                                                    <div className="connector-line" />
                                                    <div className="connector-arrow">↓</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ledger Stats */}
                        {displayedBlocks.length > 0 && (
                            <div className="ledger-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Total Blocks:</span>
                                    <span className="stat-value">{displayedBlocks.length}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Chain Status:</span>
                                    <span className="stat-value verified">✓ Verified</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Immutability:</span>
                                    <span className="stat-value locked">🔒 Locked</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BlockchainLedger;
