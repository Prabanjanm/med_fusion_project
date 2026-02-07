import React, { useState, useEffect } from 'react';
import { UserPlus, Hospital, Mail, MapPin, Hash, ShieldCheck, ArrowLeft, Loader2, Search, Filter, CheckCircle, XCircle, MoreVertical, ExternalLink, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ngoAPI } from '../services/api';
import '../styles/DashboardLayout.css';
import AnimatedButton from '../components/AnimatedButton';
import { motion, AnimatePresence } from 'framer-motion';

const NgoManageClinics = () => {
    const navigate = useNavigate();
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showNeedForm, setShowNeedForm] = useState(false);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [acceptedDonations, setAcceptedDonations] = useState([]);

    // Feedback Sidebar State
    const [feedbackSidebarOpen, setFeedbackSidebarOpen] = useState(false);
    const [clinicFeedback, setClinicFeedback] = useState([]);
    const [loadingFeedback, setLoadingFeedback] = useState(false);

    // Calculate total stock per item name
    const stockMap = acceptedDonations.reduce((acc, donation) => {
        const itemName = donation.item_name;
        acc[itemName] = (acc[itemName] || 0) + (donation.quantity || 0);
        return acc;
    }, {});

    const [formData, setFormData] = useState({
        clinic_name: '',
        official_email: '',
        facility_id: '',
        facility_id_type: 'ABDM_HFR',
        doctor_registration_number: '',
        pincode: ''
    });

    const [needData, setNeedData] = useState({
        item_name: '',
        quantity: '',
        purpose: '',
        priority: 2
    });

    useEffect(() => {
        fetchClinics();
    }, []);

    const fetchClinics = async () => {
        try {
            const [clinicData, dashboardData] = await Promise.all([
                ngoAPI.getClinics(),
                ngoAPI.getDashboardData()
            ]);
            setClinics(clinicData || []);
            setAcceptedDonations(dashboardData.accepted_donations || []);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await ngoAPI.registerClinic(formData);
            alert("Clinic onboarding initiated! Link generated in backend logs.");
            setShowForm(false);
            setFormData({
                clinic_name: '',
                official_email: '',
                facility_id: '',
                facility_id_type: 'ABDM_HFR',
                doctor_registration_number: '',
                pincode: ''
            });
            fetchClinics();
        } catch (error) {
            alert("Registration failed: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleNeedSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await ngoAPI.createClinicNeed({
                ...needData,
                clinic_id: selectedClinic.id,
                quantity: parseInt(needData.quantity)
            });
            alert("Requirement recorded successfully!");
            setShowNeedForm(false);
            setNeedData({ item_name: '', quantity: '', purpose: '', priority: 2 });
        } catch (error) {
            alert("Failed to record requirement: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewFeedback = async (clinic) => {
        setSelectedClinic(clinic);
        setFeedbackSidebarOpen(true);
        setLoadingFeedback(true);
        try {
            const data = await ngoAPI.getClinicFeedback(clinic.id);
            setClinicFeedback(data);
        } catch (error) {
            console.error("Failed to fetch feedback", error);
            setClinicFeedback([]);
        } finally {
            setLoadingFeedback(false);
        }
    };

    const filteredClinics = clinics.filter(c =>
        c.clinic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.official_email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Layout>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
                <div className="page-header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <h1 className="page-title" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #00e5ff, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Clinic Network Management
                        </h1>
                        <p className="page-subtitle">Track, onboard, and manage verified healthcare facilities</p>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            background: showForm ? 'rgba(239, 68, 68, 0.1)' : 'linear-gradient(135deg, #00e5ff 0%, #10b981 100%)',
                            color: showForm ? '#ef4444' : '#000',
                            border: showForm ? '1px solid #ef4444' : 'none',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '12px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            fontFamily: "'Orbitron', sans-serif"
                        }}
                    >
                        {showForm ? <XCircle size={18} /> : <UserPlus size={18} />}
                        {showForm ? 'CANCEL ONBOARDING' : 'ONBOARD CLINIC'}
                    </button>
                </div>

                {/* Onboarding Form Overlay */}
                {showForm && (
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(0, 229, 255, 0.2)',
                        padding: '3rem',
                        marginBottom: '3rem',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', opacity: 0.1 }}>
                            <Hospital size={120} color="#00e5ff" />
                        </div>

                        <h2 style={{ color: '#fff', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <ShieldCheck color="#00e5ff" /> New Clinic Verification
                        </h2>

                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem', position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div className="form-group">
                                    <label style={{ color: '#94a3b8', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Clinic Name</label>
                                    <input
                                        type="text" name="clinic_name" required value={formData.clinic_name} onChange={handleChange}
                                        placeholder="e.g. LifeCare Hospital"
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '12px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ color: '#94a3b8', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Official Email</label>
                                    <input
                                        type="email" name="official_email" required value={formData.official_email} onChange={handleChange}
                                        placeholder="admin@lifecare.com"
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '12px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                                <div className="form-group">
                                    <label style={{ color: '#94a3b8', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Facility ID</label>
                                    <input
                                        type="text" name="facility_id" required value={formData.facility_id} onChange={handleChange}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '12px' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ color: '#94a3b8', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>ID Type</label>
                                    <select
                                        name="facility_id_type" value={formData.facility_id_type} onChange={handleChange}
                                        style={{ width: '100%', background: 'rgba(15, 23, 42, 1)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '12px' }}
                                    >
                                        <option value="ABDM_HFR">ABDM HFR</option>
                                        <option value="CEA">CEA REGISTRY</option>
                                        <option value="STATE">STATE LICENSE</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ color: '#94a3b8', marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem' }}>Pincode</label>
                                    <input
                                        type="text" name="pincode" required pattern="[0-9]{6}" value={formData.pincode} onChange={handleChange}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '12px' }}
                                    />
                                </div>
                            </div>


                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <AnimatedButton
                                    type="submit"
                                    loading={submitting}
                                    variant="primary"
                                >
                                    <ShieldCheck size={20} /> INITIATE SECURE ONBOARDING
                                </AnimatedButton>
                            </div>
                        </form>
                    </div>
                )}
                {/* Record Need Form Modal */}
                {showNeedForm && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                        <div style={{ background: '#0f172a', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(0, 229, 255, 0.2)', width: '100%', maxWidth: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ color: '#fff', fontSize: '1.5rem', margin: 0 }}>Record Audit Requirement</h2>
                                <button onClick={() => setShowNeedForm(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}><XCircle size={24} /></button>
                            </div>
                            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Raising need for: <strong>{selectedClinic.clinic_name}</strong></p>

                            <form onSubmit={handleNeedSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
                                <div className="form-group">
                                    <label style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Product Selection (From Inventory)</label>
                                    <select
                                        required
                                        value={needData.item_name}
                                        onChange={e => setNeedData({ ...needData, item_name: e.target.value, quantity: '' })} // Reset quantity on item change
                                        style={{ width: '100%', background: 'rgba(15, 23, 42, 1)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: '8px' }}
                                    >
                                        <option value="">-- Select Product --</option>
                                        {Object.entries(stockMap).map(([itemName, totalQty]) => (
                                            <option key={itemName} value={itemName}>
                                                {itemName} (Available: {totalQty.toLocaleString()})
                                            </option>
                                        ))}
                                        {acceptedDonations.length === 0 && <option disabled>No accepted stock available</option>}
                                    </select>
                                    {acceptedDonations.length > 0 && (
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                                            Only products currently in your accepted inventory are shown.
                                        </p>
                                    )}
                                </div>
                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Quantity Needed</label>
                                        {needData.item_name && (
                                            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                                                MAX AVAILABLE: {stockMap[needData.item_name]?.toLocaleString() || 0}
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max={stockMap[needData.item_name] || 999999}
                                        value={needData.quantity}
                                        onChange={e => setNeedData({ ...needData, quantity: e.target.value })}
                                        placeholder={needData.item_name ? `Max ${stockMap[needData.item_name]}` : "Enter quantity"}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: '8px' }}
                                    />
                                    {needData.item_name && parseInt(needData.quantity) > stockMap[needData.item_name] && (
                                        <p style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '4px' }}>
                                            Warning: Requested quantity exceeds current verified stock.
                                        </p>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Priority</label>
                                    <select value={needData.priority} onChange={e => setNeedData({ ...needData, priority: parseInt(e.target.value) })} style={{ width: '100%', background: 'rgba(15, 23, 42, 1)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: '8px' }}>
                                        <option value={1}>Critical (Emergency)</option>
                                        <option value={2}>High</option>
                                        <option value={3}>Medium</option>
                                        <option value={4}>Routine</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>Purpose / Justification</label>
                                    <textarea required value={needData.purpose} onChange={e => setNeedData({ ...needData, purpose: e.target.value })} rows={3} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem', borderRadius: '8px' }}></textarea>
                                </div>
                                <AnimatedButton type="submit" loading={submitting} variant="primary">
                                    RECORD REQUIREMENT
                                </AnimatedButton>
                            </form>
                        </div>
                    </div>
                )}

                {/* Search & Filter Bar */}
                <div style={{
                    display: 'flex', gap: '1rem', marginBottom: '2rem',
                    background: 'rgba(15, 23, 42, 0.4)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                            type="text" placeholder="Search by name, email, or facility ID..."
                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px' }}
                        />
                    </div>
                    <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Filter size={18} /> Filters
                    </button>
                </div>

                {/* Clinics Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem' }}>
                        <Loader2 size={48} className="spin-icon" color="#00e5ff" />
                    </div>
                ) : filteredClinics.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Hospital size={64} color="#64748b" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No Clinics Found</h3>
                        <p style={{ color: '#94a3b8' }}>Try adjusting your search or onboard a new clinic.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {filteredClinics.map(clinic => (
                            <div key={clinic.id} style={{
                                background: 'rgba(15, 23, 42, 0.4)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '24px',
                                padding: '1.5rem',
                                transition: 'transform 0.3s ease',
                                ":hover": { transform: 'translateY(-5px)', borderColor: '#00e5ff' }
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div style={{ width: '48px', height: '48px', background: 'rgba(0, 229, 255, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Hospital color="#00e5ff" size={24} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <div style={{
                                            padding: '4px 12px', borderRadius: '20px',
                                            background: clinic.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: clinic.is_active ? '#10b981' : '#f59e0b',
                                            fontSize: '0.7rem', fontWeight: 800, border: `1px solid ${clinic.is_active ? '#10b981' : '#f59e0b'}`
                                        }}>
                                            {clinic.is_active ? 'ACTIVE' : 'PENDING'}
                                        </div>
                                        <button style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </div>

                                <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{clinic.clinic_name}</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Mail size={14} /> {clinic.official_email}
                                </p>

                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', display: 'grid', gap: '0.75rem', fontSize: '0.85rem' }}>
                                    <div style={{ display: 'flex', justifySelf: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Facility ID:</span>
                                        <span style={{ color: '#fff', fontFamily: 'monospace' }}>{clinic.facility_id}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifySelf: 'space-between' }}>
                                        <span style={{ color: '#64748b' }}>Pincode:</span>
                                        <span style={{ color: '#fff' }}>6xxxxx</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    <button
                                        disabled={!clinic.is_active}
                                        onClick={() => { navigate('/ngo/clinic-requests', { state: { clinicId: clinic.id, clinicName: clinic.clinic_name } }); }}
                                        style={{
                                            background: clinic.is_active ? 'rgba(0, 229, 255, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                                            border: `1px solid ${clinic.is_active ? '#00e5ff' : '#64748b'}`,
                                            color: clinic.is_active ? '#00e5ff' : '#64748b',
                                            padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: clinic.is_active ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        VIEW REQUIREMENTS
                                    </button>
                                    <button
                                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                        onClick={() => handleViewFeedback(clinic)}
                                    >
                                        ACTIVITY LOG <Activity size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Feedback Sidebar Drawer */}
            <AnimatePresence>
                {feedbackSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setFeedbackSidebarOpen(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(4px)' }}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                position: 'fixed', right: 0, top: 0, bottom: 0, width: '450px',
                                background: '#0f172a', borderLeft: '1px solid rgba(0, 229, 255, 0.2)',
                                zIndex: 1001, padding: '2rem', overflowY: 'auto',
                                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                    <Activity color="#00e5ff" /> {selectedClinic?.clinic_name}
                                </h2>
                                <button onClick={() => setFeedbackSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <h3 style={{ color: '#94a3b8', fontSize: '0.9rem', uppercase: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Feedback History</h3>

                            {loadingFeedback ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <Loader2 className="spin-icon" color="#00e5ff" size={32} />
                                </div>
                            ) : clinicFeedback.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: '#64748b' }}>
                                    No feedback received from this clinic.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {clinicFeedback.map((fb) => (
                                        <div key={fb.id} style={{
                                            background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ color: '#00e5ff', fontSize: '0.9rem', fontWeight: 600 }}>{fb.item_name}</span>
                                                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{new Date(fb.received_at).toLocaleDateString()}</span>
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#fff', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                                                "{fb.feedback}"
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#fbbf24' }}>
                                                {'★'.repeat(fb.quality_rating || 0)}{'☆'.repeat(5 - (fb.quality_rating || 0))}
                                                <span style={{ color: '#64748b' }}>({fb.quantity} units)</span>
                                            </div>
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

export default NgoManageClinics;
