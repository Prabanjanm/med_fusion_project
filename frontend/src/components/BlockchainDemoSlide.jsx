import React from 'react';
import { Shield, CheckCircle, ArrowRight, Layers } from 'lucide-react';

/**
 * BlockchainDemoSlide Component
 * Visual presentation slide explaining blockchain integration
 * Can be used during hackathon demo/pitch
 */
const BlockchainDemoSlide = () => {
    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '3rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f8fafc'
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(100, 255, 218, 0.1)',
                    border: '2px solid rgba(100, 255, 218, 0.3)',
                    borderRadius: '50px',
                    padding: '12px 24px',
                    marginBottom: '1.5rem'
                }}>
                    <Shield size={28} color="#64ffda" />
                    <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#64ffda' }}>
                        Blockchain Integration Layer
                    </span>
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
                    Immutable Audit Trail
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto' }}>
                    Every CSR transaction is cryptographically secured and permanently recorded
                </p>
            </div>

            {/* Workflow Visualization */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2rem',
                maxWidth: '1200px',
                width: '100%',
                marginBottom: '3rem'
            }}>
                {/* Step 1: Donation */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(67, 97, 238, 0.3)',
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #4361EE 0%, #7209B7 100%)',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 10px 30px rgba(67, 97, 238, 0.4)'
                    }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>1</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>CSR Donation</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Company creates donation record
                    </p>
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px dashed rgba(100, 255, 218, 0.3)'
                    }}>
                        <code style={{ fontSize: '0.7rem', color: '#64ffda' }}>
                            0xA1B2C3...
                        </code>
                    </div>
                    <div style={{
                        position: 'absolute',
                        right: '-1.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64ffda'
                    }}>
                        <ArrowRight size={32} />
                    </div>
                </div>

                {/* Step 2: Allocation */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(247, 37, 133, 0.3)',
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #F72585 0%, #7209B7 100%)',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 10px 30px rgba(247, 37, 133, 0.4)'
                    }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>2</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>NGO Allocation</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        NGO distributes to clinic
                    </p>
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px dashed rgba(100, 255, 218, 0.3)'
                    }}>
                        <code style={{ fontSize: '0.7rem', color: '#64ffda' }}>
                            0xD4E5F6...
                        </code>
                    </div>
                    <div style={{
                        position: 'absolute',
                        right: '-1.5rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64ffda'
                    }}>
                        <ArrowRight size={32} />
                    </div>
                </div>

                {/* Step 3: Receipt */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 180, 216, 0.3)',
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        boxShadow: '0 10px 30px rgba(0, 180, 216, 0.4)'
                    }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>3</span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Clinic Receipt</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        Clinic confirms delivery
                    </p>
                    <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px dashed rgba(100, 255, 218, 0.3)'
                    }}>
                        <code style={{ fontSize: '0.7rem', color: '#64ffda' }}>
                            0xG7H8I9...
                        </code>
                    </div>
                </div>
            </div>

            {/* Benefits */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem',
                maxWidth: '1000px',
                width: '100%',
                marginBottom: '2rem'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <CheckCircle size={32} color="#22c55e" style={{ marginBottom: '0.5rem' }} />
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>Immutable</h4>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Cannot be altered or deleted</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <Shield size={32} color="#3b82f6" style={{ marginBottom: '0.5rem' }} />
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>Transparent</h4>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Publicly verifiable records</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <Layers size={32} color="#a855f7" style={{ marginBottom: '0.5rem' }} />
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>Decentralized</h4>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No single point of failure</p>
                </div>
            </div>

            {/* Disclaimer */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.1) 100%)',
                border: '2px solid rgba(251, 191, 36, 0.4)',
                borderRadius: '12px',
                padding: '1.5rem 2rem',
                maxWidth: '800px',
                textAlign: 'center'
            }}>
                <p style={{ color: '#fcd34d', fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    🔬 Demo Mode: Simulated for Hackathon
                </p>
                <p style={{ color: '#fde68a', fontSize: '0.9rem', margin: 0 }}>
                    Blockchain integration is <strong>simulated for demonstration purposes</strong> and represents
                    planned future enhancement. Production implementation will use Ethereum/Polygon smart contracts.
                </p>
            </div>
        </div>
    );
};

export default BlockchainDemoSlide;
