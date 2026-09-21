/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * DESIGN SYSTEM BUTTON PRIMITIVE
 * 
 * Architectural Purpose:
 * Centralized accessible button adhering to the Design System tokens.
 * Supports variants (primary, secondary, danger, outline, ghost) and loading spinner.
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 min-h-[32px]',
    md: 'text-sm px-4 py-2 gap-2 min-h-[40px]',
    lg: 'text-base px-6 py-2.5 gap-2.5 min-h-[48px]',
  };

  const variantStyles = {
    primary: 'bg-[#1b3b57] text-white hover:bg-[#0f2438] active:bg-[#081420] focus-visible:outline-[#1b3b57]',
    secondary: 'bg-[#0d9488] text-white hover:bg-[#0f766e] active:bg-[#115e59] focus-visible:outline-[#0d9488]',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:outline-red-600',
    outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus-visible:outline-slate-500',
    ghost: 'text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-slate-500',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
