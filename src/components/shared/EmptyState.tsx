import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  BookOpen, 
  FileText, 
  Bell,
  Search,
  Users,
  Trophy,
  Sparkles
} from "lucide-react";

type IllustrationType = 
  | "no-messages" 
  | "no-lessons" 
  | "no-notes" 
  | "no-notifications"
  | "no-search-results"
  | "no-users"
  | "no-achievements"
  | "empty-feed";

interface EmptyStateProps {
  illustration?: IllustrationType;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaAction?: () => void;
  ctaVariant?: "default" | "outline" | "ghost";
  children?: ReactNode;
  compact?: boolean;
}

const illustrations: Record<IllustrationType, { icon: typeof MessageSquare; color: string; bgColor: string }> = {
  "no-messages": { 
    icon: MessageSquare, 
    color: "text-blue-500", 
    bgColor: "bg-blue-500/10" 
  },
  "no-lessons": { 
    icon: BookOpen, 
    color: "text-emerald-500", 
    bgColor: "bg-emerald-500/10" 
  },
  "no-notes": { 
    icon: FileText, 
    color: "text-amber-500", 
    bgColor: "bg-amber-500/10" 
  },
  "no-notifications": { 
    icon: Bell, 
    color: "text-purple-500", 
    bgColor: "bg-purple-500/10" 
  },
  "no-search-results": { 
    icon: Search, 
    color: "text-slate-500", 
    bgColor: "bg-slate-500/10" 
  },
  "no-users": { 
    icon: Users, 
    color: "text-pink-500", 
    bgColor: "bg-pink-500/10" 
  },
  "no-achievements": { 
    icon: Trophy, 
    color: "text-yellow-500", 
    bgColor: "bg-yellow-500/10" 
  },
  "empty-feed": { 
    icon: Sparkles, 
    color: "text-indigo-500", 
    bgColor: "bg-indigo-500/10" 
  },
};

export const EmptyState = ({
  illustration = "no-messages",
  title,
  description,
  ctaLabel,
  ctaAction,
  ctaVariant = "default",
  children,
  compact = false,
}: EmptyStateProps) => {
  const { icon: Icon, color, bgColor } = illustrations[illustration];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8 px-4' : 'py-16 px-6'}`}>
      {/* Icon Container */}
      <div className={`${bgColor} ${compact ? 'w-16 h-16 mb-4' : 'w-20 h-20 sm:w-24 sm:h-24 mb-6'} rounded-full flex items-center justify-center relative`}>
        <div className={`absolute inset-0 ${bgColor} rounded-full animate-ping opacity-20`} />
        <Icon className={`${color} ${compact ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'} relative z-10`} />
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-foreground ${compact ? 'text-base mb-1' : 'text-lg sm:text-xl mb-2'}`}>
        {title}
      </h3>

      {/* Description */}
      <p className={`text-muted-foreground max-w-sm ${compact ? 'text-sm mb-4' : 'text-sm sm:text-base mb-6'}`}>
        {description}
      </p>

      {/* CTA Button */}
      {ctaLabel && ctaAction && (
        <Button 
          variant={ctaVariant} 
          onClick={ctaAction}
          className={compact ? 'h-9 text-sm' : ''}
        >
          {ctaLabel}
        </Button>
      )}

      {/* Custom children */}
      {children}
    </div>
  );
};

export default EmptyState;
