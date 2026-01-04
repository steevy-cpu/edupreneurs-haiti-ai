import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarMap";
import { Profile } from "@/types/community";

interface TypingIndicatorProps {
  profile: Profile | undefined;
}

export const TypingIndicator = ({ profile }: TypingIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <Avatar className="h-6 w-6 shrink-0 avatar-interactive">
        <AvatarImage src={getAvatarUrl(profile?.avatar_url)} />
        <AvatarFallback className="text-xs">
          {profile?.nickname?.[0] || profile?.full_name?.[0] || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
        <span className="italic">en train d'écrire</span>
        <div className="flex gap-0.5 items-end relative">
          {/* Subtle glow behind dots */}
          <div 
            className="absolute inset-0 blur-md opacity-40 rounded-full"
            style={{ background: 'var(--time-accent, hsl(var(--primary) / 0.5))' }}
          />
          <span 
            className="relative animate-typing-wave text-lg leading-none"
            style={{ animationDelay: '0ms' }}
          >
            •
          </span>
          <span 
            className="relative animate-typing-wave text-lg leading-none"
            style={{ animationDelay: '100ms' }}
          >
            •
          </span>
          <span 
            className="relative animate-typing-wave text-lg leading-none"
            style={{ animationDelay: '200ms' }}
          >
            •
          </span>
        </div>
      </div>
    </div>
  );
};
