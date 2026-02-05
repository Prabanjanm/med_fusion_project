import React, { useState, useEffect } from 'react';
import { Truck, Activity, Search, Building2, Package } from 'lucide-react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import SummaryCard from '../components/SummaryCard';
import '../styles/DashboardLayout.css';
import { auditorAPI } from '../services/api';

const AuditorNgoRegistry = () => {
    const [loading, setLoading] = useState(true);
    const [ngos, setNgos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRow, setExpandedRow] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await auditorAPI.getNgoRegistry().catch(() => []);
                // Map Backend Data to UI Model
                setNgos(data.map(n => ({
                    id: n.ngo_id || n.id,
                    name: n.ngo_name || n.name || 'Unregistered NGO',
                    details: n.csr_1_number ? `CSR1: ${n.csr_1_number}` : 'Awaiting Documentation',
                    contact: n.official_email || n.email || 'No Contact Data',
                    pending_donations: n.pending_donations || 0,
                    allocations_made: n.allocations_made || 0,
                    status: n.is_verified ? 'ACTIVE' : (n.status || 'UNDER_REVIEW'),
                    history: []
                })));
            } catch (error) {
                console.error("Failed to fetch NGO registry", error);
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

        // Fetch real-time activity and clinic allocations when expanded
        try {
            const detail = await auditorAPI.getNgoActivity(id);
            setNgos(prev => prev.map(n => {
                if (n.id === id) {
                    return {
                        ...n,
                        allocations_made: detail.donations.filter(d => d.allocation).length,
                        pending_donations: detail.donations.length,
                        history: detail.donations.map(d => ({
                            action: d.allocation?.received ? 'DELIVERED TO CLINIC' : (d.allocation ? 'ALLOCATED TO CLINIC' : 'ACCEPTED BY NGO'),
                            target: d.item_name,
                            date: new Date(d.allocation?.allocated_at || d.authorized_at || d.created_at).toLocaleDateString()
                        }))
                    };
                }
                return n;
            }));
        } catch (error) {
            console.error("Failed to fetch NGO activity", error);
        }
    };

    const stats = {
        total: ngos.length,
        active: ngos.filter(n => n.status === 'ACTIVE').length,
        pending: ngos.filter(n => n.status === 'UNDER_REVIEW').length
    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">NGO Registry</h1>
                    <p className="page-subtitle">Partner NGOs & Operational History</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search NGOs..."
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
                    label="Total NGOs"
                    value={loading ? "-" : stats.total}
                    color="#10b981"
                    icon={Building2}
                />
                <SummaryCard
                    label="Active Partners"
                    value={loading ? "-" : stats.active}
                    color="#10b981"
                    icon={Activity}
                />
                <SummaryCard
                    label="Under Review"
                    value={loading ? "-" : stats.pending}
                    color="#f59e0b"
                    icon={Search}
                />
            </div>

            <div className="table-card">
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading registry...</div>
                ) : ngos.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Empty Registry</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {ngos.filter(ngo =>
                            ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (ngo.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (ngo.contact || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (ngo.id && ngo.id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
                        ).map(ngo => (
                            <div key={ngo.id} style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                overflow: 'hidden'
                            }}>
                                <div
                                    onClick={() => toggleRow(ngo.id)}
                                    style={{
                                        padding: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        background: expandedRow === ngo.id ? 'rgba(255,255,255,0.03)' : 'transparent'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '50%',
                                            background: 'rgba(16, 185, 129, 0.1)', /* Greenish for NGO */
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '1px solid rgba(16, 185, 129, 0.2)'
                                        }}>
                                            <Building2 size={24} color="#10b981" />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{ngo.name}</h3>
                                            <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.9rem' }}>{ngo.details}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Allocations</p>
                                            <p style={{ margin: 0, color: '#fff', fontWeight: '600' }}>{ngo.allocations_made}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>Pending</p>
                                            <p style={{ margin: 0, color: '#fff', fontWeight: '600' }}>{ngo.pending_donations}</p>
                                        </div>
                                        <StatusBadge status={ngo.status} />
                                    </div>
                                </div>

                                {expandedRow === ngo.id && (
                                    <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ color: '#fff', marginTop: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Activity size={18} color="#10b981" />
                                            Operating History
                                        </h4>

                                        {ngo.history.length > 0 ? (
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'left' }}>
                                                        <th style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Action</th>
                                                        <th style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Target</th>
                                                        <th style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ngo.history.map((h, i) => (
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

                                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                            <h4 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '0.95rem' }}>Full Details</h4>
                                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                                                <strong>Contact:</strong> {ngo.contact}<br />
                                                <strong>Registered ID:</strong> {ngo.id}
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

export default AuditorNgoRegistry;
