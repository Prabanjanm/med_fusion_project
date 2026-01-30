import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Handshake, Stethoscope, FileCheck, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import '../styles/Auth.css';

const RoleSelection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [hoveredRole, setHoveredRole] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);

    // Determine intent (login vs register) 
    // Check both query param (preferred) and location state (fallback)
    const mode = searchParams.get('mode');
    const isRegisterIntent = mode === 'register' || location.state?.intent === 'register';

    const roles = [
        {
            id: 'corporate',
            label: 'Corporate Donor',
            desc: 'Fund and track CSR projects with transparency.',
            icon: <Building2 size={32} />,
            color: '#00d4ff'
        },
        {
            id: 'ngo',
            label: 'NGO Partner',
            desc: 'Manage projects and receive fast allocations.',
            icon: <Handshake size={32} />,
            color: '#00ff9d'
        },
        {
            id: 'clinic',
            label: 'Medical Clinic',
            desc: 'Receive medical inventory and verify receipts.',
            icon: <Stethoscope size={32} />,
            color: '#f97316'
        },
        {
            id: 'auditor',
            label: 'Official Auditor',
            desc: 'Verify transactions and compliance logs.',
            icon: <FileCheck size={32} />,
            color: '#94a3b8'
        },
    ];

    const handleRoleSelect = (roleId) => {
        setSelectedRole(roleId);

        // Map role ID to route friendly term if needed (currently they match mostly)
        // corporate -> csr due to route param mapping elsewhere? 
        // Let's stick to what App.jsx uses for :roleId.
        // The RoleSelection uses 'corporate' but App.jsx and RegisterCompany use 'csr'.
        // We should normalize here.
        const routeRole = roleId === 'corporate' ? 'csr' : roleId;

        setTimeout(() => {
            if (isRegisterIntent) {
                navigate(`/register/${routeRole}`);
            } else {
                navigate(`/login/${routeRole}`);
            }
        }, 800);
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.8, ease: "easeOut" }
        },
        exit: { opacity: 0, transition: { duration: 0.2 } }
    };

    const cardVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        hover: {
            borderColor: "rgba(255,255,255,0.2)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.05), inset 0 0 20px rgba(255,255,255,0.02)",
            transition: { duration: 0.3 }
        }
    };

    return (
        <div className="login-wrapper" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem'
        }}>
            <AnimatePresence mode="wait">
                {!selectedRole ? (
                    <motion.div
                        key="content"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={{
                            width: '100%',
                            maxWidth: '1100px', // Slightly wider for breathability
                            background: 'rgba(10, 15, 30, 0.6)', // Deep premium dark
                            backdropFilter: 'blur(16px)', // Soft frost
                            borderRadius: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.06)', // Outer rim
                            boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)', // Depth + Top highlight
                            padding: '4rem 3rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <motion.div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                                padding: '6px 14px', borderRadius: '30px',
                                marginBottom: '1.2rem', border: '1px solid rgba(255,255,255,0.08)',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                            }}>
                                <ShieldCheck size={14} color="#00ff9d" />
                                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '500', letterSpacing: '0.5px' }}>SECURE ACCESS PORTAL</span>
                            </div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: '700', color: '#fff', marginBottom: '0.8rem', letterSpacing: '-0.5px' }}>Select Your Portal</h1>
                            <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '550px', margin: '0 auto', lineHeight: '1.6' }}>
                                Identify your role to access the dedicated secure dashboard.
                            </p>
                        </motion.div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)', // STRICT 4-COLUMN ROW
                            gap: '24px',
                            width: '100%'
                        }}>
                            {roles.map((role) => {
                                const isHovered = hoveredRole === role.id;
                                const isDimmed = hoveredRole && !isHovered;

                                return (
                                    <motion.div
                                        key={role.id}
                                        variants={cardVariants}
                                        initial="visible" // No staggered entrance
                                        whileHover="hover"
                                        animate={isDimmed ? { opacity: 0.4 } : { opacity: 1 }}
                                        onHoverStart={() => setHoveredRole(role.id)}
                                        onHoverEnd={() => setHoveredRole(null)}
                                        onClick={() => handleRoleSelect(role.id)}
                                        style={{
                                            background: 'rgba(255,255,255,0.015)',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            borderRadius: '16px',
                                            padding: '2.5rem 1.5rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            position: 'relative',
                                            height: '320px', // Fixed height for uniformity
                                            transition: 'opacity 0.3s ease'
                                        }}
                                    >
                                        {/* Premium "Cut" Corner Effect - simulated with pseudo-borders if CSS allowed, but using subtle inset shadow here */}
                                        <div style={{
                                            position: 'absolute', inset: 0, borderRadius: '16px',
                                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                                            pointerEvents: 'none'
                                        }} />

                                        {/* Icon Container - Orbit Ring */}
                                        <div style={{
                                            width: '80px', height: '80px', borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${role.color}10 0%, rgba(0,0,0,0) 100%)`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            marginBottom: '2rem',
                                            color: role.color,
                                            border: `1px solid ${role.color}15`,
                                            position: 'relative'
                                        }}>
                                            {/* Subtle Orbit Ring */}
                                            <div style={{
                                                position: 'absolute', inset: '-4px', borderRadius: '50%',
                                                border: `1px solid ${role.color}10`,
                                                opacity: 0.6
                                            }} />

                                            {role.icon}
                                        </div>

                                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.8rem', fontWeight: '600' }}>{role.label}</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 'auto', lineHeight: '1.5', padding: '0 5px' }}>
                                            {role.desc}
                                        </p>

                                        {/* Footer - Minimal Text */}
                                        <div style={{
                                            marginTop: '2rem',
                                            color: isHovered ? role.color : '#475569',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            transition: 'color 0.3s ease'
                                        }}>
                                            Enter Portal <ArrowRight size={14} />
                                        </div>

                                        {/* Hover Glow Edge / Bottom Line */}
                                        <motion.div
                                            initial={{ scaleX: 0, opacity: 0 }}
                                            animate={isHovered ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                                            style={{
                                                position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '1px',
                                                background: `linear-gradient(90deg, transparent, ${role.color}, transparent)`,
                                            }}
                                        />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="transition"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {/* Simple Premium Loader */}
                        <div style={{
                            width: '60px', height: '60px',
                            borderRadius: '50%',
                            border: '2px solid rgba(255,255,255,0.1)',
                            borderTopColor: roles.find(r => r.id === selectedRole).color,
                            marginBottom: '1.5rem',
                            animation: 'spin 1s linear infinite' // Assuming global spin keyframe, or add style
                        }} />
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

                        <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '500', letterSpacing: '0.5px' }}>
                            Accessing Secure Portal...
                        </h2>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoleSelection;
