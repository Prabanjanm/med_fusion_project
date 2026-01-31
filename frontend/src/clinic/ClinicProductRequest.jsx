import React, { useState, useEffect } from 'react';
import { Package, Send, AlertTriangle, Upload, FileText, X } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import '../styles/FormStyles.css';

// Mock storage
const CLINIC_REQUESTS_KEY = 'csr_tracker_clinic_requests';
const MOCK_DONATIONS_KEY = 'csr_tracker_mock_donations';

const getAvailableItems = () => {
    try {
        const donations = JSON.parse(localStorage.getItem(MOCK_DONATIONS_KEY) || '[]');
        const accepted = donations.filter(d => d.status === 'ACCEPTED');

        // Group by item type and sum quantities
        const items = {};
        accepted.forEach(d => {
            const itemName = d.item_name;
            if (!items[itemName]) {
                items[itemName] = { name: itemName, available: 0, ngo: d.ngo_name };
            }
            items[itemName].available += d.quantity || 0;
        });

        return Object.values(items);
    } catch (error) {
        return [];
    }
};

const saveClinicRequest = (request) => {
    try {
        const existing = JSON.parse(localStorage.getItem(CLINIC_REQUESTS_KEY) || '[]');
        const updated = [request, ...existing];
        localStorage.setItem(CLINIC_REQUESTS_KEY, JSON.stringify(updated));
        return true;
    } catch (error) {
        console.error('Error saving request:', error);
        return false;
    }
};

