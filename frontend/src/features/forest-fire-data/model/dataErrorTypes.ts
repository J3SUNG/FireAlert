import {
  AppError,
  ErrorType,
  ErrorCategory,
  ErrorSeverity,
  DataErrorCode,
  createFireDataLoadError,
  createFireDataParseError,
  createForestFireDataError,
} from "../../../shared/lib/errors";

/**
 * 산불 데이터 관련 에러 함수 및 콘스턴트
 *
 * 산불 데이터 처리 중 발생할 수 있는 에러를 관리하기 위한 API를 제공합니다.
 */
export {
  DataErrorCode,
  createFireDataLoadError,
  createFireDataParseError,
  createForestFireDataError,
};

/**
 * 산불 데이터 에러 관련 메시지
 *
 * 에러 유형별 사용자 친화적인 메시지를 정의합니다.
 */
export const FOREST_FIRE_DATA_MESSAGES: Record<string, string> = {
  [DataErrorCode.FIRE_DATA_FETCH_FAILED]:
    "산불 데이터를 가져오는데 실패했습니다. 네트워크 연결을 확인해주세요.",
  [DataErrorCode.CACHE_ERROR]: "산불 데이터 캐시 처리 중 오류가 발생했습니다.",
};
