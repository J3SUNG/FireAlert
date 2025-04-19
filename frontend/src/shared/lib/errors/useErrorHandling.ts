import { useState, useEffect, useCallback } from "react";
import { AppError, ErrorContext, ErrorHandler } from "./types";
import { getErrorService } from "./ErrorHandlingService";

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
 * 에러 처리 훅
 */
export function useErrorHandling(component?: string, feature?: string): [ErrorState, ErrorActions] {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    userMessage: "",
  });

  const errorService = getErrorService();

  const errorHandler = useCallback<ErrorHandler>(
    (error: AppError) => {
      const isRelevantError =
        (!component && !feature) ||
        (component && error.context?.component === component) ||
        (feature && error.context?.feature === feature);

      if (isRelevantError) {
        setErrorState({
          hasError: true,
          error,
          userMessage: errorService.getUserMessage(error),
        });
      }
    },
    [component, feature, errorService]
  );

  const setError = useCallback(
    (error: Error | AppError | unknown, context?: ErrorContext) => {
      const errorContext: ErrorContext = {
        ...context,
        component: component || context?.component,
        feature: feature || context?.feature,
        timestamp: Date.now(),
      };

      errorService.handleError(error, errorContext);
    },
    [component, feature, errorService]
  );

  const handleAsync = useCallback(
    async <T>(promise: Promise<T>, context?: ErrorContext): Promise<T> => {
      try {
        return await promise;
      } catch (error) {
        setError(error, context);
        throw error;
      }
    },
    [setError]
  );

  const withErrorHandling = useCallback(
    async <T>(fn: () => Promise<T>, context?: ErrorContext): Promise<T> => {
      try {
        return await fn();
      } catch (error) {
        setError(error, context);
        throw error;
      }
    },
    [setError]
  );

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      userMessage: "",
    });
  }, []);

  useEffect(() => {
    errorService.registerHandler(errorHandler);

    return () => {
      errorService.unregisterHandler(errorHandler);
    };
  }, [errorHandler, errorService]);

  return [
    errorState,
    {
      clearError,
      setError,
      handleAsync,
      withErrorHandling,
    },
  ];
}

/**
 * 비동기 작업 상태 관리 훅
 */
export function useAsyncOperation<T>(component?: string, feature?: string) {
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
    clearError,
  };
}
