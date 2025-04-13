import {
  AppError,
  ErrorCategory,
  ErrorContext,
  ErrorHandler,
  ErrorHandlingService,
  ErrorLoggingOptions,
  ErrorSeverity,
  ErrorType
} from './types';

/**
 * 공통 기본 에러 처리 서비스 구현
 * 
 * 애플리케이션 전체 에러 처리 로직을 중앙화
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
    [ErrorCategory.MAP]: '지도 로딩 중 오류가 발생했습니다.',
    [ErrorCategory.GENERAL]: '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
  };
  
  // 타입별 카테고리 매핑
  private readonly typeToCategoryMap: Record<ErrorType, ErrorCategory> = {
    [ErrorType.UNKNOWN]: ErrorCategory.GENERAL,
    [ErrorType.NETWORK]: ErrorCategory.NETWORK,
    [ErrorType.AUTH]: ErrorCategory.API,
    [ErrorType.VALIDATION]: ErrorCategory.VALIDATION,
    [ErrorType.NOT_FOUND]: ErrorCategory.API,
    [ErrorType.MAP_LOAD_FAILED]: ErrorCategory.MAP,
    [ErrorType.FIRE_DATA_FETCH_FAILED]: ErrorCategory.DATA,
    [ErrorType.GEOLOCATION_UNAVAILABLE]: ErrorCategory.MAP,
    [ErrorType.PERMISSION_DENIED]: ErrorCategory.MAP
  };
  
  constructor(options?: ErrorLoggingOptions) {
    if (options) {
      this.loggingOptions = { ...this.loggingOptions, ...options };
    }
  }
  
  /**
   * 에러 처리
   * 
   * 에러를 표준화하고 로깅 및 등록된 핸들러에 전달
   */
  handleError(error: AppError | Error | unknown, context?: ErrorContext): void {
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
   * 
   * 표준화된 에러 객체 생성
   */
  createError(
    message: string, 
    type: ErrorType = ErrorType.UNKNOWN,
    options: Partial<Omit<AppError, 'message' | 'type' | 'timestamp'>> = {}
  ): AppError {
    const category = options.category || this.typeToCategoryMap[type] || ErrorCategory.GENERAL;
    
    return {
      message,
      type,
      category,
      severity: options.severity || ErrorSeverity.ERROR,
      code: options.code,
      timestamp: Date.now(),
      context: options.context || {},
      originalError: options.originalError,
      options: options.options || {
        showUser: true,
        retryable: true,
        toast: true,
        log: true
      }
    };
  }
  
  /**
   * 사용자 친화적 에러 메시지 가져오기
   * 
   * 개발자용 기술적 메시지 대신 사용자용 메시지 생성
   */
  getUserMessage(error: AppError): string {
    const prefix = error.severity === ErrorSeverity.CRITICAL 
      ? '심각한 오류: '
      : error.severity === ErrorSeverity.ERROR 
        ? '오류: '
        : error.severity === ErrorSeverity.WARNING
          ? '경고: '
          : '';
    
    if (error.options?.showUser) {
      return `${prefix}${error.message}`;
    }
    
    return `${prefix}${this.userMessages[error.category] || error.message}`;
  }
  
  /**
   * 에러 객체 정규화 (표준 형식으로 변환)
   */
  private normalizeError(error: unknown, context?: ErrorContext): AppError {
    // 이미 AppError 형식인 경우
    if (this.isAppError(error)) {
      return {
        ...error,
        context: {
          ...error.context,
          ...context,
          timestamp: context?.timestamp || error.context?.timestamp || Date.now()
        }
      };
    }
    
    // Error 객체인 경우
    if (error instanceof Error) {
      const errorType = this.guessErrorType(error);
      return this.createError(
        error.message || 'Unknown error', 
        errorType,
        {
          category: this.typeToCategoryMap[errorType],
          severity: ErrorSeverity.ERROR,
          context: {
            ...context,
            timestamp: context?.timestamp || Date.now()
          },
          originalError: error,
          options: {
            showUser: true,
            retryable: true,
            toast: true,
            log: true
          }
        }
      );
    }
    
    // 기타 타입의 에러
    return this.createError(
      typeof error === 'string' ? error : 'An unknown error occurred',
      ErrorType.UNKNOWN,
      {
        context,
        originalError: error
      }
    );
  }
  
  /**
   * 객체가 AppError 타입인지 확인
   */
  private isAppError(obj: unknown): obj is AppError {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'type' in obj &&
      'message' in obj &&
      'category' in obj &&
      'severity' in obj &&
      'timestamp' in obj
    );
  }
  
  /**
   * 에러 타입 추측
   * 
   * 에러 메시지 내용을 기반으로 적절한 타입 판단
   */
  private guessErrorType(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('connection') || 
        message.includes('internet') || message.includes('offline')) {
      return ErrorType.NETWORK;
    }
    
    if (message.includes('auth') || message.includes('permission') || 
        message.includes('login') || message.includes('unauthorized')) {
      return ErrorType.AUTH;
    }
    
    if (message.includes('valid') || message.includes('format') || 
        message.includes('required') || message.includes('missing')) {
      return ErrorType.VALIDATION;
    }
    
    if (message.includes('map') || message.includes('layer') || 
        message.includes('marker')) {
      return ErrorType.MAP_LOAD_FAILED;
    }
    
    if (message.includes('fire') || message.includes('data') || 
        message.includes('fetch')) {
      return ErrorType.FIRE_DATA_FETCH_FAILED;
    }
    
    if (message.includes('location') || message.includes('geolocation') || 
        message.includes('position')) {
      return ErrorType.GEOLOCATION_UNAVAILABLE;
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return ErrorType.NOT_FOUND;
    }
    
    return ErrorType.UNKNOWN;
  }
  
  /**
   * 에러 로깅
   * 
   * 에러 정보를 콘솔 또는 원격 서비스에 기록
   */
  private logError(error: AppError): void {
    if (!error.options?.log) {
      return;
    }
    
    // 콘솔 로깅
    if (this.loggingOptions.logToConsole) {
      const logMethod = 
        error.severity === ErrorSeverity.CRITICAL
          ? console.error
          : error.severity === ErrorSeverity.ERROR
            ? console.error
            : error.severity === ErrorSeverity.WARNING
              ? console.warn
              : console.info;
      
      logMethod(
        `[${error.category}] ${error.type}${error.code ? ` (${error.code})` : ''}: ${error.message}`,
        { 
          severity: error.severity,
          context: error.context,
          originalError: error.originalError
        }
      );
    }
    
    // 원격 서비스 로깅 (필요시 구현)
    if (this.loggingOptions.logToService) {
      // 원격 로깅 서비스 연동 코드
    }
  }
}

// 전역 싱글톤 인스턴스
let errorServiceInstance: ErrorHandlingService | null = null;

/**
 * 에러 처리 서비스 인스턴스 가져오기
 * 
 * 싱글톤 패턴으로 서비스 인스턴스 제공
 */
export function getErrorService(): ErrorHandlingService {
  if (!errorServiceInstance) {
    errorServiceInstance = new DefaultErrorHandlingService();
  }
  return errorServiceInstance;
}

/**
 * 에러 처리 서비스 재설정
 * 
 * 주로 테스트 목적으로 사용
 */
export function resetErrorService(): void {
  errorServiceInstance = null;
}