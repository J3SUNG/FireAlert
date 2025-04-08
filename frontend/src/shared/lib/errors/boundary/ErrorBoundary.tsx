import React, { Component, ErrorInfo, ReactNode } from 'react';
import { getErrorService } from '../ErrorHandlingService';
import ErrorFallbackUI from './ErrorFallbackUI';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  component?: string;
  feature?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 에러 바운더리 컴포넌트
 * React 컴포넌트 트리에서 자식 컴포넌트에서 발생하는 JavaScript 에러를 캐치하고 
 * 에러 UI를 표시합니다.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트합니다
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 에러 로깅
    const { component, feature, onError } = this.props;
    
    // 에러 서비스에 에러 전달
    const errorService = getErrorService();
    errorService.handleError(error, {
      component,
      feature,
      timestamp: Date.now()
    });
    
    // 사용자 정의 에러 핸들러 호출
    if (onError) {
      onError(error, errorInfo);
    }
  }

  // 에러 상태 초기화
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // 사용자 지정 폴백 UI가 있으면 사용
      if (fallback) {
        return fallback;
      }
      
      // 기본 에러 UI 컴포넌트
      return (
        <ErrorFallbackUI 
          error={error} 
          onReset={this.handleReset} 
          component={this.props.component}
          feature={this.props.feature}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;
