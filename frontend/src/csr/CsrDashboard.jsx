
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Plus, Package, CheckCircle, Truck, Clock,
  TrendingUp, BarChart3, ArrowRight, Zap
} from 'lucide-react';
import Layout from '../components/Layout';
import SummaryCard from '../components/SummaryCard';
import { donationAPI } from '../services/api';
import '../styles/DashboardLayout.css';

/**
 * CSR Dashboard - Overview & Analytics
 * 
 * Provides high-level metrics and quick actions.
 * No detailed history lists (delegated to History page).
 */
const CsrDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inTransit: 0,
    pending: 0,
    totalQuantity: 0,
    lastActivity: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await donationAPI.getHistory();

        // Calculate basic counts
        const total = data.length;
        const completed = data.filter(d => ['RECEIVED', 'COMPLETED'].includes(d.status)).length;
        const inTransit = data.filter(d => ['ALLOCATED', 'IN_TRANSIT', 'ACCEPTED'].includes(d.status)).length;
        const pending = data.filter(d => ['AUTHORIZED', 'PENDING'].includes(d.status)).length;

        // Calculate total items donated
        const totalQuantity = data.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

        // Find most recent activity
        const sortedData = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const lastActivity = sortedData.length > 0 ? sortedData[0] : null;

        setStats({
          total,
          completed,
          inTransit,
          pending,
          totalQuantity,
          lastActivity
        });
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  // Helper for Status Bar Chart
  const getPercentage = (count) => stats.total === 0 ? 0 : (count / stats.total) * 100;

  return (
    <Layout>
      <motion.div
        className="dashboard-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ maxWidth: '1400px', margin: '0 auto' }}
      >
        {/* Welcome Section & Primary Action */}
        <div className="page-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Overview</h1>
            <p className="page-subtitle" style={{ fontSize: '1.1rem', opacity: 0.7 }}>Welcome back, {user?.company_name || 'Partner'}</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 229, 255, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/csr/create-donation')}
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              border: 'none',
              borderRadius: '99px',
              padding: '0.75rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)'
            }}
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>New Donation</span>
          </motion.button>
        </div>

        {/* Stats Grid */}
        <motion.div className="stats-grid" variants={itemVariants} style={{ marginBottom: '4rem', gap: '2rem' }}>
          <SummaryCard
            label="Total Donations"
            value={loading ? "-" : stats.total}
            color="#00E5FF"
            icon={Package}
          />
          <SummaryCard
            label="Items Donated"
            value={loading ? "-" : stats.totalQuantity.toLocaleString()}
            color="#7C4DFF"
            icon={TrendingUp}
          />
          <SummaryCard
            label="Active / In Transit"
            value={loading ? "-" : stats.inTransit}
            color="#ff9800"
            icon={Truck}
          />
          <SummaryCard
            label="Completed Impact"
            value={loading ? "-" : stats.completed}
            color="#00ff88"
            icon={CheckCircle}
          />
        </motion.div>

        {/* Insights & Actions Area */}
        {stats.total === 0 && !loading ? (
          /* Empty State */
          <motion.div variants={itemVariants} className="analytics-placeholder-section">
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(0, 229, 255, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
                border: '1px solid rgba(0, 229, 255, 0.3)'
              }}>
                <Zap size={32} color="#00E5FF" />
              </div>
              <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '1rem' }}>No donations yet</h2>
              <p style={{ maxWidth: '500px', margin: '0 auto', color: '#94a3b8' }}>
                Start your journey by creating your first donation record positioned above.
              </p>
            </div>
          </motion.div>
        ) : (
          /* Populated State */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '3rem' }}>

            {/* Visual Breakdown (Status Distribution) */}
            <motion.div variants={itemVariants} style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '24px', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: '600' }}>Impact Distribution</h3>
                <BarChart3 size={20} color="#64748b" />
              </div>

              {/* Premium Segmented Bar */}
              <div style={{ position: 'relative', height: '48px', width: '100%', background: '#0f172a', borderRadius: '16px', overflow: 'hidden', display: 'flex', marginBottom: '2rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' }}>
                {getPercentage(stats.completed) > 0 && (
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${getPercentage(stats.completed)}%` }} transition={{ duration: 1, ease: 'circOut' }}
                    style={{ background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', height: '100%', position: 'relative' }}
                  >
                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.3)' }} />
                  </motion.div>
                )}
                {getPercentage(stats.inTransit) > 0 && (
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${getPercentage(stats.inTransit)}%` }} transition={{ duration: 1, delay: 0.2, ease: 'circOut' }}
                    style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)', height: '100%', position: 'relative' }}
                  >
                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.3)' }} />
                  </motion.div>
                )}
                {getPercentage(stats.pending) > 0 && (
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${getPercentage(stats.pending)}%` }} transition={{ duration: 1, delay: 0.4, ease: 'circOut' }}
                    style={{ background: 'linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%)', height: '100%' }}
                  />
                )}
              </div>

              {/* Legend with Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                {[
                  { label: 'Received', count: stats.completed, color: '#10b981' },
                  { label: 'In Transit', count: stats.inTransit, color: '#f59e0b' },
                  { label: 'Pending', count: stats.pending, color: '#8b5cf6' }
                ].map((item, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '0.25rem' }}>{item.count}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity (Simplified) */}
            <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: '600', marginBottom: '1.5rem' }}>Recent Activity</h3>

              {stats.lastActivity ? (
                <div style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.4))',
                  borderRadius: '24px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '2rem',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start'
                }}>
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6',
                    padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: '600',
                    marginBottom: '1.5rem'
                  }}>
                    LATEST UPDATE
                  </div>
                  <p style={{ fontSize: '1.75rem', fontWeight: '500', color: '#fff', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    {stats.lastActivity.quantity} {stats.lastActivity.item_name}
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '2rem' }}>
                    {new Date(stats.lastActivity.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>

                  <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={16} color="#fff" />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Current Status</p>
                      <p style={{ fontSize: '1rem', color: '#fff', fontWeight: '600' }}>{stats.lastActivity.status}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '2rem', color: '#64748b', textAlign: 'center', background: 'rgba(15,23,42,0.5)', borderRadius: '24px' }}>No recent activity.</div>
              )}
            </motion.div>

          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default CsrDashboard;

