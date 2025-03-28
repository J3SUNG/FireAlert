import React, { useEffect } from 'react';
import { ForestFireData } from '../../../shared/types/forestFire';
import { useKoreaMap } from '../hooks/useKoreaMap';
import { mapStyles } from '../lib/mapStyles';

interface KoreaMapProps {
  fires: ForestFireData[];
  selectedFireId?: string;
}

export const KoreaMap: React.FC<KoreaMapProps> = ({ fires, selectedFireId }) => {
  const { containerRef, isMapLoaded, selectFire } = useKoreaMap(fires);

  // 선택된 산불이 있으면 지도에서 선택
  React.useEffect(() => {
    if (selectedFireId && isMapLoaded) {
      selectFire(selectedFireId);
    }
  }, [selectedFireId, isMapLoaded, selectFire]);

  // 전역 스타일 추가
  useEffect(() => {
    // 이미 스타일 요소가 있는지 확인
    const existingStyle = document.getElementById('korea-map-styles');
    if (!existingStyle) {
      const styleElement = document.createElement('style');
      styleElement.id = 'korea-map-styles';
      styleElement.textContent = mapStyles;
      document.head.appendChild(styleElement);
    }

    // 컴포넌트 언마운트 시 스타일 제거
    return () => {
      const styleElement = document.getElementById('korea-map-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <div 
        ref={containerRef}
        className="w-full h-full"
      ></div>
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-200 border-t-red-600"></div>
            <p className="mt-2 text-gray-600">지도를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
};
