import React from 'react';
import { cn } from '../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftAddon, rightAddon, className, disabled, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 font-sans">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-gray-300 font-sora select-none"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            'relative flex items-center bg-surface-card border rounded-base transition-colors duration-200 focus-within:ring-2 focus-within:ring-offset-1',
            error
              ? 'border-status-error focus-within:ring-status-error'
              : 'border-surface-border focus-within:border-brand-blue focus-within:ring-brand-blue/30',
            disabled && 'opacity-60 cursor-not-allowed bg-surface-ground',
          )}
        >
          {leftAddon && (
            <div className="pl-3.5 pr-1 text-gray-400 select-none flex items-center shrink-0">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full bg-transparent px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none disabled:cursor-not-allowed font-sora',
              leftAddon && 'pl-2',
              rightAddon && 'pr-2',
              className,
            )}
            {...props}
          />
          {rightAddon && (
            <div className="pr-3.5 pl-1 text-gray-400 flex items-center shrink-0">{rightAddon}</div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-status-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-gray-400">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
