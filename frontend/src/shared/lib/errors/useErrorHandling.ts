import { useState, useEffect, useCallback } from 'react';
import { 
  AppError, 
  ErrorCategory, 
  ErrorContext, 
  ErrorHandler, 
  ErrorSeverity,
  ErrorType
} from './types';
import { getErrorService } from './ErrorHandlingService';

interface ErrorState {
  hasError: boolean;
  error: AppError | null;
  userMessage: string;
}

interface ErrorActions {
  clearError: () => void;
  setError: (error: Error | AppError | unknown, context?: ErrorContext) => void;
  handleAsync: <T>(promise: Promise<T>, context?: ErrorContext) => Promise<T>;
  withErrorHandling: <T>(fn: () => Promise<T>, context?: ErrorContext) => Promise<T>;
}

/**
 * 애플리케이션 전체에서 사용할 수 있는 에러 처리 훅
 */
export function useErrorHandling(
  component?: string, 
  feature?: string
): [ErrorState, ErrorActions] {
  // 에러 상태
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    userMessage: ''
  });
  
  // 에러 서비스 가져오기
  const errorService = getErrorService();
  
  // 에러 핸들러
  const errorHandler = useCallback<ErrorHandler>((error: AppError) => {
    // 컴포넌트와 관련된 에러만 처리
    const isRelevantError = (
      (!component && !feature) || 
      (component && error.context?.component === component) ||
      (feature && error.context?.feature === feature)
    );
    
    if (isRelevantError) {
      setErrorState({
        hasError: true,
        error,
        userMessage: errorService.getUserMessage(error)
      });
    }
  }, [component, feature, errorService]);
  
  // 에러 설정 함수
  const setError = useCallback((error: Error | AppError | unknown, context?: ErrorContext) => {
    const errorContext: ErrorContext = {
      ...context,
      component: component || context?.component,
      feature: feature || context?.feature,
      timestamp: Date.now()
    };
    
    // 에러 서비스에 에러 전달
    errorService.handleError(error, errorContext);
  }, [component, feature, errorService]);
  
  // 비동기 함수 에러 처리 래퍼
  const handleAsync = useCallback(async <T>(
    promise: Promise<T>, 
    context?: ErrorContext
  ): Promise<T> => {
    try {
      return await promise;
    } catch (error) {
      setError(error, context);
      throw error;
    }
  }, [setError]);
  
  // 함수 실행과 에러 처리를 결합한 유틸리티
  const withErrorHandling = useCallback(async <T>(
    fn: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      setError(error, context);
      throw error;
    }
  }, [setError]);
  
  // 에러 초기화 함수
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      userMessage: ''
    });
  }, []);
  
  // 컴포넌트 마운트 시 에러 핸들러 등록
  useEffect(() => {
    // 에러 핸들러 등록
    errorService.registerHandler(errorHandler);
    
    // 컴포넌트 언마운트 시 에러 핸들러 제거
    return () => {
      errorService.unregisterHandler(errorHandler);
    };
  }, [errorHandler, errorService]);
  
  // 에러 상태와 액션 반환
  return [
    errorState,
    {
      clearError,
      setError,
      handleAsync,
      withErrorHandling
    }
  ];
}

/**
 * 비동기 작업을 위한 로딩 및 에러 상태 관리 훅
 */
export function useAsyncOperation<T>(
  component?: string,
  feature?: string
) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorState, { clearError, setError }] = useErrorHandling(component, feature);
  
  const execute = useCallback(
    async (asyncFn: () => Promise<T>, context?: ErrorContext): Promise<T | null> => {
      setIsLoading(true);
      clearError();
      
      try {
        const result = await asyncFn();
        return result;
      } catch (error) {
        setError(error, context);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, setError]
  );
  
  return {
    isLoading,
    error: errorState.error,
    errorMessage: errorState.userMessage,
    hasError: errorState.hasError,
    execute,
    clearError
  };
}
