import React from 'react';
import '../styles/StatusBadge.css';

/**
 * StatusBadge Component
 * Displays status with appropriate color coding
 * 
 * @param {Object} props - Component props
 * @param {string} props.status - Status value
 */
const StatusBadge = ({ status }) => {
  const statusMap = {
    completed: { label: 'Completed', class: 'status-success' },
    received: { label: 'Received', class: 'status-success' },
    confirmed: { label: 'Confirmed', class: 'status-success' },
    'delivered_approved': { label: 'Delivered (Approved)', class: 'status-success' },
    'csr_approved': { label: 'CSR Approved', class: 'status-success' },
    'authorized': { label: 'Authorized (CSR Verified)', class: 'status-success' }, // Backend status
    'ngo_approved': { label: 'Approved by NGO', class: 'status-success' },
    'accepted': { label: 'Accepted by NGO', class: 'status-success' }, // Backend status
    'utilized': { label: 'Utilized', class: 'status-success' },

    'in-progress': { label: 'In Progress', class: 'status-warning' },
    'in-transit': { label: 'In Transit', class: 'status-warning' },
    'allocated_pending_audit': { label: 'Allocated (Audit Pending)', class: 'status-warning' },
    'allocated': { label: 'Allocated', class: 'status-warning' }, // Backend status
    'partially_allocated': { label: 'Partially Allocated', class: 'status-warning' },

    processing: { label: 'Processing', class: 'status-info' },
    pending: { label: 'Pending', class: 'status-info' },
    listed: { label: 'Listed', class: 'status-info' },
    'ngo_requested': { label: 'Requested by NGO', class: 'status-info' },
    'clinic_requested': { label: 'Requested by Clinic', class: 'status-info' },
    'pending-confirmation': { label: 'Pending Confirmation', class: 'status-info' },
    'pending-allocation': { label: 'Pending Allocation', class: 'status-info' },

    failed: { label: 'Failed', class: 'status-danger' },
    damaged: { label: 'Damaged', class: 'status-danger' },
    rejected: { label: 'Rejected', class: 'status-danger' },
    'allocation_rejected': { label: 'Allocation Rejected', class: 'status-danger' },
  };

  const normalizedStatus = status ? String(status).toLowerCase().trim() : '';

  const statusInfo = statusMap[normalizedStatus] || {
    label: status ? String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase() : 'Unknown',
    class: 'status-info',
  };

  return (
    <span className={`status-badge ${statusInfo.class}`}>
      {statusInfo.label}
    </span>
  );
};

export default StatusBadge;
