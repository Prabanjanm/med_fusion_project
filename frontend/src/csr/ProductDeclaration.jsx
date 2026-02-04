import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Layout from '../components/Layout';
import BlockchainLedgerView from '../components/BlockchainLedgerView';
import '../styles/FormStyles.css';
import '../styles/AuditTrail.css';

/**
 * Verify & Record Page (CSR Audit Trail)
 * 
 * Displays the real-time blockchain ledger for CSR transactions.
 * Focuses exclusively on the immutable audit trail for transparency.
 */
const ProductDeclaration = () => {
    return (
        <Layout>
            <div className="page-header" style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ShieldCheck size={32} color="#06b6d4" />
                    <div>
                        <h1 className="page-title">Verify & Record</h1>
                        <p className="page-subtitle">Real-time immutable audit trail of verified CSR transactions</p>
                    </div>
                </div>
            </div>

            {/* Main content is the Blockchain Ledger (Audit Trail) */}
            <div style={{ marginTop: '1rem' }}>
                <BlockchainLedgerView />
            </div>
        </Layout>
    );
};

export default ProductDeclaration;
