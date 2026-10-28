import { cn } from '../utils/cn';

export interface ToastProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function Toast({
  type = 'info',
  title,
  message,
  onDismiss,
  className,
}: ToastProps): JSX.Element {
  const borderStyles = {
    success: 'border-status-success/30 bg-emerald-950/70 text-emerald-200',
    warning: 'border-status-warning/30 bg-amber-950/70 text-amber-200',
    error: 'border-status-error/30 bg-red-950/70 text-red-200',
    info: 'border-status-info/30 bg-blue-950/70 text-blue-200',
  };

  const iconColors = {
    success: 'text-status-success',
    warning: 'text-status-warning',
    error: 'text-status-error',
    info: 'text-status-info',
  };

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-4 rounded-md border shadow-lg backdrop-blur-md transition-all font-sans',
        borderStyles[type],
        className,
      )}
    >
      <div className={cn('shrink-0 mt-0.5', iconColors[type])}>
        {type === 'success' && (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        {type === 'error' && (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        {type === 'warning' && (
          <svg
            className="w-5 h-5"
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
        )}
        {type === 'info' && (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>

      <div className="flex-1 text-sm">
        {title && <h5 className="font-semibold font-sora mb-0.5">{title}</h5>}
        <p className="opacity-90">{message}</p>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-white p-1 rounded transition-colors -mr-1 -mt-1"
          aria-label="Dismiss toast"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
