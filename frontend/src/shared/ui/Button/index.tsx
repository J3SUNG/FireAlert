import React, { ButtonHTMLAttributes } from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
type ButtonSize = 'small' | 'medium' | 'large';
type ButtonType = 'button' | 'submit' | 'reset';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: ButtonType;
}

// Open/Closed Principle: This Button component is open for extension via props
// but closed for modification
const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  onClick, 
  type = 'button',
  ...props 
}) => {
  const className = `button button--${variant} button--${size} ${disabled ? 'button--disabled' : ''}`;
  
  return (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;