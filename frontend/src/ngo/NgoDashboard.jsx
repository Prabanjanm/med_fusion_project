import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  FileSearch,
  Activity,
  Package,
  AlertTriangle,
  UserPlus,
  Building
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

import Layout from '../components/Layout';
import Table from '../components/Table';
import SummaryCard from '../components/SummaryCard';
import StatusBadge from '../components/StatusBadge';
import { ngoAPI } from '../services/api';
import '../styles/DashboardLayout.css';

const NgoDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [donations, setDonations] = useState([]);
  const [clinicRequests, setClinicRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState({});
  const [stats, setStats] = useState({
    pendingDonations: 0,
    acceptedDonations: 0,
    pendingRequests: 0,
    emergencyRequests: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const availableDonations = await ngoAPI.getAvailableDonations().catch(() => []);
      const dashboardData = await ngoAPI.getDashboardData().catch(() => ({}));

      const accepted = dashboardData.accepted_donations || [];
      const requests = dashboardData.clinic_requirements || [];

      const inv = accepted.reduce((acc, d) => {
        acc[d.item_name] = (acc[d.item_name] || 0) + (d.quantity || 0);
        return acc;
      }, {});
      setInventory(inv);

      setDonations(
        availableDonations.map(d => ({
          id: d.id || d.donation_id,
          donor_name: d.company_name || d.donor_name || 'CSR Partner',
          resource_type: d.item_name,
          quantity: d.quantity,
          status: d.status
        }))
      );

      const pendingReqs = requests.filter(r =>
        ['PENDING', 'CLINIC_REQUESTED', 'NGO_APPROVED', 'PARTIALLY_ALLOCATED'].includes(r.status)
      );

      setClinicRequests(pendingReqs);

      setStats({
        pendingDonations: availableDonations.length,
        acceptedDonations: accepted.length,
        pendingRequests: pendingReqs.length,
        emergencyRequests: pendingReqs.filter(r => r.priority === 1).length
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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
            textShadow: '0 0 20px rgba(139, 92, 246, 0.2)'
          }}>
            NGO Network Dashboard
          </h1>
          <p className="page-subtitle" style={{
            fontSize: '1.1rem',
            opacity: 0.6,
            color: '#94a3b8',
            fontWeight: '400'
          }}>
            Welcome back, {user?.organization_name || 'Health Partner'}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/ngo/manage-clinics')}
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            color: '#fff',
            border: 'none',
            padding: '0.8rem 1.8rem',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
          }}
        >
          <Building size={18} /> MANAGE CLINICS
        </motion.button>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <SummaryCard label="Pending Donations" value={stats.pendingDonations} icon={Inbox} />
        <SummaryCard label="Accepted Stock" value={stats.acceptedDonations} icon={Package} />
        <SummaryCard label="Clinic Requirements" value={stats.pendingRequests} icon={FileSearch} />
        <SummaryCard label="Emergency Requests" value={stats.emergencyRequests} icon={AlertTriangle} />
      </div>

      {/* INVENTORY */}
      {!loading && Object.keys(inventory).length > 0 && (
        <div className="table-card">
          <h3 style={{ marginBottom: '1rem', color: '#94a3b8' }}>
            <Activity size={16} /> Live Inventory
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: '1rem' }}>
            {Object.entries(inventory).map(([item, qty]) => (
              <div
                key={item}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  padding: '1rem',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span>{item}</span>
                <strong>{qty}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DONATIONS */}
      <div className="table-card">
        <h2 className="table-header-title">Pending Donations</h2>
        <Table
          columns={[
            { key: 'id', label: 'ID' },
            { key: 'donor_name', label: 'Donor' },
            { key: 'resource_type', label: 'Item' },
            { key: 'quantity', label: 'Qty' },
            { key: 'status', label: 'Status' }
          ]}
          data={donations.slice(0, 5)}
          renderCell={(row, key) =>
            key === 'status' ? <StatusBadge status={row.status} /> : row[key]
          }
        />
      </div>
    </Layout>
  );
};

export default NgoDashboard;
