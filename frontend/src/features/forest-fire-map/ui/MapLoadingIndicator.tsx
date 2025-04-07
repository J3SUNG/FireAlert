import React from 'react';
import { MapLoadingIndicatorProps } from '../model/types';

/**
 * 지도 로딩 인디케이터 컴포넌트
 */
export const MapLoadingIndicator: React.FC<MapLoadingIndicatorProps> = ({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="forest-fire-map__loading">
      <div className="forest-fire-map__loading-container">
        <div className="forest-fire-map__loading-spinner"></div>
        <p className="forest-fire-map__loading-message">지도를 불러오는 중...</p>
      </div>
    </div>
  );
};