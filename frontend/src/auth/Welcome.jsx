import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, Handshake, FileCheck, Stethoscope, ArrowRight } from 'lucide-react';
import '../styles/Auth.css';
import CSREcosystemScene from '../components/CSREcosystemScene';
import Logo from '../components/Logo';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("3D Scene Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: '#ff3366', background: 'rgba(0,0,0,0.8)', borderRadius: '8px', textAlign: 'center' }}>
                    <h3>3D Scene Failed to Load</h3>
                    <p style={{ fontSize: '12px', opacity: 0.8 }}>{this.state.error?.message}</p>
                </div>
            );
        }

        return this.props.children;
    }
}

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
                <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <Logo size="large" />
                    </div>
                    <p className="login-subtitle" style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
                        Global Trust & Transparency Network
                    </p>
                </motion.div>

                {/* 3D Ecosystem Scene Replaces Static Grid */}
                <motion.div
                    variants={itemVariants}
                    style={{ marginBottom: '2rem', width: '100%', display: 'flex', justifyContent: 'center' }}
                >
                    <div style={{ width: '100%', maxWidth: '800px', position: 'relative' }}>
                        <div style={{
                            position: 'absolute',
                            top: -20,
                            left: 0,
                            right: 0,
                            textAlign: 'center',
                            zIndex: 10,
                            pointerEvents: 'none'
                        }}>
                            <span style={{
                                background: 'rgba(0,212,255,0.1)',
                                color: '#00d4ff',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                border: '1px solid rgba(0,212,255,0.3)',
                                backdropFilter: 'blur(4px)'
                            }}>
                                Interactive 3D Ecosystem • Click an entity to explore
                            </span>
                        </div>

                        <Suspense fallback={
                            <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                Loading 3D Environment...
                            </div>
                        }>
                            <ErrorBoundary>
                                <CSREcosystemScene
                                    onSelectRole={(roleId) => {
                                        // Map role IDs to navigation paths
                                        const pathMap = {
                                            'csr': '/register?role=csr',
                                            'ngo': '/register?role=ngo',
                                            'clinic': '/register?role=clinic',
                                            'auditor': '/register?role=auditor'
                                        };
                                        navigate(pathMap[roleId] || '/login');
                                    }}
                                />
                            </ErrorBoundary>
                        </Suspense>
                    </div>
                </motion.div>

                {/* Legacy List (Hidden or Small "View List" option could go here, but focusing on 3D for now) */}
                <motion.div variants={itemVariants} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', opacity: 0.6 }}>
                    {roles.map((role) => (
                        <div key={role.id} onClick={() => navigate(role.path)} style={{ cursor: 'pointer', fontSize: '0.8rem', color: role.color, border: `1px solid ${role.color}`, padding: '4px 8px', borderRadius: '4px' }}>
                            {role.label}
                        </div>
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
