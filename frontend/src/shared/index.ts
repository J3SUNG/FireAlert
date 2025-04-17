/**
 * 공통 레이어 공개 API
 *
 * 여러 기능에서 공통으로 사용되는 컴포넌트와 기능을 제공합니다.
 * 각 세그먼트에서 필요한 요소만 선택적으로 내보냅니다.
 */

// UI 컴포넌트
import { Button, LoadingIndicator, ErrorDisplay } from "./ui/components";
import { FireStatusSummary } from "./ui";
import { combineClasses } from "./ui/utils/classNameUtils";

// API 서비스
import { forestFireService } from "./api/forest-fire";
import { geoJsonService } from "./api/geoJsonService";

// 상수 값
import { APP_TITLE, FIRE_STATUS_TEXT, LOADING_MESSAGE, ERROR_MESSAGES, BUTTON_TEXT, FIRE_STATUS_CLASSES } from "./constants";

// 공통 유틸리티 및 훅
import {
  useCurrentTime,
  useFireFilterAndSelection,
  formatLocation,
  extractLocation,
  calculateFireStatistics,
  groupFiresByStatus,
  groupFiresByProvince,
  convertStatus,
  getResponseLevel,
  createCache,
  setupDefaultLeafletIcons,
} from "./lib";

// 에러 처리
import {
  ErrorBoundary,
  ErrorFallbackUI,
  useErrorHandling,
  useAsyncOperation,
  createDataFetchError,
  createMapInitError,
} from "./lib/errors";

// 모델 및 타입
import type { ForestFireData, GeoJsonData } from "./model";

// UI 컴포넌트 내보내기
export { Button, LoadingIndicator, ErrorDisplay, FireStatusSummary, combineClasses };

// API 서비스 내보내기
export { forestFireService, geoJsonService };

// 공통 유틸리티 및 훅 내보내기
export {
  useCurrentTime,
  useFireFilterAndSelection,
  formatLocation,
  extractLocation,
  calculateFireStatistics,
  groupFiresByStatus,
  groupFiresByProvince,
  convertStatus,
  getResponseLevel,
  createCache,
  setupDefaultLeafletIcons,
};

// 에러 처리 내보내기
export {
  ErrorBoundary,
  ErrorFallbackUI,
  useErrorHandling,
  useAsyncOperation,
  createDataFetchError,
  createMapInitError,
};

// 모델 및 타입 내보내기
export type { ForestFireData, GeoJsonData };

// 상수 값 내보내기
export { APP_TITLE, FIRE_STATUS_TEXT, LOADING_MESSAGE, ERROR_MESSAGES, BUTTON_TEXT, FIRE_STATUS_CLASSES };
