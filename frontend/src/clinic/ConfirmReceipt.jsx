import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';
import '../styles/FormStyles.css';

/**
 * ConfirmReceipt Component
 * Clinic form to confirm receipt of allocated donations
 * Acts as proof of receipt on the blockchain
 */
const ConfirmReceipt = () => {
  const [formData, setFormData] = useState({
    allocationId: '',
    receivedQuantity: '',
    receivedDate: new Date().toISOString().split('T')[0],
    conditionStatus: 'good',
    remarks: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const allocationOptions = [
    { value: 'ALLOC-2025-001', label: 'ALLOC-2025-001 - PPE Kits' },
    { value: 'ALLOC-2025-002', label: 'ALLOC-2025-002 - Medical Gloves' },
    { value: 'ALLOC-2025-003', label: 'ALLOC-2025-003 - Syringes' },
  ];

  const conditionOptions = [
    { value: 'good', label: 'Good Condition' },
    { value: 'damaged', label: 'Partially Damaged' },
    { value: 'partial', label: 'Partial Receipt' },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.allocationId) newErrors.allocationId = 'Allocation ID is required';
    if (!formData.receivedQuantity || formData.receivedQuantity <= 0) {
      newErrors.receivedQuantity = 'Valid quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log('Receipt confirmation submitted:', formData);
      setSubmitted(true);

      setTimeout(() => {
        setFormData({
          allocationId: '',
          receivedQuantity: '',
          receivedDate: new Date().toISOString().split('T')[0],
          conditionStatus: 'good',
          remarks: '',
        });
        setSubmitted(false);
      }, 3000);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="form-card">
          <div className="form-success" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', color: '#00ff88', marginBottom: '1rem' }}>✓</div>
            <h2 className="text-cyan">Receipt Confirmed Successfully!</h2>
            <p className="text-muted">Your receipt confirmation has been recorded on the blockchain.</p>
            <p className="text-muted" style={{ marginTop: '1rem', fontFamily: 'monospace' }}>
              Receipt ID: RCPT-{Math.random().toString(36).substring(7).toUpperCase()}
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
              Immutable Proof of Receipt Generated
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Confirm Receipt of Donation</h1>
          <p className="page-subtitle">Provide proof of receipt for blockchain verification</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="receipt-form">
          <div className="form-section">
            <h3 className="form-section-title">Allocation Information</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="allocationId">Allocation ID *</label>
              <select
                id="allocationId"
                name="allocationId"
                value={formData.allocationId}
                onChange={handleChange}
                className={`form-select ${errors.allocationId ? 'input-error' : ''}`}
              >
                <option value="">Select an allocation</option>
                {allocationOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.allocationId && <span className="form-error">{errors.allocationId}</span>}
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Receipt Details</h3>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="receivedQuantity">Received Quantity *</label>
                <input
                  type="number"
                  id="receivedQuantity"
                  name="receivedQuantity"
                  value={formData.receivedQuantity}
                  onChange={handleChange}
                  placeholder="Enter quantity received"
                  min="1"
                  className={`form-input ${errors.receivedQuantity ? 'input-error' : ''}`}
                />
                {errors.receivedQuantity && (
                  <span className="form-error">{errors.receivedQuantity}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="receivedDate">Receipt Date</label>
                <input
                  type="date"
                  id="receivedDate"
                  name="receivedDate"
                  value={formData.receivedDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label" htmlFor="conditionStatus">Condition Status</label>
                <select
                  id="conditionStatus"
                  name="conditionStatus"
                  value={formData.conditionStatus}
                  onChange={handleChange}
                  className="form-select"
                >
                  {conditionOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Additional Notes</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="remarks">Remarks (Optional)</label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Add any specific observations or damage details"
                rows="4"
                className="form-textarea"
              />
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 229, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '2rem'
          }}>
            <CheckCircle size={24} color="var(--accent-cyan)" />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              This receipt confirmation serves as immutable proof on the blockchain and completes
              the donation lifecycle tracking for audit and transparency purposes.
            </p>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              <Send size={18} />
              Confirm Receipt
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ConfirmReceipt;
