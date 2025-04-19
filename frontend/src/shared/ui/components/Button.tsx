import React from "react";

/**
 * 버튼 변형 타입
 */
type ButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "all"
  | "active"
  | "contained"
  | "extinguished";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isActive?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

/**
 * 공통 버튼 컴포넌트
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
  let baseClass = "btn";

  if (variant !== "default") {
    baseClass += ` btn--${variant}`;
  }

  if (isActive) {
    if (variant === "all") baseClass += " btn--active-all";
    else if (variant === "active") baseClass += " btn--active-red";
    else if (variant === "contained") baseClass += " btn--active-orange";
    else if (variant === "extinguished") baseClass += " btn--active-green";
    else baseClass += " btn--active";
  }

  if (fullWidth) {
    baseClass += " btn--full-width";
  }

  const finalClassName = `${baseClass} ${className}`.trim();

  const isToggleButton = ["all", "active", "contained", "extinguished"].includes(variant);

  const ariaProps: Record<string, string | boolean> = {};

  if (ariaLabel) {
    ariaProps["aria-label"] = ariaLabel;
  }

  if (isToggleButton) {
    ariaProps["aria-pressed"] = isActive;
  }

  return (
    <button className={finalClassName} {...ariaProps} {...props}>
      {children}
    </button>
  );
};
