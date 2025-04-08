/**
 * 지도 관련 에러 타입 정의
 */
import { createAppError, ErrorSeverity, ErrorType } from './index';

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
 */
export function createMapInitError(
  message = 'Failed to initialize map',
  originalError?: unknown
) {
  return createAppError(ErrorType.MAP_LOAD_FAILED, message, {
    code: MapErrorCode.INITIALIZATION_FAILED,
    severity: ErrorSeverity.ERROR,
    originalError,
    errorOptions: {
      showUser: true,
      retryable: true,
      toast: true,
      log: true,
    }
  });
}

/**
 * 지도 마커 생성 에러 생성 함수
 */
export function createMarkerError(
  message = 'Failed to create marker',
  originalError?: unknown
) {
  return createAppError(ErrorType.MAP_LOAD_FAILED, message, {
    code: MapErrorCode.MARKER_CREATION_FAILED,
    severity: ErrorSeverity.WARNING,
    originalError,
    errorOptions: {
      showUser: false,
      retryable: true,
      toast: false,
      log: true,
    }
  });
}

/**
 * GeoJSON 로드 에러 생성 함수
 */
export function createGeoJsonError(
  message = 'Failed to load GeoJSON data',
  originalError?: unknown
) {
  return createAppError(ErrorType.MAP_LOAD_FAILED, message, {
    code: MapErrorCode.GEOJSON_LOAD_FAILED,
    severity: ErrorSeverity.ERROR,
    originalError,
    errorOptions: {
      showUser: true,
      retryable: true,
      toast: true,
      log: true,
    }
  });
}

/**
 * 위치 정보 관련 에러 생성 함수
 */
export function createGeolocationError(
  message = 'Failed to get current location',
  originalError?: unknown
) {
  return createAppError(ErrorType.GEOLOCATION_UNAVAILABLE, message, {
    code: MapErrorCode.GEOLOCATION_FAILED,
    severity: ErrorSeverity.WARNING,
    originalError,
    errorOptions: {
      showUser: true,
      retryable: true,
      toast: true,
      log: true,
    }
  });
}

/**
 * 위치 정보 권한 관련 에러 생성 함수
 */
export function createLocationPermissionError(
  message = 'Location permission denied',
  originalError?: unknown
) {
  return createAppError(ErrorType.PERMISSION_DENIED, message, {
    code: MapErrorCode.PERMISSION_DENIED,
    severity: ErrorSeverity.WARNING,
    originalError,
    errorOptions: {
      showUser: true,
      retryable: false,
      toast: true,
      log: true,
    }
  });
}
