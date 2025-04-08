/**
 * 에러 관련 모듈을 한 곳에서 내보내는 인덱스 파일
 */

// 타입 및 인터페이스 내보내기
export * from './types';

// 에러 팩토리 함수들 내보내기
export { 
  // 데이터 관련 에러 팩토리
  createDataFetchError,
  createDataParseError,
  createFireDataFetchError,
  createFireDataUpdateError,
  DataErrorCode
} from './dataErrorTypes';

export { 
  // 지도 관련 에러 팩토리
  createMapInitError,
  createMarkerError,
  createGeoJsonError,
  createGeolocationError,
  createLocationPermissionError,
  MapErrorCode
} from './mapErrorTypes';

// 에러 처리 서비스 내보내기
export { 
  DefaultErrorHandlingService,
  getErrorService,
  resetErrorService 
} from './ErrorHandlingService';

// 에러 처리 훅 내보내기
export { 
  useErrorHandling,
  useAsyncOperation 
} from './useErrorHandling';

// 에러 바운더리 컴포넌트 내보내기
export { default as ErrorBoundary, ErrorFallbackUI } from './boundary';
