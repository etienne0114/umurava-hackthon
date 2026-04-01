import React from 'react';
import clsx from 'clsx';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-800 mb-1">
          {label}
          {props.required && <span className="text-red-600 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={clsx(
          'w-full px-3 py-2 border rounded-lg transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'focus-visible:ring-2 focus-visible:ring-blue-500',
          error ? 'border-red-600' : 'border-gray-400',
          props.disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
          className
        )}
        rows={4}
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
