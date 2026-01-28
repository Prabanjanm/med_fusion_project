import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import InteractiveRipple from '../components/InteractiveRipple';
import AmbientHoverRipple from '../components/AmbientHoverRipple';
import CSRJourneyMap from '../components/CSRJourneyMap';
import Logo from '../components/Logo'; // New Import
import '../styles/Home.css';
import { FileText, ShieldCheck, Globe, Shield, Activity, Network, Building2, HeartHandshake, Stethoscope } from 'lucide-react';

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
                    <button className="btn btn-ghost" onClick={() => navigate('/login')}>Login</button>
                    <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started</button>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="section hero-section">
                <AmbientHoverRipple />
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="hero-content"
                >
                    <motion.h1 className="hero-title" variants={fadeInUp}>
                        Transparent CSR Tracking,<br />Built for Trust
                    </motion.h1>
                    <motion.p className="hero-subtitle" variants={fadeInUp}>
                        A verifiable, enterprise-grade platform for managing the entire corporate social responsibility lifecycle.
                    </motion.p>

                    {/* Animated CSR Workflow Visualization */}
                    <motion.div variants={fadeInUp} style={{ width: '100%', marginTop: '3rem' }}>
                        <CSRJourneyMap />
                    </motion.div>
                </motion.div>
            </section>

            {/* Who Is This For Section */}
            <section className="section bg-dim">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={staggerContainer}
                    className="info-section"
                >
                    <motion.h2 className="section-title" variants={fadeInUp}>Who Is This Platform For?</motion.h2>
                    <p className="section-subtitle">Empowering every key stakeholder in the CSR lifecycle.</p>

                    <div className="grid-4">
                        <motion.div className="feature-card" variants={fadeInUp}>
                            <AmbientHoverRipple />
                            <div className="card-icon"><Building2 size={40} /></div>
                            <h3 className="card-title">Corporates</h3>
                            <p className="card-desc">Manage funds with total transparency and ensure every rupee creates real impact.</p>
                        </motion.div>
                        <motion.div className="feature-card" variants={fadeInUp}>
                            <AmbientHoverRipple />
                            <div className="card-icon"><HeartHandshake size={40} /></div>
                            <h3 className="card-title">NGOs</h3>
                            <p className="card-desc">Gain credibility with verifiable data and streamline fund reporting.</p>
                        </motion.div>
                        <motion.div className="feature-card" variants={fadeInUp}>
                            <AmbientHoverRipple />
                            <div className="card-icon"><Stethoscope size={40} /></div>
                            <h3 className="card-title">Clinics</h3>
                            <p className="card-desc">Record on-ground impact efficiently and receive verified equipment support.</p>
                        </motion.div>
                        <motion.div className="feature-card" variants={fadeInUp}>
                            <AmbientHoverRipple />
                            <div className="card-icon"><ShieldCheck size={40} /></div>
                            <h3 className="card-title">Auditors</h3>
                            <p className="card-desc">Access immutable records to verify projects instantly and issue trusted reports.</p>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* Trust Signals Section */}
            <section className="section">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="info-section"
                >
                    <motion.h2 className="section-title" variants={fadeInUp}>Built on Trust & Verification</motion.h2>
                    <p className="section-subtitle">Enterprise-grade standards for modern social responsibility.</p>

                    <div className="grid-3">
                        <motion.div className="feature-card" variants={fadeInUp}>
                            <AmbientHoverRipple />
                            <div className="card-icon"><Shield size={40} /></div>
                            <h3 className="card-title">Audit Readiness</h3>
                            <p className="card-desc">Immutable records ensure every project is audit-ready at any time.</p>
                        </motion.div>
                        <motion.div className="feature-card" variants={fadeInUp}>
                            <AmbientHoverRipple />
                            <div className="card-icon"><Activity size={40} /></div>
                            <h3 className="card-title">Total Transparency</h3>
                            <p className="card-desc">Real-time fund tracking eliminates greenwashing and builds public trust.</p>
                        </motion.div>
                        <motion.div className="feature-card" variants={fadeInUp}>
                            <AmbientHoverRipple />
                            <div className="card-icon"><Globe size={40} /></div>
                            <h3 className="card-title">Global Compliance</h3>
                            <p className="card-desc">Automated reporting designed to meet modern international CSR mandates.</p>
                        </motion.div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Home;
