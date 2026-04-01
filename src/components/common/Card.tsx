import React, { memo } from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const CardComponent: React.FC<CardProps> = ({ children, className, padding = 'md', ...props }) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div className={clsx('bg-white rounded-lg shadow-md', paddingStyles[padding], className)} {...props}>
      {children}
    </div>
  );
};

// Memoize Card to prevent unnecessary re-renders
export const Card = memo(CardComponent);
