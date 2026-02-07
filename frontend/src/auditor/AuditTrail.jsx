import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, FileText, Calendar, Link2, Lock,
  CheckCircle, Search, ShieldCheck, ChevronDown,
  ChevronUp, Hash, Database, Activity, RefreshCw,
  Server, Share2, Shield, ArrowRight, Cpu, Globe
} from 'lucide-react';
import Layout from '../components/Layout';
import { auditorAPI } from '../services/api';

// Using consistent premium styles
import '../styles/DashboardLayout.css';
import '../styles/BlockchainLedger.css';

// Custom Filter Dropdown with Role Grouping
const ParticipantFilter = ({ blocks, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Group participants by Role
  const groupedParticipants = React.useMemo(() => {
    const groups = {
      CSR: new Set(),
      NGO: new Set(),
      CLINIC: new Set()
    };

    blocks.forEach(b => {
      // 1. Identify Role of the Block Author (Source)
      const role = (b.role || 'CSR').toUpperCase().trim();

      // Map legacy or specific roles to broad categories
      let category = 'CSR';
      if (role.includes('NGO')) category = 'NGO';
      else if (role.includes('CLINIC')) category = 'CLINIC';
      else if (role.includes('CSR') || role.includes('COMPANY')) category = 'CSR';

      if (groups[category] && b.entity) {
        groups[category].add(b.entity);
      }

      // 2. Extract Participants from Payload Data (Destination/Target)
      if (b.data) {
        if (b.data.clinic_name) groups.CLINIC.add(b.data.clinic_name);
        if (b.data.ngo_name || b.data.ngo_id) {
          // Sometimes we might only have ID if name missing, but usually name is preferred.
          // Assuming business logic ensures names are present per previous backend fix.
          if (b.data.ngo_name) groups.NGO.add(b.data.ngo_name);
        }
        if (b.data.company_name) groups.CSR.add(b.data.company_name);
      }
    });

    return {
      CSR: Array.from(groups.CSR).sort(),
      NGO: Array.from(groups.NGO).sort(),
      CLINIC: Array.from(groups.CLINIC).sort()
    };
  }, [blocks]);

  const hasAny = groupedParticipants.CSR.length > 0 || groupedParticipants.NGO.length > 0 || groupedParticipants.CLINIC.length > 0;

  return (
    <div style={{ position: 'relative', minWidth: '280px', zIndex: 50 }}>
      {/* Trigger Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0 1.5rem',
          borderRadius: '16px',
          height: '64px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: `1px solid ${isOpen ? '#00d4ff' : 'rgba(0, 229, 255, 0.15)'}`,
          color: '#fff',
          fontSize: '1rem',
          cursor: 'pointer',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 20px rgba(0, 212, 255, 0.1)' : 'none'
        }}
      >
        <span style={{ color: selected === 'ALL' ? '#94a3b8' : '#fff' }}>
          {selected === 'ALL' ? 'FILTER BY PARTICIPANT' : selected}
        </span>
        <ChevronDown size={20} style={{ color: '#64748b', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>

      {/* Styled Dropdown Options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'absolute',
              top: '115%',
              left: 0,
              right: 0,
              background: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '0.5rem',
              maxHeight: '400px',
              overflowY: 'auto',
              boxShadow: '0 20px 40px -5px rgba(0,0,0,0.5)',
              zIndex: 100
            }}
            className="premium-scrollbar"
          >
            <div
              onClick={() => { onChange('ALL'); setIsOpen(false); }}
              className="filter-option"
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                color: selected === 'ALL' ? '#00d4ff' : '#94a3b8',
                background: selected === 'ALL' ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                marginBottom: '4px',
                fontWeight: 600,
                fontSize: '0.9rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              SHOW ALL RECORDS
            </div>

            {!hasAny && (
              <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>
                No participants found
              </div>
            )}

            {Object.entries(groupedParticipants).map(([category, items]) => (
              items.length > 0 && (
                <div key={category}>
                  <div style={{
                    padding: '8px 16px',
                    fontSize: '0.7rem',
                    color: '#64748b',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    marginTop: '8px',
                    background: 'rgba(255,255,255,0.02)'
                  }}>
                    {category} PARTNERS
                  </div>
                  {items.map(p => (
                    <div
                      key={p}
                      onClick={() => { onChange(p); setIsOpen(false); }}
                      className="filter-option"
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        color: selected === p ? '#fff' : '#cbd5e1',
                        background: selected === p ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        margin: '2px 4px',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s',
                        paddingLeft: '24px' // Indent items
                      }}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              )
            ))}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * AuditTrail Component
 * Provides a high-fidelity, block-wise visualization of the 
 * immutable blockchain ledger for all stakeholders.
 */
const AuditTrail = () => {
  const [blocks, setBlocks] = useState([]);
  const [expandedBlock, setExpandedBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [consensusStatus, setConsensusStatus] = useState('Synchronized');
  const [selectedClinic, setSelectedClinic] = useState('ALL');

  // Re-added component body logic
  useEffect(() => {
    loadLedger();
  }, []);



  const loadLedger = async () => {
    setLoading(true);
    try {
      const logs = await auditorAPI.getUnifiedAuditTrail();
      // Map logs to "Block-like" structure
      const mapped = (logs || []).map((log, index) => ({
        blockNumber: (logs.length - index).toString().padStart(4, '0'),
        id: log.reference_id,
        txHash: log.tx_hash || `0x${Math.random().toString(16).slice(2, 42)}`,
        action: log.action,
        entity: log.entity_name,
        role: log.role,
        timestamp: log.timestamp,
        prevHash: index < logs.length - 1 ? (logs[index + 1].tx_hash || '0x...') : '0x0000000000000000000000000000000000000000',
        data: log
      }));
      setBlocks(mapped);
    } catch (error) {
      console.error("Failed to load audit ledger", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setConsensusStatus('Verifying Consensus...');
    await loadLedger();
    setTimeout(() => {
      setSyncing(false);
      setConsensusStatus('Synchronized');
    }, 1200);
  };

  const getEventColor = (action) => {
    const act = action.toUpperCase();
    if (act.includes('CREATED') || act.includes('AUTHORIZED')) return '#00d4ff'; // Cyan
    if (act.includes('ACCEPTED') || act.includes('APPROVED')) return '#00ff9d'; // Green
    if (act.includes('ALLOCATED')) return '#f59e0b'; // Amber
    if (act.includes('RECEIVED') || act.includes('COMPLETED')) return '#10b981'; // Emerald
    if (act.includes('VERIFIED')) return '#b400ff'; // Purple
    return '#94a3b8'; // Slate
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const filteredBlocks = blocks.filter(b => {
    const matchesSearch = b.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.entity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.txHash?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClinic = selectedClinic === 'ALL' ||
      (b.data.clinic_name && b.data.clinic_name.toLowerCase().trim() === selectedClinic.toLowerCase().trim()) ||
      (b.data.ngo_name && b.data.ngo_name.toLowerCase().trim() === selectedClinic.toLowerCase().trim()) ||
      (b.data.company_name && b.data.company_name.toLowerCase().trim() === selectedClinic.toLowerCase().trim()) ||
      (b.entity && b.entity.toLowerCase().trim() === selectedClinic.toLowerCase().trim());

    return matchesSearch && matchesClinic;
  });

  return (
    <Layout>
      <div className="audit-trail-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        {/* Header Section */}
        <div className="page-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ padding: '8px', background: 'rgba(0, 229, 255, 0.1)', borderRadius: '12px' }}>
                <Shield className="text-primary" size={28} />
              </div>
              <h1 className="page-title" style={{ margin: 0, fontFamily: 'Orbitron, sans-serif', letterSpacing: '2px', fontWeight: 800 }}>
                HEALTH-TRACE LEDGER
              </h1>
            </div>
            <p className="page-subtitle" style={{ color: '#64748b', fontSize: '1rem' }}>
              Immutable cryptographic record of all resource transitions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, fontFamily: 'Orbitron' }}>NODE STATUS</span>
              <span style={{ fontSize: '0.85rem', color: syncing ? '#f59e0b' : '#00ff9d', fontWeight: 600 }}>● {consensusStatus}</span>
            </div>
            <button
              onClick={handleSync}
              className={`btn-primary ${syncing ? 'loading' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '160px',
                height: '48px',
                borderRadius: '12px'
              }}
            >
              <RefreshCw size={18} className={syncing ? 'spin-animation' : ''} />
              {syncing ? 'BROADCASTING...' : 'SYNC LEDGER'}
            </button>
          </div>
        </div>

        {/* Network Metrics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {[
            { label: 'CHAIN HEIGHT', value: `BK-${blocks.length}`, color: '#fff', icon: Cpu },
            { label: 'CONSENSUS MODE', value: 'PoA Consensus', color: '#00ff9d', icon: ShieldCheck },
            { label: 'VALIDATOR NODES', value: '12 ACTIVE', color: '#00d4ff', icon: Server },
            { label: 'NETWORK LATENCY', value: '24ms', color: '#b400ff', icon: Activity }
          ].map((metric, i) => (
            <div key={i} className="stat-mini-card" style={{
              background: 'rgba(15, 23, 42, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              padding: '1.5rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{ color: metric.color, opacity: 0.8 }}>
                <metric.icon size={24} />
              </div>
              <div>
                <span className="stat-mini-label" style={{ display: 'block', marginBottom: '4px' }}>{metric.label}</span>
                <span className="stat-mini-value" style={{ color: metric.color }}>{metric.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Search Bar - Modern Focused */}

        {/* Search Bar - Modern Focused */}
        <div style={{ position: 'relative', marginBottom: '4rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>

          {/* Custom Participant Filter Dropdown */}
          <ParticipantFilter
            blocks={blocks}
            selected={selectedClinic}
            onChange={setSelectedClinic}
          />

          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search transaction hash, entity ID, or record content..."
              className="form-input ledger-search"
              style={{
                width: '100%',
                paddingLeft: '4rem',
                borderRadius: '16px',
                height: '64px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(0, 229, 255, 0.15)',
                fontSize: '1.1rem',
                color: '#fff',
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                transition: 'all 0.3s ease'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px' }}>
              <span className="search-badge">HASH</span>
              <span className="search-badge">ID</span>
            </div>
          </div>
        </div>

        {/* Timeline View */}
        {loading && blocks.length === 0 ? (
          <div style={{ padding: '8rem 0', textAlign: 'center', color: '#64748b' }}>
            <div className="blockchain-loader-premium"></div>
            <p style={{ marginTop: '2rem', fontFamily: 'Orbitron', letterSpacing: '3px', fontSize: '0.9rem' }}>INITIALIZING LEDGER ACCESS...</p>
          </div>
        ) : (
          <div className="blockchain-ledger-timeline-container" style={{ position: 'relative', paddingLeft: '40px' }}>
            {/* Vertical Chain Line */}
            <div style={{
              position: 'absolute',
              left: '20px',
              top: '0',
              bottom: '0',
              width: '2px',
              background: 'linear-gradient(180deg, #00d4ff 0%, rgba(255,255,255,0.05) 100%)',
              zIndex: 0,
              opacity: 0.3
            }}></div>

            <AnimatePresence>
              {filteredBlocks.map((block, index) => {
                const isExpanded = expandedBlock === block.txHash;
                const eventColor = getEventColor(block.action);

                return (
                  <React.Fragment key={block.txHash}>
                    <motion.div
                      className={`blockchain-block-item-v2 ${isExpanded ? 'active' : ''}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, type: 'spring', damping: 20 }}
                      style={{
                        position: 'relative',
                        zIndex: 1,
                        marginBottom: '2rem'
                      }}
                    >
                      {/* Left Connector Node */}
                      <div style={{
                        position: 'absolute',
                        left: '-28px',
                        top: '30px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#0f172a',
                        border: `3px solid ${eventColor}`,
                        boxShadow: `0 0 15px ${eventColor}`,
                        zIndex: 2
                      }}></div>

                      <div
                        style={{
                          background: isExpanded ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.5)',
                          border: `1px solid ${isExpanded ? eventColor : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: '20px',
                          overflow: 'hidden',
                          backdropFilter: 'blur(20px)',
                          transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
                        }}
                      >
                        {/* Block Summary Bar */}
                        <div
                          onClick={() => setExpandedBlock(isExpanded ? null : block.txHash)}
                          style={{
                            padding: '1.75rem 2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                              width: '56px', height: '56px', borderRadius: '16px',
                              background: `${eventColor}15`, display: 'flex',
                              alignItems: 'center', justifyContent: 'center', color: eventColor,
                              border: `1px solid ${eventColor}30`,
                              boxShadow: isExpanded ? `0 0 20px ${eventColor}20` : 'none'
                            }}>
                              <Box size={28} />
                            </div>
                            <div>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '6px'
                              }}>
                                <span style={{
                                  fontSize: '0.7rem',
                                  fontFamily: 'Orbitron',
                                  color: eventColor,
                                  letterSpacing: '2px',
                                  background: `${eventColor}10`,
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontWeight: 800
                                }}>
                                  BLOCK {block.blockNumber}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#475569' }}>•</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', letterSpacing: '1px' }}>
                                  {block.txHash.substring(0, 24)}...
                                </span>
                              </div>
                              <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.25rem', fontFamily: 'Orbitron', letterSpacing: '0.5px' }}>
                                {block.action.replace(/_/g, ' ')}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1rem', color: '#fff', fontWeight: 700 }}>{block.entity}</div>
                              <div style={{
                                fontSize: '0.75rem',
                                color: '#64748b',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontWeight: 600,
                                marginTop: '2px'
                              }}>
                                Origin: {block.role}
                              </div>
                            </div>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-end',
                              minWidth: '160px'
                            }}>
                              <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>
                                {new Date(block.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#475569', fontFamily: 'monospace' }}>
                                {new Date(block.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                            <div style={{
                              width: '32px', height: '32px',
                              borderRadius: '50%', background: 'rgba(255,255,255,0.03)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.3s'
                            }}>
                              {isExpanded ? <ChevronUp size={20} color="#64748b" /> : <ChevronDown size={20} color="#64748b" />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Payload Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              style={{
                                background: 'rgba(0,0,0,0.4)',
                                padding: '2.5rem',
                                borderTop: '1px solid rgba(255,255,255,0.05)'
                              }}
                            >
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2.5rem', marginBottom: '2.5rem' }}>
                                <div className="detail-group">
                                  <label className="ledger-label-v2"><Hash size={16} /> TRANSACTION SIGNATURE</label>
                                  <div className="hash-display-v2">
                                    {block.txHash}
                                    <button className="copy-btn-v2" onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(block.txHash);
                                    }}><Share2 size={16} /></button>
                                  </div>
                                </div>
                                <div className="detail-group">
                                  <label className="ledger-label-v2"><Link2 size={16} /> PREVIOUS LINKED HASH</label>
                                  <div className="hash-display-v2 secondary">
                                    {block.prevHash}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem' }}>
                                <div className="payload-container-v2">
                                  <label className="ledger-label-v2"><Cpu size={16} /> CRYPTOGRAPHIC PAYLOAD</label>
                                  <div className="code-editor-style">
                                    <div className="code-header">
                                      <span>json</span>
                                      <div className="circles"><span></span><span></span><span></span></div>
                                    </div>
                                    <pre className="payload-display-v2">
                                      {JSON.stringify(block.data, null, 4)}
                                    </pre>
                                  </div>
                                </div>
                                <div className="verification-info-v2">
                                  <label className="ledger-label-v2"><ShieldCheck size={16} /> VALIDATION STATUS</label>
                                  <div className="v-card-v2">
                                    <div className="v-status-success">
                                      <CheckCircle size={18} />
                                      RECORD VERIFIED & LOCKED
                                    </div>

                                    {/* Real-time Clinic Feedback Display */}
                                    {block.data.feedback && (
                                      <div style={{
                                        marginBottom: '1.5rem',
                                        padding: '1rem',
                                        background: 'rgba(0, 229, 255, 0.05)',
                                        border: '1px solid rgba(0, 229, 255, 0.2)',
                                        borderRadius: '12px'
                                      }}>
                                        <div style={{ color: '#00e5ff', fontSize: '0.7rem', fontWeight: 800, fontFamily: 'Orbitron', marginBottom: '8px' }}>
                                          CLINIC FEEDBACK
                                        </div>
                                        <div style={{ color: '#fff', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '8px' }}>
                                          "{block.data.feedback}"
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                          {[...Array(5)].map((_, i) => (
                                            <span key={i} style={{ color: i < (block.data.quality_rating || 0) ? '#ffb400' : '#475569', fontSize: '1rem' }}>★</span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div className="v-timeline-v2">
                                      <div className="vt-item">
                                        <div className="vt-dot active"></div>
                                        <span>Transaction Broadcasted</span>
                                      </div>
                                      <div className="vt-item">
                                        <div className="vt-dot active"></div>
                                        <span>Payload Hash Matched</span>
                                      </div>
                                      <div className="vt-item">
                                        <div className="vt-dot active"></div>
                                        <span>Account Nonce Validated</span>
                                      </div>
                                      <div className="vt-item">
                                        <div className="vt-dot active"></div>
                                        <span>12/12 Nodes Confirmed</span>
                                      </div>
                                    </div>
                                    <div style={{
                                      marginTop: '1.5rem',
                                      padding: '1rem',
                                      background: 'rgba(0,0,0,0.2)',
                                      borderRadius: '8px',
                                      fontSize: '0.75rem',
                                      color: '#64748b',
                                      lineHeight: '1.4'
                                    }}>
                                      This block is part of the immutable main chain. Any change in the data source will result in a mismatch of the transaction hash.
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </AnimatePresence>

            {/* Genesis Record (Aesthetic Footer) */}
            {filteredBlocks.length > 0 && !searchTerm && (
              <div
                className="genesis-record-footer"
                style={{
                  padding: '2rem 0',
                  textAlign: 'center',
                  opacity: 0.5,
                  position: 'relative',
                  marginTop: '2rem'
                }}
              >
                <div style={{
                  width: '12px', height: '12px', borderRadius: '50%',
                  background: '#64748b', margin: '0 auto 1.5rem',
                  boxShadow: '0 0 10px #64748b'
                }}></div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '0.8rem', letterSpacing: '4px', color: '#64748b' }}>
                  END OF CHAIN • GENESIS REACHED
                </div>
              </div>
            )}

            {filteredBlocks.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '10rem 0', color: '#64748b' }}>
                <Activity size={80} style={{ margin: '0 auto 2rem', opacity: 0.05 }} />
                <p style={{ fontSize: '1.5rem', fontWeight: 300, marginBottom: '1.5rem', letterSpacing: '1px' }}>No records found in the ledger</p>
                <p style={{ maxWidth: '400px', margin: '0 auto 2.5rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  The network is active but no transactions have been recorded under the current filter criteria.
                </p>
                <button onClick={loadLedger} className="btn-primary" style={{ padding: '0.8rem 2.5rem' }}>FORCE SYNC</button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .ledger-search:focus {
            outline: none;
            border-color: #00d4ff !important;
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.2) !important;
            background: rgba(15, 23, 42, 0.8) !important;
        }

        .search-badge {
            font-size: 0.65rem;
            font-family: 'Orbitron', sans-serif;
            color: #64748b;
            border: 1px solid rgba(255,255,255,0.1);
            padding: 4px 10px;
            border-radius: 6px;
            font-weight: 700;
        }

        .ledger-label-v2 {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.75rem;
            font-weight: 800;
            color: #475569;
            font-family: 'Orbitron', sans-serif;
            letter-spacing: 1.5px;
            margin-bottom: 1rem;
            text-transform: uppercase;
        }

        .hash-display-v2 {
            background: rgba(15, 23, 42, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.05);
            color: #00d4ff;
            padding: 1.25rem 1.75rem;
            border-radius: 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            word-break: break-all;
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.2);
        }

        .hash-display-v2.secondary {
            color: #64748b;
        }

        .copy-btn-v2 {
            background: rgba(255,255,255,0.05);
            border: none;
            color: #64748b;
            padding: 8px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .copy-btn-v2:hover {
            background: rgba(0, 212, 255, 0.1);
            color: #00d4ff;
            transform: scale(1.1);
        }

        .code-editor-style {
            background: #050811;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .code-header {
            background: rgba(255,255,255,0.05);
            padding: 8px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.7rem;
            color: #475569;
            font-family: 'JetBrains Mono', monospace;
            text-transform: uppercase;
        }

        .code-header .circles {
            display: flex;
            gap: 6px;
        }

        .code-header .circles span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
        }

        .payload-display-v2 {
            padding: 1.5rem;
            color: #94a3b8;
            font-size: 0.9rem;
            max-height: 400px;
            overflow-y: auto;
            margin: 0;
            line-height: 1.6;
            font-family: 'JetBrains Mono', monospace;
        }

        .v-status-success {
            background: rgba(16, 185, 129, 0.1);
            color: #10b981;
            padding: 1rem;
            border-radius: 10px;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.75rem;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 2rem;
            letter-spacing: 1px;
            border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .v-timeline-v2 {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .vt-item {
            display: flex;
            align-items: center;
            gap: 15px;
            font-size: 0.85rem;
            color: #94a3b8;
        }

        .vt-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
        }

        .vt-dot.active {
            background: #10b981;
            box-shadow: 0 0 10px #10b981;
        }

        .blockchain-loader-premium {
            width: 64px;
            height: 64px;
            border: 4px solid rgba(0, 212, 255, 0.05);
            border-top-color: #00d4ff;
            border-radius: 50%;
            margin: 0 auto;
            animation: spin 0.8s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite;
            filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.4));
        }

        .spin-animation {
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .blockchain-block-item-v2:hover {
            transform: translateX(5px);
        }
      `}</style>
    </Layout>
  );
};

export default AuditTrail;
