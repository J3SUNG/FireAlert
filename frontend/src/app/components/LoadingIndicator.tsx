import React from 'react';

/**
 * 로딩 인디케이터 컴포넌트 (SRP)
 */
export const LoadingIndicator: React.FC = () => {
  return (
    <div className="fire-alert__loading-container">
      <div className="fire-alert__spinner"></div>
      <p className="fire-alert__loading-text">산불 데이터를 불러오는 중...</p>
    </div>
  );
};