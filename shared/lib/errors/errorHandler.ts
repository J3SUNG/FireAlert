/**
 * 에러 처리를 위한 유틸리티 함수
 */

import { AppError, ErrorType } from './types';
import { createAppError } from './errorFactory';

/**
 * 일반 에러를 AppError로 변환하는 함수
 */
export function normalizeError(error: unknown): AppError {
  // 이미 AppError인 경우
  if (isAppError(error)) {
    return error;
  }

  // Error 객체인 경우
  if (error instanceof Error) {
    return createAppError(
      ErrorType.UNKNOWN,
      error.message,
      { originalError: error }
    );
  }

  // 기타 타입의 에러
  return createAppError(
    ErrorType.UNKNOWN,
    typeof error === 'string' ? error : 'An unknown error occurred',
    { originalError: error }
  );
}

/**
 * 주어진 에러가 AppError 타입인지 확인하는 타입 가드 함수
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    'severity' in error &&
    'timestamp' in error
  );
}

/**
 * API 응답에서 발생한 에러를 처리하는 함수
 */
export function handleApiError(error: unknown): AppError {
  // Axios 또는 fetch 에러 처리
  if (
    error &&
    typeof error === 'object' &&
    'response' in error
  ) {
    // Axios 에러 처리
    const axiosError = error as { response?: { status?: number; data?: any } };
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    if (status === 401 || status === 403) {
      return createAppError(
        ErrorType.AUTH,
        data?.message || 'Authentication failed',
        { originalError: error }
      );
    }

    if (status === 404) {
      return createAppError(
        ErrorType.NOT_FOUND,
        data?.message || 'Resource not found',
        { originalError: error }
      );
    }

    if (status && status >= 500) {
      return createAppError(
        ErrorType.NETWORK,
        data?.message || 'Server error',
        { originalError: error }
      );
    }

    // 기타 응답 에러
    return createAppError(
      ErrorType.NETWORK,
      data?.message || 'API request failed',
      { originalError: error }
    );
  }

  // 네트워크 에러 (fetch API)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createAppError(
      ErrorType.NETWORK,
      'Network request failed',
      { originalError: error }
    );
  }

  // 일반 에러로 처리
  return normalizeError(error);
}

/**
 * 에러 로깅 함수
 */
export function logError(error: AppError): void {
  const { type, message, code, severity, timestamp, originalError } = error;
  
  // 개발 환경에서는 상세 로그
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', {
      type,
      message,
      code,
      severity,
      timestamp: new Date(timestamp).toISOString(),
      originalError
    });
    return;
  }
  
  // 프로덕션에서는 간소화된 로그
  console.error(`[${severity}] ${type}${code ? ` (${code})` : ''}: ${message}`);
  
  // 여기에 외부 로깅 서비스 연동 코드 추가 가능 (Sentry 등)
}
