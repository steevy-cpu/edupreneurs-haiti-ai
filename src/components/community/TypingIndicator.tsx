import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatarMap";
import { Profile } from "@/types/community";

interface TypingIndicatorProps {
  profile: Profile | undefined;
}

export const TypingIndicator = ({ profile }: TypingIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <Avatar className="h-6 w-6 shrink-0">
        <AvatarImage src={getAvatarUrl(profile?.avatar_url)} />
        <AvatarFallback className="text-xs">
          {profile?.nickname?.[0] || profile?.full_name?.[0] || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-1 text-muted-foreground text-sm">
        <span className="italic">en train d'écrire</span>
        <span className="flex gap-1">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
        </span>
      </div>
    </div>
  );
};
