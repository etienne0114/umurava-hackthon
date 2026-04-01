import React from 'react';
import clsx from 'clsx';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className,
  id,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${selectId}-error`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-800 mb-1">
          {label}
          {props.required && <span className="text-red-600 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          'w-full px-3 py-2 border rounded-lg transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'focus-visible:ring-2 focus-visible:ring-blue-500',
          error ? 'border-red-600' : 'border-gray-400',
          props.disabled && 'bg-gray-100 cursor-not-allowed opacity-60',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
