import React, { useState } from 'react';
import { Send } from 'lucide-react';
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
      <div className="form-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Allocation Recorded Successfully!</h2>
          <p>The donation allocation has been recorded on the blockchain.</p>
          <p className="donation-ref">Allocation ID: ALLOC-{Math.random().toString(36).substring(7).toUpperCase()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Allocate to Clinic</h1>
        <p>Distribute donations to specific clinics with tracking</p>
      </div>

      <form onSubmit={handleSubmit} className="allocation-form">
        <div className="form-section">
          <h3>Allocation Details</h3>
          
          <div className="form-group">
            <label htmlFor="donationId">Select Donation *</label>
            <select
              id="donationId"
              name="donationId"
              value={formData.donationId}
              onChange={handleChange}
              className={errors.donationId ? 'input-error' : ''}
            >
              <option value="">Choose a donation</option>
              {donationOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.donationId && <span className="error-message">{errors.donationId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="clinicName">Clinic *</label>
            <select
              id="clinicName"
              name="clinicName"
              value={formData.clinicName}
              onChange={handleChange}
              className={errors.clinicName ? 'input-error' : ''}
            >
              <option value="">Select a clinic</option>
              {clinicOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.clinicName && <span className="error-message">{errors.clinicName}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="allocatedQuantity">Allocated Quantity *</label>
              <input
                type="number"
                id="allocatedQuantity"
                name="allocatedQuantity"
                value={formData.allocatedQuantity}
                onChange={handleChange}
                placeholder="Enter quantity to allocate"
                min="1"
                className={errors.allocatedQuantity ? 'input-error' : ''}
              />
              {errors.allocatedQuantity && (
                <span className="error-message">{errors.allocatedQuantity}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="expectedDeliveryDate">Expected Delivery Date</label>
              <input
                type="date"
                id="expectedDeliveryDate"
                name="expectedDeliveryDate"
                value={formData.expectedDeliveryDate}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>
          
          <div className="form-group">
            <label htmlFor="remarks">Remarks (Optional)</label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Add any special instructions or notes"
              rows="4"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            <Send size={18} />
            Confirm Allocation
          </button>
        </div>
      </form>
    </div>
  );
};

export default AllocateToClinic;
