import React, { useState, useEffect } from 'react';
import { Activity, Search, Building, Stethoscope, ChevronRight, MapPin } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import SummaryCard from '../components/SummaryCard';
import '../styles/DashboardLayout.css';
import { auditorAPI } from '../services/api';

const AuditorClinicRegistry = () => {
    const [loading, setLoading] = useState(true);
    const [clinics, setClinics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await auditorAPI.getClinicRegistry().catch(() => []);
                setClinics(data.map(c => ({
                    id: c.id,
                    name: c.clinic_name || 'Unregistered Clinic',
                    details: c.address || 'Location Verified (No Address String)',
                    contact: c.official_email || 'Contact Hidden/Missing',
                    total_requirements: c.total_requirements || 0,
                    confirmed_receipts: c.confirmed_receipts || 0,
                    status: c.is_active ? 'ACTIVE' : 'INACTIVE',
                    history: []
                })));
            } catch (error) {
                console.error("Failed to fetch clinic registry", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleRow = async (id) => {
        if (expandedRow === id) {
            setExpandedRow(null);
            return;
        }
        setExpandedRow(id);

        try {
            const detail = await auditorAPI.getClinicActivity(id);
            setClinics(prev => prev.map(c => {
                if (c.id === id) {
                    return {
                        ...c,
                        history: detail.requirements.map(r => ({
                            action: r.allocation?.received ? 'DELIVERED & CONFIRMED' : (r.allocation ? 'IN TRANSIT / PENDING' : 'REQUESTED'),
                            item: r.item_name,
                            date: new Date(r.created_at).toLocaleDateString(),
                            feedback: r.allocation?.feedback,
                            rating: r.allocation?.quality_rating
                        }))
                    };
                }
                return c;
            }));
        } catch (error) {
            console.error("Failed to fetch clinic activity", error);
        }
    };

    const stats = {
        total: clinics.length,
        active: clinics.filter(c => c.status === 'ACTIVE').length,
        items: clinics.reduce((acc, c) => acc + (c.confirmed_receipts || 0), 0)
    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clinic Registry</h1>
                    <p className="page-subtitle">Healthcare Providers & End-to-End Fulfillment logs</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search Clinics..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            minWidth: '300px'
                        }}
                    />
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <SummaryCard
                    label="Registered Clinics"
                    value={loading ? "-" : stats.total}
                    color="#8b5cf6"
                    icon={Building}
                />
                <SummaryCard
                    label="Confirmed Deliveries"
                    value={loading ? "-" : stats.items}
                    color="#10b981"
                    icon={Activity}
                />
                <SummaryCard
                    label="Active Locations"
                    value={loading ? "-" : stats.active}
                    color="#06b6d4"
                    icon={MapPin}
                />
            </div>

            <div className="table-card">
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Consulting Central Health Records...</div>
                ) : clinics.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No verified clinics found.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {clinics.filter(c =>
                            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.contact.toLowerCase().includes(searchTerm.toLowerCase())
                        ).map(clinic => (
                            <div key={clinic.id} style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                overflow: 'hidden'
                            }}>
                                <div
                                    onClick={() => toggleRow(clinic.id)}
                                    style={{
                                        padding: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        background: expandedRow === clinic.id ? 'rgba(255,255,255,0.03)' : 'transparent'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '50%',
                                            background: 'rgba(139, 92, 246, 0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '1px solid rgba(139, 92, 246, 0.2)'
                                        }}>
                                            <Stethoscope size={24} color="#8b5cf6" />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{clinic.name}</h3>
                                            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>{clinic.details}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Shipments Received</p>
                                            <p style={{ margin: 0, color: '#fff', fontWeight: '600' }}>{clinic.confirmed_receipts}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Active Needs</p>
                                            <p style={{ margin: 0, color: '#fff', fontWeight: '600' }}>{clinic.total_requirements - clinic.confirmed_receipts}</p>
                                        </div>
                                        <StatusBadge status={clinic.status} />
                                    </div>
                                </div>

                                {expandedRow === clinic.id && (
                                    <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ color: '#fff', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Activity size={18} color="#8b5cf6" />
                                            Fulfillment Activity
                                        </h4>

                                        {clinic.history.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {clinic.history.map((h, i) => (
                                                    <div key={i} style={{
                                                        background: 'rgba(255,255,255,0.03)',
                                                        borderRadius: '12px',
                                                        padding: '1.2rem',
                                                        border: '1px solid rgba(255,255,255,0.05)'
                                                    }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                            <span style={{ color: '#8b5cf6', fontWeight: '700', fontSize: '0.8rem' }}>{h.action}</span>
                                                            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{h.date}</span>
                                                        </div>
                                                        <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '500' }}>{h.item}</div>

                                                        {h.feedback && (
                                                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0, 229, 255, 0.05)', borderRadius: '8px', borderLeft: '3px solid #00e5ff' }}>
                                                                <div style={{ color: '#00e5ff', fontSize: '0.7rem', fontWeight: '800', marginBottom: '4px' }}>CLINIC FEEDBACK</div>
                                                                <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>"{h.feedback}"</div>
                                                                <div style={{ marginTop: '6px', color: '#fbbf24' }}>
                                                                    {'★'.repeat(h.rating)}{'☆'.repeat(5 - h.rating)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                                No historical requisitions found for this location.
                                            </div>
                                        )}

                                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                                            <div style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                                <label style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>OFFICIAL CONTACT</label>
                                                <div style={{ color: '#fff' }}>{clinic.contact}</div>
                                            </div>
                                            <div style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                                <label style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>CLINIC ID</label>
                                                <div style={{ color: '#fff' }}>HCN-LOC-{clinic.id.toString().padStart(4, '0')}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AuditorClinicRegistry;
