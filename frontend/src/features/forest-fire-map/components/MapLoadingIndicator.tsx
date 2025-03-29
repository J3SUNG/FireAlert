import React from 'react';

interface MapLoadingIndicatorProps {
  isLoading: boolean;
}

/**
 * 지도 로딩 인디케이터 컴포넌트
 */
export const MapLoadingIndicator: React.FC<MapLoadingIndicatorProps> = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="forest-fire-map__loading">
      <div className="forest-fire-map__loading-content">
        <div className="forest-fire-map__spinner"></div>
        <p className="forest-fire-map__loading-text">지도를 불러오는 중...</p>
      </div>
    </div>
  );
};