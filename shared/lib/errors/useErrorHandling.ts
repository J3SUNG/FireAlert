/**
 * 리액트 컴포넌트에서 에러 처리를 위한 훅
 */

import { useState, useCallback } from 'react';
import { AppError, ErrorType } from './types';
import { normalizeError, logError } from './errorHandler';

interface ErrorHandlingHook {
  error: AppError | null;
  setError: (error: unknown) => void;
  clearError: () => void;
  handleError: <T>(promise: Promise<T>) => Promise<T>;
  withErrorHandling: <T>(fn: () => Promise<T>) => Promise<T>;
}

/**
 * 컴포넌트 내에서 에러 처리를 위한 커스텀 훅
 */
export function useErrorHandling(): ErrorHandlingHook {
  const [error, setErrorState] = useState<AppError | null>(null);

  // 에러 설정 함수 (모든 종류의 에러를 AppError로 정규화)
  const setError = useCallback((err: unknown) => {
    const appError = normalizeError(err);
    
    setErrorState(appError);
    
    // 에러 로깅 및 부가 처리
    if (appError.options?.log !== false) {
      logError(appError);
    }
    
    // 토스트 메시지 표시 (실제 구현은 별도의 toast 라이브러리 사용 필요)
    if (appError.options?.toast) {
      // 예: toast.error(appError.message);
      console.warn('Toast would show:', appError.message);
    }
    
    return appError;
  }, []);

  // 에러 상태 초기화
  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  // Promise 에러 처리 래퍼
  const handleError = useCallback(async <T>(promise: Promise<T>): Promise<T> => {
    try {
      return await promise;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [setError]);

  // 함수 실행과 에러 처리를 결합한 유틸리티
  const withErrorHandling = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      return await fn();
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [setError]);

  return {
    error,
    setError,
    clearError,
    handleError,
    withErrorHandling
  };
}

/**
 * 특정 작업에 대한 로딩/에러 상태 관리 훅
 */
export function useAsyncOperation<T = void, E = unknown>() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { error, setError, clearError } = useErrorHandling();

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    clearError();
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, setError]);

  return {
    isLoading,
    error,
    execute,
    clearError
  };
}
