'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton width={40} height={40} variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height={16} />
            <Skeleton width="40%" height={12} />
          </div>
          <Skeleton width={80} height={32} variant="rectangular" />
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton width="70%" height={24} />
          <Skeleton width="50%" height={16} />
        </div>
        <Skeleton width={60} height={24} variant="rectangular" />
      </div>
      <div className="space-y-2">
        <Skeleton width="100%" height={12} />
        <Skeleton width="90%" height={12} />
        <Skeleton width="80%" height={12} />
      </div>
      <div className="flex gap-2">
        <Skeleton width={80} height={32} variant="rectangular" />
        <Skeleton width={80} height={32} variant="rectangular" />
      </div>
    </div>
  );
};

export const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <Skeleton width="40%" height={32} />
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton width="30%" height={16} />
          <Skeleton width="100%" height={40} variant="rectangular" />
        </div>
      ))}
      <div className="flex gap-4 justify-end">
        <Skeleton width={100} height={40} variant="rectangular" />
        <Skeleton width={100} height={40} variant="rectangular" />
      </div>
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="w-full h-64 sm:h-80 flex items-end justify-around gap-2 p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton
          key={index}
          width="18%"
          height={`${Math.random() * 60 + 40}%`}
          variant="rectangular"
        />
      ))}
    </div>
  );
};
