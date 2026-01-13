import { lazy, Suspense, ComponentProps } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load the heavy EmojiPicker component (~100KB)
const EmojiPickerLazy = lazy(() => import('emoji-picker-react'));

interface LazyEmojiPickerProps {
  onEmojiClick: ComponentProps<typeof EmojiPickerLazy>['onEmojiClick'];
  width?: string | number;
}

/**
 * Lazy-loaded EmojiPicker wrapper for 3G optimization.
 * Reduces initial bundle size by ~100KB.
 */
export function LazyEmojiPicker({ onEmojiClick, width = "100%" }: LazyEmojiPickerProps) {
  return (
    <Suspense fallback={<EmojiPickerSkeleton />}>
      <EmojiPickerLazy onEmojiClick={onEmojiClick} width={width} />
    </Suspense>
  );
}

function EmojiPickerSkeleton() {
  return (
    <div className="p-3 space-y-3 w-[320px]">
      {/* Search bar skeleton */}
      <Skeleton className="h-9 w-full rounded-lg" />
      
      {/* Category tabs skeleton */}
      <div className="flex gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-7 rounded" />
        ))}
      </div>
      
      {/* Emoji grid skeleton */}
      <div className="grid grid-cols-8 gap-1.5">
        {Array.from({ length: 48 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded" />
        ))}
      </div>
    </div>
  );
}

export default LazyEmojiPicker;
