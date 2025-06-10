// UI Button component with various styles and states
'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  disabled,
  icon,
  fullWidth = false,
  ...props
}: ButtonProps) {
  // Base styles with modern glass morphism design
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 disabled:pointer-events-none disabled:opacity-50 backdrop-blur-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]';
  
  // Size styles
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 py-2 text-sm',
    lg: 'h-11 px-6 py-2 text-base',
  };
  
  // Variant styles with modern gradients and glass effects
  const variantStyles = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border border-white/20 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25',
    secondary: 'bg-slate-800/50 text-slate-200 border border-slate-600/30 hover:bg-slate-700/50 shadow-slate-500/25',
    outline: 'border border-slate-600/30 text-slate-300 hover:bg-slate-800/50 backdrop-blur-lg shadow-slate-500/10',
    ghost: 'text-slate-300 hover:bg-slate-800/30 backdrop-blur-lg',
    danger: 'bg-gradient-to-r from-red-600 to-pink-600 text-white border border-white/20 hover:from-red-500 hover:to-pink-500 shadow-red-500/25',
  };
  
  // Width style
  const widthStyle = fullWidth ? 'w-full' : '';
  
  // Combined styles
  const buttonStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`;
  
  return (
    <button 
      className={buttonStyles}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
