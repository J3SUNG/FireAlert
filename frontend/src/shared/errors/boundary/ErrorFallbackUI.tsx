import React from 'react';
import './error-fallback.css';

interface ErrorFallbackUIProps {
  error: Error | null;
  onReset: () => void;
  component?: string;
  feature?: string;
}

/**
 * 에러 폴백 UI 컴포넌트
 * 
 * 에러 발생 시 보여줄 사용자 친화적인 화면
 */
const ErrorFallbackUI: React.FC<ErrorFallbackUIProps> = ({
  error,
  onReset,
  component,
  feature
}) => {
  // 사용자에게 보여줄 에러 메시지
  const userMessage = error?.message || '알 수 없는 오류가 발생했습니다.';
  
  // 개발 환경에서만 상세 정보 표시
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="error-fallback">
      <div className="error-fallback__content">
        <div className="error-fallback__icon">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        
        <h2 className="error-fallback__title">오류가 발생했습니다</h2>
        
        <p className="error-fallback__message">
          {userMessage}
        </p>
        
        {/* 개발 모드에서만 표시되는 상세 정보 */}
        {isDevelopment && error && (
          <div className="error-fallback__details">
            <h3>기술적 세부 정보 (개발 모드)</h3>
            <p>
              <strong>컴포넌트:</strong> {component || '알 수 없음'}
              <br />
              <strong>기능:</strong> {feature || '알 수 없음'}
              <br />
              <strong>에러:</strong> {error.name || '알 수 없음'}
              <br />
              <strong>메시지:</strong> {error.message || '알 수 없음'}
              <br />
              <strong>스택 트레이스:</strong>
              <pre className="error-fallback__stack">
                {error.stack || '스택 트레이스 없음'}
              </pre>
            </p>
          </div>
        )}
        
        <div className="error-fallback__actions">
          <button 
            className="error-fallback__button error-fallback__button--primary" 
            onClick={onReset}
          >
            다시 시도
          </button>
          
          <button 
            className="error-fallback__button" 
            onClick={() => window.location.reload()}
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallbackUI;