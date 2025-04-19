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
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { component, feature, onError } = this.props;

    const errorService = getErrorService();
    errorService.handleError(error, {
      component,
      feature,
      timestamp: Date.now(),
    });

    if (onError) {
      onError(error, errorInfo);
    }
  }

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
      if (fallback) {
        return fallback;
      }

      return (
        <ErrorFallbackUI
          error={error || new Error("Unknown error")}
          resetErrorBoundary={this.handleReset}
          component={this.props.component}
          feature={this.props.feature}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;
