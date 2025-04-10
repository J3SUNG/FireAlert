import React from "react";

type ButtonVariant = "default" | "primary" | "secondary" | "all" | "active" | "contained" | "extinguished";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isActive?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * 공통 버튼 컴포넌트
 * 애플리케이션 전체에서 일관된 버튼 스타일과 동작을 제공합니다.
 * 
 * @param props.variant - 버튼 변형 (default, primary, secondary, all, active, contained, extinguished)
 * @param props.isActive - 활성화 상태
 * @param props.fullWidth - 전체 너비 사용 여부
 * @param props.children - 버튼 내용
 * @param props.className - 추가 CSS 클래스
 * @param props - 기타 HTML 버튼 속성
 */
export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  isActive = false,
  fullWidth = false,
  children,
  className = "",
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
  
  return (
    <button className={finalClassName} {...props}>
      {children}
    </button>
  );
};
