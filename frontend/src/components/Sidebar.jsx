import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    PlusCircle,
    History,
    Activity,
    FileText,
    Truck,
    ClipboardList,
    CheckSquare,
    Users,
    Building2,
    Settings,
    ShieldCheck,
    Package,
    ShoppingCart
} from 'lucide-react';
import '../styles/Sidebar.css';

const Sidebar = ({ role }) => {
    // Define menus for each role
    const menus = {
        csr: [
            { path: '/csr', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/csr/create-donation', label: 'New Donation', icon: PlusCircle },
            { path: '/csr/history', label: 'History', icon: History },
            { path: '/csr/status', label: 'Track Status', icon: Activity },
            { path: '/csr/verify-and-record', label: 'Verify & Record', icon: ShieldCheck },
            { path: '/settings', label: 'Settings', icon: Settings },
        ],
        ngo: [
            { path: '/ngo', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/ngo/pending-donations', label: 'Available Donations', icon: Package },
            { path: '/ngo/allocate', label: 'Allocate Items', icon: Truck },
            { path: '/ngo/history', label: 'History', icon: History },
            { path: '/ngo/manage-clinics', label: 'Clinics', icon: Building2 },
            { path: '/verify', label: 'Verify & Record', icon: ShieldCheck },
            { path: '/settings', label: 'Settings', icon: Settings },
        ],
        clinic: [
            { path: '/clinic', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/clinic/request-products', label: 'Request Supply', icon: ShoppingCart },
            { path: '/clinic/request-status', label: 'My Allocations', icon: Activity },
            { path: '/clinic/receipts', label: 'Confirm Receipt', icon: CheckSquare },
            { path: '/verify', label: 'Verify & Record', icon: ShieldCheck },
            { path: '/settings', label: 'Settings', icon: Settings },
        ],
        auditor: [
            { path: '/auditor', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/auditor/trail', label: 'Audit Trail', icon: FileText },
            { path: '/auditor/csr-registry', label: 'CSR Registry', icon: Building2 },
            { path: '/auditor/ngo-registry', label: 'NGO Registry', icon: Users },
            { path: '/auditor/pending-requests', label: 'Pending Reviews', icon: ClipboardList },
            { path: '/settings', label: 'Settings', icon: Settings },
            { path: '/verify', label: 'Verify & Record', icon: ShieldCheck },
        ]
    };

    const currentMenu = menus[(role || '').toLowerCase()] || [];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <ShieldCheck className="logo-icon" />
                <span className="brand-name">CSR Track</span>
            </div>

            <nav className="sidebar-nav">
                {currentMenu.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        end={item.path === `/${role}`} // Only exact match for dashboard home
                    >
                        <item.icon size={20} className="nav-icon" />
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <p>SECURE • TRANSPARENT</p>
                <p style={{ marginTop: '5px' }}>v1.0.0 Beta</p>
            </div>
        </aside>
    );
};

export default Sidebar;
