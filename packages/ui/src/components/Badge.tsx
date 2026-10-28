import React from 'react';
import { cn } from '../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'brand' | 'accent' | 'genuine';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps): JSX.Element {
  const baseStyles = 'inline-flex items-center font-medium select-none tracking-wide font-sora';

  const variants = {
    neutral: 'bg-surface-elevated text-gray-300 border border-surface-border',
    success: 'bg-status-success-light text-status-success border border-status-success/20',
    warning: 'bg-status-warning-light text-status-warning border border-status-warning/20',
    error: 'bg-status-error-light text-status-error border border-status-error/20',
    info: 'bg-status-info-light text-status-info border border-status-info/20',
    brand: 'bg-brand-blue-light text-brand-blue border border-brand-blue/30',
    accent: 'bg-brand-orange-light text-brand-orange border border-brand-orange/30',
    genuine:
      'bg-gradient-to-r from-emerald-950 to-teal-900 text-emerald-400 border border-emerald-500/40 shadow-sm',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-sm gap-1',
    md: 'text-xs px-2.5 py-1 rounded-base gap-1.5',
  };

  const dotColors = {
    neutral: 'bg-gray-400',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    error: 'bg-status-error',
    info: 'bg-status-info',
    brand: 'bg-brand-blue',
    accent: 'bg-brand-orange',
    genuine: 'bg-emerald-400',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {variant === 'genuine' && (
        <svg
          className="w-3.5 h-3.5 text-emerald-400 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      <span>{children}</span>
    </span>
  );
}
