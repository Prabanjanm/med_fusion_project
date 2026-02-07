import React, { useState, useEffect } from 'react';
import { User, Activity, FileText, Search, Building, ChevronDown, History } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import SummaryCard from '../components/SummaryCard';
import '../styles/DashboardLayout.css';
import { auditorAPI } from '../services/api';

const AuditorCsrRegistry = () => {
    const [loading, setLoading] = useState(true);
    const [csrs, setCsrs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await auditorAPI.getCsrRegistry().catch(() => []);
                // Map Backend Data to UI Model
                setCsrs(data.map(c => ({
                    id: c.company_id || c.id,
                    name: c.company_name || c.name || 'Unregistered Entity',
                    details: c.cin ? `CIN: ${c.cin}` : 'No CIN Records',
                    contact: c.official_email || c.email || 'No Contact Data',
                    total_donations: c.total_donations || 0,
                    last_active: c.last_active || null,
                    status: c.is_verified ? 'ACTIVE' : (c.status || 'PENDING_VERIFICATION'),
                    history: []
                })));
            } catch (error) {
                console.error("Failed to fetch CSR registry", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleRow = async (id) => {
        if (expandedRow === id) {
            setExpandedRow(null);
            return;
        }
        setExpandedRow(id);

        // Fetch real-time activity when expanded
        try {
            const detail = await auditorAPI.getCsrActivity(id);
            setCsrs(prev => prev.map(c => {
                if (c.id === id) {
                    return {
                        ...c,
                        total_donations: detail.donations.length,
                        history: detail.donations.map(d => ({
                            action: d.status,
                            target: d.ngo_id ? `NGO #${d.ngo_id}` : 'General Pool',
                            date: new Date(d.authorized_at || d.created_at).toLocaleDateString()
                        }))
                    };
                }
                return c;
            }));
        } catch (error) {
            console.error("Failed to fetch CSR activity", error);
        }
    };

    const stats = {
        total: csrs.length,
        active: csrs.filter(c => c.status === 'ACTIVE').length,
        inactive: csrs.filter(c => c.status !== 'ACTIVE').length
    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">CSR Registry</h1>
                    <p className="page-subtitle">Registered Corporate Partners & Activity Logs</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search CSRs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.75rem 1rem 0.75rem 2.5rem',
                            background: 'rgba(15, 23, 42, 0.6)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            minWidth: '300px'
                        }}
                    />
                </div>
            </div>



            {/* Stats Grid */}
            <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                <SummaryCard
                    label="Total Registered"
                    value={loading ? "-" : stats.total}
                    color="#3b82f6"
                    icon={Building}
                />
                <SummaryCard
                    label="Active Partners"
                    value={loading ? "-" : stats.active}
                    color="#10b981"
                    icon={Activity}
                />
                <SummaryCard
                    label="Inactive/Suspended"
                    value={loading ? "-" : stats.inactive}
                    color="#64748b"
                    icon={FileText}
                />
            </div>

            <div className="table-card">
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading registry...</div>
                ) : csrs.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Empty Registry</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {csrs.filter(csr =>
                            csr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (csr.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (csr.contact || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (csr.id && csr.id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
                        ).map(csr => (
                            <div key={csr.id} style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                overflow: 'hidden'
                            }}>
                                <div
                                    onClick={() => toggleRow(csr.id)}
                                    style={{
                                        padding: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        background: expandedRow === csr.id ? 'rgba(255,255,255,0.03)' : 'transparent'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '50%',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '1px solid rgba(59, 130, 246, 0.2)'
                                        }}>
                                            <Building size={24} color="#3b82f6" />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{csr.name}</h3>
                                            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>{csr.details}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Donations</p>
                                            <p style={{ margin: 0, color: '#fff', fontWeight: '600' }}>{csr.total_donations}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Last Active</p>
                                            <p style={{ margin: 0, color: '#fff', fontWeight: '600' }}>{new Date(csr.last_active).toLocaleDateString()}</p>
                                        </div>
                                        <StatusBadge status={csr.status} />
                                        <div style={{ marginLeft: '1rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                                            {expandedRow === csr.id ? <ChevronDown size={20} /> : <History size={20} title="View History" />}
                                        </div>
                                    </div>
                                </div>

                                {expandedRow === csr.id && (
                                    <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ color: '#fff', marginTop: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Activity size={18} color="#3b82f6" />
                                            Recent History
                                        </h4>

                                        {csr.history.length > 0 ? (
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'left' }}>
                                                        <th style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Action</th>
                                                        <th style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Target</th>
                                                        <th style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {csr.history.map((h, i) => (
                                                        <tr key={i} style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                                            <td style={{ padding: '0.75rem' }}>{h.action}</td>
                                                            <td style={{ padding: '0.75rem' }}>{h.target}</td>
                                                            <td style={{ padding: '0.75rem' }}>{h.date}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>No recent activity recorded.</p>
                                        )}

                                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                            <h4 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '0.95rem' }}>Full Details</h4>
                                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                                                <strong>Contact:</strong> {csr.contact}<br />
                                                <strong>Registered ID:</strong> {csr.id}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AuditorCsrRegistry;
