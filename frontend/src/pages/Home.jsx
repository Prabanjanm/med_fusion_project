import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InteractiveRipple from '../components/InteractiveRipple';
import AmbientHoverRipple from '../components/AmbientHoverRipple';
import CSRJourneyMap from '../components/CSRJourneyMap'; // Restored Import
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import '../styles/Home.css';
import { ShieldCheck, CheckCircle, Search, FileCheck, Lock, ArrowRight, Eye } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="home-container">
            <InteractiveRipple />
            {/* Navbar */}
            <motion.nav
                className="navbar"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="logo-container" style={{ transform: 'scale(0.8)', transformOrigin: 'left center', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <Logo />
                </div>
                <div className="nav-actions">
                    <button className="btn btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
                    <button className="btn btn-primary" onClick={() => navigate('/register')}>Start Verification</button>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="section hero-section" style={{ minHeight: '90vh', justifyContent: 'center', paddingTop: '8rem', paddingBottom: '4rem' }}>
                <AmbientHoverRipple />
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="hero-content"
                    style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 10 }}
                >
                    <motion.div variants={fadeInUp} style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'center' }}>
                        <div style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '100px',
                            border: '1px solid rgba(148, 163, 184, 0.1)',
                            background: 'rgba(255,255,255,0.02)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem'
                        }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa' }}></span>
                            <span style={{
                                color: '#94a3b8',
                                fontSize: '0.8rem',
                                fontWeight: '500',
                                letterSpacing: '1px',
                                textTransform: 'uppercase'
                            }}>
                                The Future of Integrity
                            </span>
                        </div>
                    </motion.div>

                    <motion.h1 className="hero-title" variants={fadeInUp} style={{ fontSize: '4.5rem', lineHeight: '1.1', marginBottom: '2.5rem', letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif', fontWeight: '800', color: '#f8fafc' }}>
                        Opacity is the enemy<br />
                        <span style={{ color: '#94a3b8' }}>of social impact.</span>
                    </motion.h1>

                    <motion.p className="hero-subtitle" variants={fadeInUp} style={{ fontSize: '1.25rem', color: '#64748b', lineHeight: '1.8', maxWidth: '650px', margin: '0 auto 5rem auto', fontWeight: '400' }}>
                        The first platform that eliminates doubt from social responsibility. We replace manual promises with mathematical proof.
                    </motion.p>

                    {/* Enhanced Trust Signals */}
                    <motion.div
                        variants={fadeInUp}
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '3rem',
                            marginBottom: '6rem',
                            flexWrap: 'wrap'
                        }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '1rem',
                                color: '#e2e8f0',
                                fontWeight: '500',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '99px',
                                background: 'rgba(59, 130, 246, 0.05)',
                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                cursor: 'default',
                                transition: 'all 0.3s'
                            }}
                        >
                            <Lock size={18} color="#3b82f6" />
                            <span>Immutable Records</span>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '1rem',
                                color: '#e2e8f0',
                                fontWeight: '500',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '99px',
                                background: 'rgba(16, 185, 129, 0.05)',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                cursor: 'default',
                                transition: 'all 0.3s'
                            }}
                        >
                            <CheckCircle size={18} color="#10b981" />
                            <span>Real-Time Verification</span>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '1rem',
                                color: '#e2e8f0',
                                fontWeight: '500',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '99px',
                                background: 'rgba(168, 85, 247, 0.05)',
                                border: '1px solid rgba(168, 85, 247, 0.2)',
                                cursor: 'default',
                                transition: 'all 0.3s'
                            }}
                        >
                            <ShieldCheck size={18} color="#a855f7" />
                            <span>Audit-Ready</span>
                        </motion.div>
                    </motion.div>

                    {/* Restored Moving Truck / CSR Journey Map */}
                    <motion.div variants={fadeInUp} style={{ width: '100%' }}>
                        <CSRJourneyMap />
                    </motion.div>
                </motion.div>
            </section>

            {/* INTERACTIVE PROOF SECTION WITH HOVER */}
            <section className="section" style={{ 
                padding: '8rem 0', 
                background: 'linear-gradient(to bottom, transparent 0%, #020617 20%, #0f172a 80%, transparent 100%)', 
                position: 'relative', 
                overflow: 'hidden' 
            }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
                        <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: '2.5rem', fontWeight: '700', color: '#fff', marginBottom: '1rem', letterSpacing: '-1px' }}>
                            Claims become records.
                        </h2>
                        <p style={{ fontSize: '1.2rem', color: '#64748b' }}>Watch how vague assertions are transformed into immutable data.</p>
                    </div>

                    {/* The Transformation Visual with Hover Outline */}
                    <motion.div
                        whileHover={{
                            borderColor: 'rgba(59, 130, 246, 0.4)',
                            boxShadow: '0 0 60px rgba(59, 130, 246, 0.08)',
                            scale: 1.01
                        }}
                        transition={{ duration: 0.3 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto 1fr',
                            gap: '2rem',
                            alignItems: 'center',
                            background: 'rgba(30, 41, 59, 0.2)',
                            padding: '4rem',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.03)',
                            cursor: 'default'
                        }}
                    >
                        {/* LEFT: The Claim (Fading/Unsure) */}
                        <div style={{ textAlign: 'center', opacity: 0.5 }}>
                            <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem auto', background: '#334155', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileCheck size={32} color="#94a3b8" />
                            </div>
                            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>"We funded a clinic."</h3>
                            <span style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic' }}>Unverified Claim</span>
                        </div>

                        {/* CENTER: The Verification Lens */}
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                style={{ position: 'absolute', width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)' }}
                            />
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%',
                                background: '#0f172a', border: '1px solid #3b82f6',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                zIndex: 2,
                                boxShadow: '0 0 30px rgba(59, 130, 246, 0.2)'
                            }}>
                                <ArrowRight size={24} color="#3b82f6" />
                            </div>
                        </div>

                        {/* RIGHT: The Proof (Solid/Trusted) */}
                        <div style={{ textAlign: 'center' }}>
                            <motion.div
                                style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem auto', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                                animate={{ boxShadow: ['0 0 0px rgba(16, 185, 129, 0)', '0 0 20px rgba(16, 185, 129, 0.2)', '0 0 0px rgba(16, 185, 129, 0)'] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <ShieldCheck size={32} color="#10b981" />
                            </motion.div>
                            <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>Verified Transaction #92A</h3>
                            <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: '600', letterSpacing: '0.5px' }}>IMMUTABLE PROOF</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
