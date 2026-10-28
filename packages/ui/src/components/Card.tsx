import React from 'react';
import { cn } from '../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: CardProps): JSX.Element {
  const baseStyles = 'rounded-md text-white transition-all duration-200';

  const variants = {
    default: 'bg-surface-card border border-surface-border shadow-card',
    elevated: 'bg-surface-elevated border border-surface-border/80 shadow-card',
    bordered: 'bg-transparent border border-surface-border',
    interactive:
      'bg-surface-card border border-surface-border hover:border-brand-blue/50 hover:shadow-glow cursor-pointer active:scale-[0.99]',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };

  return (
    <div className={cn(baseStyles, variants[variant], paddings[padding], className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn('flex flex-col gap-1.5 pb-3 border-b border-surface-border/60', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>): JSX.Element {
  return (
    <h3
      className={cn('font-sora font-semibold text-lg text-white tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div className={cn('pt-3 font-sans text-sm text-gray-300', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn('flex items-center pt-4 border-t border-surface-border/60', className)}
      {...props}
    >
      {children}
    </div>
  );
}
