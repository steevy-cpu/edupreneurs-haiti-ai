import { useMemo, useRef, useEffect } from 'react';
import { useProgressiveReveal, parseContentIntoSections } from '@/hooks/useProgressiveReveal';
import { MathContent, isMathSubject } from '@/components/MathContent';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, Eye, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressiveContentProps {
  content: string;
  subjectName?: string;
  className?: string;
  showProgressBar?: boolean;
}

export const ProgressiveContent = ({
  content,
  subjectName = '',
  className,
  showProgressBar = true
}: ProgressiveContentProps) => {
  const isMath = isMathSubject(subjectName);
  
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

  // If no sections or just one, render normally
  if (sections.length <= 1) {
    return isMath ? (
      <MathContent content={content} className={className} />
    ) : (
      <div 
        className={cn("lesson-content prose prose-sm sm:prose-lg max-w-none", className)} 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    );
  }

  const hasMoreToReveal = revealedCount < totalSections;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress indicator */}
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
          <Button
            variant="ghost"
            size="sm"
            onClick={revealAll}
            className="text-xs gap-1 hover:bg-primary/10"
          >
            <Eye className="h-3 w-3" />
            Tout voir
          </Button>
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
                    "animate-fade-in transition-all duration-500",
                    section.type === 'heading' && "mt-6 first:mt-0"
                  )}
                >
                  {isMath ? (
                    <MathContent content={section.content} />
                  ) : (
                    <div 
                      className="lesson-content prose prose-sm sm:prose-lg max-w-none" 
                      dangerouslySetInnerHTML={{ __html: section.content }} 
                    />
                  )}
                </div>
              )}

              {/* Blur preview for next unrevealed section */}
              {isNext && !showAll && (
                <div className="relative overflow-hidden rounded-lg">
                  {/* Blurred preview */}
                  <div 
                    className="blur-sm opacity-40 select-none pointer-events-none max-h-24 overflow-hidden"
                    aria-hidden="true"
                  >
                    {isMath ? (
                      <MathContent content={section.content} />
                    ) : (
                      <div 
                        className="lesson-content prose prose-sm sm:prose-lg max-w-none" 
                        dangerouslySetInnerHTML={{ __html: section.content }} 
                      />
                    )}
                  </div>
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/80 to-background" />
                  
                  {/* Continue reading prompt */}
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

      {/* Show more button at the bottom if there are hidden sections */}
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
