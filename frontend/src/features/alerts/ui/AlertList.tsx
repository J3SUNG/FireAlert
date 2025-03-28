import React from 'react';
import AlertCard, { Alert } from './AlertCard';
import './AlertList.css';

interface AlertListProps {
  alerts?: Alert[];
  onAlertClick?: (alert: Alert) => void;
  loading?: boolean;
  error?: string | null;
}

// Interface Segregation Principle: This component only receives the props it needs
const AlertList: React.FC<AlertListProps> = ({ 
  alerts = [], 
  onAlertClick, 
  loading = false, 
  error = null 
}) => {
  if (loading) {
    return <div className="alert-list__loading">Loading alerts...</div>;
  }

  if (error) {
    return <div className="alert-list__error">Error: {error}</div>;
  }

  if (!alerts || alerts.length === 0) {
    return <div className="alert-list__empty">No alerts found</div>;
  }

  return (
    <div className="alert-list">
      {alerts.map(alert => (
        <AlertCard 
          key={alert.id} 
          alert={alert} 
          onClick={onAlertClick}
        />
      ))}
    </div>
  );
};

export default AlertList;