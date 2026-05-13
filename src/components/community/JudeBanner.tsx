const ericAiHelper = '/images/eric-ai-helper-100w.webp';

interface JudeBannerProps {
  isVisible: boolean;
}

/**
 * JudeBanner - Shows Jude AI assistant banner for group chats
 * No fixed positioning - sits naturally in the flex layout
 */
export const JudeBanner = ({ isVisible }: JudeBannerProps) => {
  if (!isVisible) return null;
  
  return (
    <div className="px-2 sm:px-4 py-2 bg-background/80 backdrop-blur-sm">
      <div className="px-3 py-2.5 bg-gradient-to-r from-primary/10 via-primary/5 to-success/10 border border-primary/20 rounded-xl backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative">
            <img
              src={ericAiHelper}
              srcSet="/images/eric-ai-helper-100w.webp 100w, /images/eric-ai-helper-200w.webp 200w"
              sizes="(max-width: 640px) 36px, 40px"
              alt="Jude AI Assistant"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0 ring-2 ring-primary/20"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-foreground font-semibold">
              Jude, votre assistant IA est dans ce groupe !
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              Tapez <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">"Hey Jude"</span> pour lui parler
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
