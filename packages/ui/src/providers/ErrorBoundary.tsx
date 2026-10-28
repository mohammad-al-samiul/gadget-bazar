'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../components/Button';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  locale?: 'bn' | 'en';
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error securely without PII
    console.error(
      'ErrorBoundary caught an unhandled error:',
      error.message,
      errorInfo.componentStack,
    );
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isBn = this.props.locale !== 'en';

      return (
        <div className="min-h-[300px] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full rounded-md border border-surface-border bg-surface-card p-6 text-center shadow-card space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-status-error/10 text-status-error mx-auto">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-bold font-sora text-white">
              {isBn ? 'একটি অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে' : 'Something went wrong'}
            </h3>

            <p className="text-xs text-gray-400">
              {isBn
                ? 'পৃষ্ঠাটি লোড করার সময় একটি সমস্যা হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।'
                : 'An unexpected error occurred while rendering this section. Please try again.'}
            </p>

            <div className="pt-2 flex justify-center gap-3">
              <Button variant="primary" size="sm" onClick={this.handleReset}>
                {isBn ? 'পুনরায় চেষ্টা করুন' : 'Try Again'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (typeof window !== 'undefined') window.location.reload();
                }}
              >
                {isBn ? 'রিলোড করুন' : 'Reload Page'}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
