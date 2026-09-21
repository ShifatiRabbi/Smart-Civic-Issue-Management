/**
 * SMART CIVIC ISSUE MANAGEMENT PLATFORM
 * DESIGN SYSTEM CARD PRIMITIVE
 * 
 * Architectural Purpose:
 * Container surface complying with anti-slop guidelines: no extreme border radii,
 * no ungrounded glowing shadows, clean neutral borders.
 */

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'interactive';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseStyles = 'bg-white rounded-lg border border-slate-200 transition-all';
  
  const variantStyles = {
    default: 'shadow-sm',
    muted: 'bg-slate-50 border-slate-200 shadow-none',
    interactive: 'shadow-sm hover:border-slate-300 hover:shadow-md cursor-pointer',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
