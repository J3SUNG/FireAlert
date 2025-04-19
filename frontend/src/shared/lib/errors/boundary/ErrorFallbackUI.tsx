import React from "react";
import "./ErrorFallbackUI.css";

interface ErrorFallbackUIProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  resetErrorBoundary?: () => void;
  component?: string;
  feature?: string;
}

/**
 * 에러 상태에서 렌더링되는 폴백 UI
 */
const ErrorFallbackUI: React.FC<ErrorFallbackUIProps> = ({
  error,
  errorInfo,
  resetErrorBoundary,
  component,
  feature,
}) => {
  const userFriendlyMessage = "예상치 못한 오류가 발생했습니다.";

  const developerInfo = {
    errorName: error.name,
    errorMessage: error.message,
    stackTrace: error.stack,
    componentStack: errorInfo?.componentStack,
    component,
    feature,
  };

  const isDevelopment = true;

  return (
    <div className="error-fallback">
      <div className="error-fallback__content">
        <div className="error-fallback__icon">⚠️</div>
        <h2 className="error-fallback__title">앗! 문제가 발생했습니다</h2>
        <p className="error-fallback__message">{userFriendlyMessage}</p>

        {isDevelopment && (
          <div className="error-fallback__details">
            <h3>오류 정보</h3>
            <p>{error.message}</p>

            {developerInfo.component && <p>컴포넌트: {developerInfo.component}</p>}

            {developerInfo.feature && <p>기능: {developerInfo.feature}</p>}

            {error.stack && (
              <div className="error-fallback__stack">
                {error.stack.split("\n").slice(0, 3).join("\n")}
              </div>
            )}
          </div>
        )}

        <div className="error-fallback__actions">
          {resetErrorBoundary && (
            <button
              className="error-fallback__button error-fallback__button--primary"
              onClick={resetErrorBoundary}
            >
              다시 시도
            </button>
          )}

          <button className="error-fallback__button" onClick={() => window.location.reload()}>
            페이지 새로고침
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallbackUI;
