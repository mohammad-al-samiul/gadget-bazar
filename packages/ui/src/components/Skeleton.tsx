import React from 'react';
import { cn } from '../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export function Skeleton({ variant = 'rounded', className, ...props }: SkeletonProps): JSX.Element {
  const variants = {
    rectangular: 'rounded-none',
    rounded: 'rounded-base',
    circular: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-surface-elevated/70 border border-surface-border/40',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
