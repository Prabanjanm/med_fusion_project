
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
import StatusBadge from '../components/StatusBadge';
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
    rejected: 0,
    totalQuantity: 0,
    recentHistory: []
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
        const rejected = data.filter(d => ['REJECTED', 'DENIED', 'CANCELLED'].includes(d.status)).length;

        // Calculate total items donated
        const totalQuantity = data.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

        // Find most recent activity
        const sortedData = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const lastActivity = sortedData.length > 0 ? sortedData[0] : null;

        setStats({
          // Real Data Visualization
          total: total || 0,
          completed: completed || 0,
          // Avoid redeclaration issue by using computed value
          inTransit: inTransit || 0,
          pending: pending || 0,
          rejected: rejected || 0,
          totalQuantity: totalQuantity || 0,
          recentHistory: sortedData.slice(0, 4)
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
      {/* Full-bleed gradient background - breaks out of container */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, #0a0f1e 0%, #0f172a 40%, #1e293b 100%)',
        zIndex: -2
      }} />

      {/* Gradient overlay for smooth transition */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '100vh',
        background: `
          linear-gradient(
            180deg,
            rgba(6, 182, 212, 0.12) 0%,
            rgba(6, 182, 212, 0.08) 15%,
            rgba(15, 23, 42, 0.4) 35%,
            rgba(30, 41, 59, 0.3) 50%,
            rgba(30, 41, 59, 0.15) 70%,
            transparent 100%
          )
        `,
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      <motion.div
        className="dashboard-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Hero Section */}
        <div style={{
          marginBottom: '1rem',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          paddingBottom: '1rem',
          position: 'relative'
        }}>
          <div>
            <h1 className="page-title" style={{
              fontSize: '2rem',
              marginBottom: '0.25rem',
              textShadow: '0 0 20px rgba(6, 182, 212, 0.2)'
            }}>
              Overview
            </h1>
            <p className="page-subtitle" style={{
              fontSize: '1.1rem',
              opacity: 0.6,
              color: '#94a3b8',
              textShadow: 'none',
              textTransform: 'none',
              fontWeight: '400'
            }}>
              Welcome back, {user?.company_name || 'Partner'}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)' }}
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
              boxShadow: '0 4px 20px rgba(6, 182, 212, 0.25)'
            }}
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>New Donation</span>
          </motion.button>
        </div>

        {/* Stats Grid */}
        <motion.div
          className="stats-grid"
          variants={itemVariants}
          style={{
            marginBottom: '2rem',
            gap: '1.5rem'
          }}
        >
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
            label="Completed Impact"
            value={loading ? "-" : stats.completed}
            color="#00ff88"
            icon={CheckCircle}
          />
        </motion.div>

        {/* Content Area */}
        {stats.total === 0 && !loading ? (
          /* Empty State */
          <motion.div variants={itemVariants} style={{
            background: 'rgba(15, 23, 42, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '32px',
            border: '1px solid rgba(255, 255, 255, 0.03)',
            boxShadow: '0 20px 60px -20px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(6, 182, 212, 0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.1)'
              }}>
                <Zap size={32} color="#06b6d4" />
              </div>
              <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', marginBottom: '1rem', fontWeight: '600' }}>
                No donations yet
              </h2>
              <p style={{ maxWidth: '500px', margin: '0 auto', color: '#94a3b8', lineHeight: '1.6' }}>
                Start your journey by creating your first donation record positioned above.
              </p>
            </div>
          </motion.div>
        ) : (
          /* Populated State */
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            paddingBottom: '4rem'
          }}>

            {/* Supply Lifecycle Tracking (Requirement 5) */}
            <motion.div
              variants={itemVariants}
              style={{
                background: 'rgba(15, 23, 42, 0.3)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '1.5rem',
                border: '1px solid rgba(255,255,255,0.04)',
                boxShadow: '0 20px 60px -20px rgba(0, 0, 0, 0.3)',
                width: '100%',
                maxWidth: '1200px',
                marginTop: '2rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: '600' }}>Supply Allocation Status</h3>
                <Package size={20} color="#64748b" />
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                  <thead>
                    <tr style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'left', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0 1rem 1rem' }}>Supply Name</th>
                      <th style={{ padding: '0 1rem 1rem' }}>Total Donated</th>
                      <th style={{ padding: '0 1rem 1rem' }}>Allocated</th>
                      <th style={{ padding: '0 1rem 1rem' }}>Remaining</th>
                      <th style={{ padding: '0 1rem 1rem' }}>Latest Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentHistory.map((item, idx) => {
                      const isAllocated = ['ALLOCATED', 'RECEIVED', 'COMPLETED', 'IN_TRANSIT'].includes(item.status);
                      const total = item.quantity || 0;
                      const allocated = isAllocated ? total : 0;
                      const remaining = total - allocated;

                      return (
                        <tr key={item.id || idx} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', transition: 'transform 0.2s' }}>
                          <td style={{ padding: '1rem', color: '#fff', fontWeight: 600, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                            {item.item_name}
                          </td>
                          <td style={{ padding: '1rem', color: '#94a3b8' }}>{total}</td>
                          <td style={{ padding: '1rem', color: allocated > 0 ? '#00ff88' : '#64748b' }}>{allocated}</td>
                          <td style={{ padding: '1rem', color: remaining > 0 ? '#f59e0b' : '#64748b' }}>{remaining}</td>
                          <td style={{ padding: '1rem', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                            <StatusBadge status={item.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {stats.recentHistory.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No active donations found.</div>
                )}
              </div>
            </motion.div>

          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default CsrDashboard;
