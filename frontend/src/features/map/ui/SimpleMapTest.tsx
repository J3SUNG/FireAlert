import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { mapCreator } from '../lib/MapCreator';

const SimpleMapTest: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // 지도 초기화 (마운트 시)
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(async () => {
      if (!mapContainerRef.current || !mounted) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // DOM 요소에 고유 ID 부여
        const uniqueId = `map-container-${Date.now()}`;
        mapContainerRef.current.id = uniqueId;
        
        // 맵 초기화
        const map = mapCreator.initializeMap(mapContainerRef.current);
        
        try {
          // 실 서비스용 korea_sigungu_simplified.geojson 로드
          await mapCreator.loadGeoJSON(map, '/korea_sigungu_simplified.geojson');
          console.log('korea_sigungu_simplified.geojson 로드 성공');
          
          if (mounted) {
            setIsLoading(false);
          }
        } catch (err) {
          console.error('korea_sigungu_simplified.geojson 로드 실패:', err);
          throw err;
        }
      } catch (err) {
        console.error('맵 초기화 실패:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : '지도 로드 중 오류가 발생했습니다');
          setIsLoading(false);
        }
      }
    }, 700); // 더 긴 지연 적용 (700ms)
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      mounted = false;
      clearTimeout(timer);
      mapCreator.cleanup();
    };
  }, []);
  
  return (
    <div className="flex flex-col h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-700">지도를 불러오는 중입니다...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
          <div className="max-w-md p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-red-600 font-medium">지도 로드 오류</p>
            <p className="text-red-500 text-sm mt-1">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}
      
      <div 
        ref={mapContainerRef}
        className="w-full h-full min-h-[600px] border border-gray-300 rounded-md shadow-md relative"
        style={{ minHeight: '70vh' }}
      ></div>
      
      <div className="p-3 bg-white border-t border-gray-200 mt-2">
        <h3 className="text-sm font-semibold mb-1">지도 정보</h3>
        <p className="text-xs text-gray-600 mb-1">
          • GeoJSON 파일: korea_sigungu_simplified.geojson
        </p>
        <p className="text-xs text-gray-600">
          • 상태: {isLoading ? '로딩 중...' : error ? '오류 발생' : '지도 로드 완료'}
        </p>
      </div>
    </div>
  );
};

export default SimpleMapTest;
