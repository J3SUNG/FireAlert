/**
 * 지도 관련 에러 타입 정의
 */
import { ErrorSeverity, ErrorType } from './types';
import { getErrorService } from './ErrorHandlingService';

// 지도 관련 세부 에러 코드
export enum MapErrorCode {
  INITIALIZATION_FAILED = 'map-001',
  MARKER_CREATION_FAILED = 'map-002',
  GEOJSON_LOAD_FAILED = 'map-003',
  GEOLOCATION_FAILED = 'map-004',
  BOUNDS_INVALID = 'map-005',
  LAYER_LOAD_FAILED = 'map-006',
  PERMISSION_DENIED = 'map-007',
  EVENT_HANDLER_ERROR = 'map-008',
}

/**
 * 지도 초기화 에러 생성 함수
 * 
 * 지도 컴포넌트 로드 및 초기화 실패 시 사용
 */
export function createMapInitError(
  message = 'Failed to initialize map',
  originalError?: unknown
) {
  const errorService = getErrorService();
  return errorService.createError(message, ErrorType.MAP_LOAD_FAILED, {
    code: MapErrorCode.INITIALIZATION_FAILED,
    severity: ErrorSeverity.ERROR,
    originalError,
    options: {
      showUser: true,
      retryable: true,
      toast: true,
      log: true,
    }
  });
}

/**
 * 지도 마커 생성 에러 생성 함수
 * 
 * 위치 마커 생성 및 표시 실패 시 사용
 */
export function createMarkerError(
  message = 'Failed to create marker',
  originalError?: unknown
) {
  const errorService = getErrorService();
  return errorService.createError(message, ErrorType.MAP_LOAD_FAILED, {
    code: MapErrorCode.MARKER_CREATION_FAILED,
    severity: ErrorSeverity.WARNING,
    originalError,
    options: {
      showUser: false,
      retryable: true,
      toast: false,
      log: true,
    }
  });
}

/**
 * GeoJSON 로드 에러 생성 함수
 * 
 * 지역 경계 데이터 로드 실패 시 사용
 */
export function createGeoJsonError(
  message = 'Failed to load GeoJSON data',
  originalError?: unknown
) {
  const errorService = getErrorService();
  return errorService.createError(message, ErrorType.MAP_LOAD_FAILED, {
    code: MapErrorCode.GEOJSON_LOAD_FAILED,
    severity: ErrorSeverity.ERROR,
    originalError,
    options: {
      showUser: true,
      retryable: true,
      toast: true,
      log: true,
    }
  });
}

/**
 * 위치 정보 관련 에러 생성 함수
 * 
 * 사용자 현재 위치 획득 실패 시 사용
 */
export function createGeolocationError(
  message = 'Failed to get current location',
  originalError?: unknown
) {
  const errorService = getErrorService();
  return errorService.createError(message, ErrorType.GEOLOCATION_UNAVAILABLE, {
    code: MapErrorCode.GEOLOCATION_FAILED,
    severity: ErrorSeverity.WARNING,
    originalError,
    options: {
      showUser: true,
      retryable: true,
      toast: true,
      log: true,
    }
  });
}

/**
 * 위치 정보 권한 관련 에러 생성 함수
 * 
 * 위치 권한 거부 시 사용
 */
export function createLocationPermissionError(
  message = 'Location permission denied',
  originalError?: unknown
) {
  const errorService = getErrorService();
  return errorService.createError(message, ErrorType.PERMISSION_DENIED, {
    code: MapErrorCode.PERMISSION_DENIED,
    severity: ErrorSeverity.WARNING,
    originalError,
    options: {
      showUser: true,
      retryable: false,
      toast: true,
      log: true,
    }
  });
}
