import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, ClipboardCheck, Loader, Star, MessageSquare, Package, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { clinicAPI } from '../services/api';
import '../styles/FormStyles.css';
import { useNavigate } from 'react-router-dom';

const ConfirmReceipt = () => {
  const navigate = useNavigate();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAllocation, setSelectedAllocation] = useState('');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllocations();
  }, []);

  const fetchAllocations = async () => {
    try {
      const data = await clinicAPI.getPendingAllocations();
      setAllocations(data || []);
    } catch (error) {
      console.error("Failed to load allocations", error);
      setError("Could not load your pending shipments. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAllocation) return;
    if (rating === 0) {
      setError("Please provide a quality rating.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await clinicAPI.confirmReceipt(selectedAllocation, {
        feedback,
        quality_rating: rating
      });
      setSuccessMessage('Shipment receipt and feedback submitted successfully.');
      setSelectedAllocation('');
      setFeedback('');
      setRating(0);

      // Refresh list after success
      setTimeout(() => {
        setSuccessMessage(null);
        fetchAllocations();
      }, 3000);

    } catch (err) {
      setError(err.message || "Failed to confirm receipt. Technical error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader className="animate-spin" color="#00e5ff" size={48} style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#94a3b8', fontFamily: 'Orbitron' }}>Scanning Inventory...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '750px', margin: '0 auto', padding: '1rem' }}>
        <button
          onClick={() => navigate('/clinic')}
          style={{
            background: 'none', border: 'none', color: '#64748b',
            display: 'flex', alignItems: 'center', gap: '8px',
            cursor: 'pointer', marginBottom: '1rem', fontSize: '0.85rem'
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="page-header" style={{ marginBottom: '1.5rem', paddingBottom: '1rem' }}>
          <div>
            <h1 className="page-title" style={{ color: '#00e5ff', fontSize: '1.5rem', marginBottom: '0.2rem' }}>Shipment Confirmation</h1>
            <p className="page-subtitle" style={{ fontSize: '0.9rem' }}>Acknowledge receipt and provide quality metrics</p>
          </div>
        </div>

        {successMessage && (
          <div className="success-message" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <CheckCircle size={20} />
            <div style={{ fontSize: '0.9rem' }}>
              <p style={{ fontWeight: 600, margin: 0 }}>Confirmed!</p>
              <p style={{ margin: 0, opacity: 0.8 }}>{successMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message" style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '12px', color: '#f87171',
            fontSize: '0.85rem'
          }}>
            <Package size={20} />
            <div>
              <strong>Connection Issue:</strong> {error}
              {error.includes("Failed to fetch") && <p style={{ marginTop: '4px', opacity: 0.8 }}>Tip: Make sure the backend server (FastAPI) is running.</p>}
            </div>
          </div>
        )}

        <div className="form-card" style={{
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '1.5rem 2rem',
          borderRadius: '20px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '48px', height: '48px', background: 'rgba(0, 229, 255, 0.1)',
              borderRadius: '12px', display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '1rem'
            }}>
              <ClipboardCheck size={24} color="#00e5ff" />
            </div>
            <h2 style={{ color: '#fff', fontSize: '1.3rem', fontFamily: 'Orbitron', marginBottom: '0.25rem' }}>Confirm Allocated Items</h2>
          </div>

          {allocations.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '3.5rem 2rem', color: '#64748b',
              background: 'rgba(0,0,0,0.2)', borderRadius: '24px',
              border: '2px dashed rgba(255,255,255,0.05)'
            }}>
              <Package size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Shipments Found</h3>
              <p style={{ fontSize: '0.85rem', maxWidth: '300px', margin: '0 auto 1.5rem auto', lineHeight: '1.6' }}>
                When your supervising NGO allocates items from their inventory to your clinic, they will appear here for confirmation.
              </p>
              <button
                onClick={fetchAllocations}
                className="btn-secondary"
                style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', fontSize: '0.8rem' }}
              >
                Refresh Inventory
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="input-label" style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', display: 'block' }}>
                  Select Allocated Item
                </label>
                <select
                  value={selectedAllocation}
                  onChange={(e) => setSelectedAllocation(e.target.value)}
                  className="form-input"
                  style={{
                    height: '48px',
                    background: '#1e293b', // Solid dark background
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f8fafc',
                    padding: '0 0.75rem',
                    fontSize: '0.9rem',
                    width: '100%',
                    colorScheme: 'dark'
                  }}
                  required
                >
                  <option value="" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>-- Select Allocated Item --</option>
                  {allocations.map(alloc => (
                    <option key={alloc.id} value={alloc.id} style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>
                      {alloc.item_name} ({alloc.quantity} units) - {alloc.ngo_name} (Ref #{alloc.id})
                    </option>
                  ))}
                </select>
              </div>

              {selectedAllocation && (
                <div style={{
                  marginTop: '1.5rem', paddingTop: '1.5rem',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  animation: 'slideUp 0.3s ease-out'
                }}>
                  <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                    <label className="input-label" style={{ display: 'block', marginBottom: '0.75rem', color: '#00e5ff', fontSize: '0.85rem' }}>
                      Rate Product Quality
                    </label>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHover(star)}
                          onMouseLeave={() => setHover(0)}
                          onClick={() => setRating(star)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            transition: 'transform 0.2s', padding: '4px'
                          }}
                        >
                          <Star
                            size={star <= (hover || rating) ? 32 : 28}
                            fill={star <= (hover || rating) ? '#eab308' : 'none'}
                            color={star <= (hover || rating) ? '#eab308' : '#334155'}
                            strokeWidth={star <= (hover || rating) ? 0 : 2}
                            style={{ transition: 'all 0.15s ease' }}
                          />
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                        {rating === 1 && "Poor"}
                        {rating === 2 && "Fair"}
                        {rating === 3 && "Average"}
                        {rating === 4 && "Good"}
                        {rating === 5 && "Excellent"}
                      </p>
                    )}
                  </div>

                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      <MessageSquare size={16} color="#00e5ff" />
                      Feedback
                    </label>
                    <textarea
                      placeholder="Condition notes..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="form-input"
                      style={{
                        minHeight: '80px', background: 'rgba(0,0,0,0.2)',
                        borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', padding: '0.75rem', fontSize: '0.9rem', width: '100%'
                      }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                    style={{
                      width: '100%', height: '48px', borderRadius: '12px',
                      background: isSubmitting ? '#1e293b' : 'linear-gradient(90deg, #3b82f6, #00e5ff)',
                      border: 'none', color: '#fff'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="animate-spin" size={18} />
                        Confirming...
                      </>
                    ) : (
                      <>
                        Confirm Receipt
                        <Send size={16} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      <style>{`
                @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
    </Layout >
  );
};

export default ConfirmReceipt;
