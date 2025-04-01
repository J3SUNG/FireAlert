import { useErrorHandling } from '../../../shared/lib/errors';
import { MapErrorCode, createMapError } from '../model/mapErrorTypes';

/**
 * 지도 특화 에러 처리 훅
 * 
 * shared의 일반 에러 처리 훅을 확장하여 지도 특화 에러 처리 기능 추가
 */
export function useMapErrorHandling(component: string) {
  // 공통 에러 처리 훅 사용
  const [errorState, errorActions] = useErrorHandling(component, 'forest-fire-map');
  
  // 지도 특화 에러 생성 함수
  const createGeoJsonError = (
    errorCode: MapErrorCode.GEOJSON_FETCH_FAILED | 
               MapErrorCode.GEOJSON_PARSE_ERROR | 
               MapErrorCode.GEOJSON_RENDERING_ERROR,
    originalError?: Error,
    additionalInfo?: string
  ) => {
    return createMapError(errorCode, originalError, additionalInfo);
  };
  
  // 지도 초기화 에러 생성 함수
  const createMapInitError = (
    errorCode: MapErrorCode.CONTAINER_NOT_FOUND | 
               MapErrorCode.INITIALIZATION_FAILED,
    originalError?: Error,
    additionalInfo?: string
  ) => {
    return createMapError(errorCode, originalError, additionalInfo);
  };
  
  // 마커 관련 에러 생성 함수
  const createMarkerError = (
    errorCode: MapErrorCode.MARKER_CREATION_FAILED | 
               MapErrorCode.MARKER_UPDATE_FAILED | 
               MapErrorCode.MARKER_REMOVAL_FAILED,
    originalError?: Error,
    additionalInfo?: string
  ) => {
    return createMapError(errorCode, originalError, additionalInfo);
  };
  
  return {
    // 기존 에러 상태와 액션 그대로 내보내기
    ...errorState,
    ...errorActions,
    
    // 지도 특화 에러 생성 함수 추가
    createGeoJsonError,
    createMapInitError,
    createMarkerError
  };
}