import { useErrorHandling } from "../../../shared/lib/errors";
import { 
  MapErrorCode, 
  createForestFireMapError, 
  createMapInitializationError, 
  createMarkerCreationError 
} from "../model/mapErrorTypes";

/**
 * 지도 특화 에러 처리 훅
 *
 * shared의 일반 에러 처리 훅을 확장하여 지도 특화 에러 처리 기능 추가
 */
export function useMapErrorHandling(component: string) {
  // 공통 에러 처리 훅 사용
  const [errorState, errorActions] = useErrorHandling(component, "forest-fire-map");

  // 지도 특화 에러 생성 함수
  const createGeoJsonError = (
    code: MapErrorCode,
    originalError?: Error,
    additionalInfo?: string
  ) => {
    return createForestFireMapError(code, originalError, additionalInfo);
  };

  // 지도 초기화 에러 생성 함수
  const createMapInitError = (
    originalError?: Error,
    additionalInfo?: string
  ) => {
    return createMapInitializationError(originalError, additionalInfo);
  };

  // 마커 관련 에러 생성 함수
  const createMarkerError = (
    originalError?: Error,
    additionalInfo?: string
  ) => {
    return createMarkerCreationError(originalError, additionalInfo);
  };

  // 일반 맵 에러 생성 (특정 코드 사용 시)
  const createMapError = (
    errorCode: MapErrorCode,
    originalError?: Error,
    additionalInfo?: string
  ) => {
    return createForestFireMapError(errorCode, originalError, additionalInfo);
  };

  return {
    // 기존 에러 상태와 액션 그대로 내보내기
    ...errorState,
    ...errorActions,

    // 지도 특화 에러 생성 함수 추가
    createGeoJsonError,
    createMapInitError,
    createMarkerError,
    createMapError,
  };
}
