/**
 * 데이터 관련 에러 타입 정의
 * 모든 데이터 관련 에러와 산불 데이터 특화 에러를 포함합니다.
 */
import { ErrorSeverity, ErrorType, ErrorCategory, AppError } from './types';
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
): AppError {
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
): AppError {
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
): AppError {
  const errorService = getErrorService();
  return errorService.createError(
    message || getErrorMessage(code),
    ErrorType.FIRE_DATA_FETCH_FAILED, 
    {
      code,
      category: ErrorCategory.DATA,
      severity: ErrorSeverity.ERROR,
      originalError,
      context: {
        feature: "forest-fire-data",
        timestamp: Date.now(),
      },
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
): AppError {
  const errorService = getErrorService();
  return errorService.createError(
    message || getErrorMessage(code),
    ErrorType.FIRE_DATA_FETCH_FAILED, 
    {
      code,
      category: ErrorCategory.DATA,
      severity: ErrorSeverity.WARNING,
      originalError,
      context: {
        feature: "forest-fire-data",
        timestamp: Date.now(),
      },
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
 * 산불 데이터 파싱 에러 생성 함수
 * 
 * 산불 데이터 파싱에 실패했을 때 사용
 */
export function createFireDataParseError(
  message?: string,
  originalError?: unknown,
  code = DataErrorCode.FIRE_DATA_PARSE_FAILED
): AppError {
  const errorService = getErrorService();
  return errorService.createError(
    message || getErrorMessage(code),
    ErrorType.VALIDATION,
    {
      code,
      category: ErrorCategory.DATA,
      severity: ErrorSeverity.ERROR,
      originalError,
      context: {
        feature: "forest-fire-data",
        timestamp: Date.now(),
      },
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
 * 산불 데이터 로드 실패 에러 생성 함수
 * 
 * 산불 데이터 로드에 실패했을 때 사용
 * (기존 createFireDataLoadError 함수와의 호환성 유지)
 */
export function createFireDataLoadError(
  originalError?: unknown,
  additionalInfo?: string
): AppError {
  const message = additionalInfo 
    ? `${getErrorMessage(DataErrorCode.FIRE_DATA_FETCH_FAILED)} ${additionalInfo}`
    : getErrorMessage(DataErrorCode.FIRE_DATA_FETCH_FAILED);
    
  return createFireDataFetchError(message, originalError);
}

/**
 * 산불 데이터 특화 에러 생성 유틸리티 함수
 * 
 * 산불 데이터 관련 에러 생성을 위한 유연한 유틸리티 함수입니다.
 * 특정 상황에 맞는 에러 타입과 옵션을 지정할 수 있습니다.
 */
export function createForestFireDataError(
  code: DataErrorCode,
  message?: string,
  originalError?: unknown,
  additionalOptions?: Partial<AppError>
): AppError {
  // 에러 유형에 따라 카테고리와 타입 분류
  const category: ErrorCategory = ErrorCategory.DATA;
  let type: ErrorType = ErrorType.FIRE_DATA_FETCH_FAILED;
  let severity: ErrorSeverity = ErrorSeverity.WARNING;
  let retryable = true;

  if (code === DataErrorCode.FETCH_FAILED || code === DataErrorCode.TIMEOUT) {
    type = ErrorType.NETWORK;
    severity = ErrorSeverity.ERROR;
  } else if (code === DataErrorCode.PARSE_FAILED || code === DataErrorCode.VALIDATION_FAILED) {
    type = ErrorType.VALIDATION;
    severity = ErrorSeverity.ERROR;
    retryable = false;
  }

  const errorService = getErrorService();
  return errorService.createError(
    message || getErrorMessage(code),
    type,
    {
      code,
      category,
      severity,
      originalError,
      context: {
        feature: "forest-fire-data",
        timestamp: Date.now(),
        ...(additionalOptions?.context || {}),
      },
      options: {
        showUser: true,
        retryable,
        toast: true,
        log: true,
        ...(additionalOptions?.options || {}),
      },
      ...additionalOptions
    }
  );
}