const ClinicProductRequest = () => {
    const { user } = useAuth();
    const [availableItems, setAvailableItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([{ product: '', quantity: '' }]);
    const [priority, setPriority] = useState('low');
    const [purpose, setPurpose] = useState('');
    const [emergencyDoc, setEmergencyDoc] = useState(null);
    const [emergencyReason, setEmergencyReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const items = getAvailableItems();
        setAvailableItems(items);
    }, []);

    const addItemRow = () => {
        setSelectedItems([...selectedItems, { product: '', quantity: '' }]);
    };

    const removeItemRow = (index) => {
        if (selectedItems.length > 1) {
            setSelectedItems(selectedItems.filter((_, i) => i !== index));
        }
    };

    const updateItemRow = (index, field, value) => {
        const updated = [...selectedItems];
        updated[index][field] = value;
        setSelectedItems(updated);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEmergencyDoc({
                name: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date().toISOString()
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validItems = selectedItems.filter(item => item.product && item.quantity > 0);

        if (validItems.length === 0) {
            alert('Please select at least one item with quantity');
            return;
        }

        const isUrgent = priority === 'high' || priority === 'emergency';

        if (isUrgent && !emergencyDoc) {
            alert('High and Emergency requests require supporting documents');
            return;
        }

        if (isUrgent && !emergencyReason.trim()) {
            alert('Please describe the situation requiring urgent attention');
            return;
        }

        setLoading(true);

        const requestItems = validItems.map(item => {
            const availableItem = availableItems.find(ai => ai.name === item.product);
            return {
                product_type: item.product,
                requested_quantity: parseInt(item.quantity),
                available_quantity: availableItem?.available || 0
            };
        });

        const request = {
            id: `REQ-${Date.now()}`,
            clinic_name: user?.companyName || 'Clinic',
            items: requestItems,
            priority: priority,
            purpose: purpose,
            emergency_reason: (priority === 'high' || priority === 'emergency') ? emergencyReason : null,
            emergency_document: (priority === 'high' || priority === 'emergency') ? emergencyDoc : null,
            status: 'PENDING',
            ngo_status: 'pending_review',
            created_at: new Date().toISOString(),
            ngo_name: requestItems[0]?.ngo || 'NGO'
        };

        const saved = saveClinicRequest(request);

        setTimeout(() => {
            setLoading(false);
            if (saved) {
                setSuccess(true);
                setSelectedItems([{ product: '', quantity: '' }]);
                setPriority('low');
                setPurpose('');
                setEmergencyDoc(null);
                setEmergencyReason('');

                setTimeout(() => setSuccess(false), 3000);
            }
        }, 1000);
    };

    const getMaxQuantity = (productName) => {
        const item = availableItems.find(i => i.name === productName);
        return item?.available || 0;
    };

    return (
        <Layout>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
                <div className="page-header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <h1 className="page-title" style={{
                            color: '#00e5ff',
                            textShadow: '0 0 10px rgba(0, 229, 255, 0.3)'
                        }}>
                            REQUEST PRODUCTS FROM NGO
                        </h1>
                        <p className="page-subtitle">Select items from available stock and submit your request</p>
                    </div>
                </div>

                {success && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '12px',
                        padding: '1rem 1.5rem',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <Send size={20} color="#10b981" />
                        <div>
                            <h4 style={{ color: '#10b981', margin: 0, fontSize: '1rem' }}>Request Submitted!</h4>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>NGO will review your request</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="form-card" style={{
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 229, 255, 0.2)'
                }}>

                    {/* Available Items */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <Package size={20} />
                            Available Items from NGO
                        </h3>

                        {availableItems.length === 0 ? (
                            <div style={{
                                padding: '2rem',
                                textAlign: 'center',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <Package size={40} color="#64748b" style={{ marginBottom: '0.5rem' }} />
                                <p style={{ color: '#94a3b8', margin: 0 }}>No items available</p>
                            </div>
                        ) : (
                            <>
                                {selectedItems.map((item, index) => (
                                    <div key={index} style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 150px auto',
                                        gap: '1rem',
                                        marginBottom: '1rem',
                                        alignItems: 'end'
                                    }}>
                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>Product Type</label>
                                            <select
                                                value={item.product}
                                                onChange={(e) => updateItemRow(index, 'product', e.target.value)}
                                                className="form-input"
                                                required
                                            >
                                                <option value="">Select Product</option>
                                                {availableItems.map(ai => (
                                                    <option key={ai.name} value={ai.name}>
                                                        {ai.name} (Available: {ai.available.toLocaleString()})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group" style={{ marginBottom: 0 }}>
                                            <label>
                                                Quantity
                                                {item.product && (
                                                    <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                                        (Max: {getMaxQuantity(item.product)})
                                                    </span>
                                                )}
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                max={getMaxQuantity(item.product)}
                                                value={item.quantity}
                                                onChange={(e) => updateItemRow(index, 'quantity', e.target.value)}
                                                className="form-input"
                                                placeholder={item.product ? `Max ${getMaxQuantity(item.product)}` : "0"}
                                                required
                                            />
                                        </div>

                                        <div style={{ paddingBottom: '0.25rem' }}>
                                            {selectedItems.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItemRow(index)}
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                                        borderRadius: '8px',
                                                        padding: '0.5rem',
                                                        color: '#ef4444',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <X size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={addItemRow}
                                    style={{
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        border: '1px solid rgba(59, 130, 246, 0.3)',
                                        borderRadius: '8px',
                                        padding: '0.75rem 1.5rem',
                                        color: '#3b82f6',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        marginTop: '0.5rem'
                                    }}
                                >
                                    + Add Another Item
                                </button>
                            </>
                        )}
                    </div>

                    {/* Priority Level */}
                    <div className="form-section">
                        <h3 className="section-title">
                            <AlertTriangle size={20} />
                            Priority Level
                        </h3>

                        <div className="form-group">
                            <label>Select Priority Urgency</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="form-input"
                                style={{ width: '100%' }}
                            >
                                <option value="low">Low - Routine Stock</option>
                                <option value="medium">Medium - Replenishment</option>
                                <option value="high">High - Urgent</option>
                                <option value="emergency">Emergency - Immediate Attention</option>
                            </select>
                        </div>
                    </div>

                    {/* Urgent/Emergency Details */}
                    {(priority === 'high' || priority === 'emergency') && (
                        <div className="form-section" style={{
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            marginTop: '1rem'
                        }}>
                            <h3 style={{
                                color: '#ef4444',
                                marginBottom: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '1rem'
                            }}>
                                <AlertTriangle size={18} />
                                {priority === 'emergency' ? 'Emergency' : 'Urgent'} Documentation Required
                            </h3>

                            <div className="form-group">
                                <label>Describe Situation *</label>
                                <textarea
                                    value={emergencyReason}
                                    onChange={(e) => setEmergencyReason(e.target.value)}
                                    placeholder="Provide detailed information about why this is urgent..."
                                    required
                                    className="form-input"
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Upload Supporting Document *</label>
                                <div style={{
                                    border: '2px dashed rgba(239, 68, 68, 0.3)',
                                    borderRadius: '8px',
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    background: 'rgba(255,255,255,0.02)'
                                }}>
                                    {emergencyDoc ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                            <FileText size={20} color="#10b981" />
                                            <div style={{ textAlign: 'left', flex: 1 }}>
                                                <p style={{ color: '#fff', margin: 0, fontSize: '0.9rem' }}>{emergencyDoc.name}</p>
                                                <p style={{ color: '#64748b', margin: 0, fontSize: '0.75rem' }}>
                                                    {(emergencyDoc.size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setEmergencyDoc(null)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    borderRadius: '6px',
                                                    padding: '0.5rem 1rem',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={24} color="#64748b" style={{ marginBottom: '0.5rem' }} />
                                            <p style={{ color: '#94a3b8', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                                                Upload medical certificate or emergency report
                                            </p>
                                            <input
                                                type="file"
                                                onChange={handleFileUpload}
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                style={{ display: 'none' }}
                                                id="emergency-doc"
                                            />
                                            <label
                                                htmlFor="emergency-doc"
                                                style={{
                                                    display: 'inline-block',
                                                    padding: '0.5rem 1.25rem',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    borderRadius: '6px',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Choose File
                                            </label>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Purpose */}
                    <div className="form-section">
                        <div className="form-group">
                            <label>Purpose & Medical Need *</label>
                            <textarea
                                value={purpose}
                                onChange={(e) => setPurpose(e.target.value)}
                                placeholder="Describe how these items will be used for patient care..."
                                required
                                className="form-input"
                                rows="3"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedItems([{ product: '', quantity: '' }]);
                                setPriority('low');
                                setPurpose('');
                                setEmergencyDoc(null);
                                setEmergencyReason('');
                            }}
                            className="btn btn-secondary"
                            style={{
                                borderRadius: '12px',
                                minWidth: '150px',
                                justifyContent: 'center',
                                fontFamily: "'Orbitron', sans-serif"
                            }}
                        >
                            CLEAR FORM
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-submit"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                borderRadius: '12px',
                                minWidth: '200px',
                                justifyContent: 'center',
                                textTransform: 'uppercase',
                                fontFamily: "'Orbitron', sans-serif"
                            }}
                        >
                            <Send size={18} />
                            {loading ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default ClinicProductRequest;
