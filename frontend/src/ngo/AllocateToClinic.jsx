import React, { useState, useEffect } from 'react';
import { Send, Truck, CheckCircle, Loader } from 'lucide-react';
import Layout from '../components/Layout';
import { ngoAPI } from '../services/api';
import '../styles/FormStyles.css';

const AllocateToClinic = () => {
  const [data, setData] = useState({ availableDonations: [], requirements: [] });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    donationId: '',
    requirementId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const dashboardData = await ngoAPI.getDashboardData();
      setData({
        availableDonations: dashboardData.accepted_donations || [],
        requirements: dashboardData.clinic_requirements || []
      });
    } catch (error) {
      console.error("Failed to load allocation data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.donationId || !formData.requirementId) return;

    setIsSubmitting(true);
    try {
      await ngoAPI.allocate(formData.donationId, formData.requirementId);
      setSuccess(true);
      setFormData({ donationId: '', requirementId: '' });
      fetchData(); // Refresh to remove allocated items if backend filters them
    } catch (error) {
      alert("Allocation failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Layout><div style={{ padding: '4rem', textAlign: 'center', color: '#fff' }}>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clinic Allocation</h1>
          <p className="page-subtitle">Match Donations to Requirements</p>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981'
          }}>
            <CheckCircle size={20} />
            Allocation Successful!
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-card" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #F72585 0%, #7209B7 100%)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 10px 25px rgba(247, 37, 133, 0.4)' }}>
              <Truck size={30} color="#fff" />
            </div>
            <h2 style={{ color: '#fff', fontSize: '1.5rem' }}>New Allocation</h2>
          </div>

          {/* Source: Donation */}
          <div className="form-group">
            <label className="input-label">Select Source Donation (In Stock)</label>
            <select
              className="form-input"
              value={formData.donationId}
              onChange={e => setFormData({ ...formData, donationId: e.target.value })}
              required
            >
              <option value="">-- Choose Donation --</option>
              {data.availableDonations.map(d => (
                <option key={d.id} value={d.id}>
                  #{d.id} {d.item_name} (Qty: {d.quantity})
                </option>
              ))}
            </select>
          </div>

          {/* Target: Requirement */}
          <div className="form-group">
            <label className="input-label">Select Clinic Requirement</label>
            <select
              className="form-input"
              value={formData.requirementId}
              onChange={e => setFormData({ ...formData, requirementId: e.target.value })}
              required
            >
              <option value="">-- Choose Requirement --</option>
              {data.requirements.map(req => (
                <option key={req.id} value={req.id}>
                  {req.id} - {req.clinic_name} needs {req.item_name} ({req.quantity})
                </option>
              ))}
            </select>
            {data.requirements.length === 0 && (
              <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '5px' }}>No pending clinic requirements found.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.donationId || !formData.requirementId}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
          >
            {isSubmitting ? 'Allocating...' : 'Allocate Donation'}
            {!isSubmitting && <Send size={16} />}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AllocateToClinic;
