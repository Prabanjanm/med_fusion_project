import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CSRFlowAnimation from '../components/CSRFlowAnimation';
import '../styles/Home.css';

/**
 * Home Landing Page - Professional Layout
 * Clean top navigation, centered immersive 3D animation
 */
const Home = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);

    // Navigate after zoom animation
    const handleRoleClick = (roleId) => {
        setSelectedRole(roleId);
        // Delay navigation slightly to allow for zoom animation
        setTimeout(() => {
            navigate(`/register?role=${roleId}`);
        }, 1500);
    };

    return (
        <div className="home-page">
            {/* Top Navigation Bar */}
            <motion.nav
                className="top-nav"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="nav-logo">CSR TRACKER</div>
                <div className="nav-links">
                    <button className="nav-btn nav-btn-ghost" onClick={() => navigate('/login')}>Login</button>
                    <button className="nav-btn nav-btn-primary" onClick={() => navigate('/register')}>Get Started</button>
                </div>
            </motion.nav>

            {/* Main 3D Animation Container */}
            <div className="animation-wrapper">
                <CSRFlowAnimation onRoleClick={handleRoleClick} selectedRole={selectedRole} />
            </div>

            {/* Bottom Helper Text (Optional, fades out on selection) */}
            <AnimatePresence>
                {!selectedRole && (
                    <motion.div
                        className="bottom-helper"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 1 }}
                    >
                        <p>Select your role to begin</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
