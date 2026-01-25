import React from 'react';
import '../styles/SummaryCard.css';

/**
 * Card Component
 * Generic reusable card component for content display
 */
const Card = ({ title, children, className = '', actions = null }) => {
  return (
    <div className={`card ${className}`}>
      {title && (
        <div className="card-header">
          <h2 className="card-title">{title}</h2>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;
