import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auditorAPI, ngoAPI, clinicAPI } from '../services/api';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const alerts = [];
      setLoading(true);

      if (user?.role === 'auditor') {
        const [pendingCsr, pendingNgo] = await Promise.all([
          auditorAPI.getPendingCompanies().catch(() => []),
          auditorAPI.getPendingNGOs().catch(() => [])
        ]);
        const total = (pendingCsr?.length || 0) + (pendingNgo?.length || 0);
        if (total > 0) {
          alerts.push({
            id: 'audit-review',
            title: 'Review Applications',
            desc: `${total} CSR/NGO registrations pending verification`,
            time: 'Immediate Action Required',
            type: 'registration'
          });
        }
      } else if (user?.role === 'ngo') {
        const dashboardData = await ngoAPI.getDashboardData().catch(() => ({}));
        const requirements = dashboardData.clinic_requirements || [];
        const pendingReqs = requirements.filter(r => r.status === 'PENDING' || r.status === 'CLINIC_REQUESTED');

        if (pendingReqs.length > 0) {
          alerts.push({
            id: 'ngo-reqs',
            title: 'Clinic Requirements',
            desc: `${pendingReqs.length} pending clinic resource requests`,
            time: 'Action Required',
            type: 'requirement'
          });
        } else {
          const available = await ngoAPI.getAvailableDonations().catch(() => []);
          if (available.length > 0) {
            alerts.push({
              id: 'ngo-donations',
              title: 'Available Donations',
              desc: `${available.length} items ready for NGO acceptance`,
              time: 'New Items',
              type: 'donation'
            });
          }
        }
      } else if (user?.role === 'clinic') {
        const pending = await clinicAPI.getPendingAllocations().catch(() => []);
        if (pending.length > 0) {
          alerts.push({
            id: 'clinic-receipts',
            title: 'Confirm Receipts',
            desc: `${pending.length} incoming allocations to verify`,
            time: 'Action Required',
            type: 'receipt'
          });
        }
      }

      setNotifications(alerts.slice(0, 1)); // Strict: Keep only one notification
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every min
    return () => clearInterval(interval);
  }, [user]);

  const getRoleLabel = (role) => {
    const labels = {
      csr: 'CSR Partner',
      ngo: 'NGO Coordinator',
      clinic: 'Clinic Admin',
      auditor: 'Compliance Auditor',
    };
    return labels[role] || role;
  };

  const handleNotificationClick = (n) => {
    if (user?.role === 'auditor') navigate('/auditor/pending-requests');
    if (user?.role === 'ngo') {
      if (n.id === 'ngo-donations') navigate('/ngo/pending-donations');
      else navigate('/ngo/allocate');
    }
    if (user?.role === 'clinic') navigate('/clinic/receipts');
    setShowNotifications(false);
  };

  return (
    <header className="dashboard-navbar">
      <div className="navbar-content">
        <div></div>

        <div className="navbar-actions">
          <div className="notification-wrapper" style={{ position: 'relative' }}>
            <button
              className={`nav-icon-btn ${showNotifications ? 'active' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Bell size={20} color={notifications.length > 0 ? "#00e5ff" : "#94a3b8"} />
              {notifications.length > 0 && (
                <span className="notif-badge">{notifications.length}</span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="notif-dropdown"
                >
                  <div className="notif-header">
                    <h3>Action Required</h3>
                    <span className="notif-count">{notifications.length} Priority Alert</span>
                  </div>
                  <div className="notif-body">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className="notif-item" onClick={() => handleNotificationClick(n)}>
                          <div className="notif-icon-circle">
                            <AlertCircle size={14} color="#00e5ff" />
                          </div>
                          <div className="notif-info">
                            <p className="notif-title">{n.title}</p>
                            <p className="notif-desc">{n.desc}</p>
                            <span className="notif-time">{n.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="notif-empty">
                        <Clock size={24} color="#1e293b" />
                        <p>Chain is quiet. No pending actions.</p>
                      </div>
                    )}
                  </div>
                  <div className="notif-footer">
                    <button onClick={() => {
                      if (user?.role === 'auditor') navigate('/auditor/pending-requests');
                      if (user?.role === 'ngo') navigate('/ngo/allocate');
                      if (user?.role === 'clinic') navigate('/clinic/receipts');
                      setShowNotifications(false);
                    }}>Go to Actions Page</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="divider-vertical"></div>

          <div className="user-profile" onClick={() => navigate(`/${user?.role?.toLowerCase()}/settings`)} style={{ cursor: 'pointer' }}>
            <div className="user-info">
              <span className="user-role-badge">{getRoleLabel(user?.role)}</span>
            </div>
            <div className="user-avatar">
              <User size={18} color="#fff" />
            </div>
          </div>

          <div className="divider-vertical"></div>

          <button className="btn-logout" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
