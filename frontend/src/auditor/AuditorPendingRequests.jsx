import React from 'react';
import Layout from '../components/Layout';
import { UserCheck } from 'lucide-react';
import UserApprovals from './UserApprovals';
import '../styles/DashboardLayout.css';

const AuditorPendingRequests = () => {
    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Pending Requests</h1>
                    <p className="page-subtitle">Review and approve new registration requests</p>
                </div>
            </div>

            {/* Render all pending approvals without filter */}
            <UserApprovals />
        </Layout>
    );
};

export default AuditorPendingRequests;
