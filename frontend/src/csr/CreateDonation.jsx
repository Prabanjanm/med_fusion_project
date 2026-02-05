import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { donationAPI } from '../services/api';
import {
  Plus, CheckCircle, Search, ShieldCheck,
  Calendar, Package, Building2, Briefcase,
  ArrowRight, Info, Heart, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import WizardModal, { ReviewSummary } from '../components/WizardModal';
import BlockchainNotification from '../components/BlockchainNotification';
import { useBlockchainNotification } from '../hooks/useBlockchainNotification';
import '../styles/FormStyles.css';

const CreateDonation = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
    donorOrgName: '',
    item_name: '',
    quantity: '',
    ngo_id: '',
    ngo_name: '',
    purpose: '',
    board_resolution_ref: '',
    csr_policy_declared: true,
    expiryDate: '',
  });

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
        item_name: item_name || '',
        quantity: quantity || '',
        purpose: `Fulfillment: ${item_name} for ${clinic_name}`,
      }));
      // If redirected with state, maybe auto-open? 
      // The user said "page can start with symbol and clicking button goes to form"
      // So I'll keep it closed by default.
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!formData.donorName) errs.donorName = 'Donor name is required';
    if (!formData.donorOrgName) errs.donorOrgName = 'Organization is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!formData.item_name) errs.item_name = 'Product name is required';
    if (!formData.quantity || formData.quantity <= 0) errs.quantity = 'Valid quantity is required';
    if (!formData.ngo_id) errs.ngo_id = 'Please select a recipient NGO';
    if (!formData.expiryDate) errs.expiryDate = 'Expiry date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        item_name: formData.item_name,
        quantity: parseInt(formData.quantity, 10),
        ngo_id: parseInt(formData.ngo_id, 10),
        purpose: formData.purpose || 'Direct Corporate Donation',
        board_resolution_ref: formData.board_resolution_ref || `BR-${Date.now()}`,
        csr_policy_declared: true,
        expiry_date: formData.expiryDate
      };

      await triggerBlockCreation('DONATION_CREATED', payload);
      const response = await donationAPI.create(payload);

      setSubmittedHash(response.audit?.tx_hash || 'TX-HASH-' + Date.now());
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
          <Briefcase size={18} style={{ position: 'absolute', right: '1rem', top: '1rem', color: '#64748b' }} />
          <input
            type="text"
            name="donorName"
            value={formData.donorName}
            onChange={handleInputChange}
            placeholder="e.g. Director of Finance"
            className="wizard-input"
          />
        </div>
        {errors.donorName && <span className="error-text">{errors.donorName}</span>}
      </div>

      <div className="wizard-field-group">
        <label className="wizard-label">Company / Department</label>
        <div style={{ position: 'relative' }}>
          <Building2 size={18} style={{ position: 'absolute', right: '1rem', top: '1rem', color: '#64748b' }} />
          <input
            type="text"
            name="donorOrgName"
            value={formData.donorOrgName}
            onChange={handleInputChange}
            placeholder="e.g. Acme Health Biotech"
            className="wizard-input"
          />
        </div>
        {errors.donorOrgName && <span className="error-text">{errors.donorOrgName}</span>}
      </div>
    </div>
  );

  const Step2Allocation = (
    <div className="wizard-form-container">
      <div className="wizard-field-group" style={{ position: 'relative' }}>
        <label className="wizard-label">Recipient NGO</label>

        {/* Dropdown Toggle / Selection Bar */}
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
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#00e5ff',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem'
                }}>
                  {formData.ngo_name?.charAt(0)}
                </div>
                <span style={{ color: '#fff', fontWeight: 600 }}>{formData.ngo_name}</span>
              </>
            ) : (
              <span style={{ color: '#64748b' }}>Select NGO from directory...</span>
            )}
          </div>
          <ChevronDown
            size={20}
            color="#64748b"
            style={{
              transform: isNgoDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.3s'
            }}
          />
        </div>

        {/* Dropdown Content */}
        <AnimatePresence>
          {isNgoDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 100,
                background: '#0f172a',
                border: '1px solid rgba(0, 229, 255, 0.2)',
                borderRadius: '16px',
                marginTop: '0.5rem',
                padding: '1rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '0.9rem', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={ngoSearch}
                  onChange={(e) => setNgoSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="wizard-input"
                  style={{ paddingLeft: '2.5rem', height: '44px', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                padding: '4px'
              }} className="custom-scrollbar">
                {filteredNgos.length > 0 ? filteredNgos.map(ngo => (
                  <div
                    key={ngo.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, ngo_id: ngo.id, ngo_name: ngo.name });
                      setIsNgoDropdownOpen(false);
                    }}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: formData.ngo_id === ngo.id ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                      border: formData.ngo_id === ngo.id ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s',
                      marginBottom: '4px'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      fontSize: '0.8rem'
                    }}>
                      {ngo.name.charAt(0)}
                    </div>
                    <span style={{ color: formData.ngo_id === ngo.id ? '#00e5ff' : '#fff', fontSize: '0.9rem' }}>{ngo.name}</span>
                  </div>
                )) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No matching NGOs</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {errors.ngo_id && <span className="error-text" style={{ marginTop: '0.5rem', display: 'block' }}>{errors.ngo_id}</span>}
      </div>

      <div className="wizard-field-group">
        <label className="wizard-label">Product Name & Batch</label>
        <div style={{ position: 'relative' }}>
          <Package size={18} style={{ position: 'absolute', right: '1rem', top: '1rem', color: '#64748b' }} />
          <input
            type="text"
            name="item_name"
            value={formData.item_name}
            onChange={handleInputChange}
            placeholder="e.g. Surgical Masks"
            className="wizard-input"
          />
        </div>
        {errors.item_name && <span className="error-text">{errors.item_name}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="wizard-field-group">
          <label className="wizard-label">Total Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            placeholder="0"
            className="wizard-input"
          />
          {errors.quantity && <span className="error-text">{errors.quantity}</span>}
        </div>
        <div className="wizard-field-group">
          <label className="wizard-label">Expiry Date</label>
          <div style={{ position: 'relative' }}>
            <Calendar size={18} style={{
              position: 'absolute',
              right: '1rem',
              top: '1rem',
              color: '#64748b',
              pointerEvents: 'none',
              zIndex: 1
            }} />
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              className="wizard-input date-input-field"
              style={{ paddingRight: '3rem' }}
            />
          </div>
          {errors.expiryDate && <span className="error-text">{errors.expiryDate}</span>}
        </div>
      </div>
    </div>
  );

  const wizardSteps = [
    { id: 'identity', label: 'Auth', title: 'Internal Authorization', component: Step1Identity, validate: validateStep1 },
    { id: 'allocation', label: 'Details', title: 'Resource Allocation', component: Step2Allocation, validate: validateStep2 },
    { id: 'review', label: 'Blockchain', title: 'Ledger Confirmation', component: <ReviewSummary data={{ ...formData, verified: 'Cryptographic Check' }} />, validate: () => true }
  ];

  if (submittedHash) {
    return (
      <Layout>
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(0, 255, 148, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem',
            boxShadow: '0 0 50px rgba(0, 255, 148, 0.2)'
          }}>
            <ShieldCheck size={60} color="#00ff94" />
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(to right, #00ff94, #00e5ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Record Authorized
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: '600px', marginBottom: '2rem' }}>
            The transaction has been successfully synced with the blockchain ledger.
          </p>
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)', padding: '1.5rem', borderRadius: '12px',
            border: '1px solid rgba(0, 255, 148, 0.3)', fontFamily: 'monospace',
            fontSize: '0.9rem', color: '#00ff94', marginBottom: '2rem', maxWidth: '90%'
          }}>
            {submittedHash}
          </div>
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
          <h1 className="page-title">Resource Authorization</h1>
          <p className="page-subtitle">Initiate a secure donation protocol on the blockchain</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(24px)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '4rem 3rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem', border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.1)'
          }}>
            <Heart size={48} color="#3b82f6" fill="rgba(59, 130, 246, 0.1)" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '1rem' }}>New Donation Record</h2>
          <p style={{ color: '#94a3b8', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
            Authorizing a donation creates an immutable record on the HealthTrace blockchain,
            ensuring transparency for auditors and receiving clinics.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setIsWizardOpen(true)}
            style={{ padding: '1.2rem 4rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px', margin: '0 auto' }}
          >
            START FORM <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>

      <WizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Donation Wizard"
        steps={wizardSteps}
        onComplete={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
};

export default CreateDonation;
