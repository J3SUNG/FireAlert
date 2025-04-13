/**
 * 에러 관련 모듈 통합 인덱스
 */

// 타입 및 인터페이스
export * from "./types";

// 데이터 관련 에러 팩토리
export {
  createDataFetchError,
  createDataParseError,
  createFireDataFetchError,
  createFireDataUpdateError,
  DataErrorCode,
} from "./dataErrorTypes";

// 지도 관련 에러 팩토리
export {
  createMapInitError,
  createMarkerError,
  createGeoJsonError,
  createGeolocationError,
  createLocationPermissionError,
  MapErrorCode,
} from "./mapErrorTypes";

// 에러 처리 서비스
export {
  DefaultErrorHandlingService,
  getErrorService,
  resetErrorService,
} from "./ErrorHandlingService";

// 에러 처리 훅
export { useErrorHandling, useAsyncOperation } from "./useErrorHandling";

// 에러 바운더리 컴포넌트
export { default as ErrorBoundary, ErrorFallbackUI } from "./boundary";
