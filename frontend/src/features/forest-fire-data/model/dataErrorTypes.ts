import {
  ErrorCategory,
  ErrorSeverity,
  AppError,
  ErrorType,
} from "../../../shared/lib/errors";
import { DataErrorCode, getErrorMessage } from "../../../shared/lib/errors/errorCodes";

/**
 * 산불 데이터 특화 에러 메시지 (feature별 특화 메시지가 필요한 경우)
 */
export const FOREST_FIRE_DATA_MESSAGES: Record<string, string> = {
  [DataErrorCode.FIRE_DATA_FETCH_FAILED]: "산불 데이터를 가져오는데 실패했습니다. 네트워크 연결을 확인해주세요.",
  [DataErrorCode.CACHE_ERROR]: "산불 데이터 캐시 처리 중 오류가 발생했습니다.",
};

/**
 * 산불 데이터 feature 특화 에러 생성 함수
 *
 * 산불 데이터 슬라이스에 특화된 에러 컨텍스트를 포함합니다
 */
export function createForestFireDataError(
  code: DataErrorCode,
  originalError?: Error,
  additionalInfo?: string
): AppError {
  // feature 특화 메시지 또는 공통 메시지 사용
  const baseMessage = FOREST_FIRE_DATA_MESSAGES[code] || getErrorMessage(code);
  const message = additionalInfo ? `${baseMessage} ${additionalInfo}` : baseMessage;

  // 에러 유형에 따라 카테고리와 타입 분류
  let category: ErrorCategory = ErrorCategory.DATA;
  let type: ErrorType = ErrorType.FIRE_DATA_FETCH_FAILED;

  if (code === DataErrorCode.FETCH_FAILED || code === DataErrorCode.TIMEOUT) {
    type = ErrorType.NETWORK;
  } else if (code === DataErrorCode.PARSE_FAILED || code === DataErrorCode.VALIDATION_FAILED) {
    type = ErrorType.VALIDATION;
  }

  // 심각도 결정 - 네트워크 오류는 더 심각한 수준
  const severity =
    code === DataErrorCode.FETCH_FAILED || code === DataErrorCode.TIMEOUT
      ? ErrorSeverity.ERROR
      : ErrorSeverity.WARNING;

  return {
    message,
    type,
    severity,
    category,
    code,
    originalError,
    context: {
      feature: "forest-fire-data",
      timestamp: Date.now(),
    },
    options: {
      showUser: true,
      retryable: code !== DataErrorCode.VALIDATION_FAILED,
      toast: true,
      log: true,
    },
    timestamp: Date.now(),
  };
}

/**
 * 산불 데이터 로드 실패 에러 생성 함수
 * 
 * 산불 데이터 로드에 실패했을 때 사용
 */
export function createFireDataLoadError(
  originalError?: Error,
  additionalInfo?: string
): AppError {
  return createForestFireDataError(
    DataErrorCode.FIRE_DATA_FETCH_FAILED,
    originalError,
    additionalInfo
  );
}

/**
 * 산불 데이터 파싱 에러 생성 함수
 * 
 * 산불 데이터 파싱에 실패했을 때 사용
 */
export function createFireDataParseError(
  originalError?: Error,
  additionalInfo?: string
): AppError {
  return createForestFireDataError(
    DataErrorCode.FIRE_DATA_PARSE_FAILED,
    originalError,
    additionalInfo
  );
}
