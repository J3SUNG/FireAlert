/**
 * 통합된 에러 타입 정의
 */

// 에러 심각도
export enum ErrorSeverity {
  INFO = 'info',       // 정보 메시지
  WARNING = 'warning', // 경고 메시지
  ERROR = 'error',     // 일반 에러
  CRITICAL = 'critical' // 심각한 에러
}

// 에러 카테고리
export enum ErrorCategory {
  NETWORK = 'network',       // 네트워크 관련 에러
  API = 'api',               // API 호출 에러
  VALIDATION = 'validation', // 데이터 검증 에러
  UI = 'ui',                 // UI 관련 에러
  DATA = 'data',             // 데이터 처리 에러
  MAP = 'map',               // 지도 관련 에러
  GENERAL = 'general'        // 일반 에러
}

// 상세 에러 타입
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

// 에러 컨텍스트
export interface ErrorContext {
  component?: string;        // 에러가 발생한 컴포넌트
  feature?: string;          // 에러가 발생한 feature
  functionName?: string;     // 에러가 발생한 함수
  params?: Record<string, any>; // 관련 파라미터
  timestamp?: number;        // 발생 시간
  action?: string;           // 수행 중이던 액션
}

// 에러 옵션
export interface ErrorOptions {
  showUser?: boolean;        // 사용자에게 보여줄지 여부
  retryable?: boolean;       // 재시도 가능 여부
  toast?: boolean;           // 토스트 메시지로 표시할지 여부
  log?: boolean;             // 로깅할지 여부
  metadata?: Record<string, any>; // 추가 메타데이터
}

// 통합된 앱 에러 인터페이스
export interface AppError {
  message: string;           // 에러 메시지
  type: ErrorType;           // 상세 에러 타입
  category: ErrorCategory;   // 에러 카테고리
  severity: ErrorSeverity;   // 에러 심각도
  code?: string;             // 에러 코드
  timestamp: number;         // 발생 시간
  context?: ErrorContext;    // 에러 컨텍스트
  originalError?: unknown;   // 원본 에러
  options?: ErrorOptions;    // 에러 처리 옵션
}

// 에러 핸들러 타입
export type ErrorHandler = (error: AppError) => void;

// 에러 로깅 옵션
export interface ErrorLoggingOptions {
  logToConsole?: boolean;    // 콘솔에 로깅 여부
  logToService?: boolean;    // 서비스에 로깅 여부 (원격 로깅)
}

// 에러 처리 서비스 인터페이스
export interface ErrorHandlingService {
  // 에러 처리
  handleError(error: AppError | Error | unknown, context?: ErrorContext): void;
  
  // 에러 핸들러 등록
  registerHandler(handler: ErrorHandler): void;
  
  // 에러 핸들러 제거
  unregisterHandler(handler: ErrorHandler): void;
  
  // 에러 생성
  createError(message: string, type: ErrorType, options?: Partial<Omit<AppError, 'message' | 'type' | 'timestamp'>>): AppError;
  
  // 에러를 사용자 친화적 메시지로 변환
  getUserMessage(error: AppError): string;
}
