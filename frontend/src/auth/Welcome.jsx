import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, Handshake, FileCheck, Stethoscope, ArrowRight } from 'lucide-react';
import '../styles/Auth.css';

const Welcome = () => {
    const navigate = useNavigate();

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

    const roles = [
        {
            id: 'corporate',
            label: 'Corporate',
            icon: <Building2 size={32} />,
            desc: 'CSR Donors & Enterprises',
            color: '#00d4ff',
            path: '/register?role=csr'
        },
        {
            id: 'ngo',
            label: 'NGO',
            icon: <Handshake size={32} />,
            desc: 'Non-Profit Partners',
            color: '#00ff9d',
            path: '/register?role=ngo'
        },
        {
            id: 'auditor',
            label: 'Auditor',
            icon: <FileCheck size={32} />,
            desc: 'Compliance Verifiers',
            color: '#f59e0b',
            path: '/register?role=auditor'
        },
        {
            id: 'clinic',
            label: 'Clinic',
            icon: <Stethoscope size={32} />,
            desc: 'Healthcare Providers',
            color: '#ff0055',
            path: '/register?role=clinic'
        }
    ];

    return (
        <div className="login-wrapper">
            <motion.div
                className="welcome-container"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                style={{
                    maxWidth: '900px',
                    width: '100%',
                    padding: '2rem',
                    zIndex: 10
                }}
            >
                <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 className="login-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '2px' }}>
                        CSR COMPLIANCE NETWORK
                    </h1>
                    <p className="login-subtitle" style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
                        Select your role to begin
                    </p>
                </motion.div>

                <motion.div
                    className="roles-grid"
                    variants={itemVariants}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '3rem'
                    }}
                >
                    {roles.map((role) => (
                        <motion.div
                            key={role.id}
                            whileHover={{
                                y: -5,
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                boxShadow: `0 0 20px ${role.color}40`,
                                borderColor: role.color
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(role.path)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                padding: '2rem',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                        >
                            <div
                                style={{
                                    color: role.color,
                                    padding: '1rem',
                                    background: `${role.color}15`,
                                    borderRadius: '12px',
                                    marginBottom: '0.5rem'
                                }}
                            >
                                {role.icon}
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{role.label}</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{role.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div variants={itemVariants} style={{ textAlign: 'center' }}>
                    <div
                        onClick={() => navigate('/login')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            opacity: 0.8,
                            transition: 'opacity 0.2s',
                            background: 'rgba(255, 255, 255, 0.05)',
                            padding: '10px 24px',
                            borderRadius: '30px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                    >
                        <span>Already registered?</span>
                        <span style={{ color: '#00d4ff', fontWeight: 600 }}>Login</span>
                        <ArrowRight size={16} color="#00d4ff" />
                    </div>
                </motion.div>

            </motion.div>

            {/* Optional Background styling override if needed for this specific page to ensure it matches the request */}
            <style>{`
        .roles-grid > div:hover h3 {
          text-shadow: 0 0 10px rgba(255,255,255,0.5);
        }
      `}</style>
        </div>
    );
};

export default Welcome;
