import React, { useState } from 'react';
import { Send, CheckCircle, ClipboardCheck } from 'lucide-react';
import Layout from '../components/Layout';
import WizardModal, { ReviewSummary } from '../components/WizardModal';
import '../styles/FormStyles.css';

/**
 * ConfirmReceipt Component
 * Clinic form to confirm receipt of allocated donations via Wizard.
 */
const ConfirmReceipt = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const [formData, setFormData] = useState({
    allocationId: '',
    receivedQuantity: '',
    receivedDate: new Date().toISOString().split('T')[0],
    conditionStatus: 'good',
    remarks: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedHash, setSubmittedHash] = useState(null);

  // Waiting for backend
  const allocationOptions = [];

  const conditionOptions = [
    { value: 'good', label: 'Good Condition' },
    { value: 'damaged', label: 'Partially Damaged' },
    { value: 'partial', label: 'Partial Receipt' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.allocationId) newErrors.allocationId = 'Allocation ID is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.receivedQuantity || formData.receivedQuantity <= 0) {
      newErrors.receivedQuantity = 'Valid quantity is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Receipt confirmation submitted:', formData);
      const mockHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setSubmittedHash(mockHash);
      setIsSubmitting(false);
      setIsWizardOpen(false);
    }, 2000);
  };

  const Step1Selection = (
    <div>
      <div className="wizard-field-group">
        <label className="wizard-label">Allocation ID</label>
        <select
          name="allocationId"
          value={formData.allocationId}
          onChange={handleChange}
          className="wizard-select"
        >
          <option value="">Select an allocation</option>
          {allocationOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.allocationId && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.allocationId}</span>}
      </div>

      <div style={{ background: 'rgba(67, 97, 238, 0.1)', border: '1px dashed #4361EE', padding: '1rem', borderRadius: '8px', marginTop: '2rem' }}>
        <p style={{ fontSize: '0.9rem', color: '#CBD5E1', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <CheckCircle size={18} color="#4361EE" />
          Please ensure you have physically inspected the package before proceeding.
        </p>
      </div>
    </div>
  );

  const Step2Verification = (
    <div>
      <div className="wizard-field-group">
        <label className="wizard-label">Received Quantity</label>
        <input
          type="number"
          name="receivedQuantity"
          value={formData.receivedQuantity}
          onChange={handleChange}
          placeholder="Enter quantity count"
          min="1"
          className="wizard-input"
        />
        {errors.receivedQuantity && (
          <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{errors.receivedQuantity}</span>
        )}
      </div>

      <div className="wizard-field-group">
        <label className="wizard-label">Receipt Date</label>
        <input
          type="date"
          name="receivedDate"
          value={formData.receivedDate}
          onChange={handleChange}
          className="wizard-input"
        />
      </div>

      <div className="wizard-field-group">
        <label className="wizard-label">Condition Status</label>
        <select
          name="conditionStatus"
          value={formData.conditionStatus}
          onChange={handleChange}
          className="wizard-select"
        >
          {conditionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      <div className="wizard-field-group">
        <label className="wizard-label">Remarks (Optional)</label>
        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Observations, damage report, or notes"
          rows="3"
          className="wizard-textarea"
        />
      </div>
    </div>
  );

  const wizardSteps = [
    {
      id: 'step1',
      label: 'Identify',
      title: 'Select Allocation Shipment',
      component: Step1Selection,
      validate: validateStep1
    },
    {
      id: 'step2',
      label: 'Verify',
      title: 'Inspect & Verify Contents',
      component: Step2Verification,
      validate: validateStep2
    },
    {
      id: 'step3',
      label: 'Sign',
      title: 'Sign Receipt Transaction',
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
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Receipt Confirmed</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Your signature has been written to the ledger. Transfer of custody is complete.
          </p>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem 2rem', borderRadius: '8px', border: '1px dashed #334155', fontFamily: 'monospace', color: '#00ff94', marginBottom: '2rem' }}>
            {submittedHash}
          </div>

          <button
            className="btn-primary"
            onClick={() => {
              setSubmittedHash(null);
              setFormData({
                allocationId: '', receivedQuantity: '', receivedDate: new Date().toISOString().split('T')[0], conditionStatus: 'good', remarks: ''
              });
            }}
          >
            Confirm Another
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
          <h1 className="page-title">Receipt Confirmation</h1>
          <p className="page-subtitle">Verify & Sign Incoming Shipments</p>
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
          <div style={{ background: 'linear-gradient(135deg, #00B4D8 0%, #0077B6 100%)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 10px 25px rgba(0, 180, 216, 0.4)' }}>
            <ClipboardCheck size={40} color="#fff" />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>Incoming Shipment?</h2>
          <p style={{ color: '#94A3B8', marginBottom: '2rem', lineHeight: '1.6' }}>
            Verify the contents and condition of received goods to complete the chain of custody.
            Blockchain signature required.
          </p>
          <button
            className="btn-primary"
            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
            onClick={() => setIsWizardOpen(true)}
          >
            Start Receipt Wizard
          </button>
        </div>
      </div>

      <WizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Confirm Receipt (Trust Protocol)"
        steps={wizardSteps}
        onComplete={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
};

export default ConfirmReceipt;
