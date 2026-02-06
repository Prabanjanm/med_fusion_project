import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell, Mail, Inbox, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auditorAPI } from '../services/api';
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
    if (user?.role === 'auditor') {
      try {
        setLoading(true);
        const [pendingCsr, pendingNgo] = await Promise.all([
          auditorAPI.getPendingCompanies(),
          auditorAPI.getPendingNGOs()
        ]);

        const alerts = [];
        pendingCsr.forEach(c => alerts.push({ id: `csr-${c.id}`, title: 'New CSR Registration', desc: c.company_name, time: 'Pending Action', type: 'registration' }));
        pendingNgo.forEach(n => alerts.push({ id: `ngo-${n.id}`, title: 'New NGO Registration', desc: n.ngo_name, time: 'Pending Action', type: 'registration' }));

        setNotifications(alerts);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
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

  return (
    <header className="dashboard-navbar">
      <div className="navbar-content">
        {/* Empty left side - logo only in sidebar */}
        <div></div>

        {/* Right Side: User Profile & Actions */}
        <div className="navbar-actions">
          {/* Real-time Notification Inbox */}
          <div className="notification-wrapper" style={{ position: 'relative' }}>
            <button
              className={`nav-icon-btn ${showNotifications ? 'active' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Inbox size={20} color={notifications.length > 0 ? "#00e5ff" : "#94a3b8"} />
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
                    <h3>Verification Inbox</h3>
                    <span className="notif-count">{notifications.length} Priority Alerts</span>
                  </div>
                  <div className="notif-body">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className="notif-item" onClick={() => { navigate('/auditor/pending-requests'); setShowNotifications(false); }}>
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
                    <button onClick={() => { navigate('/auditor/pending-requests'); setShowNotifications(false); }}>View All Applications</button>
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
