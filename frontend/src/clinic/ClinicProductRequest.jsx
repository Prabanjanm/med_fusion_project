import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Info, MapPin, ClipboardList } from 'lucide-react';
import Layout from '../components/Layout';
import '../styles/FormStyles.css';

const ClinicProductRequest = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <div style={{ maxWidth: '850px', margin: '0 auto', padding: '2rem' }}>
                <button
                    onClick={() => navigate('/clinic')}
                    style={{
                        background: 'none', border: 'none', color: '#64748b',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        cursor: 'pointer', marginBottom: '2rem', fontSize: '0.9rem'
                    }}
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <div className="page-header" style={{ marginBottom: '3rem' }}>
                    <div>
                        <h1 className="page-title" style={{ color: '#00e5ff' }}>Requirement Protocol</h1>
                        <p className="page-subtitle">Standard operating procedure for supply allocations</p>
                    </div>
                </div>

                <div style={{
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px',
                    padding: '3.5rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '70px', height: '70px',
                        background: 'rgba(0, 229, 255, 0.1)',
                        borderRadius: '20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 2rem',
                        border: '1px solid rgba(0, 229, 255, 0.2)'
                    }}>
                        <ShieldCheck size={36} color="#00e5ff" />
                    </div>

                    <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1.5rem', fontFamily: "'Orbitron', sans-serif" }}>
                        NGO-Managed Requirements
                    </h2>

                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                        To ensure transparency and compliance with CSR regulations, clinics do not request specific stock directly through the portal.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <MapPin size={24} color="#00e5ff" style={{ marginBottom: '1rem' }} />
                            <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>1. Physical Visit</h4>
                            <p style={{ color: '#64748b', fontSize: '0.8rem' }}>NGO partner visits for on-site assessment.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <ClipboardList size={24} color="#00e5ff" style={{ marginBottom: '1rem' }} />
                            <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>2. Audit Entry</h4>
                            <p style={{ color: '#64748b', fontSize: '0.8rem' }}>NGO notes and uploads needs to the CSR chain.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <Info size={24} color="#00e5ff" style={{ marginBottom: '1rem' }} />
                            <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem' }}>3. Auto-Allocation</h4>
                            <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Matching batches are allocated to your clinic.</p>
                        </div>
                    </div>

                    <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.9rem' }}>
                        <strong>Your Action Needed:</strong> Once the NGO completes their visit, check your dashboard for incoming allocations and <strong>confirm the final receipt</strong> to close the loop.
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ClinicProductRequest;
