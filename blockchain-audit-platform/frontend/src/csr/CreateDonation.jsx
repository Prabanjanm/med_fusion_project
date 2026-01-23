import React, { useState } from 'react';
import { Upload, Send } from 'lucide-react';
import '../styles/FormStyles.css';

/**
 * CreateDonation Component
 * Allows CSR to create and submit new donation records
 * Includes donor info, resource type, quantity, and optional document upload
 */
const CreateDonation = () => {
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

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.donorName.trim()) newErrors.donorName = 'Donor name is required';
    if (!formData.donorOrgName.trim()) newErrors.donorOrgName = 'Organization name is required';
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.ngoName) newErrors.ngoName = 'Please select an NGO';

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFormData(prev => ({
      ...prev,
      supportingDocument: file,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Simulate API call
      console.log('Donation submitted:', formData);
      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
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
        setSubmitted(false);
      }, 3000);
    }
  };

  if (submitted) {
    return (
      <div className="form-container">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Donation Submitted Successfully!</h2>
          <p>Your donation has been recorded on the blockchain.</p>
          <p className="donation-ref">Reference: DON-{Math.random().toString(36).substring(7).toUpperCase()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Create New Donation</h1>
        <p>Submit donation details for healthcare resources</p>
      </div>

      <form onSubmit={handleSubmit} className="donation-form">
        <div className="form-section">
          <h3>Donor Information</h3>
          
          <div className="form-group">
            <label htmlFor="donorName">Donor Name *</label>
            <input
              type="text"
              id="donorName"
              name="donorName"
              value={formData.donorName}
              onChange={handleChange}
              placeholder="Enter donor name"
              className={errors.donorName ? 'input-error' : ''}
            />
            {errors.donorName && <span className="error-message">{errors.donorName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="donorOrgName">Organization Name *</label>
            <input
              type="text"
              id="donorOrgName"
              name="donorOrgName"
              value={formData.donorOrgName}
              onChange={handleChange}
              placeholder="Enter organization name"
              className={errors.donorOrgName ? 'input-error' : ''}
            />
            {errors.donorOrgName && <span className="error-message">{errors.donorOrgName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="donationDate">Donation Date</label>
            <input
              type="date"
              id="donationDate"
              name="donationDate"
              value={formData.donationDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Resource Details</h3>
          
          <div className="form-group">
            <label htmlFor="resourceType">Resource Type</label>
            <select
              id="resourceType"
              name="resourceType"
              value={formData.resourceType}
              onChange={handleChange}
            >
              {resourceOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                min="1"
                className={errors.quantity ? 'input-error' : ''}
              />
              {errors.quantity && <span className="error-message">{errors.quantity}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              >
                {unitOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Distribution Details</h3>
          
          <div className="form-group">
            <label htmlFor="ngoName">NGO *</label>
            <select
              id="ngoName"
              name="ngoName"
              value={formData.ngoName}
              onChange={handleChange}
              className={errors.ngoName ? 'input-error' : ''}
            >
              <option value="">Select an NGO</option>
              {ngoOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.ngoName && <span className="error-message">{errors.ngoName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose (Optional)</label>
            <textarea
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Describe the purpose of this donation"
              rows="4"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Supporting Document</h3>
          
          <div className="file-upload-group">
            <label htmlFor="supportingDocument" className="file-label">
              <Upload size={20} />
              <span>Upload supporting document (optional)</span>
            </label>
            <input
              type="file"
              id="supportingDocument"
              name="supportingDocument"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {formData.supportingDocument && (
              <p className="file-selected">✓ File selected: {formData.supportingDocument.name}</p>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            <Send size={18} />
            Submit Donation
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDonation;
