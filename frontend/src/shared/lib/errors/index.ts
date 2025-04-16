/**
 * 에러 관리 시스템 공개 API
 * 
 * 이 모듈은 어플리케이션 전체에서 사용할 에러 관리 시스템을 제공합니다.
 * 외부 모듈에서 필요한 타입, 함수 및 컴포넌트만 선택적으로 내보냅니다.
 */

// 핵심 에러 타입 (필요한 것만 선택적으로 내보내기)
import { 
  AppError, 
  ErrorType, 
  ErrorCategory, 
  ErrorSeverity,
  ErrorContext,
  ErrorHandler
} from "./types";

// 에러 코드 (무분별한 export * 대신 필요한 것만 선택)
import {
  GeneralErrorCode,
  DataErrorCode,
  MapErrorCode,
  getErrorMessage
} from "./errorCodes";

// 에러 생성 유틸리티 (공개할 API만 선택)
import {
  createDataFetchError,
  createDataParseError,
  createFireDataFetchError,
  createFireDataUpdateError,
  createFireDataParseError,
  createFireDataLoadError,
  createForestFireDataError
} from "./dataErrorTypes";

import {
  createMapInitError,
  createMarkerError,
  createGeoJsonError,
  createGeolocationError,
  createLocationPermissionError
} from "./mapErrorTypes";

// 에러 서비스 (공개 API만 선택)
import {
  getErrorService,
  resetErrorService
} from "./ErrorHandlingService";

// 에러 훅 (공개 API만 선택)
import { 
  useErrorHandling, 
  useAsyncOperation 
} from "./useErrorHandling";

// 에러 바운더리 컴포넌트
import ErrorBoundary, { 
  ErrorFallbackUI 
} from "./boundary";

// 타입 내보내기 - 필요한 것만 명시적으로 내보냄
export type {
  AppError,
  ErrorContext,
  ErrorHandler
};

// 열거형 내보내기
export {
  ErrorType,
  ErrorCategory,
  ErrorSeverity,
  GeneralErrorCode,
  DataErrorCode,
  MapErrorCode
};

// 유틸리티 함수 내보내기
export {
  getErrorMessage,
  getErrorService,
  resetErrorService
};

// 데이터 에러 유틸리티 내보내기
export {
  createDataFetchError,
  createDataParseError,
  createFireDataFetchError,
  createFireDataUpdateError,
  createFireDataParseError,
  createFireDataLoadError,
  createForestFireDataError
};

// 맵 에러 유틸리티 내보내기
export {
  createMapInitError,
  createMarkerError,
  createGeoJsonError,
  createGeolocationError,
  createLocationPermissionError
};

// 에러 훅 내보내기
export {
  useErrorHandling,
  useAsyncOperation
};

// 컴포넌트 내보내기
export {
  ErrorBoundary,
  ErrorFallbackUI
};