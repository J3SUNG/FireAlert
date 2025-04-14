import { Component, ErrorInfo, ReactNode } from "react";
import { getErrorService } from "../ErrorHandlingService";
import ErrorFallbackUI from "./ErrorFallbackUI";

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
 *
 * 컴포넌트 트리에서 발생하는 JavaScript 에러를 캐치하고 대체 UI 표시
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 에러 발생 시 상태 업데이트
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { component, feature, onError } = this.props;

    // 중앙 에러 처리 서비스에 에러 전달
    const errorService = getErrorService();
    errorService.handleError(error, {
      component,
      feature,
      timestamp: Date.now(),
    });

    // 사용자 정의 에러 핸들러가 있다면 호출
    if (onError) {
      onError(error, errorInfo);
    }
  }

  // 에러 상태 초기화 - 앱 복구 시도
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
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

      // 기본 에러 UI 표시
      return (
        <ErrorFallbackUI
          error={error || new Error('Unknown error')}  // null 값 방지
          resetErrorBoundary={this.handleReset}
          component={this.props.component}
          feature={this.props.feature}
        />
      );
    }

    // 에러가 없으면 자식 컴포넌트 정상 렌더링
    return children;
  }
}

export default ErrorBoundary;
