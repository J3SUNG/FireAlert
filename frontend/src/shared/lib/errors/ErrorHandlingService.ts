import {
  AppError,
  ErrorCategory,
  ErrorContext,
  ErrorHandler,
  ErrorHandlingService,
  ErrorLoggingOptions,
  ErrorSeverity
} from './errorTypes';

/**
 * 공통 기본 에러 처리 서비스 구현
 */
export class DefaultErrorHandlingService implements ErrorHandlingService {
  private handlers: ErrorHandler[] = [];
  private loggingOptions: ErrorLoggingOptions = {
    logToConsole: true, 
    logToService: false
  };
  
  // 사용자 친화적 에러 메시지 매핑
  private readonly userMessages: Record<ErrorCategory, string> = {
    [ErrorCategory.NETWORK]: '네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해 주세요.',
    [ErrorCategory.API]: '서비스 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    [ErrorCategory.VALIDATION]: '입력 데이터에 문제가 있습니다. 입력 값을 확인해 주세요.',
    [ErrorCategory.UI]: '화면 표시 중 오류가 발생했습니다.',
    [ErrorCategory.DATA]: '데이터 처리 중 오류가 발생했습니다.',
    [ErrorCategory.GENERAL]: '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  };
  
  constructor(options?: ErrorLoggingOptions) {
    if (options) {
      this.loggingOptions = { ...this.loggingOptions, ...options };
    }
  }
  
  /**
   * 에러 처리
   */
  handleError(error: AppError | Error, context?: ErrorContext): void {
    // 표준화된 AppError 객체로 변환
    const appError = this.normalizeError(error, context);
    
    // 에러 로깅
    this.logError(appError);
    
    // 등록된 모든 핸들러에 에러 전달
    this.handlers.forEach(handler => {
      try {
        handler(appError);
      } catch (handlerError) {
        // 핸들러 내부 에러는 콘솔에만 로깅하고 계속 진행
        console.error('Error handler failed:', handlerError);
      }
    });
  }
  
  /**
   * 에러 핸들러 등록
   */
  registerHandler(handler: ErrorHandler): void {
    if (!this.handlers.includes(handler)) {
      this.handlers.push(handler);
    }
  }
  
  /**
   * 에러 핸들러 제거
   */
  unregisterHandler(handler: ErrorHandler): void {
    this.handlers = this.handlers.filter(h => h !== handler);
  }
  
  /**
   * 새 에러 생성
   */
  createError(message: string, options: Partial<AppError> = {}): AppError {
    return {
      message,
      severity: options.severity || ErrorSeverity.ERROR,
      category: options.category || ErrorCategory.GENERAL,
      originalError: options.originalError,
      context: options.context || { timestamp: Date.now() },
      code: options.code,
      recoverable: options.recoverable !== undefined ? options.recoverable : true,
      retryable: options.retryable !== undefined ? options.retryable : true
    };
  }
  
  /**
   * 사용자 친화적 에러 메시지 가져오기
   */
  getUserMessage(error: AppError): string {
    // 심각도에 따라 다른 접두사 추가
    const prefix = error.severity === ErrorSeverity.CRITICAL 
      ? '심각한 오류: '
      : error.severity === ErrorSeverity.ERROR 
        ? '오류: '
        : error.severity === ErrorSeverity.WARNING
          ? '경고: '
          : '';
    
    // 카테고리에 맞는 친화적 메시지 반환
    // 개발자용 상세 메시지는 숨기고 사용자용 메시지 제공
    return `${prefix}${this.userMessages[error.category] || error.message}`;
  }
  
  /**
   * 에러 객체 정규화 (표준 형식으로 변환)
   */
  private normalizeError(error: AppError | Error, context?: ErrorContext): AppError {
    // 이미 AppError 형식인 경우
    if ('category' in error && 'severity' in error) {
      return {
        ...error,
        context: {
          ...error.context,
          ...context,
          timestamp: context?.timestamp || error.context?.timestamp || Date.now()
        }
      } as AppError;
    }
    
    // 일반 Error 객체를 AppError로 변환
    return {
      message: error.message || 'Unknown error',
      severity: ErrorSeverity.ERROR,
      category: this.guessErrorCategory(error),
      originalError: error,
      context: {
        ...context,
        timestamp: context?.timestamp || Date.now()
      },
      recoverable: true,
      retryable: true
    };
  }
  
  /**
   * 에러 카테고리 추측
   */
  private guessErrorCategory(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('connection') || 
        message.includes('internet') || message.includes('offline')) {
      return ErrorCategory.NETWORK;
    }
    
    if (message.includes('api') || message.includes('server') || 
        message.includes('response') || message.includes('request')) {
      return ErrorCategory.API;
    }
    
    if (message.includes('valid') || message.includes('format') || 
        message.includes('required') || message.includes('missing')) {
      return ErrorCategory.VALIDATION;
    }
    
    if (message.includes('data') || message.includes('parsing') || 
        message.includes('processing')) {
      return ErrorCategory.DATA;
    }
    
    if (message.includes('render') || message.includes('component') || 
        message.includes('element')) {
      return ErrorCategory.UI;
    }
    
    return ErrorCategory.GENERAL;
  }
  
  /**
   * 에러 로깅
   */
  private logError(error: AppError): void {
    // 콘솔 로깅
    if (this.loggingOptions.logToConsole) {
      const logMethod = 
        error.severity === ErrorSeverity.ERROR || error.severity === ErrorSeverity.CRITICAL
          ? console.error
          : error.severity === ErrorSeverity.WARNING
            ? console.warn
            : console.info;
      
      logMethod(
        `[${error.category}] ${error.message}`,
        { 
          severity: error.severity,
          context: error.context,
          originalError: error.originalError
        }
      );
    }
    
    // 원격 서비스 로깅 (실제 구현 필요)
    if (this.loggingOptions.logToService) {
      // 원격 서비스에 로깅 구현
      // 예: 서버 API 호출, 모니터링 서비스(Sentry 등) 활용
    }
  }
}

// 전역 싱글톤 인스턴스
let errorServiceInstance: ErrorHandlingService | null = null;

/**
 * 에러 처리 서비스 인스턴스 가져오기
 */
export function getErrorService(): ErrorHandlingService {
  if (!errorServiceInstance) {
    errorServiceInstance = new DefaultErrorHandlingService();
  }
  return errorServiceInstance;
}

/**
 * 에러 처리 서비스 재설정
 */
export function resetErrorService(): void {
  errorServiceInstance = null;
}