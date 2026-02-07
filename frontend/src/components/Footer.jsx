import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Mail, Info, Lock } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const headingStyle = {
        fontFamily: "'Inter', sans-serif",
        fontSize: '1.2rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: '#f8fafc',
        margin: 0,
        textAlign: 'center',
        width: '100%'
    };

    const bodyStyle = {
        fontFamily: "'Inter', sans-serif",
        fontSize: '1rem',
        color: '#94a3b8',
        lineHeight: '1.6',
        fontWeight: 400
    };

    const linkStyle = {
        ...bodyStyle,
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '1.2rem',
        cursor: 'pointer'
    };

    const columnHeaderStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '2.5rem',
        height: '60px', // Fixed height for baseline alignment
        justifyContent: 'flex-start'
    };

    const accentLineStyle = {
        width: '40px',
        height: '3px',
        background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
        marginTop: '0.8rem',
        borderRadius: '2px'
    };

    return (
        <footer style={{
            background: 'linear-gradient(to bottom, #020617 0%, #0a0f1e 100%)',
            padding: '8rem 2rem 4rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.03)',
            position: 'relative',
            zIndex: 10
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '2.5rem',
                    marginBottom: '6rem',
                    alignItems: 'start'
                }}>
                    {/* Column 1 – Brand */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                            height: '60px',
                            display: 'flex',
                            alignItems: 'start',
                            marginBottom: '1.8rem',
                            transform: 'scale(0.85)',
                            transformOrigin: 'left top'
                        }}>
                            <Logo />
                        </div>
                        <p style={{ ...bodyStyle, maxWidth: '100%', fontSize: '0.95rem' }}>
                            Transforming social impact through blockchain-backed transparency.
                            We provide absolute proof for every donation and activity.
                        </p>
                    </div>

                    {/* Column 2 – Platform */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={columnHeaderStyle}>
                            <h4 style={headingStyle}>Platform</h4>
                            <div style={accentLineStyle}></div>
                        </div>
                        <div style={{ width: 'fit-content' }}>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {[
                                    'Verification Process',
                                    'Blockchain Audit',
                                    'CSR Network',
                                    'NGO Directory',
                                    'Impact Map'
                                ].map((item) => (
                                    <li key={item}>
                                        <motion.div
                                            style={linkStyle}
                                            whileHover={{ x: 5, color: '#3b82f6' }}
                                        >
                                            <ArrowRight size={16} style={{ flexShrink: 0, opacity: 0.5 }} />
                                            <span>{item}</span>
                                        </motion.div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Column 3 – Get in Touch */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={columnHeaderStyle}>
                            <h4 style={headingStyle}>Support</h4>
                            <div style={accentLineStyle}></div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: 'fit-content' }}>
                            <div style={{ ...bodyStyle, display: 'flex', alignItems: 'center', gap: '14px', whiteSpace: 'nowrap' }}>
                                <Mail size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
                                <span>admin@csr.gov.in</span>
                            </div>
                            <div style={{ ...bodyStyle, display: 'flex', alignItems: 'center', gap: '14px', width: 'max-content' }}>
                                <Info size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
                                <span>Official admin communication only</span>
                            </div>
                            <div style={{ ...bodyStyle, display: 'flex', alignItems: 'center', gap: '14px', width: 'max-content' }}>
                                <Lock size={20} color="#3b82f6" style={{ flexShrink: 0 }} />
                                <span>Secure platform-based support</span>
                            </div>
                        </div>
                    </div>

                    {/* Column 4 – Compliance */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={columnHeaderStyle}>
                            <h4 style={headingStyle}>Compliance</h4>
                            <div style={{ ...accentLineStyle, background: 'linear-gradient(90deg, transparent, #10b981, transparent)' }}></div>
                        </div>
                        <div style={{
                            padding: '1.8rem',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            width: '100%',
                            maxWidth: '280px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem' }}>
                                <ShieldCheck size={22} color="#10b981" />
                                <span style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 600 }}>ISO 27001 Certified</span>
                            </div>
                            <p style={{ ...bodyStyle, fontSize: '0.85rem', margin: 0, color: '#64748b', lineHeight: '1.6' }}>
                                Enterprise-grade security protocols active. All data transactions are encrypted, verifiable, and auditable.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    paddingTop: '2.5rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1.5rem'
                }}>
                    <p style={{ ...bodyStyle, fontSize: '0.85rem', opacity: 0.6 }}>
                        &copy; {currentYear} CSR HealthTrace. All rights reserved. Built on Zero-Trust Architecture.
                    </p>
                    <div style={{ display: 'flex', gap: '3rem' }}>
                        {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                            <a
                                key={item}
                                href="#"
                                style={{ ...bodyStyle, fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
                                onMouseOver={(e) => e.target.style.color = '#3b82f6'}
                                onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                            >
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
