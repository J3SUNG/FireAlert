import { useState, useEffect, useCallback } from 'react';
import { 
  AppError, 
  ErrorCategory, 
  ErrorContext, 
  ErrorHandler, 
  ErrorSeverity 
} from './errorTypes';
import { getErrorService } from './ErrorHandlingService';

interface ErrorState {
  hasError: boolean;
  error: AppError | null;
  userMessage: string;
}

interface ErrorActions {
  clearError: () => void;
  setError: (error: Error | AppError, context?: ErrorContext) => void;
  createError: (message: string, category?: ErrorCategory, severity?: ErrorSeverity) => AppError;
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
  const setError = useCallback((error: Error | AppError, context?: ErrorContext) => {
    const errorContext: ErrorContext = {
      ...context,
      component: component || context?.component,
      feature: feature || context?.feature,
      timestamp: Date.now()
    };
    
    // 에러 서비스에 에러 전달
    errorService.handleError(error, errorContext);
  }, [component, feature, errorService]);
  
  // 에러 생성 함수
  const createError = useCallback((
    message: string, 
    category: ErrorCategory = ErrorCategory.GENERAL,
    severity: ErrorSeverity = ErrorSeverity.ERROR
  ): AppError => {
    return errorService.createError(message, {
      category,
      severity,
      context: {
        component,
        feature,
        timestamp: Date.now()
      }
    });
  }, [component, feature, errorService]);
  
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
      createError
    }
  ];
}