
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hideLabel?: boolean;
  icon?: React.ElementType;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, id, icon: Icon, error, className, hideLabel = false, ...props }) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className={`w-full ${className || ''}`}>
      {label && !hideLabel && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
            <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        )}
        <input
          id={inputId}
          className={`block w-full px-3 py-2 border rounded-md focus:outline-none sm:text-sm
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                   : 'border-gray-300 focus:ring-[#FFDF00] focus:border-[#FFDF00]'}
            ${props.disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hideLabel?: boolean;
  error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, id, error, className, hideLabel = false, ...props }) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className={`w-full ${className || ''}`}>
      {label && !hideLabel && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={3}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                 : 'border-gray-300 focus:ring-[#FFDF00] focus:border-[#FFDF00]'}
          ${props.disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};