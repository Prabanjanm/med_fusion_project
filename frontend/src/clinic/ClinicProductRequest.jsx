import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Send, AlertCircle, CheckCircle, RefreshCw, Box } from 'lucide-react';
import Layout from '../components/Layout';
import { clinicAPI } from '../services/api';
import '../styles/FormStyles.css';

const ClinicProductRequest = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [ngoInventory, setNgoInventory] = useState([]);
    const [loadingInventory, setLoadingInventory] = useState(true);
    const [formData, setFormData] = useState({
        item_name: '',
        quantity: '',
        priority: 3, // Default Medium/Standard
        purpose: ''
    });

    React.useEffect(() => {
        fetchNgoInventory();
    }, []);

    const fetchNgoInventory = async () => {
        setLoadingInventory(true);
        try {
            const data = await clinicAPI.getNgoInventory();
            setNgoInventory(data || []);
        } catch (error) {
            console.error("Failed to fetch NGO inventory:", error);
        } finally {
            setLoadingInventory(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await clinicAPI.createRequirement({
                ...formData,
                quantity: parseInt(formData.quantity)
            });
            setSuccess(true);
            setTimeout(() => navigate('/clinic/request-status'), 2000);
        } catch (error) {
            console.error("Failed to submit requirement:", error);
            alert("Error: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <Layout>
                <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div style={{ color: '#00ff94', marginBottom: '2rem' }}>
                        <CheckCircle size={80} />
                    </div>
                    <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: '1rem' }}>Requirement Submitted</h1>
                    <p style={{ color: '#94a3b8' }}>Your request has been forwarded directly to your supervising NGO for review and allocation.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
                <button
                    onClick={() => navigate('/clinic')}
                    style={{
                        background: 'none', border: 'none', color: '#64748b',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        cursor: 'pointer', marginBottom: '2rem', fontSize: '0.9rem'
                    }}
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <div className="page-header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <h1 className="page-title" style={{ color: '#00e5ff' }}>Request Requirements</h1>
                        <p className="page-subtitle" style={{ color: '#94a3b8' }}>Submit your clinical needs for NGO-authorized supply allocation</p>
                    </div>
                </div>

                <div className="form-card" style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '2.5rem' }}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label className="form-label" style={{ marginBottom: 0 }}>Item / Resource Name (From NGO Stock)</label>
                                <button
                                    type="button"
                                    onClick={fetchNgoInventory}
                                    style={{
                                        background: 'none', border: 'none', color: '#00e5ff',
                                        fontSize: '0.75rem', cursor: 'pointer', display: 'flex',
                                        alignItems: 'center', gap: '4px'
                                    }}
                                >
                                    <RefreshCw size={12} className={loadingInventory ? 'spin-animation' : ''} />
                                    SYNC STOCK
                                </button>
                            </div>

                            {loadingInventory ? (
                                <div style={{ color: '#64748b', fontSize: '0.9rem', padding: '0.8rem', background: 'rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                                    Checking NGO live inventory...
                                </div>
                            ) : (
                                <div style={{ position: 'relative' }}>
                                    <select
                                        className="form-select"
                                        value={formData.item_name}
                                        onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                                        required
                                        style={{ width: '100%', appearance: 'auto' }}
                                    >
                                        <option value="">-- Select Available Item --</option>
                                        {ngoInventory.length === 0 ? (
                                            <option value="" disabled>No stock available at NGO</option>
                                        ) : (
                                            ngoInventory.map(item => (
                                                <option key={item.item_name} value={item.item_name}>
                                                    {item.item_name} ({item.quantity} available)
                                                </option>
                                            ))
                                        )}
                                        <option value="OTHER">--- Item Not Listed? ---</option>
                                    </select>
                                </div>
                            )}

                            {formData.item_name === 'OTHER' && (
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter item name manually..."
                                    style={{ marginTop: '1rem' }}
                                    onChange={e => setFormData({ ...formData, item_name: e.target.value })}
                                    required
                                />
                            )}
                        </div>

                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label className="form-label">Quantity Required</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="0"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Priority Level</label>
                                <select
                                    className="form-select"
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value={1}>1 - Critical Emergency</option>
                                    <option value={2}>2 - High Priority</option>
                                    <option value={3}>3 - Standard Need</option>
                                    <option value={4}>4 - Routine Inventory</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Purpose / Clinical Rationale</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Describe why these items are needed..."
                                value={formData.purpose}
                                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                required
                                style={{ minHeight: '120px' }}
                            ></textarea>
                        </div>

                        <div style={{
                            background: 'rgba(245, 158, 11, 0.05)',
                            border: '1px solid rgba(245, 158, 11, 0.1)',
                            borderRadius: '12px',
                            padding: '1rem',
                            display: 'flex',
                            gap: '0.75rem',
                            marginBottom: '2rem'
                        }}>
                            <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
                            <p style={{ color: '#d97706', fontSize: '0.85rem', margin: 0 }}>
                                Only your superviding NGO will see this requirement. Allocation depends on NGO inventory availability and priority ranking.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}
                        >
                            <Send size={18} />
                            {submitting ? 'Submitting Requirement...' : 'Notify NGO of Requirement'}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default ClinicProductRequest;
