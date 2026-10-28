import { cn } from '../utils/cn';

export interface TimelineEvent {
  stage: string;
  titleBn: string;
  titleEn: string;
  descriptionBn?: string;
  descriptionEn?: string;
  timestamp?: string;
  status: 'completed' | 'active' | 'pending';
}

export interface ShipmentTimelineProps {
  events: TimelineEvent[];
  mode?: 'air' | 'sea';
  locale?: 'bn' | 'en';
  className?: string;
}

export function ShipmentTimeline({
  events,
  mode = 'air',
  locale = 'bn',
  className,
}: ShipmentTimelineProps): JSX.Element {
  return (
    <div className={cn('flex flex-col gap-0 font-sans', className)}>
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold font-sora text-white">
            {locale === 'bn' ? 'শিপমেন্ট ট্র্যাকিং স্ট্যাটাস' : 'Shipment Tracking Timeline'}
          </span>
          <span className="px-2 py-0.5 text-[11px] font-medium rounded-sm bg-brand-blue-light text-brand-blue border border-brand-blue/30 uppercase">
            {mode === 'air'
              ? locale === 'bn'
                ? '✈️ এয়ার কার্গো'
                : '✈️ Air Cargo'
              : locale === 'bn'
                ? '🚢 সি কার্গো'
                : '🚢 Sea Freight'}
          </span>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-surface-border">
        {events.map((event, idx) => {
          const isCompleted = event.status === 'completed';
          const isActive = event.status === 'active';

          return (
            <div key={idx} className="relative flex items-start gap-3.5 group">
              {/* Timeline indicator node */}
              <div
                className={cn(
                  'absolute -left-6 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs transition-all',
                  isCompleted && 'bg-status-success text-white border-status-success',
                  isActive &&
                    'bg-brand-blue text-white border-brand-blue ring-4 ring-brand-blue/20 shadow-glow animate-pulse',
                  event.status === 'pending' &&
                    'bg-surface-elevated text-gray-500 border-surface-border',
                )}
              >
                {isCompleted ? (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={cn(
                      'text-sm font-semibold font-sora transition-colors',
                      isActive ? 'text-brand-orange' : isCompleted ? 'text-white' : 'text-gray-400',
                    )}
                  >
                    {locale === 'bn' ? event.titleBn : event.titleEn}
                  </h4>
                  {event.timestamp && (
                    <time className="text-[11px] text-gray-400 shrink-0 font-mono">
                      {event.timestamp}
                    </time>
                  )}
                </div>

                {(event.descriptionBn || event.descriptionEn) && (
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    {locale === 'bn' ? event.descriptionBn : event.descriptionEn}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
