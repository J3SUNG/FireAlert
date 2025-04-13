/**
 * 산불 데이터 관리 슬라이스 공개 API
 * 
 * 산불 데이터를 가져오고 관리하는 기능을 제공합니다.
 * 외부에서 필요한 훅과 타입만 선택적으로 내보냅니다.
 */

// 핵심 데이터 훅
import { useForestFireData } from './lib/useForestFireData';

// 에러 처리 훅
import { useDataErrorHandling } from './lib/useDataErrorHandling';

// 필요한 타입만 선택
import type { ForestFireDataState } from './model/types';

// 에러 관련 유틸리티
import { 
  createFireDataLoadError,
  createFireDataParseError
} from './model/dataErrorTypes';

// 핵심 데이터 훅 내보내기
export {
  useForestFireData
};

// 에러 처리 훅 내보내기
export {
  useDataErrorHandling
};

// 필요한 타입만 내보내기
export type {
  ForestFireDataState
};

// 에러 관련 유틸리티 내보내기
export {
  createFireDataLoadError,
  createFireDataParseError
};
