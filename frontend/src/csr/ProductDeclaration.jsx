import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Calendar, FileText, Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import '../styles/FormStyles.css';

/**
 * STEP 1: CSR PRODUCT DECLARATION
 * 
 * CSR organizations submit products for donation.
 * All submissions are immutable after creation.
 */
const ProductDeclaration = () => {
    const navigate = useNavigate();
    const [submitted, setSubmitted] = useState(false);
    const [submittedId, setSubmittedId] = useState(null);

    const [formData, setFormData] = useState({
        productName: '',
        category: '',
        quantityAvailable: '',
        unit: 'boxes',
        expiryDate: '',
        batchId: '',
        invoiceNumber: '',
        certificationRef: '',
        availabilityStart: new Date().toISOString().split('T')[0],
        availabilityEnd: '',
    });

    const [errors, setErrors] = useState({});

    const categories = [
        'Medical Equipment',
        'PPE (Personal Protective Equipment)',
        'Medicines & Pharmaceuticals',
        'Surgical Supplies',
        'Diagnostic Equipment',
        'Emergency Supplies',
        'Other Medical Supplies'
    ];

    const units = ['boxes', 'units', 'kg', 'liters', 'pieces', 'sets'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.quantityAvailable || formData.quantityAvailable <= 0) {
            newErrors.quantityAvailable = 'Valid quantity is required';
        }
        if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = 'Invoice number is required for authenticity';
        if (!formData.availabilityEnd) newErrors.availabilityEnd = 'Availability end date is required';

        // Validate date range
        if (formData.availabilityEnd && formData.availabilityStart > formData.availabilityEnd) {
            newErrors.availabilityEnd = 'End date must be after start date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        // Simulate API call
        setTimeout(() => {
            const mockId = `PROD-${Date.now()}`;
            setSubmittedId(mockId);
            setSubmitted(true);
        }, 1000);
    };

    if (submitted) {
        return (
            <Layout>
                <div style={{
                    minHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '2rem'
                }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.6 }}
                        style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '2rem',
                            boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)'
                        }}
                    >
                        <Lock size={48} color="#fff" />
                    </motion.div>

                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#fff' }}>
                        Product Declaration Locked
                    </h1>

                    <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '600px', marginBottom: '2rem', lineHeight: '1.6' }}>
                        Your product declaration has been submitted and is now <strong style={{ color: '#10b981' }}>immutable</strong>.
                        It will be reviewed by our NGO partners for verification.
                    </p>

                    <div style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '12px',
                        padding: '1.5rem 2rem',
                        marginBottom: '3rem',
                        fontFamily: 'monospace'
                    }}>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Declaration ID</p>
                        <p style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: '600' }}>{submittedId}</p>
                    </div>

                    <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        maxWidth: '500px',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <Shield size={24} color="#3b82f6" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                            <div style={{ textAlign: 'left' }}>
                                <h3 style={{ color: '#3b82f6', fontSize: '1rem', marginBottom: '0.5rem' }}>What happens next?</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    NGO partners will verify product authenticity, quantities, and compliance.
                                    Once approved, clinics can request allocation.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className="btn-ghost"
                            onClick={() => navigate('/csr/dashboard')}
                            style={{ padding: '0.875rem 1.5rem' }}
                        >
                            Back to Dashboard
                        </button>
                        <button
                            className="btn-primary"
                            onClick={() => {
                                setSubmitted(false);
                                setFormData({
                                    productName: '',
                                    category: '',
                                    quantityAvailable: '',
                                    unit: 'boxes',
                                    expiryDate: '',
                                    batchId: '',
                                    invoiceNumber: '',
                                    certificationRef: '',
                                    availabilityStart: new Date().toISOString().split('T')[0],
                                    availabilityEnd: '',
                                });
                            }}
                            style={{ padding: '0.875rem 1.5rem' }}
                        >
                            Declare Another Product
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="page-header" style={{ marginBottom: '3rem' }}>
                <div>
                    <h1 className="page-title">Product Declaration</h1>
                    <p className="page-subtitle">Submit products for donation verification</p>
                </div>
            </div>

            {/* Warning Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}
            >
                <AlertCircle size={24} color="#f59e0b" />
                <div>
                    <p style={{ color: '#fbbf24', fontWeight: '600', marginBottom: '0.25rem' }}>
                        Immutable Declaration
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        Once submitted, this declaration cannot be edited or deleted. Ensure all information is accurate.
                    </p>
                </div>
            </motion.div>

            <form onSubmit={handleSubmit} style={{ maxWidth: '900px' }}>
                {/* Product Information */}
                <div className="form-section">
                    <div className="section-header">
                        <Package size={20} />
                        <h3>Product Information</h3>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">
                                Product Name <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="productName"
                                value={formData.productName}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="e.g., N95 Respirator Masks"
                            />
                            {errors.productName && <span className="error-text">{errors.productName}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Category <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {errors.category && <span className="error-text">{errors.category}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Quantity Available <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="number"
                                name="quantityAvailable"
                                value={formData.quantityAvailable}
                                onChange={handleChange}
                                className="form-input"
                                min="1"
                                placeholder="Enter quantity"
                            />
                            {errors.quantityAvailable && <span className="error-text">{errors.quantityAvailable}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Unit</label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                className="form-select"
                            >
                                {units.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Authenticity & Compliance */}
                <div className="form-section">
                    <div className="section-header">
                        <FileText size={20} />
                        <h3>Proof of Authenticity</h3>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">
                                Invoice Number <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="invoiceNumber"
                                value={formData.invoiceNumber}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="INV-2025-XXXX"
                            />
                            {errors.invoiceNumber && <span className="error-text">{errors.invoiceNumber}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Batch ID (Optional)</label>
                            <input
                                type="text"
                                name="batchId"
                                value={formData.batchId}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="BATCH-XXXX"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Certification Reference (Optional)</label>
                            <input
                                type="text"
                                name="certificationRef"
                                value={formData.certificationRef}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="CERT-XXXX or FDA/ISO ref"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Expiry Date (if applicable)</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                    </div>
                </div>

                {/* Availability Window */}
                <div className="form-section">
                    <div className="section-header">
                        <Calendar size={20} />
                        <h3>Availability Window</h3>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Available From</label>
                            <input
                                type="date"
                                name="availabilityStart"
                                value={formData.availabilityStart}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Available Until <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="date"
                                name="availabilityEnd"
                                value={formData.availabilityEnd}
                                onChange={handleChange}
                                className="form-input"
                            />
                            {errors.availabilityEnd && <span className="error-text">{errors.availabilityEnd}</span>}
                        </div>
                    </div>
                </div>

                {/* Submit Actions */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                    <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => navigate('/csr/dashboard')}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Lock size={18} />
                        Submit Declaration (Immutable)
                    </button>
                </div>
            </form>
        </Layout>
    );
};

export default ProductDeclaration;
