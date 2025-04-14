import React from "react";
import "./ErrorFallbackUI.css";

interface ErrorFallbackUIProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  resetErrorBoundary?: () => void;
  component?: string; // 추가
  feature?: string;  // 추가
}

/**
 * 에러 상태에서 렌더링되는 폴백 UI
 * 
 * 사용자 친화적인 에러 메시지와 가능한 경우 재시도 버튼을 제공합니다.
 * 개발 환경에서는 디버깅 정보를 표시합니다.
 */
const ErrorFallbackUI: React.FC<ErrorFallbackUIProps> = ({
  error,
  errorInfo,
  resetErrorBoundary,
}) => {
  // 에러 발생시 사용자에게 보여줄 메시지
  const userFriendlyMessage = "예상치 못한 오류가 발생했습니다.";
  
  // 개발자를 위한 자세한 에러 정보
  const developerInfo = {
    errorName: error.name,
    errorMessage: error.message,
    stackTrace: error.stack,
    componentStack: errorInfo?.componentStack,
  };
  
  // 현재 환경이 개발 모드인지 확인 - 템플릿 값으로 처리
  const isDevelopment = false;

  return (
    <div className="error-fallback">
      <div className="error-fallback__icon">⚠️</div>
      <div className="error-fallback__content">
        <h2 className="error-fallback__title">앗! 문제가 발생했습니다</h2>
        <p className="error-fallback__message">{userFriendlyMessage}</p>
        
        {resetErrorBoundary && (
          <button
            className="error-fallback__retry-button"
            onClick={resetErrorBoundary}
          >
            다시 시도
          </button>
        )}
        
        {isDevelopment && (
          <div className="error-fallback__dev-info">
            <details>
              <summary>개발자 정보 ▾</summary>
              <div className="error-fallback__dev-details">
                <h4>에러명: {developerInfo.errorName}</h4>
                <h4>메시지: {developerInfo.errorMessage}</h4>
                {developerInfo.stackTrace && (
                  <>
                    <h4>스택 트레이스:</h4>
                    <pre>{developerInfo.stackTrace}</pre>
                  </>
                )}
                {developerInfo.componentStack && (
                  <>
                    <h4>컴포넌트 스택:</h4>
                    <pre>{developerInfo.componentStack}</pre>
                  </>
                )}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorFallbackUI;
