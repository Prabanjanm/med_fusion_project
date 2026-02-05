import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, CheckCircle, AlertTriangle, ArrowRight, ClipboardList,
    Building2, Heart, ShieldCheck, Zap, Info, Clock, Calendar
} from 'lucide-react';
import Layout from '../components/Layout';
import WizardModal, { ReviewSummary } from '../components/WizardModal';
import { donationAPI } from '../services/api';
import BlockchainNotification from '../components/BlockchainNotification';
import { useBlockchainNotification } from '../hooks/useBlockchainNotification';
import '../styles/DashboardLayout.css';
import '../styles/FormStyles.css';

const CsrViewRequirements = () => {
    const navigate = useNavigate();
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Notification & Blockchain Hook
    const { notification, triggerBlockCreation, hideNotification } = useBlockchainNotification();

    // Form State
    const [formData, setFormData] = useState({
        item_name: '',
        resourceType: 'other',
        quantity: '',
        unit: 'units',
        ngo_id: '',
        ngo_name: '',
        purpose: '',
        board_resolution_ref: '',
        csr_policy_declared: true,
        expiry_date: '',
        requirement_id: null
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const ngosData = await donationAPI.getVerifiedNgos();
            setNgos(ngosData || []);
        } catch (error) {
            console.error("Failed to fetch NGO directory", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleOpenWizard = (ngo) => {
        setFormData({
            ...formData,
            ngo_id: ngo.id,
            ngo_name: ngo.name,
            requirement_id: null,
            purpose: `Corporate donation to ${ngo.name}`
        });
        setIsWizardOpen(true);
    };

    const validateStep1 = () => {
        const errs = {};
        if (!formData.item_name) errs.item_name = 'Product name is required';
        if (!formData.quantity || formData.quantity <= 0) errs.quantity = 'Valid quantity is required';
        if (!formData.ngo_id) errs.ngo_id = 'Please select a recipient NGO';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validateStep2 = () => {
        const errs = {};
        if (!formData.expiry_date) errs.expiry_date = 'Expiry date is required for medical supplies';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleCompleteDonation = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                item_name: formData.item_name,
                quantity: formData.quantity,
                ngo_id: formData.ngo_id,
                purpose: formData.purpose,
                board_resolution_ref: formData.board_resolution_ref || `BR-${Date.now()}`,
                csr_policy_declared: true,
                expiry_date: formData.expiry_date,
                requirement_id: null
            };

            // Trigger blockchain animation
            await triggerBlockCreation('DONATION_CREATED', payload);

            // API Call
            await donationAPI.create(payload);

            setIsWizardOpen(false);
            navigate('/csr/history');
        } catch (error) {
            console.error("Donation failed", error);
            alert("Error: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const Step1Details = (
        <div className="wizard-form-container">
            <div className="wizard-field-group">
                <label className="wizard-label">Product Details</label>
                <input
                    type="text"
                    name="item_name"
                    placeholder="e.g. N95 Masks, Paracetamol 500mg"
                    value={formData.item_name}
                    onChange={handleInputChange}
                    className="wizard-input"
                />
                {errors.item_name && <span className="error-text">{errors.item_name}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="wizard-field-group">
                    <label className="wizard-label">Quantity</label>
                    <input
                        type="number"
                        name="quantity"
                        placeholder="0"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="wizard-input"
                    />
                    {errors.quantity && <span className="error-text">{errors.quantity}</span>}
                </div>
                <div className="wizard-field-group">
                    <label className="wizard-label">Recipient NGO</label>
                    <select
                        name="ngo_id"
                        value={formData.ngo_id}
                        onChange={(e) => {
                            const selected = ngos.find(n => n.id == e.target.value);
                            setFormData({ ...formData, ngo_id: e.target.value, ngo_name: selected?.name || '' });
                        }}
                        className="wizard-select"
                        disabled // Typically pre-selected from card
                    >
                        <option value="">Select NGO</option>
                        {ngos.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="wizard-field-group">
                <label className="wizard-label">Purpose / Reference</label>
                <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="wizard-input"
                    rows={2}
                />
            </div>
        </div>
    );

    const Step2Expiry = (
        <div className="wizard-form-container">
            <div className="wizard-field-group">
                <label className="wizard-label">Batch Expiry Date</label>
                <div style={{ position: 'relative' }}>
                    <Calendar size={18} style={{ position: 'absolute', right: '1rem', top: '1rem', color: '#64748b' }} />
                    <input
                        type="date"
                        name="expiry_date"
                        value={formData.expiry_date}
                        onChange={handleInputChange}
                        className="wizard-input"
                    />
                </div>
                {errors.expiry_date && <span className="error-text">{errors.expiry_date}</span>}
            </div>

            <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                gap: '10px'
            }}>
                <ShieldCheck size={20} color="#10b981" />
                <p style={{ color: '#10b981', fontSize: '0.85rem', margin: 0 }}>
                    Verification ensures products have valid shelf life before reaching clinics.
                </p>
            </div>
        </div>
    );

    const wizardSteps = [
        { id: 'details', label: 'Product', title: 'Donation Details', component: Step1Details, validate: validateStep1 },
        { id: 'expiry', label: 'Verification', title: 'Batch Verification', component: Step2Expiry, validate: validateStep2 },
        { id: 'review', label: 'Blockchain', title: 'Final Review', component: <ReviewSummary data={formData} />, validate: () => true }
    ];

    return (
        <Layout>
            <BlockchainNotification
                show={notification.show}
                eventType={notification.eventType}
                onComplete={hideNotification}
            />

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
                <div className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '16px',
                            background: 'rgba(59, 130, 246, 0.1)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Building2 size={32} color="#3b82f6" />
                        </div>
                        <div>
                            <h1 className="page-title">NGO Partner Directory</h1>
                            <p className="page-subtitle">Collaborate with verified non-profits to channel your CSR impact</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', marginTop: '2rem' }}>
                    {/* Main Content: NGO Marketplace */}
                    <div>
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ color: '#fff', fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Building2 size={24} color="#3b82f6" /> Verified Organizations
                                </h2>
                                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{ngos.length} Partners Available</span>
                            </div>

                            {loading ? (
                                <div style={{ color: '#64748b', padding: '3rem', textAlign: 'center' }}>Connecting to trusted partner registry...</div>
                            ) : ngos.length === 0 ? (
                                <div className="table-card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                    No verified NGOs currently registered.
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                    {ngos.map(ngo => (
                                        <div key={ngo.id} className="table-card" style={{
                                            padding: '2rem',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            background: 'rgba(15, 23, 42, 0.4)',
                                            transition: 'transform 0.2s',
                                        }}>
                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                                <div style={{ width: '48px', height: '48px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Building2 size={24} color="#3b82f6" />
                                                </div>
                                                <div>
                                                    <h4 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>{ngo.name}</h4>
                                                    <span style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <ShieldCheck size={12} /> Verified
                                                    </span>
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
                                                Official Email:<br />
                                                <strong style={{ color: '#fff' }}>{ngo.email}</strong>
                                            </div>

                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handleOpenWizard(ngo)}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                            >
                                                Initiate Donation <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div>
                        <div className="table-card" style={{ padding: '1.5rem', background: 'rgba(0, 229, 255, 0.03)', border: '1px solid rgba(0, 229, 255, 0.1)' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShieldCheck size={20} color="#00e5ff" /> Donation Protocol
                            </h3>
                            <ul style={{ color: '#94a3b8', paddingLeft: '1.2rem', fontSize: '0.85rem', lineHeight: '1.8' }}>
                                <li>All donations are recorded on the secure ledger.</li>
                                <li>Specify batch quantities and expiry clearly.</li>
                                <li>NGOs manage secondary clinic allocation.</li>
                                <li>Provide board resolution refs for audit.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <WizardModal
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                title="Donation Wizard"
                steps={wizardSteps}
                onComplete={handleCompleteDonation}
                isSubmitting={isSubmitting}
            />
        </Layout>
    );
};

export default CsrViewRequirements;
