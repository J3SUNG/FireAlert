import React from "react";
import { ERROR_MESSAGES, BUTTON_TEXT } from "../../constants";

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * 공통 에러 표시 컴포넌트
 * 애플리케이션 전체에서 일관된 에러 UI를 제공합니다.
 * 
 * @param props.message - 에러 메시지 (기본값: 기본 에러 메시지)
 * @param props.onRetry - 재시도 버튼 클릭 핸들러
 * @param props.className - 추가 CSS 클래스
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
