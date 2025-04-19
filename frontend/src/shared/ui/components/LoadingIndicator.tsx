import React from "react";
import { LOADING_MESSAGE } from "../../constants";

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
  size?: "small" | "medium" | "large";
}

/**
 * 공통 로딩 표시 컴포넌트
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = LOADING_MESSAGE,
  className = "",
  size = "medium",
}) => {
  const containerClass = `loading-indicator ${className}`;
  const spinnerClass = `loading-indicator__spinner loading-indicator__spinner--${size}`;

  return (
    <div className={containerClass} aria-live="polite" aria-busy="true" role="status">
      <div className={spinnerClass} role="progressbar" aria-valuetext={message}></div>
      {message && <p className="loading-indicator__text">{message}</p>}
    </div>
  );
};
