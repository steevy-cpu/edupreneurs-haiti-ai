import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface GoldBadgeProps {
  /** Current gold amount to display */
  goldAmount: number;
  /** Triggers a pulse animation when true (set briefly after gold is earned) */
  animated?: boolean;
  /** Optional extra classes */
  className?: string;
}

/**
 * Compact pill badge showing the student's gold balance.
 * Designed to fit inside lesson headers and exam banners.
 * Uses amber palette for gold theming with dark mode support.
 */
export function GoldBadge({ goldAmount, animated = false, className }: GoldBadgeProps) {
  const [isPulsing, setIsPulsing] = useState(false);

  // Brief pulse animation when animated prop is set to true
  useEffect(() => {
    if (animated) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [animated, goldAmount]);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        "bg-amber-100 text-amber-800 border border-amber-200/60",
        "dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/40",
        isPulsing && "animate-pulse ring-2 ring-amber-400/50",
        className
      )}
    >
      <span className="text-sm leading-none">🥇</span>
      <span>{goldAmount.toLocaleString('fr-FR')}</span>
    </div>
  );
}
