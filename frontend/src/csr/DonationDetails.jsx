import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, User, Building2 } from 'lucide-react';
import Layout from '../components/Layout';
import DonationTimeline from '../components/DonationTimeline';
import StatusBadge from '../components/StatusBadge';
import { donationAPI } from '../services/api';
import '../styles/DashboardLayout.css';

const DonationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [donation, setDonation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDonation = async () => {
            console.log('🔍 Fetching details for Donation ID:', id);
            try {
                const data = await donationAPI.getById(id);
                console.log('✅ Received details:', data);
                setDonation(data);
            } catch (error) {
                console.error('❌ Failed to fetch donation details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDonation();
    }, [id]);

    if (loading) {
        return (
            <Layout>
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8' }}>Loading donation details...</p>
                </div>
            </Layout>
        );
    }

    if (!donation) {
        return (
            <Layout>
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8' }}>Donation not found</p>
                    <button onClick={() => navigate('/csr/history')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Back to History
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => navigate('/csr/history')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            marginBottom: '1rem'
                        }}
                    >
                        <ArrowLeft size={18} />
                        Back to History
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>
                                Donation Details
                            </h1>
                            <p className="page-subtitle">{donation.display_id || `DON-${donation.id}`}</p>
                        </div>
                        <StatusBadge status={donation.status} />
                    </div>
                </div>

                {/* Donation Info Card */}
                <div style={{
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '24px',
                    padding: '2rem',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.5rem' }}>
                        Donation Information
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Package size={16} color="#64748b" />
                                <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Item</span>
                            </div>
                            <p style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>{donation.item_name}</p>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Package size={16} color="#64748b" />
                                <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Quantity</span>
                            </div>
                            <p style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>{donation.quantity?.toLocaleString()}</p>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <User size={16} color="#64748b" />
                                <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Donor</span>
                            </div>
                            <p style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>{donation.donor_name || 'CSR Partner'}</p>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Building2 size={16} color="#64748b" />
                                <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>NGO</span>
                            </div>
                            <p style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>{donation.ngo_name || 'Pending Assignment'}</p>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Calendar size={16} color="#64748b" />
                                <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Created</span>
                            </div>
                            <p style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>
                                {new Date(donation.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        {donation.purpose && (
                            <div style={{ gridColumn: '1 / -1' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Purpose</span>
                                </div>
                                <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6 }}>{donation.purpose}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline */}
                <DonationTimeline donation={donation} />
            </div>
        </Layout>
    );
};

export default DonationDetails;
