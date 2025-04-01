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
 */
export const GeoJsonLayerManager: FC<GeoJsonLayerManagerProps> = ({ map, onLayersLoaded }) => {
  // 지도 특화 에러 처리 훅 사용
  const { hasError, userMessage, createGeoJsonError, setError } = useMapErrorHandling('GeoJsonLayerManager');
  
  // GeoJSON 관리 로직을 훅으로 분리하여 주입
  const { isGeoJsonLoaded } = useGeoJsonManager(map, {
    provincesUrl: GEOJSON_PATHS.provinces,
    districtsUrl: GEOJSON_PATHS.districts
  });
  
  // GeoJSON 로드 완료 시 onLayersLoaded 콜백 호출
  useEffect(() => {
    try {
      if (isGeoJsonLoaded) {
        onLayersLoaded();
      }
    } catch (error) {
      // 에러 발생 시 지도 특화 에러 생성 후 전달
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
  
  // 오류 발생 시 표시할 어러 상태
  if (hasError) {
    console.warn(`GeoJson 로드 오류: ${userMessage}`);
    // 상위 컴포넌트에서 처리할 수 있도록 UI를 반환하지 않고 null을 반환
  }
  
  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
};