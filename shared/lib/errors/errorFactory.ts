/**
 * 에러 객체 생성을 위한 팩토리
 */

import { AppError, ErrorSeverity, ErrorType, ErrorOptions } from './types';

/**
 * 애플리케이션 에러 객체를 생성하는 함수
 */
export function createAppError(
  type: ErrorType,
  message: string,
  options?: {
    code?: string;
    severity?: ErrorSeverity;
    originalError?: unknown;
    errorOptions?: ErrorOptions;
  }
): AppError {
  return {
    type,
    message,
    code: options?.code,
    severity: options?.severity || ErrorSeverity.ERROR,
    timestamp: Date.now(),
    originalError: options?.originalError,
    options: options?.errorOptions || {
      showUser: true,
      retryable: false,
      toast: true,
      log: true
    }
  };
}

// 미리 정의된 에러 생성 함수들
export const createNetworkError = (
  message = 'Network connection failed',
  originalError?: unknown
): AppError => {
  return createAppError(ErrorType.NETWORK, message, {
    severity: ErrorSeverity.ERROR,
    originalError,
    errorOptions: {
      showUser: true,
      retryable: true,
      toast: true,
      log: true
    }
  });
};

export const createAuthError = (
  message = 'Authentication failed',
  originalError?: unknown
): AppError => {
  return createAppError(ErrorType.AUTH, message, {
    severity: ErrorSeverity.ERROR,
    originalError,
    errorOptions: {
      showUser: true,
      retryable: false,
      toast: true,
      log: true
    }
  });
};

export const createValidationError = (
  message: string,
  metadata?: Record<string, any>,
  originalError?: unknown
): AppError => {
  return createAppError(ErrorType.VALIDATION, message, {
    severity: ErrorSeverity.WARNING,
    originalError,
    errorOptions: {
      showUser: true,
      retryable: false,
      toast: false,
      log: true,
      metadata
    }
  });
};

export const createMapError = (
  message = 'Failed to load map',
  originalError?: unknown
): AppError => {
  return createAppError(ErrorType.MAP_LOAD_FAILED, message, {
    severity: ErrorSeverity.ERROR,
    originalError,
    errorOptions: {
      showUser: true,
      retryable: true,
      toast: true,
      log: true
    }
  });
};

export const createFireDataError = (
  message = 'Failed to fetch fire data',
  originalError?: unknown
): AppError => {
  return createAppError(ErrorType.FIRE_DATA_FETCH_FAILED, message, {
    severity: ErrorSeverity.ERROR,
    originalError,
    errorOptions: {
      showUser: true,
      retryable: true,
      toast: true,
      log: true
    }
  });
};

export const createGeolocationError = (
  message = 'Geolocation not available',
  originalError?: unknown
): AppError => {
  return createAppError(ErrorType.GEOLOCATION_UNAVAILABLE, message, {
    severity: ErrorSeverity.WARNING,
    originalError,
    errorOptions: {
      showUser: true,
      retryable: false,
      toast: true,
      log: true
    }
  });
};
