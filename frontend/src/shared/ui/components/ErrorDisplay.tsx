import React from "react";
import { ERROR_MESSAGES, BUTTON_TEXT } from "../../constants";

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * 공통 에러 표시 컴포넌트
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message = ERROR_MESSAGES.default,
  onRetry,
  className = "",
}) => {
  const containerClass = `error-display ${className}`;

  return (
    <div className={containerClass}>
      <p className="error-display__text">{message}</p>
      {onRetry && (
        <button className="error-display__retry-button" onClick={onRetry}>
          {BUTTON_TEXT.retry}
        </button>
      )}
    </div>
  );
};
