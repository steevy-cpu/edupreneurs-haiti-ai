import { useMemo, useState } from 'react';
import { useProgressiveReveal, parseContentIntoSections } from '@/hooks/useProgressiveReveal';
import { MathContent, isMathSubject } from '@/components/MathContent';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, Eye, Sparkles, BookOpen, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
import { useNetwork } from '@/contexts/NetworkContext';
import { ImmersiveSection } from './ImmersiveSection';

interface ProgressiveContentProps {
  content: string;
  subjectName?: string;
  className?: string;
  showProgressBar?: boolean;
  /** Enable toggle for immersive reading mode */
  enableImmersiveMode?: boolean;
}

export const ProgressiveContent = ({
  content,
  subjectName = '',
  className,
  showProgressBar = true,
  enableImmersiveMode = false
}: ProgressiveContentProps) => {
  const isMath = isMathSubject(subjectName);
  const { shouldShowAnimations, loadingStrategy } = useNetwork();

  // Auto-disable immersive mode on slow connections
  const canUseImmersive = enableImmersiveMode && shouldShowAnimations;
  const [isImmersive, setIsImmersive] = useState(false);

  // Parse content into sections
  const sections = useMemo(() => {
    if (typeof window === 'undefined') return [];
    return parseContentIntoSections(content);
  }, [content]);

  const {
    isRevealed,
    revealNext,
    revealAll,
    showAll,
    progress,
    registerSection,
    totalSections,
    revealedCount
  } = useProgressiveReveal(sections, {
    autoReveal: true,
    revealThreshold: 0.7,
    initialVisibleSections: 1
  });

  // If no sections or just one, render normally (no immersive needed)
  if (sections.length <= 1) {
    return isMath ? (
      <MathContent content={content} className={className} />
    ) : (
      <div 
        className={cn("lesson-content prose prose-sm sm:prose-lg max-w-none", className)} 
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} 
      />
    );
  }

  const hasMoreToReveal = revealedCount < totalSections;
  const activeImmersive = canUseImmersive && isImmersive;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress indicator + immersive toggle */}
      {showProgressBar && !showAll && (
        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                Progression de lecture
              </span>
              <span className="text-xs font-medium text-primary">
                {revealedCount}/{totalSections} sections
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex items-center gap-1">
            {/* Immersive mode toggle — hidden on slow connections */}
            {canUseImmersive && (
              <Button
                variant={isImmersive ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsImmersive(prev => !prev)}
                className={cn(
                  "text-xs gap-1 h-7 px-2",
                  isImmersive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-primary/10"
                )}
                title={isImmersive ? "Mode classique" : "Mode immersif"}
              >
                <Wand2 className="h-3 w-3" />
                <span className="hidden sm:inline">
                  {isImmersive ? 'Immersif' : 'Classique'}
                </span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={revealAll}
              className="text-xs gap-1 hover:bg-primary/10 h-7 px-2"
            >
              <Eye className="h-3 w-3" />
              <span className="hidden sm:inline">Tout voir</span>
            </Button>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => {
          const revealed = isRevealed(section.id);
          const isNext = !revealed && index === revealedCount;

          return (
            <div key={section.id} className="relative">
              {/* Revealed section */}
              {revealed && (
                <div
                  ref={(el) => registerSection(section.id, el)}
                  data-section-id={section.id}
                  className={cn(
                    !activeImmersive && "animate-fade-in transition-all duration-500",
                    section.type === 'heading' && "mt-6 first:mt-0"
                  )}
                >
                  {activeImmersive ? (
                    /* Immersive mode: animated section wrapper */
                    <ImmersiveSection
                      content={section.content}
                      type={section.type}
                      isMath={isMath}
                      delay={index * 80}
                      loadingStrategy={loadingStrategy}
                    />
                  ) : isMath ? (
                    <MathContent content={section.content} />
                  ) : (
                    <div 
                      className="lesson-content prose prose-sm sm:prose-lg max-w-none" 
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }} 
                    />
                  )}
                </div>
              )}

              {/* Blur preview for next unrevealed section */}
              {isNext && !showAll && (
                <div className="relative overflow-hidden rounded-lg">
                  <div 
                    className="blur-sm opacity-40 select-none pointer-events-none max-h-24 overflow-hidden"
                    aria-hidden="true"
                  >
                    {isMath ? (
                      <MathContent content={section.content} />
                    ) : (
                      <div 
                        className="lesson-content prose prose-sm sm:prose-lg max-w-none" 
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }} 
                      />
                    )}
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
                  
                  <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2 pb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                      <span>Continue à lire pour débloquer la suite...</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={revealNext}
                      className="gap-2 group"
                    >
                      <ChevronDown className="h-4 w-4 group-hover:animate-bounce" />
                      Révéler la section suivante
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show more button at the bottom */}
      {hasMoreToReveal && !showAll && revealedCount > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={revealAll}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Afficher tout le contenu ({totalSections - revealedCount} sections restantes)
          </Button>
        </div>
      )}

      {/* Completion message */}
      {(showAll || !hasMoreToReveal) && totalSections > 1 && (
        <div className="flex items-center justify-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20 text-green-600 dark:text-green-400">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">
            Tu as terminé de lire cette section! 🎉
          </span>
        </div>
      )}
    </div>
  );
};
