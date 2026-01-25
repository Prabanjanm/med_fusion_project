import React from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import PageTransition from './PageTransition';
import '../styles/DashboardLayout.css';

/**
 * Main Layout Component
 * Wraps all dashboard pages with Persistent Sidebar + Sticky Navbar
 */
const Layout = ({ children }) => {
    const { user } = useAuth();

    return (
        <div className="app-container">
            {/* Persistent Left Sidebar */}
            <Sidebar role={user?.role || 'csr'} />

            {/* Main Content Area */}
            <div className="main-content-wrapper">
                <Navbar />

                {/* Dynamic Page Content */}
                <main className="page-container">
                    <PageTransition>
                        {children}
                    </PageTransition>
                </main>
            </div>
        </div>
    );
};

export default Layout;
