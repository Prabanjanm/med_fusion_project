import React, { useState } from 'react';
import { Send, Truck, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import WizardModal, { ReviewSummary } from '../components/WizardModal';
import '../styles/FormStyles.css';

/**
 * AllocateToClinic Component
 * NGO form to allocate donations to specific clinics using a Wizard Flow.
 */
const AllocateToClinic = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const [formData, setFormData] = useState({
    donationId: '',
    clinicName: '',
    allocatedQuantity: '',
    expectedDeliveryDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedHash, setSubmittedHash] = useState(null);

  const donationOptions = [
    { value: 'DON-2025-001', label: 'DON-2025-001 - PPE Kits (100 boxes)' },
    { value: 'DON-2025-002', label: 'DON-2025-002 - Medical Gloves (500 boxes)' },
    { value: 'DON-2025-003', label: 'DON-2025-003 - Syringes (1000 units)' },
  ];

  const clinicOptions = [
    { value: 'clinic1', label: 'City General Hospital' },
    { value: 'clinic2', label: 'Community Clinic West' },
    { value: 'clinic3', label: 'Rural Health Center' },
    { value: 'clinic4', label: 'Emergency Care Clinic' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.donationId) newErrors.donationId = 'Donation is required';
    if (!formData.clinicName) newErrors.clinicName = 'Clinic is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.allocatedQuantity || formData.allocatedQuantity <= 0) {
      newErrors.allocatedQuantity = 'Valid quantity is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Allocation submitted:', formData);
      const mockHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setSubmittedHash(mockHash);
      setIsSubmitting(false);
      setIsWizardOpen(false);
    }, 2000);
  };

  const Step1Selection = (
    <div>
      <div className="wizard-field-group">
        <label className="wizard-label">Select Source Donation</label>
        <select
          name="donationId"
          value={formData.donationId}
          onChange={handleChange}
          className="wizard-select"
        >
          <option value="">Choose a donation</option>
          {donationOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.donationId && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.donationId}</span>}
      </div>

      <div className="wizard-field-group">
        <label className="wizard-label">Target Clinic</label>
        <select
          name="clinicName"
          value={formData.clinicName}
          onChange={handleChange}
          className="wizard-select"
        >
          <option value="">Select receiver clinic</option>
          {clinicOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.clinicName && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.clinicName}</span>}
      </div>
    </div>
  );

  const Step2Logistics = (
    <div>
      <div className="wizard-field-group">
        <label className="wizard-label">Allocated Quantity</label>
        <input
          type="number"
          name="allocatedQuantity"
          value={formData.allocatedQuantity}
          onChange={handleChange}
          placeholder="Enter quantity"
          min="1"
          className="wizard-input"
        />
        {errors.allocatedQuantity && (
          <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.allocatedQuantity}</span>
        )}
      </div>

      <div className="wizard-field-group">
        <label className="wizard-label">Expected Delivery Date</label>
        <input
          type="date"
          name="expectedDeliveryDate"
          value={formData.expectedDeliveryDate}
          onChange={handleChange}
          className="wizard-input"
        />
      </div>

      <div className="wizard-field-group">
        <label className="wizard-label">Remarks (Optional)</label>
        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Special instructions or notes"
          rows="3"
          className="wizard-textarea"
        />
      </div>
    </div>
  );

  const wizardSteps = [
    {
      id: 'step1',
      label: 'Source',
      title: 'Select Donation & Clinic',
      component: Step1Selection,
      validate: validateStep1
    },
    {
      id: 'step2',
      label: 'Logistics',
      title: 'Allocation Details',
      component: Step2Logistics,
      validate: validateStep2
    },
    {
      id: 'step3',
      label: 'Confirm',
      title: 'Review & Sign Transaction',
      component: <ReviewSummary data={formData} />,
    }
  ];

  if (submittedHash) {
    return (
      <Layout>
        <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', color: '#00ff94', marginBottom: '1rem', animation: 'bounce 1s' }}>
            <CheckCircle size={80} />
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Allocation Recorded</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2rem' }}>
            The allocation has been successfully broadcast to the network.
          </p>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem 2rem', borderRadius: '8px', border: '1px dashed #334155', fontFamily: 'monospace', color: '#00ff94', marginBottom: '2rem' }}>
            {submittedHash}
          </div>

          <button
            className="btn-primary"
            onClick={() => {
              setSubmittedHash(null);
              setFormData({
                donationId: '', clinicName: '', allocatedQuantity: '', expectedDeliveryDate: new Date().toISOString().split('T')[0], remarks: ''
              });
            }}
          >
            Allocate More
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
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinic Allocation</h1>
          <p className="page-subtitle">Distribute Resources to Clinics</p>
        </div>
      </div>

      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.05)',
        padding: '2rem'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ background: 'linear-gradient(135deg, #F72585 0%, #7209B7 100%)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 25px rgba(247, 37, 133, 0.4)' }}>
            <Truck size={40} color="#fff" />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>New Allocation</h2>
          <p style={{ color: '#94A3B8', marginBottom: '2rem', lineHeight: '1.6' }}>
            Create a new shipment allocation for a registered clinic.
            Ensure quantities match available donation stock.
          </p>
          <button
            className="btn-primary"
            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
            onClick={() => setIsWizardOpen(true)}
          >
            Start Allocation Wizard
          </button>
        </div>
      </div>

      <WizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Distribute Resources (Secure)"
        steps={wizardSteps}
        onComplete={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
};

export default AllocateToClinic;
