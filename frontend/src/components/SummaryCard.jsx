import React from 'react';
import '../styles/SummaryCard.css';
import { Activity } from 'lucide-react';

/**
 * SummaryCard Component
 * Displays KPI metrics with customizable icons and neon styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Card label
 * @param {string|number} props.value - Main metric value
 * @param {string} props.color - Neon accent color (hex or var)
 * @param {ReactNode} props.icon - Lucide icon component
 */
const SummaryCard = ({ label, value, color = '#00d4ff', icon: Icon = Activity }) => {
  return (
    <div className="summary-card" style={{ '--card-color': color }}>
      <div className="card-icon-wrapper">
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <div className="card-content">
        <h3 className="card-label">{label}</h3>
        <p className="card-value">{value}</p>
      </div>
    </div>
  );
};

export default SummaryCard;
