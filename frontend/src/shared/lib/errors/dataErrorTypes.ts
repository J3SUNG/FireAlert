/**
 * 데이터 관련 에러 타입 정의
 */
import { ErrorSeverity, ErrorType, ErrorCategory } from './types';
import { DataErrorCode, getErrorMessage } from './errorCodes';
import { getErrorService } from './ErrorHandlingService';

/**
 * 데이터 페칭 에러 생성 함수
 * 
 * 네트워크 또는 서버 문제로 데이터를 가져오지 못할 때 사용
 */
export function createDataFetchError(
  message?: string,
  originalError?: unknown,
  code = DataErrorCode.FETCH_FAILED
) {
  const errorService = getErrorService();
  return errorService.createError(
    message || getErrorMessage(code),
    ErrorType.NETWORK, 
    {
      code,
      category: ErrorCategory.DATA,
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
 * 데이터 파싱 에러 생성 함수
 * 
 * 수신된 데이터의 형식이 예상과 다를 때 사용
 */
export function createDataParseError(
  message?: string,
  originalError?: unknown,
  code = DataErrorCode.PARSE_FAILED
) {
  const errorService = getErrorService();
  return errorService.createError(
    message || getErrorMessage(code),
    ErrorType.VALIDATION, 
    {
      code,
      category: ErrorCategory.DATA,
      severity: ErrorSeverity.ERROR,
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

/**
 * 산불 데이터 가져오기 에러 생성 함수
 * 
 * 산불 특화 데이터 로드 실패 시 사용
 */
export function createFireDataFetchError(
  message?: string,
  originalError?: unknown,
  code = DataErrorCode.FIRE_DATA_FETCH_FAILED
) {
  const errorService = getErrorService();
  return errorService.createError(
    message || getErrorMessage(code),
    ErrorType.FIRE_DATA_FETCH_FAILED, 
    {
      code,
      category: ErrorCategory.DATA,
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
 * 산불 데이터 업데이트 에러 생성 함수
 * 
 * 이미 로드된 산불 데이터 갱신 실패 시 사용
 */
export function createFireDataUpdateError(
  message?: string,
  originalError?: unknown,
  code = DataErrorCode.FIRE_DATA_UPDATE_FAILED
) {
  const errorService = getErrorService();
  return errorService.createError(
    message || getErrorMessage(code),
    ErrorType.FIRE_DATA_FETCH_FAILED, 
    {
      code,
      category: ErrorCategory.DATA,
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
