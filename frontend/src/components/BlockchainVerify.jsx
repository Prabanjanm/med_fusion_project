import React from 'react';
import { List, Info, Lock } from 'lucide-react';
import Layout from '../components/Layout';
import BlockchainLedgerView from '../components/BlockchainLedgerView';
import '../styles/FormStyles.css';
import '../styles/AuditTrail.css';

/**
 * BlockchainVerify Component
 * Shows blockchain ledger for audit and verification purposes
 * DEMO MODE: Simulates blockchain storage for demonstration
 */
const BlockchainVerify = () => {
    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Blockchain Audit Ledger</h1>
                    <p className="page-subtitle">Immutable record of all transactions (Demo Mode)</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '20px', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                    <Lock size={14} />
                    <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>SIMULATED BLOCKCHAIN</span>
                </div>
            </div>

            {/* Honest Messaging Banner */}
            <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem'
            }}>
                <div style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    padding: '10px',
                    borderRadius: '50%',
                    color: '#3b82f6',
                    flexShrink: 0
                }}>
                    <Info size={24} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 600 }}>
                        About This Blockchain Ledger
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
                        This is a <strong>frontend simulation</strong> demonstrating how transaction records will be stored on blockchain in production.
                        Each event (donation, allocation, receipt) creates a block with cryptographic hashing and immutable storage.
                        Real blockchain integration with smart contracts will be implemented in future versions.
                    </p>
                </div>
            </div>

            {/* Blockchain Ledger View */}
            <BlockchainLedgerView />

            {/* Future Features Info */}
            <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px'
            }}>
                <h3 style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Planned Blockchain Features
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                        <div style={{ color: '#00d4ff', marginBottom: '0.5rem', fontWeight: 600 }}>Smart Contract Integration</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Ethereum/Polygon network deployment</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                        <div style={{ color: '#00ff9d', marginBottom: '0.5rem', fontWeight: 600 }}>Transaction Verification</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Public blockchain explorer integration</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                        <div style={{ color: '#f97316', marginBottom: '0.5rem', fontWeight: 600 }}>Cryptographic Proof</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Real hash verification and consensus</div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BlockchainVerify;
