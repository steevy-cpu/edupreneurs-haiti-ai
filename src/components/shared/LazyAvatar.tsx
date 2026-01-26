import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/avatarMap";

interface LazyAvatarProps {
  src?: string | null;
  fallback?: string;
  className?: string;
  /** Size variant for consistent sizing */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Additional ring styling */
  ring?: boolean;
}

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
};

const fallbackTextSize = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

/**
 * LazyAvatar - Optimized avatar component with lazy loading.
 * 
 * Automatically applies loading="lazy" and decoding="async" for 3G optimization.
 * Uses the avatarMap utility for consistent avatar URL resolution.
 * 
 * @example
 * <LazyAvatar src={user.avatar_url} fallback={user.nickname} size="md" />
 */
export function LazyAvatar({ 
  src, 
  fallback = '?', 
  className,
  size = 'md',
  ring = false
}: LazyAvatarProps) {
  const avatarUrl = getAvatarUrl(src);
  const initials = fallback.slice(0, 2).toUpperCase();

  return (
    <Avatar className={cn(
      sizeClasses[size], 
      ring && 'ring-2 ring-background',
      className
    )}>
      <AvatarImage 
        src={avatarUrl} 
        loading="lazy" 
        decoding="async"
        alt={fallback || 'Avatar'}
      />
      <AvatarFallback className={cn(
        "bg-gradient-to-br from-primary/20 to-muted font-medium",
        fallbackTextSize[size]
      )}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
