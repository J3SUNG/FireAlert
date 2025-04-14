/**
 * 공통 라이브러리 유틸리티 공개 API
 *
 * 프로젝트 전체에서 사용하는 공통 후크와 유틸리티 함수들을 제공합니다.
 * 외부에 필요한 기능만 선택적으로 내보냅니다.
 */

// hooks 세그먼트에서 필요한 훅만 선택적으로 내보내기
import { 
  useCurrentTime,
  useFireFilterAndSelection 
} from "./hooks";

// formatting 세그먼트
import { 
  formatLocation,
  extractLocation,
  provinceShortNames
} from "./formatting";

// calculations 세그먼트
import {
  calculateFireStatistics,
  groupFiresByStatus,
  groupFiresByProvince
} from "./calculations/forestFireStats";

// data 처리 세그먼트
import {
  convertStatus,
  getResponseLevel
} from "./data/forestFireUtils";

// cache 유틸리티
import {
  CacheManager
} from "./cache/cacheUtils";

// Leaflet 유틸리티
import { 
  setupDefaultLeafletIcons 
} from "./leaflet/iconSetup";

// 훅 내보내기
export {
  useCurrentTime,
  useFireFilterAndSelection
};

// 포맷팅 관련 유틸리티 내보내기
export {
  formatLocation,
  extractLocation,
  provinceShortNames
};

// 계산 관련 유틸리티 내보내기
export {
  calculateFireStatistics,
  groupFiresByStatus,
  groupFiresByProvince
};

// 데이터 처리 관련 유틸리티 내보내기
export {
  convertStatus,
  getResponseLevel
};

// 캐시 유틸리티 내보내기
export {
  CacheManager
};

// Leaflet 유틸리티 내보내기
export {
  setupDefaultLeafletIcons
};
