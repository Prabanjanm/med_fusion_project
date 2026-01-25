import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import '../styles/DashboardLayout.css';

/**
 * MainLayout Component
 * Wraps protected pages with navigation and sidebar
 */
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="main-layout">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="layout-body">
        <Sidebar isOpen={sidebarOpen} />
        <main className="main-content">
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
