import React from 'react';
import { CheckCircle, Clock, AlertCircle, Package, Truck, Building2, Heart } from 'lucide-react';
import '../styles/DonationTimeline.css';

/**
 * DonationTimeline Component
 * Visual timeline showing the lifecycle of a donation from CSR → NGO → Clinic
 * Audit & Blockchain-Ready Tracking (Demo)
 */
const DonationTimeline = ({ donation }) => {
    // Define the workflow stages
    const isRejected = donation.status === 'REJECTED';

    const stages = [
        {
            id: 'created',
            label: 'Donation Created',
            role: 'CSR',
            icon: Heart,
            status: donation.status,
            timestamp: donation.created_at,
            description: `${donation.donor_name || 'CSR Partner'} created donation`,
            completed: true // Always completed if donation exists
        },
        {
            id: 'accepted',
            label: isRejected ? 'Rejected by NGO' : 'Verified by NGO',
            role: 'NGO',
            icon: isRejected ? AlertCircle : CheckCircle,
            status: donation.ngo_status || 'pending',
            timestamp: donation.ngo_accepted_at || donation.ngo_rejected_at,
            description: isRejected
                ? `Rejected: ${donation.rejection_reason || 'Not specified'}`
                : donation.ngo_verified
                    ? `Verified and accepted by ${donation.ngo_name}`
                    : 'Awaiting NGO verification',
            completed: ['ACCEPTED', 'ALLOCATED', 'IN_TRANSIT', 'RECEIVED', 'COMPLETED'].includes(donation.status),
            rejected: isRejected
        },
        {
            id: 'requested',
            label: 'Requested by Clinic',
            role: 'Clinic',
            icon: Building2,
            status: donation.clinic_request_status || 'pending',
            timestamp: donation.clinic_requested_at,
            description: donation.clinic_name ? `Requested by ${donation.clinic_name}` : 'Awaiting clinic request',
            completed: ['ALLOCATED', 'IN_TRANSIT', 'RECEIVED', 'COMPLETED'].includes(donation.status),
            disabled: isRejected
        },
        {
            id: 'allocated',
            label: 'Allocated by NGO',
            role: 'NGO',
            icon: Package,
            status: donation.allocation_status || 'pending',
            timestamp: donation.allocated_at,
            description: donation.allocated_at ? `${donation.allocated_quantity || donation.quantity} units allocated` : 'Awaiting allocation',
            completed: ['ALLOCATED', 'IN_TRANSIT', 'RECEIVED', 'COMPLETED'].includes(donation.status),
            disabled: isRejected
        },
        {
            id: 'in_transit',
            label: 'In Transit',
            role: 'Logistics',
            icon: Truck,
            status: donation.transit_status || 'pending',
            timestamp: donation.shipped_at,
            description: donation.shipped_at ? 'Products in transit to clinic' : 'Awaiting shipment',
            completed: ['IN_TRANSIT', 'RECEIVED', 'COMPLETED'].includes(donation.status),
            disabled: isRejected
        },
        {
            id: 'received',
            label: 'Received by Clinic',
            role: 'Clinic',
            icon: CheckCircle,
            status: donation.receipt_status || 'pending',
            timestamp: donation.received_at,
            description: donation.received_at ? 'Products received and verified' : 'Awaiting clinic confirmation',
            completed: ['RECEIVED', 'COMPLETED'].includes(donation.status),
            disabled: isRejected
        }
    ];

    const getStageColor = (stage) => {
        if (stage.completed) return '#10b981'; // Green
        if (stage.status === 'rejected') return '#ef4444'; // Red
        return '#64748b'; // Gray
    };

    const getStageIcon = (stage) => {
        const IconComponent = stage.icon;
        if (stage.completed) return <CheckCircle size={24} />;
        if (stage.status === 'rejected') return <AlertCircle size={24} />;
        return <Clock size={24} />;
    };

    return (
        <div className="donation-timeline-container">
            <div className="timeline-header">
                <h3>Donation Lifecycle Tracker</h3>
                <div className="timeline-badge">
                    <span>🔒 Audit & Blockchain-Ready Tracking (Demo)</span>
                </div>
            </div>

            <div className="timeline-content">
                {stages.map((stage, index) => (
                    <div
                        key={stage.id}
                        className={`timeline-stage ${stage.completed ? 'completed' : 'pending'} ${stage.status === 'rejected' ? 'rejected' : ''}`}
                    >
                        {/* Connector Line */}
                        {index < stages.length - 1 && (
                            <div className={`timeline-connector ${stage.completed ? 'active' : 'inactive'}`} />
                        )}

                        {/* Stage Icon */}
                        <div
                            className="timeline-icon"
                            style={{
                                background: stage.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                                borderColor: getStageColor(stage),
                                color: getStageColor(stage)
                            }}
                        >
                            {getStageIcon(stage)}
                        </div>

                        {/* Stage Content */}
                        <div className="timeline-stage-content">
                            <div className="stage-header">
                                <h4 className="stage-label">{stage.label}</h4>
                                <span
                                    className="stage-role-badge"
                                    style={{
                                        background: stage.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                                        color: stage.completed ? '#10b981' : '#64748b'
                                    }}
                                >
                                    {stage.role}
                                </span>
                            </div>

                            <p className="stage-description">{stage.description}</p>

                            {stage.timestamp && (
                                <div className="stage-timestamp">
                                    <Clock size={14} />
                                    <span>{new Date(stage.timestamp).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</span>
                                </div>
                            )}

                            {stage.completed && (
                                <div className="stage-status-badge completed">
                                    <CheckCircle size={14} />
                                    <span>Verified & Locked</span>
                                </div>
                            )}

                            {!stage.completed && stage.status !== 'rejected' && (
                                <div className="stage-status-badge pending">
                                    <Clock size={14} />
                                    <span>Awaiting Action</span>
                                </div>
                            )}

                            {stage.status === 'rejected' && (
                                <div className="stage-status-badge rejected">
                                    <AlertCircle size={14} />
                                    <span>Rejected</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Blockchain Note */}
            <div className="timeline-footer">
                <div className="blockchain-note">
                    <div className="note-icon">ℹ️</div>
                    <div className="note-content">
                        <strong>Immutable Audit Trail</strong>
                        <p>Each completed stage is locked and cannot be modified, ensuring transparency and traceability. In production, these events will be recorded on blockchain for cryptographic verification.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationTimeline;
