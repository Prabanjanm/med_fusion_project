import React, { useState } from 'react';
import { Send } from 'lucide-react';
import Layout from '../components/Layout';
import '../styles/FormStyles.css';

/**
 * AllocateToClinic Component
 * NGO form to allocate donations to specific clinics
 * Includes allocation tracking and expected delivery dates
 */
const AllocateToClinic = () => {
  const [formData, setFormData] = useState({
    donationId: '',
    clinicName: '',
    allocatedQuantity: '',
    expectedDeliveryDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.donationId) newErrors.donationId = 'Donation is required';
    if (!formData.clinicName) newErrors.clinicName = 'Clinic is required';
    if (!formData.allocatedQuantity || formData.allocatedQuantity <= 0) {
      newErrors.allocatedQuantity = 'Valid quantity is required';
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
      console.log('Allocation submitted:', formData);
      setSubmitted(true);

      setTimeout(() => {
        setFormData({
          donationId: '',
          clinicName: '',
          allocatedQuantity: '',
          expectedDeliveryDate: new Date().toISOString().split('T')[0],
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
            <h2 className="text-cyan">Allocation Recorded Successfully!</h2>
            <p className="text-muted">The donation allocation has been recorded on the blockchain.</p>
            <p className="text-muted" style={{ marginTop: '1rem', fontFamily: 'monospace' }}>
              Allocation ID: ALLOC-{Math.random().toString(36).substring(7).toUpperCase()}
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
          <h1 className="page-title">Allocate to Clinic</h1>
          <p className="page-subtitle">Distribute donations to specific clinics with tracking</p>
        </div>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit} className="allocation-form">
          <div className="form-section">
            <h3 className="form-section-title">Allocation Details</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="donationId">Select Donation *</label>
              <select
                id="donationId"
                name="donationId"
                value={formData.donationId}
                onChange={handleChange}
                className={`form-select ${errors.donationId ? 'input-error' : ''}`}
              >
                <option value="">Choose a donation</option>
                {donationOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.donationId && <span className="form-error">{errors.donationId}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="clinicName">Clinic *</label>
              <select
                id="clinicName"
                name="clinicName"
                value={formData.clinicName}
                onChange={handleChange}
                className={`form-select ${errors.clinicName ? 'input-error' : ''}`}
              >
                <option value="">Select a clinic</option>
                {clinicOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.clinicName && <span className="form-error">{errors.clinicName}</span>}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="allocatedQuantity">Allocated Quantity *</label>
                <input
                  type="number"
                  id="allocatedQuantity"
                  name="allocatedQuantity"
                  value={formData.allocatedQuantity}
                  onChange={handleChange}
                  placeholder="Enter quantity to allocate"
                  min="1"
                  className={`form-input ${errors.allocatedQuantity ? 'input-error' : ''}`}
                />
                {errors.allocatedQuantity && (
                  <span className="form-error">{errors.allocatedQuantity}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="expectedDeliveryDate">Expected Delivery Date</label>
                <input
                  type="date"
                  id="expectedDeliveryDate"
                  name="expectedDeliveryDate"
                  value={formData.expectedDeliveryDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Additional Information</h3>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="remarks">Remarks (Optional)</label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Add any special instructions or notes"
                rows="4"
                className="form-textarea"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              <Send size={18} />
              Confirm Allocation
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AllocateToClinic;
