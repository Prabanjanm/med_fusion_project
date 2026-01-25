import React, { useState } from 'react';
import { Search, ShieldCheck, Box, Activity, Server, Hash } from 'lucide-react';
import Layout from '../components/Layout';
import '../styles/FormStyles.css';
import '../styles/AuditTrail.css'; // Reusing for terminal styles

/**
 * BlockchainVerify Component
 * Public explorer page to verify transaction integrity on the ledger.
 */
const BlockchainVerify = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleVerify = (e) => {
        e.preventDefault();
        if (!query) return;

        setLoading(true);
        setResult(null);

        // Simulate Network Look-up
        setTimeout(() => {
            setLoading(false);
            setResult({
                isValid: true,
                blockHeight: 1402391,
                timestamp: '2025-01-24T08:45:00Z',
                hash: query.startsWith('0x') ? query : '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
                prevHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
                data: {
                    type: 'DONATION_RECORD',
                    assetId: 'DON-2025-001',
                    donor: 'Health Corp Global',
                    recipient: 'Red Cross India',
                    items: 'PPE Kits (100 units)'
                }
            });
        }, 1500);
    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Blockchain Explorer</h1>
                    <p className="page-subtitle">Verify Transaction Integrity & Source of Truth</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(0, 255, 148, 0.1)', borderRadius: '20px', border: '1px solid rgba(0, 255, 148, 0.2)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00ff94', boxShadow: '0 0 10px #00ff94' }}></div>
                    <span style={{ fontSize: '0.75rem', color: '#00ff94', fontWeight: 600 }}>MAINNET LIVE</span>
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* Search Hero */}
                <div className="form-card" style={{ padding: '3rem 2rem', textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px', height: '64px', margin: '0 auto 1.5rem',
                        background: 'rgba(0, 242, 255, 0.1)', borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 30px rgba(0, 242, 255, 0.2)'
                    }}>
                        <Search size={32} className="text-cyan" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>Verify Any Transaction</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Enter a Transaction Hash (TXID) or Asset ID to cryptographically provet existence on the ledger.
                    </p>

                    <form onSubmit={handleVerify} style={{ display: 'flex', gap: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                        <input
                            type="text"
                            placeholder="e.g. 0x3f4d... or DON-2025-001"
                            className="form-input"
                            style={{ fontSize: '1rem', padding: '1rem' }}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit" className="btn-submit" disabled={loading} style={{ width: 'auto', padding: '0 2rem' }}>
                            {loading ? 'Verifying...' : 'Verify'}
                        </button>
                    </form>
                </div>

                {/* Results Area */}
                {result && (
                    <div className="animate-slide-up">

                        {/* Status Banner */}
                        <div style={{
                            background: result.isValid ? 'rgba(0, 255, 148, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                            border: result.isValid ? '1px solid #00ff94' : '1px solid #ff4444',
                            borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <ShieldCheck size={32} color={result.isValid ? '#00ff94' : '#ff4444'} />
                                <div>
                                    <h3 style={{ color: result.isValid ? '#00ff94' : '#ff4444', margin: 0, fontSize: '1.2rem' }}>
                                        {result.isValid ? 'Valid Transaction Found' : 'Invalid Transaction'}
                                    </h3>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Confirmed by 12 network nodes</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Block Height</div>
                                <div style={{ fontSize: '1.2rem', color: '#fff', fontFamily: 'monospace' }}>#{result.blockHeight}</div>
                            </div>
                        </div>

                        {/* Technical Details */}
                        <div className="form-card">
                            <h3 className="form-section-title">Cryptographic Proof</h3>

                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Transaction Hash</label>
                                    <div className="blockchain-hash" style={{ fontSize: '0.9rem', color: '#fff' }}>{result.hash}</div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Previous Block Hash</label>
                                        <div className="blockchain-hash" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{result.prevHash.substring(0, 20)}...</div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timestamp</label>
                                        <div style={{ fontFamily: 'monospace', color: '#fff', padding: '0.5rem 0' }}>{result.timestamp}</div>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payload Data (JSON)</label>
                                    <pre style={{
                                        background: '#020617', padding: '1rem', borderRadius: '8px',
                                        color: '#a5b4fc', fontFamily: 'monospace', fontSize: '0.9rem', overflowX: 'auto'
                                    }}>
                                        {JSON.stringify(result.data, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Network Stats Footer */}
                {!result && (
                    <div className="stats-grid" style={{ marginTop: '3rem', opacity: 0.7 }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                            <Server size={24} style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }} />
                            <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold' }}>142</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Nodes</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                            <Box size={24} style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }} />
                            <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold' }}>1.4M</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Blocks Mined</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                            <Activity size={24} style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }} />
                            <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 'bold' }}>24ms</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg Latency</div>
                        </div>
                    </div>
                )}

            </div>

            <style>{`
        .animate-slide-up { animation: slideUp 0.4s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </Layout>
    );
};

export default BlockchainVerify;
