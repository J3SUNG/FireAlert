import React from "react";
import { LOADING_MESSAGE } from "../../constants";

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
  size?: "small" | "medium" | "large";
}

/**
 * 공통 로딩 표시 컴포넌트
 * 애플리케이션 전체에서 일관된 로딩 UI를 제공합니다.
 * 
 * @param props.message - 로딩 메시지 (기본값: "데이터를 불러오는 중입니다...")
 * @param props.className - 추가 CSS 클래스
 * @param props.size - 로딩 스피너 크기 (small, medium, large)
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = LOADING_MESSAGE,
  className = "",
  size = "medium",
}) => {
  const containerClass = `loading-indicator ${className}`;
  const spinnerClass = `loading-indicator__spinner loading-indicator__spinner--${size}`;
  
  return (
    <div className={containerClass}>
      <div className={spinnerClass}></div>
      {message && <p className="loading-indicator__text">{message}</p>}
    </div>
  );
};
