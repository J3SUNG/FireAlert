import React from 'react';
import './AlertCard.css';

export interface Alert {
  id: string | number;
  title: string;
  location: string;
  severity: string;
  timestamp: string | number | Date;
}

interface AlertCardProps {
  alert: Alert;
  onClick?: (alert: Alert) => void;
}

// Interface Segregation Principle: This component only receives the props it needs
const AlertCard: React.FC<AlertCardProps> = ({ alert, onClick }) => {
  const { title, location, severity, timestamp } = alert;
  
  // Format date
  const formattedDate = new Date(timestamp).toLocaleString();
  
  // Determine severity class
  const severityClass = `alert-card--${severity.toLowerCase()}`;
  
  return (
    <div 
      className={`alert-card ${severityClass}`} 
      onClick={() => onClick && onClick(alert)}
    >
      <h3 className="alert-card__title">{title}</h3>
      <div className="alert-card__location">{location}</div>
      <div className="alert-card__meta">
        <span className="alert-card__severity">{severity}</span>
        <span className="alert-card__time">{formattedDate}</span>
      </div>
    </div>
  );
};

export default AlertCard;