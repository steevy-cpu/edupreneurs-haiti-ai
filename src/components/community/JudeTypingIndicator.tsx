import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";

const ericAiHelper = '/images/eric-ai-helper-100w.webp';

interface JudeTypingIndicatorProps {
  isThinking?: boolean;
}

/**
 * Jude-specific typing/thinking indicator.
 * Shows Jude's avatar with "Jude réfléchit..." text and animated dots.
 * Network-aware: falls back to spinner on slow connections.
 */
export function JudeTypingIndicator({ isThinking = true }: JudeTypingIndicatorProps) {
  const { isSlowConnection } = useNetworkAwareLoading();
  
  if (!isThinking) return null;

  return (
    <div className="flex justify-start px-2">
      <div className="flex gap-1.5 sm:gap-2 max-w-[85%] sm:max-w-[70%]">
        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 ring-2 ring-primary/30">
          <AvatarImage src={ericAiHelper} alt="Jude AI" />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-success/20 text-[10px] sm:text-xs">
            🤖
          </AvatarFallback>
        </Avatar>
        <div className="rounded-2xl px-3 py-2 sm:px-4 bg-muted">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium text-foreground/80">Jude réfléchit</span>
            {isSlowConnection ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <span className="flex items-center gap-0.5">
                <span className="animate-typing-wave inline-block" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-typing-wave inline-block" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-typing-wave inline-block" style={{ animationDelay: '300ms' }}>.</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
