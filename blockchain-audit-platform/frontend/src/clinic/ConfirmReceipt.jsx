import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
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
      <div className="form-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Receipt Confirmed Successfully!</h2>
          <p>Your receipt confirmation has been recorded on the blockchain.</p>
          <p className="donation-ref">Receipt ID: RCPT-{Math.random().toString(36).substring(7).toUpperCase()}</p>
          <p className="blockchain-note">This serves as immutable proof of receipt.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Confirm Receipt of Donation</h1>
        <p>Provide proof of receipt for blockchain verification</p>
      </div>

      <form onSubmit={handleSubmit} className="receipt-form">
        <div className="form-section">
          <h3>Allocation Information</h3>
          
          <div className="form-group">
            <label htmlFor="allocationId">Allocation ID *</label>
            <select
              id="allocationId"
              name="allocationId"
              value={formData.allocationId}
              onChange={handleChange}
              className={errors.allocationId ? 'input-error' : ''}
            >
              <option value="">Select an allocation</option>
              {allocationOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.allocationId && <span className="error-message">{errors.allocationId}</span>}
          </div>
        </div>

        <div className="form-section">
          <h3>Receipt Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="receivedQuantity">Received Quantity *</label>
              <input
                type="number"
                id="receivedQuantity"
                name="receivedQuantity"
                value={formData.receivedQuantity}
                onChange={handleChange}
                placeholder="Enter quantity received"
                min="1"
                className={errors.receivedQuantity ? 'input-error' : ''}
              />
              {errors.receivedQuantity && (
                <span className="error-message">{errors.receivedQuantity}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="receivedDate">Receipt Date</label>
              <input
                type="date"
                id="receivedDate"
                name="receivedDate"
                value={formData.receivedDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="conditionStatus">Condition Status</label>
            <select
              id="conditionStatus"
              name="conditionStatus"
              value={formData.conditionStatus}
              onChange={handleChange}
            >
              {conditionOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Notes</h3>
          
          <div className="form-group">
            <label htmlFor="remarks">Remarks (Optional)</label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Add any specific observations or damage details"
              rows="4"
            />
          </div>
        </div>

        <div className="compliance-notice">
          <CheckCircle size={20} />
          <p>
            This receipt confirmation serves as immutable proof on the blockchain and completes
            the donation lifecycle tracking for audit and transparency purposes.
          </p>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            <Send size={18} />
            Confirm Receipt
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfirmReceipt;
