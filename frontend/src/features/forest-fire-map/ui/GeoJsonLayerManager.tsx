import { FC, useEffect } from 'react';
import L from 'leaflet';
import { useGeoJsonManager } from '../lib/useGeoJsonManager';
import { GEOJSON_PATHS } from '../model/mapSettings';
import { useMapErrorHandling } from '../lib/useMapErrorHandling';
import { MapErrorCode } from '../model/mapErrorTypes';

interface GeoJsonLayerManagerProps {
  map: L.Map | null;
  onLayersLoaded: () => void;
}

/**
 * GeoJSON 레이어 관리 컴포넌트
 * 
 * 시도/시군구 경계 데이터를 지도에 표시
 */
export const GeoJsonLayerManager: FC<GeoJsonLayerManagerProps> = ({ map, onLayersLoaded }) => {
  // 지도 특화 에러 처리
  const { hasError, userMessage, createGeoJsonError, setError } = useMapErrorHandling('GeoJsonLayerManager');
  
  // GeoJSON 관리 로직
  const { isGeoJsonLoaded } = useGeoJsonManager(map, {
    provincesUrl: GEOJSON_PATHS.provinces,
    districtsUrl: GEOJSON_PATHS.districts
  });
  
  // 로드 완료 시 콜백 호출
  useEffect(() => {
    try {
      if (isGeoJsonLoaded) {
        onLayersLoaded();
      }
    } catch (error) {
      // 에러 처리
      setError(
        createGeoJsonError(
          MapErrorCode.GEOJSON_RENDERING_ERROR, 
          error instanceof Error ? error : new Error('Unknown error'),
          'GeoJSON 레이어 로드 완료 후 처리 중 오류 발생'
        )
      );
      
      // 에러가 있어도 로드 완료 처리
      onLayersLoaded();
    }
  }, [isGeoJsonLoaded, onLayersLoaded, setError]);
  
  // 오류 발생 시 콘솔 경고만 표시
  if (hasError) {
    console.warn(`GeoJson 로드 오류: ${userMessage}`);
  }
  
  // UI 없음
  return null;
};