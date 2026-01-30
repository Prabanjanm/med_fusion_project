import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Edit3, AlertTriangle, FileText, Activity } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import '../styles/DashboardLayout.css';

/**
 * STEP 4: NGO VALIDATION OF CLINIC REQUESTS
 * 
 * NGO validates clinic requests for reasonableness, legitimacy, and availability.
 * Can approve, reject, or adjust requested quantities.
 */
const RequestValidation = () => {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [validationNotes, setValidationNotes] = useState('');
    const [adjustedQuantity, setAdjustedQuantity] = useState('');
    const [filter, setFilter] = useState('PENDING_REVIEW');

    // Mock clinic requests
    const [requests, setRequests] = useState([
        {
            id: 'REQ-1738234567890',
            clinic_name: 'City General Hospital',
            clinic_id: 'CLINIC-001',
            product_name: 'N95 Respirator Masks',
            product_id: 'PROD-1738234567893',
            category: 'PPE (Personal Protective Equipment)',
            requested_quantity: 100,
            available_quantity: 500,
            unit: 'boxes',
            urgency_level: 'HIGH',
            justification: 'We are experiencing a surge in respiratory illness cases. Our current stock of N95 masks is critically low with only 2 days of supply remaining. We serve approximately 500 patients daily in our emergency department and require immediate replenishment to maintain safety protocols for our healthcare workers.',
            supporting_evidence: 'Patient admission records show 40% increase in respiratory cases over the past week. Current inventory: 15 boxes remaining.',
            status: 'PENDING_REVIEW',
            created_at: '2025-01-30T08:00:00Z'
        },
        {
            id: 'REQ-1738234567891',
            clinic_name: 'Rural Health Center',
            clinic_id: 'CLINIC-002',
            product_name: 'Digital Thermometers',
            product_id: 'PROD-1738234567892',
            category: 'Diagnostic Equipment',
            requested_quantity: 50,
            available_quantity: 200,
            unit: 'units',
            urgency_level: 'MEDIUM',
            justification: 'Our facility serves a rural population of approximately 5,000 residents. We currently have only 5 functional thermometers for our 3 examination rooms and mobile health unit. This creates bottlenecks in patient screening and increases wait times significantly.',
            supporting_evidence: 'Monthly patient volume: 800-1000. Current equipment age: 8+ years with frequent malfunctions.',
            status: 'PENDING_REVIEW',
            created_at: '2025-01-30T09:30:00Z'
        },
        {
            id: 'REQ-1738234567892',
            clinic_name: 'Community Clinic West',
            clinic_id: 'CLINIC-003',
            product_name: 'Surgical Gloves (Sterile)',
            product_id: 'PROD-1738234567894',
            category: 'Surgical Supplies',
            requested_quantity: 200,
            available_quantity: 1000,
            unit: 'boxes',
            urgency_level: 'MEDIUM',
            justification: 'We perform approximately 150 minor surgical procedures monthly. Our glove consumption rate is 40 boxes per month. Requesting 5-month supply to ensure uninterrupted operations.',
            supporting_evidence: '',
            status: 'APPROVED',
            approved_quantity: 200,
            validated_at: '2025-01-30T10:00:00Z',
            validation_notes: 'Request validated. Quantity reasonable based on procedure volume and consumption rate.'
        }
    ]);

    const handleValidate = (requestId, decision) => {
        if (!validationNotes.trim() && decision === 'reject') {
            alert('Please provide validation notes for rejection');
            return;
        }

        const finalQuantity = decision === 'adjust' && adjustedQuantity
            ? parseInt(adjustedQuantity)
            : selectedRequest.requested_quantity;

        setRequests(prev => prev.map(r =>
            r.id === requestId
                ? {
                    ...r,
                    status: decision === 'reject' ? 'REJECTED' : 'APPROVED',
                    approved_quantity: finalQuantity,
                    validated_at: new Date().toISOString(),
                    validation_notes: validationNotes || 'Request approved'
                }
                : r
        ));

        setSelectedRequest(null);
        setValidationNotes('');
        setAdjustedQuantity('');
    };

    const filteredRequests = requests.filter(r => {
        if (filter === 'PENDING_REVIEW') return r.status === 'PENDING_REVIEW';
        if (filter === 'APPROVED') return r.status === 'APPROVED';
        if (filter === 'REJECTED') return r.status === 'REJECTED';
        return true;
    });

    const stats = {
        pending: requests.filter(r => r.status === 'PENDING_REVIEW').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
        rejected: requests.filter(r => r.status === 'REJECTED').length
    };

    const getUrgencyColor = (level) => {
        switch (level) {
            case 'CRITICAL': return '#ef4444';
            case 'HIGH': return '#f59e0b';
            case 'MEDIUM': return '#3b82f6';
            case 'LOW': return '#64748b';
            default: return '#64748b';
        }
    };

    return (
        <Layout>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title">Request Validation</h1>
                    <p className="page-subtitle">Review and validate clinic product requests</p>
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
                    onClick={() => setFilter('PENDING_REVIEW')}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Pending Validation</p>
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

            {/* Request List */}
            <div className="table-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 className="table-header-title">
                        {filter === 'PENDING_REVIEW' && 'Pending Requests'}
                        {filter === 'APPROVED' && 'Approved Requests'}
                        {filter === 'REJECTED' && 'Rejected Requests'}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['PENDING_REVIEW', 'APPROVED', 'REJECTED'].map(f => (
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

                {filteredRequests.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                        <Activity size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>No requests in this category</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {filteredRequests.map(request => (
                            <motion.div
                                key={request.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    background: 'rgba(15, 23, 42, 0.4)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '12px',
                                    padding: '1.5rem'
                                }}
                            >
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>
                                                {request.product_name}
                                            </h3>
                                            <StatusBadge status={request.status} />
                                            <div style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '99px',
                                                background: `${getUrgencyColor(request.urgency_level)}20`,
                                                border: `1px solid ${getUrgencyColor(request.urgency_level)}40`,
                                                color: getUrgencyColor(request.urgency_level),
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                {request.urgency_level}
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                            <div>
                                                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Clinic</p>
                                                <p style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>{request.clinic_name}</p>
                                            </div>
                                            <div>
                                                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Requested</p>
                                                <p style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: '600' }}>
                                                    {request.requested_quantity} {request.unit}
                                                </p>
                                            </div>
                                            <div>
                                                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Available</p>
                                                <p style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600' }}>
                                                    {request.available_quantity} {request.unit}
                                                </p>
                                            </div>
                                            {request.approved_quantity && (
                                                <div>
                                                    <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Approved</p>
                                                    <p style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '600' }}>
                                                        {request.approved_quantity} {request.unit}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div style={{
                                            background: 'rgba(255,255,255,0.02)',
                                            borderLeft: '3px solid #3b82f6',
                                            padding: '1rem',
                                            borderRadius: '4px',
                                            marginTop: '1rem'
                                        }}>
                                            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Justification</p>
                                            <p style={{ color: '#e2e8f0', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                                {request.justification}
                                            </p>
                                            {request.supporting_evidence && (
                                                <>
                                                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                                                        Supporting Evidence
                                                    </p>
                                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                                        {request.supporting_evidence}
                                                    </p>
                                                </>
                                            )}
                                        </div>

                                        {request.validation_notes && (
                                            <div style={{
                                                background: 'rgba(16, 185, 129, 0.05)',
                                                borderLeft: '3px solid #10b981',
                                                padding: '1rem',
                                                borderRadius: '4px',
                                                marginTop: '1rem'
                                            }}>
                                                <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Validation Notes</p>
                                                <p style={{ color: '#10b981', fontSize: '0.9rem' }}>{request.validation_notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {request.status === 'PENDING_REVIEW' && (
                                        <button
                                            onClick={() => setSelectedRequest(request)}
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
                                            Validate →
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Validation Modal */}
            <AnimatePresence>
                {selectedRequest && (
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
                        onClick={() => setSelectedRequest(null)}
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
                                <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>Validate Request</h2>
                                <button
                                    onClick={() => setSelectedRequest(null)}
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

                            {/* Request Summary */}
                            <div style={{
                                background: 'rgba(59, 130, 246, 0.05)',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                marginBottom: '2rem'
                            }}>
                                <h3 style={{ color: '#3b82f6', fontSize: '1.2rem', marginBottom: '1rem' }}>
                                    {selectedRequest.product_name}
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Clinic</p>
                                        <p style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>{selectedRequest.clinic_name}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Urgency</p>
                                        <p style={{ color: getUrgencyColor(selectedRequest.urgency_level), fontSize: '0.95rem', fontWeight: '600' }}>
                                            {selectedRequest.urgency_level}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Requested</p>
                                        <p style={{ color: '#3b82f6', fontSize: '0.95rem', fontWeight: '600' }}>
                                            {selectedRequest.requested_quantity} {selectedRequest.unit}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Available</p>
                                        <p style={{ color: '#10b981', fontSize: '0.95rem', fontWeight: '600' }}>
                                            {selectedRequest.available_quantity} {selectedRequest.unit}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Adjust Quantity */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    Adjust Quantity (Optional)
                                </label>
                                <input
                                    type="number"
                                    value={adjustedQuantity}
                                    onChange={(e) => setAdjustedQuantity(e.target.value)}
                                    placeholder={`Leave blank to approve ${selectedRequest.requested_quantity}`}
                                    min="1"
                                    max={selectedRequest.available_quantity}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                    If the requested quantity is unreasonable, you can adjust it here
                                </p>
                            </div>

                            {/* Validation Notes */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    Validation Notes
                                </label>
                                <textarea
                                    value={validationNotes}
                                    onChange={(e) => setValidationNotes(e.target.value)}
                                    placeholder="Add notes about your validation decision..."
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
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <button
                                    onClick={() => handleValidate(selectedRequest.id, 'reject')}
                                    style={{
                                        padding: '0.875rem',
                                        borderRadius: '8px',
                                        border: '1px solid #ef4444',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <XCircle size={16} />
                                    Reject
                                </button>
                                {adjustedQuantity && (
                                    <button
                                        onClick={() => handleValidate(selectedRequest.id, 'adjust')}
                                        style={{
                                            padding: '0.875rem',
                                            borderRadius: '8px',
                                            border: '1px solid #f59e0b',
                                            background: 'rgba(245, 158, 11, 0.1)',
                                            color: '#f59e0b',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Edit3 size={16} />
                                        Adjust
                                    </button>
                                )}
                                <button
                                    onClick={() => handleValidate(selectedRequest.id, 'approve')}
                                    style={{
                                        padding: '0.875rem',
                                        borderRadius: '8px',
                                        border: '1px solid #10b981',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        color: '#10b981',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        gridColumn: adjustedQuantity ? 'auto' : 'span 2'
                                    }}
                                >
                                    <CheckCircle size={16} />
                                    Approve
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Layout >
    );
};

export default RequestValidation;
