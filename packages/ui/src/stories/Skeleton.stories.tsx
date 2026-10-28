import { Skeleton } from '../components/Skeleton';

export default {
  title: 'Primitives/Skeleton',
  component: Skeleton,
};

export const CardPlaceholder = () => (
  <div className="max-w-xs space-y-3 p-4 bg-surface-card rounded-md border border-surface-border">
    <Skeleton className="h-44 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex justify-between pt-2">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

export const TextLines = () => (
  <div className="space-y-2 max-w-md">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-4/6" />
  </div>
);
