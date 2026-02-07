import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Search, Building, Stethoscope, ChevronRight, MapPin, XCircle, Loader2, History } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import SummaryCard from '../components/SummaryCard';
import '../styles/DashboardLayout.css';
import { auditorAPI } from '../services/api';

const AuditorClinicRegistry = () => {
    const [loading, setLoading] = useState(true);
    const [clinics, setClinics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Sidebar State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [activityLog, setActivityLog] = useState([]);
    const [loadingActivity, setLoadingActivity] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await auditorAPI.getClinicRegistry().catch(() => []);
                const formattedData = data.map(c => {
                    const addr = c.address || (c.pincode ? `Pincode: ${c.pincode}` : 'No address provided');
                    return {
                        id: c.clinic_id || c.id,
                        name: c.clinic_name || 'Unregistered Clinic',
                        details: addr,
                        contact: c.official_email || 'Contact Data Missing',
                        total_requirements: c.total_requirements || 0,
                        confirmed_receipts: c.confirmed_receipts || 0,
                        active_needs: c.active_needs || 0,
                        last_active: c.last_active_at ? new Date(c.last_active_at).toLocaleDateString() : 'Never',
                        status: c.is_active ? 'ACTIVE' : 'INACTIVE',
                        history: []
                    };
                });

                // Deduplicate by name
                const uniqueClinics = Array.from(new Map(formattedData.map(item => [item.name, item])).values());
                setClinics(uniqueClinics);
            } catch (error) {
                console.error("Failed to fetch clinic registry", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleViewActivity = async (clinic) => {
        setSelectedClinic(clinic);
        setSidebarOpen(true);
        setActivityLog([]);
        setLoadingActivity(true);

        try {
            const detail = await auditorAPI.getClinicActivity(clinic.id);
            if (detail) {
                // Update selected clinic info from detail (more fresh)
                setSelectedClinic({
                    ...clinic,
                    contact: detail.official_email || clinic.contact,
                    details: detail.address || (detail.pincode ? `Pincode: ${detail.pincode}` : clinic.details)
                });

                const requirements = detail.requirements || [];
                setActivityLog(requirements.map(r => ({
                    action: r.allocation?.received ? 'DELIVERED & CONFIRMED' : (r.allocation ? 'IN TRANSIT / PENDING' : 'REQUESTED'),
                    item: r.item_name,
                    quantity: r.quantity,
                    date: new Date(r.created_at).toLocaleDateString(),
                    feedback: r.allocation?.feedback || null,
                    rating: r.allocation?.quality_rating || 0,
                    fulfilled_by: r.allocation?.ngo_name,
                    funded_by: r.allocation?.company_name
                })));
            }
        } catch (error) {
            console.error("Failed to fetch clinic activity", error);
        } finally {
            setLoadingActivity(false);
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
                                    style={{
                                        padding: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: 'transparent'
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
                                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase' }}>Received</p>
                                            <p style={{ margin: 0, color: '#10b981', fontWeight: '700', fontSize: '1.1rem' }}>{clinic.confirmed_receipts}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase' }}>Pending</p>
                                            <p style={{ margin: 0, color: '#fbbf24', fontWeight: '700', fontSize: '1.1rem' }}>{clinic.active_needs}</p>
                                        </div>

                                        <div style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>

                                        <button
                                            onClick={() => handleViewActivity(clinic)}
                                            style={{
                                                background: 'rgba(139, 92, 246, 0.1)',
                                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                                color: '#a78bfa',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontWeight: 600,
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            ACTIVITY <History size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Sidebar for Activity Log */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(4px)' }}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                position: 'fixed', right: 0, top: 0, bottom: 0, width: '450px',
                                background: '#0f172a', borderLeft: '1px solid rgba(139, 92, 246, 0.2)',
                                zIndex: 1001, padding: '2rem', overflowY: 'auto',
                                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                    <Activity color="#8b5cf6" /> {selectedClinic?.name}
                                </h2>
                                <button onClick={() => setSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>CONTACT</label>
                                        <div style={{ color: '#fff', fontSize: '0.9rem' }}>{selectedClinic?.contact}</div>
                                    </div>
                                    <div>
                                        <label style={{ color: '#64748b', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>LOCATION</label>
                                        <div style={{ color: '#fff', fontSize: '0.9rem' }}>{selectedClinic?.details}</div>
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
                                Activity & Feedback History
                            </h3>

                            {loadingActivity ? (
                                <div style={{ textAlign: 'center', padding: '3rem' }}>
                                    <Loader2 className="spin-icon" color="#8b5cf6" size={32} />
                                </div>
                            ) : activityLog.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: '#64748b' }}>
                                    No activity recorded for this clinic.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {activityLog.map((h, i) => (
                                        <div key={i} style={{
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '12px',
                                            padding: '1.25rem',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{
                                                    color: h.action === 'DELIVERED & CONFIRMED' ? '#10b981' : '#8b5cf6',
                                                    fontWeight: '700', fontSize: '0.75rem'
                                                }}>
                                                    {h.action}
                                                </span>
                                                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{h.date}</span>
                                            </div>
                                            <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                                {h.item} <span style={{ color: '#64748b', fontWeight: '400', fontSize: '0.9rem' }}>x {h.quantity}</span>
                                            </div>

                                            {h.fulfilled_by && (
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                                    Fulfilled by: <span style={{ color: '#fff' }}>{h.fulfilled_by}</span>
                                                </div>
                                            )}

                                            {(h.feedback || h.rating > 0) ? (
                                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0, 229, 255, 0.05)', borderRadius: '8px', borderLeft: '3px solid #00e5ff' }}>
                                                    <div style={{ color: '#00e5ff', fontSize: '0.7rem', fontWeight: '800', marginBottom: '4px' }}>CLINIC FEEDBACK</div>
                                                    {h.feedback && (
                                                        <div style={{ color: '#fff', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>"{h.feedback}"</div>
                                                    )}
                                                    <div style={{ display: 'flex', gap: '2px', color: '#fbbf24' }}>
                                                        {'★'.repeat(h.rating || 0)}{'☆'.repeat(5 - (h.rating || 0))}
                                                    </div>
                                                </div>
                                            ) : (h.action === 'DELIVERED & CONFIRMED' && (
                                                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                                                    Waiting for feedback...
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </Layout>
    );
};

export default AuditorClinicRegistry;
