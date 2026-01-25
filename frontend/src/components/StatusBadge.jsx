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
    'in-progress': { label: 'In Progress', class: 'status-warning' },
    'in-transit': { label: 'In Transit', class: 'status-warning' },
    processing: { label: 'Processing', class: 'status-warning' },
    pending: { label: 'Pending', class: 'status-info' },
    'pending-confirmation': { label: 'Pending Confirmation', class: 'status-info' },
    'pending-allocation': { label: 'Pending Allocation', class: 'status-info' },
    failed: { label: 'Failed', class: 'status-danger' },
    damaged: { label: 'Damaged', class: 'status-danger' },
    rejected: { label: 'Rejected', class: 'status-danger' },
  };

  const statusInfo = statusMap[status] || {
    label: status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown',
    class: 'status-info',
  };

  return (
    <span className={`status-badge ${statusInfo.class}`}>
      {statusInfo.label}
    </span>
  );
};

export default StatusBadge;
