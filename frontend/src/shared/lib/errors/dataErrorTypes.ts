/**
 * 데이터 관련 에러 타입 정의
 */
import { ErrorSeverity, ErrorType } from './types';
import { getErrorService } from './ErrorHandlingService';

// 데이터 관련 세부 에러 코드
export enum DataErrorCode {
  FETCH_FAILED = 'data-001',
  PARSE_FAILED = 'data-002',
  VALIDATION_FAILED = 'data-003',
  TRANSFORM_FAILED = 'data-004',
  TIMEOUT = 'data-005',
  EMPTY_RESPONSE = 'data-006',
  FIRE_DATA_FETCH_FAILED = 'fire-data-001',
  FIRE_DATA_UPDATE_FAILED = 'fire-data-002',
  FIRE_DATA_PARSE_FAILED = 'fire-data-003',
}

/**
 * 데이터 페칭 에러 생성 함수
 */
export function createDataFetchError(
  message = 'Failed to fetch data',
  originalError?: unknown,
  code = DataErrorCode.FETCH_FAILED
) {
  const errorService = getErrorService();
  return errorService.createError(message, ErrorType.NETWORK, {
    code,
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
 * 데이터 파싱 에러 생성 함수
 */
export function createDataParseError(
  message = 'Failed to parse data',
  originalError?: unknown
) {
  const errorService = getErrorService();
  return errorService.createError(message, ErrorType.VALIDATION, {
    code: DataErrorCode.PARSE_FAILED,
    severity: ErrorSeverity.ERROR,
    originalError,
    options: {
      showUser: true,
      retryable: false,
      toast: true,
      log: true,
    }
  });
}

/**
 * 산불 데이터 관련 에러 생성 함수
 */
export function createFireDataFetchError(
  message = 'Failed to fetch forest fire data',
  originalError?: unknown
) {
  const errorService = getErrorService();
  return errorService.createError(message, ErrorType.FIRE_DATA_FETCH_FAILED, {
    code: DataErrorCode.FIRE_DATA_FETCH_FAILED,
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
 * 산불 데이터 업데이트 에러 생성 함수
 */
export function createFireDataUpdateError(
  message = 'Failed to update forest fire data',
  originalError?: unknown
) {
  const errorService = getErrorService();
  return errorService.createError(message, ErrorType.FIRE_DATA_FETCH_FAILED, {
    code: DataErrorCode.FIRE_DATA_UPDATE_FAILED,
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
