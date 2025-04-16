import { 
  useErrorHandling, 
  DataErrorCode, 
  createForestFireDataError, 
  createFireDataLoadError,
  createFireDataParseError 
} from "../../../shared/lib/errors";

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
    originalError?: Error,
    additionalInfo?: string
  ) => {
    return createFireDataLoadError(originalError, additionalInfo);
  };

  // 데이터 구문 분석 에러 생성
  const createParsingError = (
    originalError?: Error,
    additionalInfo?: string
  ) => {
    return createFireDataParseError(originalError, additionalInfo);
  };

  // 일반 데이터 에러 생성 (특정 코드 사용 시)
  const createDataError = (
    errorCode: DataErrorCode,
    originalError?: Error,
    additionalInfo?: string
  ) => {
    return createForestFireDataError(errorCode, originalError, additionalInfo);
  };

  return {
    // 기존 에러 상태와 액션 그대로 내보내기
    ...errorState,
    ...errorActions,

    // 데이터 특화 에러 생성 함수 추가
    createFetchError,
    createParsingError,
    createDataError,
  };
}