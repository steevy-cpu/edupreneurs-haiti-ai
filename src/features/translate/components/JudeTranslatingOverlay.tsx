/**
 * JudeTranslatingOverlay Component
 * 
 * Displays Jude at his desk with a pulsing animation while translation
 * is in progress. Creates a personalized "Jude is working" experience.
 */

const judeChairDesk = "/images/eric-chair-desk-200w.webp";

interface JudeTranslatingOverlayProps {
  isVisible: boolean;
}

export function JudeTranslatingOverlay({ isVisible }: JudeTranslatingOverlayProps) {
  if (!isVisible) return null;
  
  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center p-6 border rounded-md bg-muted/30">
      {/* Jude at desk with pulse animation */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
        <img
          src={judeChairDesk}
          srcSet="/images/eric-chair-desk-200w.webp 200w, /images/eric-chair-desk-400w.webp 400w"
          sizes="(max-width: 640px) 96px, 128px"
          alt="Jude travaille sur la traduction"
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
        Jude traduit votre texte...
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
