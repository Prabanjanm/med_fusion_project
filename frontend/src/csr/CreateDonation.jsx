import React, { useState } from 'react';
import { donationAPI } from '../services/api';
import { Upload, Plus, FileText, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import WizardModal, { ReviewSummary } from '../components/WizardModal';
import BlockchainNotification from '../components/BlockchainNotification';
import { useBlockchainNotification } from '../hooks/useBlockchainNotification';
import '../styles/FormStyles.css';

/**
 * CreateDonation Component
 * Uses the WizardModal to guide users through the donation process.
 */
const CreateDonation = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { notification, triggerBlockCreation, hideNotification } = useBlockchainNotification();

  const [formData, setFormData] = useState({
    donorName: '',
    donorOrgName: '',
    resourceType: 'ppe',
    quantity: '',
    unit: 'pieces',
    donationDate: new Date().toISOString().split('T')[0],
    ngoName: '',
    purpose: '',
    supportingDocument: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedHash, setSubmittedHash] = useState(null);

  const resourceOptions = [
    { value: 'ppe', label: 'PPE Kits' },
    { value: 'gloves', label: 'Medical Gloves' },
    { value: 'syringes', label: 'Syringes' },
    { value: 'masks', label: 'N95 Masks' },
    { value: 'medications', label: 'Medications' },
    { value: 'equipment', label: 'Medical Equipment' },
    { value: 'other', label: 'Other' },
  ];

  const ngoOptions = [
    { value: 'ngo1', label: 'Red Cross India' },
    { value: 'ngo2', label: 'WHO Partners' },
    { value: 'ngo3', label: 'MSF India' },
    { value: 'ngo4', label: 'Médecins du Monde' },
  ];

  const unitOptions = [
    { value: 'pieces', label: 'Pieces' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'cartons', label: 'Cartons' },
    { value: 'units', label: 'Units' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFormData(prev => ({ ...prev, supportingDocument: file }));
  };

  // Step 1: Validation
  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.donorName.trim()) newErrors.donorName = 'Donor name is required';
    if (!formData.donorOrgName.trim()) newErrors.donorOrgName = 'Organization name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2: Validation
  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.ngoName) newErrors.ngoName = 'Please select an NGO';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        item_name: `${formData.resourceType} (${formData.unit})`,
        quantity: parseInt(formData.quantity, 10),
        purpose: formData.purpose || `Donation to ${formData.ngoName}`,
        board_resolution_ref: `BR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        csr_policy_declared: true
      };

      // Trigger blockchain block creation with notification
      const block = await triggerBlockCreation('DONATION_CREATED', payload);

      // Call API (in demo mode this will use mock data)
      const response = await donationAPI.create(payload).catch(() => ({
        id: `DON-${Date.now()}`,
        ...payload,
        status: 'PENDING'
      }));

      console.log('Donation submitted:', response);
      console.log('Blockchain block created:', block);

      setSubmittedHash(block?.hash || 'DEMO-HASH-' + Date.now());
      setIsSubmitting(false);

      // Close wizard after notification completes
      setTimeout(() => {
        setIsWizardOpen(false);
      }, 3500);
    } catch (error) {
      console.error("Donation creation failed", error);
      alert("Failed to create donation: " + error.message);
      setIsSubmitting(false);
    }
  };

  // Step Components
  const Step1Identity = (
    <div>
      <div className="wizard-field-group">
        <label className="wizard-label">Donor Name</label>
        <input
          type="text"
          name="donorName"
          value={formData.donorName}
          onChange={handleChange}
          placeholder="e.g. John Doe"
          className="wizard-input"
          required
        />
        {errors.donorName && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.donorName}</span>}
      </div>
      <div className="wizard-field-group">
        <label className="wizard-label">Organization Name</label>
        <input
          type="text"
          name="donorOrgName"
          value={formData.donorOrgName}
          onChange={handleChange}
          placeholder="e.g. Health Corp Global"
          className="wizard-input"
          required
        />
        {errors.donorOrgName && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.donorOrgName}</span>}
      </div>
      <div className="wizard-field-group">
        <label className="wizard-label">Donation Date</label>
        <input
          type="date"
          name="donationDate"
          value={formData.donationDate}
          onChange={handleChange}
          className="wizard-input"
        />
      </div>
    </div>
  );

  const Step2Details = (
    <div>
      <div className="wizard-field-group">
        <label className="wizard-label">Target NGO</label>
        <select
          name="ngoName"
          value={formData.ngoName}
          onChange={handleChange}
          className="wizard-select"
          required
        >
          <option value="" disabled>Select Receiver NGO</option>
          {ngoOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {errors.ngoName && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.ngoName}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="wizard-field-group">
          <label className="wizard-label">Resource Type</label>
          <select
            name="resourceType"
            value={formData.resourceType}
            onChange={handleChange}
            className="wizard-select"
          >
            {resourceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="wizard-field-group">
          <label className="wizard-label">Unit</label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="wizard-select"
          >
            {unitOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      <div className="wizard-field-group">
        <label className="wizard-label">Quantity</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="0"
          className="wizard-input"
          min="1"
          required
        />
        {errors.quantity && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.quantity}</span>}
      </div>

      <div className="wizard-field-group">
        <label className="wizard-label">Supporting Document (Optional)</label>
        <div style={{ border: '1px dashed #cbd5e1', padding: '1rem', borderRadius: '8px', textAlign: 'center', background: '#f8fafc' }}>
          <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
            <Upload size={24} />
            <span>{formData.supportingDocument ? formData.supportingDocument.name : "Click to Upload Proof"}</span>
            <input type="file" style={{ display: 'none' }} onChange={handleFileChange} />
          </label>
        </div>
      </div>
    </div>
  );

  const wizardSteps = [
    {
      id: 'step1',
      label: 'Identity',
      title: 'Donor Identification',
      component: Step1Identity,
      validate: validateStep1
    },
    {
      id: 'step2',
      label: 'Details',
      title: 'Resource Allocation',
      component: Step2Details,
      validate: validateStep2
    },
    {
      id: 'step3',
      label: 'Review',
      title: 'Blockchain Verification',
      component: <ReviewSummary data={formData} />,
      validate: () => true
    }
  ];

  if (submittedHash) {
    return (
      <Layout>
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', color: '#00ff94', marginBottom: '1rem', animation: 'bounce 1s' }}>
            <CheckCircle size={80} />
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Transaction Recorded</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2rem' }}>
            The donation has been successfully written to the blockchain ledger.
            Immutable hash generated.
          </p>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem 2rem', borderRadius: '8px', border: '1px dashed #334155', fontFamily: 'monospace', color: '#00ff94', marginBottom: '1rem' }}>
            {submittedHash}
          </div>

          <div style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '8px',
            padding: '12px 20px',
            marginBottom: '2rem',
            maxWidth: '500px'
          }}>
            <p style={{ color: '#fbbf24', fontSize: '0.85rem', margin: 0 }}>
              ⚠️ <strong>Simulated Blockchain Hash</strong> - This represents planned future blockchain integration for demonstration purposes
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={() => {
              setSubmittedHash(null);
              setFormData({
                donorName: '', donorOrgName: '', resourceType: 'ppe', quantity: '', unit: 'pieces',
                donationDate: new Date().toISOString().split('T')[0], ngoName: '', purpose: '', supportingDocument: null
              });
            }}
          >
            Make Another Donation
          </button>
        </div>
        <style>{`
             @keyframes bounce {
               0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
               40% {transform: translateY(-20px);}
               60% {transform: translateY(-10px);}
             }
           `}</style>
      </Layout>
    )
  }

  return (
    <Layout>
      <BlockchainNotification
        show={notification.show}
        eventType={notification.eventType}
        onComplete={hideNotification}
      />

      <div className="page-header">
        <div>
          <h1 className="page-title">Donation Portal</h1>
          <p className="page-subtitle">Secure Blockchain Record Management</p>
        </div>
      </div>

      <div style={{
        minHeight: '60vh',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.70)', /* Glass Theme */
        backdropFilter: 'blur(24px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6)',
        padding: '3rem'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ background: 'linear-gradient(135deg, #4361EE 0%, #7209B7 100%)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 25px rgba(67, 97, 238, 0.5)' }}>
            <Plus size={40} color="#fff" />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>New Donation Record</h2>
          <p style={{ color: '#94A3B8', marginBottom: '2rem', lineHeight: '1.6' }}>
            Start a secure, step-by-step process to record a new resource donation.
            All data is verified and hashed on the blockchain for transparency.
          </p>
          <button
            className="btn-primary"
            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
            onClick={() => setIsWizardOpen(true)}
          >
            Start Donation Wizard
          </button>
        </div>
      </div>

      <WizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Create New Donation (Secure)"
        steps={wizardSteps}
        onComplete={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
};

export default CreateDonation;
