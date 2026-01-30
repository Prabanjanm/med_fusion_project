import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, XCircle, AlertTriangle, FileText, Package, Calendar, Search } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import '../styles/DashboardLayout.css';

/**
 * STEP 2: NGO VERIFICATION DASHBOARD
 * 
 * NGOs verify product declarations from CSR organizations.
 * Only verified products become available for clinic requests.
 */
const ProductVerification = () => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [filter, setFilter] = useState('SUBMITTED'); // SUBMITTED, APPROVED, REJECTED

    // Mock data - replace with API call
    const [products, setProducts] = useState([
        {
            id: 'PROD-1738234567890',
            company_name: 'MedTech Solutions Pvt Ltd',
            product_name: 'N95 Respirator Masks',
            category: 'PPE (Personal Protective Equipment)',
            quantity_available: 500,
            unit: 'boxes',
            invoice_number: 'INV-2025-MT-1234',
            batch_id: 'BATCH-N95-2025-A',
            certification_ref: 'FDA-510K-2024',
            expiry_date: '2026-12-31',
            availability_start: '2025-02-01',
            availability_end: '2025-06-30',
            status: 'SUBMITTED',
            created_at: '2025-01-29T10:30:00Z'
        },
        {
            id: 'PROD-1738234567891',
            company_name: 'HealthCare Innovations Inc',
            product_name: 'Surgical Gloves (Sterile)',
            category: 'Surgical Supplies',
            quantity_available: 1000,
            unit: 'boxes',
            invoice_number: 'INV-2025-HCI-5678',
            batch_id: 'BATCH-SG-2025-B',
            certification_ref: 'ISO-13485',
            expiry_date: '2027-03-15',
            availability_start: '2025-02-01',
            availability_end: '2025-08-31',
            status: 'SUBMITTED',
            created_at: '2025-01-29T14:15:00Z'
        },
        {
            id: 'PROD-1738234567892',
            company_name: 'Global Pharma Corp',
            product_name: 'Digital Thermometers',
            category: 'Diagnostic Equipment',
            quantity_available: 200,
            unit: 'units',
            invoice_number: 'INV-2025-GPC-9012',
            batch_id: '',
            certification_ref: 'CE-MARK-2024',
            expiry_date: '',
            availability_start: '2025-02-01',
            availability_end: '2025-12-31',
            status: 'APPROVED_FOR_ALLOCATION',
            created_at: '2025-01-28T09:00:00Z',
            verified_at: '2025-01-29T11:00:00Z',
            verification_notes: 'All documentation verified. Product meets quality standards.'
        }
    ]);

    const handleVerify = (productId, decision) => {
        if (!verificationNotes.trim() && decision === 'REJECTED') {
            alert('Please provide verification notes for rejection');
            return;
        }

        setProducts(prev => prev.map(p =>
            p.id === productId
                ? {
                    ...p,
                    status: decision === 'approve' ? 'APPROVED_FOR_ALLOCATION' : 'REJECTED',
                    verified_at: new Date().toISOString(),
                    verification_notes: verificationNotes || 'Verified successfully'
                }
                : p
        ));

        setSelectedProduct(null);
        setVerificationNotes('');
    };

    const filteredProducts = products.filter(p => {
        if (filter === 'SUBMITTED') return p.status === 'SUBMITTED';
        if (filter === 'APPROVED') return p.status === 'APPROVED_FOR_ALLOCATION';
        if (filter === 'REJECTED') return p.status === 'REJECTED';
        return true;
    });

    const stats = {
        pending: products.filter(p => p.status === 'SUBMITTED').length,
        approved: products.filter(p => p.status === 'APPROVED_FOR_ALLOCATION').length,
        rejected: products.filter(p => p.status === 'REJECTED').length
    };

    return (
        <Layout>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title">Product Verification</h1>
                    <p className="page-subtitle">Review and verify CSR product declarations</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <motion.div
                    whileHover={{ y: -2 }}
                    style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        cursor: 'pointer'
                    }}
                    onClick={() => setFilter('SUBMITTED')}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Pending Review</p>
                            <p style={{ color: '#fff', fontSize: '2rem', fontWeight: '700' }}>{stats.pending}</p>
                        </div>
                        <AlertTriangle size={32} color="#f59e0b" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -2 }}
                    style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        cursor: 'pointer'
                    }}
                    onClick={() => setFilter('APPROVED')}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Approved</p>
                            <p style={{ color: '#fff', fontSize: '2rem', fontWeight: '700' }}>{stats.approved}</p>
                        </div>
                        <CheckCircle size={32} color="#10b981" />
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -2 }}
                    style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        cursor: 'pointer'
                    }}
                    onClick={() => setFilter('REJECTED')}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Rejected</p>
                            <p style={{ color: '#fff', fontSize: '2rem', fontWeight: '700' }}>{stats.rejected}</p>
                        </div>
                        <XCircle size={32} color="#ef4444" />
                    </div>
                </motion.div>
            </div>

            {/* Product List */}
            <div className="table-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="table-header-title">
                        {filter === 'SUBMITTED' && 'Pending Verification'}
                        {filter === 'APPROVED' && 'Approved Products'}
                        {filter === 'REJECTED' && 'Rejected Products'}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['SUBMITTED', 'APPROVED', 'REJECTED'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '8px',
                                    border: filter === f ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                                    background: filter === f ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    color: filter === f ? '#3b82f6' : '#94a3b8',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {f.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>No products in this category</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {filteredProducts.map(product => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: 'rgba(15, 23, 42, 0.4)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    cursor: product.status === 'SUBMITTED' ? 'pointer' : 'default'
                                }}
                                onClick={() => product.status === 'SUBMITTED' && setSelectedProduct(product)}
                                whileHover={product.status === 'SUBMITTED' ? { borderColor: 'rgba(59, 130, 246, 0.3)' } : {}}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                                            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>
                                                {product.product_name}
                                            </h3>
                                            <StatusBadge status={product.status} />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                            <div>
                                                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Company</p>
                                                <p style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{product.company_name}</p>
                                            </div>
                                            <div>
                                                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Category</p>
                                                <p style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{product.category}</p>
                                            </div>
                                            <div>
                                                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Quantity</p>
                                                <p style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{product.quantity_available} {product.unit}</p>
                                            </div>
                                            <div>
                                                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Invoice</p>
                                                <p style={{ color: '#e2e8f0', fontSize: '0.9rem', fontFamily: 'monospace' }}>{product.invoice_number}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {product.status === 'SUBMITTED' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProduct(product);
                                            }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                border: '1px solid #3b82f6',
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                color: '#3b82f6',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            Review →
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Verification Modal */}
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
                                maxWidth: '700px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflow: 'auto',
                                padding: '2rem'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Verify Product Declaration</h2>
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

                            {/* Product Details */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ color: '#3b82f6', fontSize: '1.2rem', marginBottom: '1rem' }}>
                                    {selectedProduct.product_name}
                                </h3>

                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <DetailRow label="Company" value={selectedProduct.company_name} />
                                    <DetailRow label="Category" value={selectedProduct.category} />
                                    <DetailRow label="Quantity" value={`${selectedProduct.quantity_available} ${selectedProduct.unit}`} />
                                    <DetailRow label="Invoice Number" value={selectedProduct.invoice_number} mono />
                                    {selectedProduct.batch_id && <DetailRow label="Batch ID" value={selectedProduct.batch_id} mono />}
                                    {selectedProduct.certification_ref && <DetailRow label="Certification" value={selectedProduct.certification_ref} mono />}
                                    {selectedProduct.expiry_date && <DetailRow label="Expiry Date" value={selectedProduct.expiry_date} />}
                                    <DetailRow label="Available From" value={selectedProduct.availability_start} />
                                    <DetailRow label="Available Until" value={selectedProduct.availability_end} />
                                </div>
                            </div>

                            {/* Verification Notes */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    Verification Notes
                                </label>
                                <textarea
                                    value={verificationNotes}
                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                    placeholder="Add notes about authenticity, compliance, or any concerns..."
                                    rows="4"
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

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => handleVerify(selectedProduct.id, 'reject')}
                                    style={{
                                        flex: 1,
                                        padding: '0.875rem',
                                        borderRadius: '8px',
                                        border: '1px solid #ef4444',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <XCircle size={18} />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleVerify(selectedProduct.id, 'approve')}
                                    style={{
                                        flex: 1,
                                        padding: '0.875rem',
                                        borderRadius: '8px',
                                        border: '1px solid #10b981',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        color: '#10b981',
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <CheckCircle size={18} />
                                    Approve for Allocation
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Layout>
    );
};

const DetailRow = ({ label, value, mono = false }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{label}</span>
        <span style={{ color: '#e2e8f0', fontSize: '0.9rem', fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</span>
    </div>
);

export default ProductVerification;
