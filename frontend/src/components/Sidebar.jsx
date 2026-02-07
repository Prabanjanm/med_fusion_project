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
    ShoppingCart,
    Stethoscope
} from 'lucide-react';
import Logo from './Logo';
import '../styles/Sidebar.css';

const Sidebar = ({ role }) => {
    // Define menus for each role
    const menus = {
        csr: [
            { path: '/csr', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/csr/create-donation', label: 'Create Donation', icon: PlusCircle },
            { path: '/csr/history', label: 'Donation History', icon: History },
            { path: '/auditor/trail', label: 'Audit Trail', icon: ShieldCheck },
            { path: '/settings', label: 'Settings', icon: Settings },
        ],
        ngo: [
            { path: '/ngo', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/ngo/pending-donations', label: 'Available Donations', icon: Package },
            { path: '/ngo/allocate', label: 'Allocate Items', icon: Truck },
            { path: '/ngo/history', label: 'History', icon: History },
            { path: '/ngo/manage-clinics', label: 'Clinics', icon: Building2 },
            { path: '/auditor/trail', label: 'Audit Trail', icon: ShieldCheck },
            { path: '/settings', label: 'Settings', icon: Settings },
        ],
        clinic: [
            { path: '/clinic', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/clinic/request-products', label: 'Request Requirements', icon: ShoppingCart },
            { path: '/clinic/request-status', label: 'My Allocations', icon: Activity },
            { path: '/clinic/receipts', label: 'Confirm Receipt', icon: CheckSquare },
            { path: '/auditor/trail', label: 'Audit Trail', icon: ShieldCheck },
            { path: '/settings', label: 'Settings', icon: Settings },
        ],
        auditor: [
            { path: '/auditor', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/auditor/trail', label: 'Audit Trail', icon: FileText },
            { path: '/auditor/csr-registry', label: 'CSR Registry', icon: Building2 },
            { path: '/auditor/ngo-registry', label: 'NGO Registry', icon: Users },
            { path: '/auditor/clinic-registry', label: 'Clinic Registry', icon: Stethoscope },
            { path: '/auditor/pending-requests', label: 'Pending Reviews', icon: ClipboardList },
            { path: '/auditor/settings', label: 'Settings', icon: Settings },
        ]
    };

    const currentRole = (role || '').toLowerCase();

    // Update simple /settings to role-prefixed settings for consistency across all roles
    const currentMenu = (menus[currentRole] || []).map(item => {
        if (item.path === '/settings') return { ...item, path: `/${currentRole}/settings` };
        return item;
    });

    return (
        <aside className="sidebar">
            <div className="sidebar-header" style={{ paddingLeft: '1.2rem' }}>
                <Logo size="small" />
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
