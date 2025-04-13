import { useErrorHandling } from "../../../shared/lib/errors";
import { DataErrorCode, createDataError } from "../model/dataErrorTypes";

/**
 * 데이터 특화 에러 처리 훅
 *
 * 일반 에러 처리 훅을 확장하여 데이터 관련 특화 기능 제공
 */
export function useDataErrorHandling(component: string) {
  // 공통 에러 처리 훅 사용
  const [errorState, errorActions] = useErrorHandling(component, "forest-fire-data");

  // 네트워크 관련 에러 생성
  const createFetchError = (
    errorCode: DataErrorCode.FETCH_FAILED | DataErrorCode.TIMEOUT,
    originalError?: Error,
    additionalInfo?: string
  ) => {
    return createDataError(errorCode, originalError, additionalInfo);
  };

  // 데이터 구문 분석 에러 생성
  const createParsingError = (
    errorCode: DataErrorCode.PARSE_ERROR | DataErrorCode.INVALID_FORMAT,
    originalError?: Error,
    additionalInfo?: string
  ) => {
    return createDataError(errorCode, originalError, additionalInfo);
  };

  // 데이터 상태 관련 에러 생성
  const createStateError = (
    errorCode: DataErrorCode.EMPTY_RESPONSE | DataErrorCode.CACHE_ERROR,
    originalError?: Error,
    additionalInfo?: string
  ) => {
    return createDataError(errorCode, originalError, additionalInfo);
  };

  return {
    // 기존 에러 상태와 액션 그대로 내보내기
    ...errorState,
    ...errorActions,

    // 데이터 특화 에러 생성 함수 추가
    createFetchError,
    createParsingError,
    createStateError,
  };
}
