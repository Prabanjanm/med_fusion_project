
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
      >
        {/* Welcome Section */}
        <div className="page-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title">Dashboard Overview</h1>
            <p className="page-subtitle">Welcome back, {user?.company_name || 'Partner'}</p>
          </div>
          <div className="account-status-card">
            <div className="status-indicator">
              <span style={{ height: '8px', width: '8px', background: '#00ff88', borderRadius: '50%', boxShadow: '0 0 10px #00ff88' }}></span>
              <span className="status-text">System Operational</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div className="stats-grid" variants={itemVariants}>
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
          /* Empty State - Call to Action */
          <motion.div variants={itemVariants} className="analytics-placeholder-section" style={{ textAlign: 'center', borderColor: 'var(--accent-cyan)', background: 'rgba(0, 229, 255, 0.05)' }}>
            <div style={{ padding: '2rem' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0,229,255,0.2) 0%, rgba(67,97,238,0.2) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <Zap size={40} color="#00E5FF" />
              </div>
              <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem' }}>Start Your Impact Journey</h2>
              <p style={{ maxWidth: '600px', margin: '0 auto 2rem', color: '#94a3b8', fontSize: '1.1rem' }}>
                You haven't made any donations yet. Create your first donation record to start tracking your philanthropic contributions on the blockchain.
              </p>
              <button
                className="btn-submit"
                onClick={() => navigate('/csr/create-donation')}
                style={{ padding: '1rem 3rem', fontSize: '1.2rem', display: 'inline-flex', gap: '0.75rem' }}
              >
                <Plus size={24} /> Create First Donation
              </button>
            </div>
          </motion.div>

        ) : (
          /* Populated State - Visuals & Actions */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>

            {/* Left Col: Visual Breakdown */}
            <motion.div variants={itemVariants} style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={20} color="#00E5FF" /> Status Distribution
              </h3>

              {/* CSS Bar Chart */}
              <div style={{ height: '24px', width: '100%', background: '#1e293b', borderRadius: '12px', overflow: 'hidden', display: 'flex', marginBottom: '1.5rem' }}>
                {getPercentage(stats.completed) > 0 && (
                  <div style={{ width: `${getPercentage(stats.completed)}% `, background: '#00ff88' }} title="Completed" />
                )}
                {getPercentage(stats.inTransit) > 0 && (
                  <div style={{ width: `${getPercentage(stats.inTransit)}% `, background: '#ff9800' }} title="In Transit" />
                )}
                {getPercentage(stats.pending) > 0 && (
                  <div style={{ width: `${getPercentage(stats.pending)}% `, background: '#b400ff' }} title="Pending" />
                )}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#00ff88' }}></div> Received
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ff9800' }}></div> In Transit
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#b400ff' }}></div> Pending
                </div>
              </div>
            </motion.div>

      {/* Right Col: Recent Activity & Quick Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Recent Activity Highlight */}
        <motion.div variants={itemVariants} style={{ background: 'linear-gradient(135deg, rgba(67, 97, 238, 0.1), rgba(15, 23, 42, 0.6))', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(67, 97, 238, 0.2)' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} color="#4361EE" /> Latest Activity
          </h3>
          {stats.lastActivity ? (
            <div>
              <p style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                Donated {stats.lastActivity.quantity} {stats.lastActivity.item_name}
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                {new Date(stats.lastActivity.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <div style={{ marginTop: '1rem', display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', fontSize: '0.85rem', color: '#fff' }}>
                Status: {stats.lastActivity.status}
              </div>
            </div>
          ) : (
            <p style={{ color: '#94a3b8' }}>No activity yet.</p>
          )}
        </motion.div>

        {/* Quick Action Navigation */}
        <motion.div variants={itemVariants} className="quick-actions-grid" style={{ gridTemplateColumns: '1fr 1fr', margin: 0 }}>
          {/* Create New */}
          <div
            className="action-card"
            onClick={() => navigate('/csr/create-donation')}
            style={{ '--card-color': '#00E5FF', minHeight: '100px' }}
          >
            <div className="action-icon" style={{ background: 'rgba(0, 229, 255, 0.1)' }}>
              <Plus color="#00E5FF" />
            </div>
            <div className="action-content">
              <div className="action-title">New Donation</div>
            </div>
            <ArrowRight className="action-arrow" size={18} />
          </div>

          {/* View History */}
          <div
            className="action-card"
            onClick={() => navigate('/csr/history')}
            style={{ '--card-color': '#b400ff', minHeight: '100px' }}
          >
            <div className="action-icon" style={{ background: 'rgba(180, 0, 255, 0.1)' }}>
              <BarChart3 color="#b400ff" />
            </div>
            <div className="action-content">
              <div className="action-title">View History</div>
            </div>
            <ArrowRight className="action-arrow" size={18} />
          </div>
        </motion.div>

      </div>
    </div>
  )
}
      </motion.div >
    </Layout >
  );
};

export default CsrDashboard;

