/**
 * @deprecated 
 * 이 파일은 중복 코드 통합을 위해 더 이상 사용되지 않습니다.
 * 모든 에러 타입 및 함수는 shared/lib/errors로 이동되었습니다.
 * 다음 파일을 참조하세요: import { createFireDataLoadError } from '../../../shared/lib/errors';
 */

// 에러 타입 및 함수를 shared/lib/errors에서 가져와 호환성 유지
import {
  AppError,
  ErrorType,
  ErrorCategory,
  ErrorSeverity,
  DataErrorCode,
  createFireDataLoadError,
  createFireDataParseError,
  createForestFireDataError
} from "../../../shared/lib/errors";

// 현재 파일에서 사용되던 함수들을 중앙 모듈에서 재내보내기
export {
  DataErrorCode,
  createFireDataLoadError,
  createFireDataParseError,
  createForestFireDataError
};

// 이전 FOREST_FIRE_DATA_MESSAGES 상수도 내보내기 (호환성 유지)
export const FOREST_FIRE_DATA_MESSAGES: Record<string, string> = {
  [DataErrorCode.FIRE_DATA_FETCH_FAILED]: "산불 데이터를 가져오는데 실패했습니다. 네트워크 연결을 확인해주세요.",
  [DataErrorCode.CACHE_ERROR]: "산불 데이터 캐시 처리 중 오류가 발생했습니다.",
};