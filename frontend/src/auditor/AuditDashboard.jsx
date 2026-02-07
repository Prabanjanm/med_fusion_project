import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  CheckCircle2,
  Users,
  Link,
  Stethoscope
} from 'lucide-react';

import Layout from '../components/Layout';
import Table from '../components/Table';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import { auditorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import '../styles/DashboardLayout.css';

const AuditDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [auditRecords, setAuditRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    donatedItems: 0,
    ngos: 0,
    verified: 0,
    clinics: 0,
    pendingReviews: 0,
    fulfillmentRate: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companies, ngos, clinics, auditTrail, pendingCsr, pendingNgo, globalStats] = await Promise.all([
          auditorAPI.getVerifiedCompanies(),
          auditorAPI.getVerifiedNGOs(),
          auditorAPI.getClinicRegistry(),
          auditorAPI.getUnifiedAuditTrail(),
          auditorAPI.getPendingCompanies(),
          auditorAPI.getPendingNGOs(),
          auditorAPI.getSystemStats()
        ]);

        setStats({
          total: auditTrail.length,
          donatedItems: globalStats.total_donated_items,
          ngos: ngos.length,
          verified: companies.length,
          clinics: clinics.length,
          pendingReviews: pendingCsr.length + pendingNgo.length,
          fulfillmentRate: globalStats.fulfillment_rate
        });

        setAuditRecords(
          auditTrail.slice(0, 5).map((d) => ({
            id: d.reference_id || 'PENDING',
            entity: d.entity_name,
            role: d.role,
            action: d.action,
            timestamp: new Date(d.timestamp).toLocaleString()
          }))
        );
      } catch (error) {
        console.error('Failed to load Auditor data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
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
            textShadow: '0 0 20px rgba(0, 229, 255, 0.2)'
          }}>
            Auditor Compliance Dashboard
          </h1>
          <p className="page-subtitle" style={{
            fontSize: '1.1rem',
            opacity: 0.6,
            color: '#94a3b8',
            fontWeight: '400'
          }}>
            Oversight Protocol: {user?.organization_name || 'System Authority'}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 229, 255, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/auditor/pending-requests')}
          style={{
            background: 'rgba(0, 229, 255, 0.1)',
            color: '#00e5ff',
            border: '1px solid #00e5ff',
            padding: '0.8rem 1.8rem',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <ClipboardCheck size={18} /> REVIEW APPLICATIONS
        </motion.button>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <SummaryCard
          label="Total Items Donated"
          value={loading ? '-' : stats.donatedItems}
          color="#00E5FF"
          icon={ClipboardCheck}
          onClick={() => navigate('/auditor/csr-registry')}
        />
        <SummaryCard
          label="Fulfillment Rate"
          value={loading ? '-' : `${stats.fulfillmentRate}%`}
          color="#00ff88"
          icon={CheckCircle2}
        />
        <SummaryCard
          label="Medical Network"
          value={loading ? '-' : stats.clinics + stats.ngos}
          color="#8b5cf6"
          icon={Stethoscope}
        />
        <SummaryCard
          label="Ledger Integrity"
          value={loading ? '-' : stats.total}
          color="#ff9800"
          icon={Link}
          onClick={() => navigate('/auditor/trail')}
        />
      </div>

      {/* AUDIT TABLE */}
      <div className="table-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}
        >
          <h2 className="table-header-title">Recent Ledger Activity</h2>
          <button
            onClick={() => navigate('/auditor/trail')}
            style={{
              background: 'none',
              border: 'none',
              color: '#00e5ff',
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            See all events →
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Consulting Blockchain...
          </div>
        ) : auditRecords.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <p>No activity recorded in the ledger yet.</p>
          </div>
        ) : (
          <Table
            columns={[
              { key: 'timestamp', label: 'Timestamp' },
              { key: 'entity', label: 'Entity' },
              {
                key: 'role',
                label: 'Role',
                render: val => <StatusBadge status={val} />
              },
              { key: 'action', label: 'Action' },
              { key: 'id', label: 'Ref ID' }
            ]}
            data={auditRecords}
          />
        )}
      </div>
    </Layout>
  );
};

export default AuditDashboard;
