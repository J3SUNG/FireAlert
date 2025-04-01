/**
 * 애플리케이션 공통 에러 타입 정의
 */
export enum ErrorSeverity {
  INFO = 'info',       // 정보 메시지
  WARNING = 'warning', // 경고 메시지
  ERROR = 'error',     // 일반 에러
  CRITICAL = 'critical' // 심각한 에러
}

export enum ErrorCategory {
  NETWORK = 'network',       // 네트워크 관련 에러
  API = 'api',               // API 호출 에러
  VALIDATION = 'validation', // 데이터 검증 에러
  UI = 'ui',                 // UI 관련 에러
  DATA = 'data',             // 데이터 처리 에러
  GENERAL = 'general'        // 일반 에러
}

export interface ErrorContext {
  component?: string;        // 에러가 발생한 컴포넌트
  feature?: string;          // 에러가 발생한 feature
  functionName?: string;     // 에러가 발생한 함수
  params?: Record<string, any>; // 관련 파라미터
  timestamp?: number;        // 발생 시간
}

export interface AppError {
  message: string;           // 에러 메시지
  severity: ErrorSeverity;   // 심각도
  category: ErrorCategory;   // 카테고리
  originalError?: Error;     // 원본 에러 (있는 경우)
  context?: ErrorContext;    // 에러 컨텍스트
  code?: string;             // 에러 코드 (선택적)
  recoverable?: boolean;     // 복구 가능 여부
  retryable?: boolean;       // 재시도 가능 여부
}

// 에러 처리자 타입
export type ErrorHandler = (error: AppError) => void;

// 에러 로깅 옵션
export interface ErrorLoggingOptions {
  logToConsole?: boolean;    // 콘솔에 로깅 여부
  logToService?: boolean;    // 서비스에 로깅 여부 (원격 로깅)
}

// 에러 처리 서비스 인터페이스
export interface ErrorHandlingService {
  // 에러 처리
  handleError(error: AppError | Error, context?: ErrorContext): void;
  
  // 에러 핸들러 등록
  registerHandler(handler: ErrorHandler): void;
  
  // 에러 핸들러 제거
  unregisterHandler(handler: ErrorHandler): void;
  
  // 에러 생성
  createError(message: string, options: Partial<AppError>): AppError;
  
  // 에러를 사용자 친화적 메시지로 변환
  getUserMessage(error: AppError): string;
}