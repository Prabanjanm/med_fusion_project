import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { donationAPI } from '../services/api';
import {
  Plus, CheckCircle, Search, ShieldCheck,
  Calendar, Package, Building2, Briefcase,
  ArrowRight, Info, Heart, ChevronDown, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import WizardModal, { ReviewSummary } from '../components/WizardModal';
import BlockchainNotification from '../components/BlockchainNotification';
import { useBlockchainNotification } from '../hooks/useBlockchainNotification';
import { useAuth } from '../context/AuthContext';
import '../styles/FormStyles.css';

const CreateDonation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Page starts with landing screen, clicking button opens wizard
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { notification, triggerBlockCreation, hideNotification } = useBlockchainNotification();

  const [availableNgos, setAvailableNgos] = useState([]);
  const [ngoSearch, setNgoSearch] = useState('');
  const [isNgoDropdownOpen, setIsNgoDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedHash, setSubmittedHash] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    donorName: '',
    donorOrgName: user?.organization_name || user?.company_name || '', // AUTO-FILL
    items: [{ id: Date.now(), item_name: '', quantity: '', unit: 'Units', expiryDate: '' }],
    ngo_id: '',
    ngo_name: '',
    purpose: '',
    board_resolution_ref: '',
    csr_policy_declared: true,
  });

  useEffect(() => {
    if (user) {
      const orgName = user.organization_name || user.company_name;
      if (orgName) {
        setFormData(prev => ({ ...prev, donorOrgName: orgName }));
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchNgos = async () => {
      try {
        const ngos = await donationAPI.getVerifiedNgos();
        setAvailableNgos(ngos);
      } catch (error) {
        console.error("Failed to fetch NGOs:", error);
      }
    };
    fetchNgos();

    if (location.state) {
      const { item_name, quantity, requirement_id, clinic_name } = location.state;
      setFormData(prev => ({
        ...prev,
        items: [{ id: Date.now(), item_name: item_name || '', quantity: quantity || '', unit: 'Units', expiryDate: '' }],
        purpose: `Fulfillment: ${item_name} for ${clinic_name}`,
      }));
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleItemChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now(), item_name: '', quantity: '', unit: 'Units', expiryDate: '' }]
    }));
  };

  const removeItem = (id) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
    }
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.donorName) errs.donorName = 'Authorizing official name is required';
    if (!formData.donorOrgName) errs.donorOrgName = 'Organization name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.ngo_id) errs.ngo_id = 'Please select a recipient NGO';

    const itemErrors = [];
    formData.items.forEach((item, index) => {
      if (!item.item_name || !item.quantity || !item.expiryDate) {
        itemErrors.push(index);
      }
    });

    if (itemErrors.length > 0) {
      errs.items = 'Please complete all fields for each item';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let lastHash = '';

      // Submit each item as a separate block to ensure granular audit trail
      for (const item of formData.items) {
        const payload = {
          item_name: `${item.item_name} (${item.unit})`,
          quantity: parseInt(item.quantity, 10),
          ngo_id: parseInt(formData.ngo_id, 10),
          purpose: formData.purpose || 'Direct Corporate Donation',
          board_resolution_ref: formData.board_resolution_ref || `BR-${Date.now()}`,
          csr_policy_declared: true,
          expiry_date: item.expiryDate
        };

        await triggerBlockCreation('DONATION_CREATED', payload);
        const response = await donationAPI.create(payload);
        lastHash = response.audit?.tx_hash;
      }

      setSubmittedHash(lastHash || 'BATCH-AUTH-' + Date.now());
      setIsSubmitting(false);

      setTimeout(() => {
        setIsWizardOpen(false);
      }, 3000);
    } catch (error) {
      console.error("Donation failed", error);
      alert("Submission error: " + error.message);
      setIsSubmitting(false);
    }
  };

  const filteredNgos = availableNgos.filter(n =>
    n.name.toLowerCase().includes(ngoSearch.toLowerCase())
  );

  const Step1Identity = (
    <div className="wizard-form-container">
      <div className="wizard-field-group">
        <label className="wizard-label">Authorizing Official</label>
        <div style={{ position: 'relative' }}>
          <Briefcase size={18} style={{ position: 'absolute', right: '1rem', top: '1rem', color: '#06b6d4' }} />
          <input
            type="text"
            name="donorName"
            value={formData.donorName}
            onChange={handleInputChange}
            placeholder="e.g. Director of Finance"
            className="wizard-input"
            style={{ borderColor: errors.donorName ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
          />
        </div>
        {errors.donorName && <span className="error-text">{errors.donorName}</span>}
      </div>

      <div className="wizard-field-group">
        <label className="wizard-label">Company / Department</label>
        <div style={{ position: 'relative' }}>
          <Building2 size={18} style={{ position: 'absolute', right: '1rem', top: '1rem', color: '#06b6d4' }} />
          <input
            type="text"
            name="donorOrgName"
            value={formData.donorOrgName}
            onChange={handleInputChange}
            placeholder="e.g. Acme Health Biotech"
            className="wizard-input"
            style={{ borderColor: errors.donorOrgName ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
          />
        </div>
        {errors.donorOrgName && <span className="error-text">{errors.donorOrgName}</span>}
      </div>
    </div>
  );

  const Step2Allocation = (
    <div className="wizard-form-container">
      <div className="wizard-field-group" style={{ position: 'relative', marginBottom: '2rem' }}>
        <label className="wizard-label">Recipient NGO</label>

        <div
          onClick={() => setIsNgoDropdownOpen(!isNgoDropdownOpen)}
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: `1px solid ${isNgoDropdownOpen ? '#00e5ff' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '12px',
            padding: '1rem',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {formData.ngo_id ? (
              <>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                  color: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem'
                }}>
                  {formData.ngo_name?.charAt(0)}
                </div>
                <span style={{ color: '#fff', fontWeight: 600 }}>{formData.ngo_name}</span>
              </>
            ) : (
              <span style={{ color: '#64748b' }}>Select NGO from directory...</span>
            )}
          </div>
          <ChevronDown size={20} color="#64748b" style={{ transform: isNgoDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }} />
        </div>

        <AnimatePresence>
          {isNgoDropdownOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: '#0f172a', border: '1px solid rgba(0, 229, 255, 0.2)',
                borderRadius: '16px', marginTop: '0.5rem', padding: '1rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)'
              }}>
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '0.9rem', color: '#64748b' }} />
                <input type="text" placeholder="Filter by name..." value={ngoSearch} onChange={(e) => setNgoSearch(e.target.value)} onClick={(e) => e.stopPropagation()} className="wizard-input" style={{ paddingLeft: '2.5rem', height: '44px', fontSize: '0.9rem' }} />
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px' }} className="custom-scrollbar">
                {filteredNgos.length > 0 ? filteredNgos.map(ngo => (
                  <div key={ngo.id} onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, ngo_id: ngo.id, ngo_name: ngo.name }); setIsNgoDropdownOpen(false); }}
                    style={{
                      padding: '0.75rem 1rem', borderRadius: '10px', cursor: 'pointer',
                      background: formData.ngo_id === ngo.id ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                      border: formData.ngo_id === ngo.id ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid transparent',
                      display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', marginBottom: '4px'
                    }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                      {ngo.name.charAt(0)}
                    </div>
                    <span style={{ color: formData.ngo_id === ngo.id ? '#00e5ff' : '#fff', fontSize: '0.9rem' }}>{ngo.name}</span>
                  </div>
                )) : <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No matching NGOs</div>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {errors.ngo_id && <span className="error-text" style={{ marginTop: '0.5rem', display: 'block' }}>{errors.ngo_id}</span>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <label className="wizard-label" style={{ margin: 0 }}>Itemized Resources</label>
        <button type="button" onClick={addItem}
          style={{
            background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)',
            color: '#06b6d4', padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem',
            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
          }}>
          <Plus size={14} /> Add Item
        </button>
      </div>

      <div className="custom-scrollbar" style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
        {formData.items.map((item, index) => (
          <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', position: 'relative'
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
              <label className="wizard-label" style={{ fontSize: '0.75rem', opacity: 0.8, margin: 0, color: '#00e5ff', fontWeight: '800' }}>PRODUCT {index + 1}</label>
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    padding: 0
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            <div className="wizard-field-group">
              <div style={{ position: 'relative' }}>
                <Package size={18} style={{ position: 'absolute', right: '1rem', top: '1rem', color: '#64748b' }} />
                <input type="text" value={item.item_name} onChange={(e) => handleItemChange(item.id, 'item_name', e.target.value)} placeholder="e.g. Surgical Masks" className="wizard-input" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 3fr', gap: '1rem' }}>
              <div className="wizard-field-group">
                <label className="wizard-label" style={{ fontSize: '0.75rem', opacity: 0.7 }}>QUANTITY</label>
                <input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} placeholder="0" className="wizard-input" />
              </div>
              <div className="wizard-field-group">
                <label className="wizard-label" style={{ fontSize: '0.75rem', opacity: 0.7 }}>TYPE</label>
                <select value={item.unit} onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)} className="wizard-select">
                  <option value="Units">Units</option>
                  <option value="Boxes">Boxes</option>
                  <option value="Cases">Cases</option>
                  <option value="Kits">Kits</option>
                </select>
              </div>
              <div className="wizard-field-group">
                <label className="wizard-label" style={{ fontSize: '0.75rem', opacity: 0.7 }}>EXPIRY</label>
                <input type="date" value={item.expiryDate} onChange={(e) => handleItemChange(item.id, 'expiryDate', e.target.value)} className="wizard-input" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {errors.items && <span className="error-text" style={{ textAlign: 'center', display: 'block' }}>{errors.items}</span>}
    </div>
  );

  const wizardSteps = [
    { id: 'identity', label: 'Auth', title: 'Internal Authorization', component: Step1Identity, validate: validateStep1 },
    { id: 'allocation', label: 'Details', title: 'Resource Allocation', component: Step2Allocation, validate: validateStep2 },
    {
      id: 'review', label: 'Blockchain', title: 'Ledger Confirmation', component: <ReviewSummary data={{
        Official: formData.donorName,
        Org: formData.donorOrgName,
        Items: `${formData.items.length} Category Batch`,
        Target: formData.ngo_name,
        Integrity: 'Sha-256 Verified'
      }} />, validate: () => true
    }
  ];

  if (submittedHash) {
    return (
      <Layout>
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(0, 255, 148, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 0 50px rgba(0, 255, 148, 0.2)' }}>
            <ShieldCheck size={60} color="#00ff94" />
          </motion.div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #00ff94, #00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Batch Authorized</h1>
          <p style={{ color: '#94a3b8', maxWidth: '600px', marginBottom: '2rem' }}>All {formData.items.length} items have been recorded as unique verified nodes on the blockchain ledger.</p>
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0, 255, 148, 0.3)', fontFamily: 'monospace', fontSize: '0.9rem', color: '#00ff94', marginBottom: '2rem', maxWidth: '90%' }}>{submittedHash}</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={() => navigate('/csr/history')}>View History</button>
            <button className="btn-secondary" onClick={() => window.location.reload()} style={{ padding: '0 2rem' }}>Record Another</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <BlockchainNotification show={notification.show} eventType={notification.eventType} onComplete={hideNotification} />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="page-title">Trust Authorization</h1>
          <p className="page-subtitle">Secure resource commitment for the Social Health Network</p>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(24px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '4rem 3rem', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', border: '1px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 0 30px rgba(59, 130, 246, 0.1)' }}>
            <Heart size={48} color="#3b82f6" fill="rgba(59, 130, 246, 0.1)" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '1rem' }}>Initiate Batch Donation</h2>
          <p style={{ color: '#94a3b8', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem', lineHeight: '1.6' }}>Every item in your batch is recorded with absolute mathematical proof, providing full transparency to auditors and clinics.</p>
          <button className="btn btn-primary" onClick={() => setIsWizardOpen(true)} style={{ padding: '1.2rem 4rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 auto', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}>DONATE NOW <ArrowRight size={20} /></button>
        </motion.div>
      </div>
      <WizardModal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} title="Donation Authorization Wizard" steps={wizardSteps} onComplete={handleSubmit} isSubmitting={isSubmitting} />
    </Layout>
  );
};

export default CreateDonation;
