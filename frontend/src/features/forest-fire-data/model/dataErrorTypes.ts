import { 
  ErrorCategory, 
  ErrorSeverity, 
  AppError 
} from '../../../shared/lib/errors/errorTypes';

/**
 * 데이터 관련 에러 코드
 */
export enum DataErrorCode {
  // 데이터 로딩 관련 에러
  FETCH_FAILED = 'DATA001',
  TIMEOUT = 'DATA002',
  
  // 데이터 파싱 관련 에러
  PARSE_ERROR = 'DATA003',
  INVALID_FORMAT = 'DATA004',
  
  // 데이터 상태 관련 에러
  EMPTY_RESPONSE = 'DATA005',
  CACHE_ERROR = 'DATA006'
}

/**
 * 데이터 에러 메시지 매핑
 */
export const DATA_ERROR_MESSAGES: Record<DataErrorCode, string> = {
  [DataErrorCode.FETCH_FAILED]: '산불 데이터를 가져오는데 실패했습니다.',
  [DataErrorCode.TIMEOUT]: '데이터 요청 시간이 초과되었습니다.',
  [DataErrorCode.PARSE_ERROR]: '데이터 분석 중 오류가 발생했습니다.',
  [DataErrorCode.INVALID_FORMAT]: '유효하지 않은 데이터 형식입니다.',
  [DataErrorCode.EMPTY_RESPONSE]: '받은 데이터가 없습니다.',
  [DataErrorCode.CACHE_ERROR]: '캐시 처리 중 오류가 발생했습니다.'
};

/**
 * 데이터 특화 에러 생성 함수
 * 
 * 에러 코드에 따라 적절한 에러 객체를 생성합니다
 */
export function createDataError(
  code: DataErrorCode, 
  originalError?: Error, 
  additionalInfo?: string
): AppError {
  const baseMessage = DATA_ERROR_MESSAGES[code] || '데이터 처리 중 오류가 발생했습니다.';
  const message = additionalInfo ? `${baseMessage} ${additionalInfo}` : baseMessage;
  
  // 에러 유형에 따라 카테고리 분류
  let category: ErrorCategory;
  
  if (code === DataErrorCode.FETCH_FAILED || code === DataErrorCode.TIMEOUT) {
    category = ErrorCategory.NETWORK;
  } else if (code === DataErrorCode.PARSE_ERROR || code === DataErrorCode.INVALID_FORMAT) {
    category = ErrorCategory.VALIDATION;
  } else {
    category = ErrorCategory.DATA;
  }
  
  // 네트워크 오류는 더 심각한 수준으로 분류
  const severity = 
    (code === DataErrorCode.FETCH_FAILED || code === DataErrorCode.TIMEOUT) 
      ? ErrorSeverity.ERROR 
      : ErrorSeverity.WARNING;
  
  return {
    message,
    severity,
    category,
    code,
    originalError,
    context: {
      feature: 'forest-fire-data',
      timestamp: Date.now()
    },
    recoverable: true,
    retryable: code !== DataErrorCode.INVALID_FORMAT // 형식 오류는 재시도해도 동일한 결과
  };
}