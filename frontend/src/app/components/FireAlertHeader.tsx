import React from 'react';

interface FireAlertHeaderProps {
  timestamp: string;
  filterButtons: React.ReactNode;
}

/**
 * 산불 경보 헤더 컴포넌트 (SRP)
 */
export const FireAlertHeader: React.FC<FireAlertHeaderProps> = ({ 
  timestamp, 
  filterButtons 
}) => {
  return (
    <header className="fire-alert__header">
      <div className="fire-alert__logo-container">
        <div className="fire-alert__logo-icon">🔥</div>
        <h1 className="fire-alert__logo-text">
          <span className="fire-alert__logo-text--fire">Fire</span>Alert
        </h1>
        <span className="fire-alert__subtitle">전국 산불 모니터링 시스템</span>
      </div>

      <div className="fire-alert__filter-container">
        {filterButtons}
      </div>

      <div className="fire-alert__timestamp">최종 업데이트: {timestamp}</div>
    </header>
  );
};