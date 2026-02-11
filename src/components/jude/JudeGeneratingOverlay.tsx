/**
 * JudeGeneratingOverlay Component
 * 
 * Reusable loading overlay showing Jude at his desk with a pulse animation
 * and a customizable message. Used for quiz/activities/translation generation.
 */

import judeChairDesk from "@/assets/eric-chair-desk.png";

interface JudeGeneratingOverlayProps {
  isVisible: boolean;
  message: string;
}

export function JudeGeneratingOverlay({ isVisible, message }: JudeGeneratingOverlayProps) {
  if (!isVisible) return null;
  
  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center p-6">
      {/* Jude at desk with pulse animation */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
        <img
          src={judeChairDesk}
          alt="Jude prépare le contenu"
          className="relative w-24 h-24 sm:w-32 sm:h-32 object-contain"
          style={{
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
          loading="lazy"
          decoding="async"
        />
      </div>
      
      {/* Status text */}
      <p className="text-sm font-medium text-foreground mb-2">
        {message}
      </p>
      
      {/* Bouncing dots - thinking indicator */}
      <div className="flex gap-1">
        <span 
          className="w-2 h-2 bg-primary rounded-full animate-bounce" 
          style={{ animationDelay: '0ms' }} 
        />
        <span 
          className="w-2 h-2 bg-primary rounded-full animate-bounce" 
          style={{ animationDelay: '150ms' }} 
        />
        <span 
          className="w-2 h-2 bg-primary rounded-full animate-bounce" 
          style={{ animationDelay: '300ms' }} 
        />
      </div>
    </div>
  );
}
