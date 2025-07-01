
import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'danger_ghost' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ElementType;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText = 'Loading...',
  icon: Icon,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-[#FFDF00] text-[#004040] hover:bg-yellow-400 focus:ring-[#FFDF00]',
    secondary: 'bg-gray-200 text-[#004040] hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    danger_ghost: 'bg-transparent text-red-600 hover:bg-red-50 focus:ring-red-500',
    ghost: 'bg-transparent text-[#004040] hover:bg-yellow-50 focus:ring-[#FFDF00]',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <ArrowPathIcon className={`animate-spin mr-2 ${iconSize[size]}`} />}
      {Icon && !isLoading && <Icon className={`mr-2 ${iconSize[size]}`} />}
      {isLoading ? loadingText : children}
    </button>
  );
};