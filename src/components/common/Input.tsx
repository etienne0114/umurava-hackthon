import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-800 mb-1">
          {label}
          {props.required && <span className="text-red-600 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'w-full px-3 py-2 border rounded-lg transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'focus-visible:ring-2 focus-visible:ring-blue-500',
          error ? 'border-red-600' : 'border-gray-400',
          props.disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={clsx(
          error && errorId,
          helperText && !error && helperId
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="mt-1 text-sm text-gray-600">
          {helperText}
        </p>
      )}
    </div>
  );
};
