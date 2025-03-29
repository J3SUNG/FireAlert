import React from 'react';

interface ErrorDisplayProps {
  errorMessage: string;
  onRetry: () => void;
}

/**
 * 에러 표시 컴포넌트 (SRP)
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  errorMessage, 
  onRetry 
}) => {
  return (
    <div className="fire-alert__error-container">
      <p className="fire-alert__error-text">{errorMessage}</p>
      <button
        className="fire-alert__retry-button"
        onClick={onRetry}
      >
        다시 시도
      </button>
    </div>
  );
};