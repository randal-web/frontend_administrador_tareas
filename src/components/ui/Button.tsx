import React from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'text-white bg-[var(--primary)] hover:opacity-90 focus:ring-indigo-500',
    secondary: 'text-gray-700 bg-[var(--secondary)] hover:bg-gray-200 focus:ring-gray-400',
    danger: 'text-white bg-red-500 hover:bg-red-600 focus:ring-red-500',
    ghost: 'text-gray-600 bg-transparent hover:bg-gray-100 focus:ring-gray-300',
    outline: 'text-gray-700 bg-transparent border border-[var(--border)] hover:bg-gray-50 focus:ring-gray-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <AiOutlineLoading3Quarters className="animate-spin -ml-1 mr-2" size={size === 'sm' ? 14 : 18} />
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
