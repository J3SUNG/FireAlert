/**
 * 애플리케이션에서 사용되는 에러 타입 정의
 */

// 기본 에러 타입 
export enum ErrorType {
  // 일반적인 에러
  UNKNOWN = 'unknown',
  NETWORK = 'network',
  AUTH = 'auth',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  
  // 도메인별 에러 (산불 알림 서비스 관련)
  MAP_LOAD_FAILED = 'map_load_failed',
  FIRE_DATA_FETCH_FAILED = 'fire_data_fetch_failed',
  GEOLOCATION_UNAVAILABLE = 'geolocation_unavailable',
  PERMISSION_DENIED = 'permission_denied'
}

// 에러의 심각도 정의
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// 에러 처리 옵션
export interface ErrorOptions {
  showUser?: boolean;  // 사용자에게 표시할지 여부
  retryable?: boolean; // 재시도 가능한지 여부
  toast?: boolean;     // 토스트 메시지로 표시할지 여부
  log?: boolean;       // 로깅할지 여부
  metadata?: Record<string, any>; // 추가 메타데이터
}

// 애플리케이션 에러 인터페이스
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  severity: ErrorSeverity;
  timestamp: number;
  originalError?: unknown;
  options?: ErrorOptions;
}
