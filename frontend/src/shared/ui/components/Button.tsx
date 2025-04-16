import React from "react";

/**
 * 버튼 변형 타입
 * 
 * default: 기본 스타일
 * primary: 주요 액션
 * secondary: 보조 액션
 * all: 전체 필터
 * active: 진행중 필터
 * contained: 통제중 필터
 * extinguished: 진화완료 필터
 */
type ButtonVariant = "default" | "primary" | "secondary" | "all" | "active" | "contained" | "extinguished";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isActive?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  /** ARIA 레이블 - 버튼 콘텐츠가 충분한 설명을 제공하지 않을 때 사용 */
  ariaLabel?: string;
}

/**
 * 공통 버튼 컴포넌트
 * 
 * 애플리케이션 전체에서 일관된 버튼 스타일과 기능을 제공합니다.
 * 다양한 변형(variant)과 상태(active/inactive)를 지원합니다.
 * 접근성 속성 추가: aria-label, aria-pressed
 * 
 * @param variant 버튼 변형 - default, primary, secondary, 필터 유형들
 * @param isActive 활성화 상태 - 필터 선택 상태 등을 표시
 * @param fullWidth 전체 너비 사용 여부
 * @param className 추가 CSS 클래스
 * @param children 버튼 내부 콘텐츠
 * @param ariaLabel 접근성 레이블 (옵션)
 */
export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  isActive = false,
  fullWidth = false,
  children,
  className = "",
  ariaLabel,
  ...props
}) => {
  // 기본 클래스
  let baseClass = "btn";
  
  // 변형에 따른 클래스 추가
  if (variant !== "default") {
    baseClass += ` btn--${variant}`;
  }
  
  // 활성화 상태에 따른 클래스 추가
  if (isActive) {
    if (variant === "all") baseClass += " btn--active-all";
    else if (variant === "active") baseClass += " btn--active-red";
    else if (variant === "contained") baseClass += " btn--active-orange";
    else if (variant === "extinguished") baseClass += " btn--active-green";
    else baseClass += " btn--active";
  }
  
  // 전체 너비 사용 시 클래스 추가
  if (fullWidth) {
    baseClass += " btn--full-width";
  }
  
  // 사용자 정의 클래스 추가
  const finalClassName = `${baseClass} ${className}`.trim();
  
  // 버튼이 토글 또는 필터 역할을 하는지 확인
  const isToggleButton = ["all", "active", "contained", "extinguished"].includes(variant);
  
  // 접근성 속성 설정
  const ariaProps: Record<string, string | boolean> = {};
  
  // ARIA 레이블 설정
  if (ariaLabel) {
    ariaProps["aria-label"] = ariaLabel;
  }
  
  // 토글 버튼인 경우 pressed 상태 설정
  if (isToggleButton) {
    ariaProps["aria-pressed"] = isActive;
  }
  
  return (
    <button 
      className={finalClassName} 
      {...ariaProps}
      {...props}
    >
      {children}
    </button>
  );
};