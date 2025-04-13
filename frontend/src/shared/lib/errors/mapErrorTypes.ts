/**
 * 지도 관련 에러 타입 정의
 */
import { ErrorSeverity, ErrorType, ErrorCategory } from './types';
import { MapErrorCode, getErrorMessage } from './errorCodes';
import { getErrorService } from './ErrorHandlingService';

/**
 * 지도 초기화 에러 생성 함수
 * 
 * 지도 컴포넌트 로드 및 초기화 실패 시 사용
 */
export function createMapInitError(
  message?: string,
  originalError?: unknown,
  code = MapErrorCode.INITIALIZATION_FAILED
) {
  const errorService = getErrorService();
  return errorService.createError(
    message || getErrorMessage(code),
    ErrorType.MAP_LOAD_FAILED, 
    {
      code,
      category: ErrorCategory.MAP,
      severity: ErrorSeverity.ERROR,
      originalError,
      options: {
        showUser: true,
        retryable: true,
        toast: true,
        log: true,
      }
    }
  );
}

/**
 * 지도 마커 생성 에러 생성 함수
 * 
 * 위치 마커 생성 및 표시 실패 시 사용
 */
export function createMarkerError(
  message?: string,
  originalError?: unknown,
  code = MapErrorCode.MARKER_CREATION_FAILED
) {
  const errorService = getErrorService();
  return errorService.createError(
    message || getErrorMessage(code),
    ErrorType.MAP_LOAD_FAILED, 
    {
      code,
      category: ErrorCategory.MAP,
      severity: ErrorSeverity.WARNING,
      originalError,
      options: {
        showUser: false,
        retryable: true,
        toast: false,
        log: true,
      }
    }
  );
}

/**
 * GeoJSON 로드 에러 생성 함수
 * 
 * 지역 경계 데이터 로드 실패 시 사용
 */
export function createGeoJsonError(
  message?: string,
  originalError?: unknown,
  code = MapErrorCode.GEOJSON_LOAD_FAILED
) {
  const errorService = getErrorService();
  return errorService.createError(
    message || getErrorMessage(code),
    ErrorType.MAP_LOAD_FAILED, 
    {
      code,
      category: ErrorCategory.MAP,
      severity: ErrorSeverity.ERROR,
      originalError,
      options: {
        showUser: true,
        retryable: true,
        toast: true,
        log: true,
      }
    }
  );
}

/**
 * 위치 정보 관련 에러 생성 함수
 * 
 * 사용자 현재 위치 획득 실패 시 사용
 */
export function createGeolocationError(
  message?: string,
  originalError?: unknown,
  code = MapErrorCode.GEOLOCATION_FAILED
) {
  const errorService = getErrorService();
  return errorService.createError(
    message || getErrorMessage(code),
    ErrorType.GEOLOCATION_UNAVAILABLE, 
    {
      code,
      category: ErrorCategory.MAP,
      severity: ErrorSeverity.WARNING,
      originalError,
      options: {
        showUser: true,
        retryable: true,
        toast: true,
        log: true,
      }
    }
  );
}

/**
 * 위치 정보 권한 관련 에러 생성 함수
 * 
 * 위치 권한 거부 시 사용
 */
export function createLocationPermissionError(
  message?: string,
  originalError?: unknown,
  code = MapErrorCode.PERMISSION_DENIED
) {
  const errorService = getErrorService();
  return errorService.createError(
    message || getErrorMessage(code),
    ErrorType.PERMISSION_DENIED, 
    {
      code,
      category: ErrorCategory.MAP,
      severity: ErrorSeverity.WARNING,
      originalError,
      options: {
        showUser: true,
        retryable: false,
        toast: true,
        log: true,
      }
    }
  );
}
