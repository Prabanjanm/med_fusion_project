import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Send, AlertCircle, CheckCircle, FileText, Search } from 'lucide-react';
import Layout from '../components/Layout';
import '../styles/DashboardLayout.css';

/**
 * STEP 3: CLINIC PRODUCT CATALOG & REQUEST
 * 
 * Clinics view ONLY verified products and submit requests with justification.
 * Donor identities are hidden unless explicitly permitted.
 */
const ClinicProductCatalog = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [requestSubmitted, setRequestSubmitted] = useState(false);

    const [requestForm, setRequestForm] = useState({
        requestedQuantity: '',
        justification: '',
        urgencyLevel: 'MEDIUM',
        supportingEvidence: ''
    });

    const [errors, setErrors] = useState({});

    // Mock approved products - only APPROVED_FOR_ALLOCATION visible to clinics
    const approvedProducts = [
        {
            id: 'PROD-1738234567892',
            product_name: 'Digital Thermometers',
            category: 'Diagnostic Equipment',
            quantity_available: 200,
            unit: 'units',
            expiry_date: '',
            availability_end: '2025-12-31',
            donor_visible: false // Identity hidden
        },
        {
            id: 'PROD-1738234567893',
            product_name: 'N95 Respirator Masks',
            category: 'PPE (Personal Protective Equipment)',
            quantity_available: 500,
            unit: 'boxes',
            expiry_date: '2026-12-31',
            availability_end: '2025-06-30',
            donor_visible: false
        },
        {
            id: 'PROD-1738234567894',
            product_name: 'Surgical Gloves (Sterile)',
            category: 'Surgical Supplies',
            quantity_available: 1000,
            unit: 'boxes',
            expiry_date: '2027-03-15',
            availability_end: '2025-08-31',
            donor_visible: false
        },
        {
            id: 'PROD-1738234567895',
            product_name: 'Blood Pressure Monitors',
            category: 'Diagnostic Equipment',
            quantity_available: 50,
            unit: 'units',
            expiry_date: '',
            availability_end: '2025-12-31',
            donor_visible: false
        },
        {
            id: 'PROD-1738234567896',
            product_name: 'Disposable Syringes (5ml)',
            category: 'Surgical Supplies',
            quantity_available: 2000,
            unit: 'units',
            expiry_date: '2026-06-30',
            availability_end: '2025-09-30',
            donor_visible: false
        }
    ];

    const categories = ['ALL', ...new Set(approvedProducts.map(p => p.category))];

    const filteredProducts = approvedProducts.filter(p => {
        const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleRequestChange = (e) => {
        const { name, value } = e.target;
        setRequestForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateRequest = () => {
        const newErrors = {};

        if (!requestForm.requestedQuantity || requestForm.requestedQuantity <= 0) {
            newErrors.requestedQuantity = 'Valid quantity is required';
        }
        if (requestForm.requestedQuantity > selectedProduct.quantity_available) {
            newErrors.requestedQuantity = `Cannot exceed available quantity (${selectedProduct.quantity_available})`;
        }
        if (!requestForm.justification.trim() || requestForm.justification.length < 50) {
            newErrors.justification = 'Detailed justification required (minimum 50 characters)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitRequest = () => {
        if (!validateRequest()) return;

        // Simulate API call
        setTimeout(() => {
            setRequestSubmitted(true);
            setSelectedProduct(null);
            setRequestForm({
                requestedQuantity: '',
                justification: '',
                urgencyLevel: 'MEDIUM',
                supportingEvidence: ''
            });
        }, 1000);
    };

    if (requestSubmitted) {
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
                            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '2rem',
                            boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)'
                        }}
                    >
                        <Send size={48} color="#fff" />
                    </motion.div>

                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#fff' }}>
                        Request Submitted
                    </h1>

                    <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '600px', marginBottom: '2rem', lineHeight: '1.6' }}>
                        Your product request has been submitted to the NGO for validation.
                        You'll be notified once it's reviewed.
                    </p>

                    <div style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        maxWidth: '500px',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <AlertCircle size={24} color="#3b82f6" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                            <div style={{ textAlign: 'left' }}>
                                <h3 style={{ color: '#3b82f6', fontSize: '1rem', marginBottom: '0.5rem' }}>What happens next?</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    The NGO will validate your request against medical needs, quantity reasonableness, and product availability.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={() => setRequestSubmitted(false)}
                    >
                        Request More Products
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title">Product Catalog</h1>
                    <p className="page-subtitle">Browse verified products and submit requests</p>
                </div>
            </div>

            {/* Info Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}
            >
                <AlertCircle size={24} color="#3b82f6" />
                <div>
                    <p style={{ color: '#60a5fa', fontWeight: '600', marginBottom: '0.25rem' }}>
                        Verified Products Only
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        All products shown have been verified by NGO partners. Donor identities are protected.
                    </p>
                </div>
            </motion.div>

            {/* Search and Filter */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            style={{
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: categoryFilter === cat ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                                background: categoryFilter === cat ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                color: categoryFilter === cat ? '#3b82f6' : '#94a3b8',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
                    <Package size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p style={{ fontSize: '1.1rem' }}>No products found</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Try adjusting your search or filters</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredProducts.map(product => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)' }}
                            style={{
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onClick={() => setSelectedProduct(product)}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem'
                            }}>
                                <Package size={24} color="#fff" />
                            </div>

                            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                                {product.product_name}
                            </h3>

                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                {product.category}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Available</p>
                                    <p style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: '700' }}>
                                        {product.quantity_available} {product.unit}
                                    </p>
                                </div>
                                {product.expiry_date && (
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ color: '#64748b', fontSize: '0.75rem' }}>Expires</p>
                                        <p style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>
                                            {new Date(product.expiry_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedProduct(product);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #3b82f6',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    color: '#3b82f6',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Request Product
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Request Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '2rem'
                        }}
                        onClick={() => setSelectedProduct(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: '#0f172a',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                maxWidth: '600px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflow: 'auto',
                                padding: '2rem'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Request Product</h2>
                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#94a3b8',
                                        fontSize: '1.5rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Product Info */}
                            <div style={{
                                background: 'rgba(59, 130, 246, 0.05)',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                borderRadius: '12px',
                                padding: '1rem',
                                marginBottom: '2rem'
                            }}>
                                <h3 style={{ color: '#3b82f6', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                                    {selectedProduct.product_name}
                                </h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                    Available: <strong style={{ color: '#10b981' }}>{selectedProduct.quantity_available} {selectedProduct.unit}</strong>
                                </p>
                            </div>

                            {/* Request Form */}
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        Requested Quantity <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="requestedQuantity"
                                        value={requestForm.requestedQuantity}
                                        onChange={handleRequestChange}
                                        min="1"
                                        max={selectedProduct.quantity_available}
                                        placeholder={`Max: ${selectedProduct.quantity_available}`}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: errors.requestedQuantity ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    {errors.requestedQuantity && (
                                        <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                                            {errors.requestedQuantity}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        Urgency Level
                                    </label>
                                    <select
                                        name="urgencyLevel"
                                        value={requestForm.urgencyLevel}
                                        onChange={handleRequestChange}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        Medical Justification <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <textarea
                                        name="justification"
                                        value={requestForm.justification}
                                        onChange={handleRequestChange}
                                        placeholder="Explain the medical need, patient load, and why this quantity is required (minimum 50 characters)..."
                                        rows="5"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: errors.justification ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '0.9rem',
                                            resize: 'vertical'
                                        }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                                        {errors.justification && (
                                            <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>
                                                {errors.justification}
                                            </span>
                                        )}
                                        <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: 'auto' }}>
                                            {requestForm.justification.length} / 50 min
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        Supporting Evidence (Optional)
                                    </label>
                                    <textarea
                                        name="supportingEvidence"
                                        value={requestForm.supportingEvidence}
                                        onChange={handleRequestChange}
                                        placeholder="Additional documentation, patient statistics, or references..."
                                        rows="3"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            fontSize: '0.9rem',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmitRequest}
                                style={{
                                    width: '100%',
                                    marginTop: '2rem',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Send size={18} />
                                Submit Request for Validation
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Layout>
    );
};

export default ClinicProductCatalog;
