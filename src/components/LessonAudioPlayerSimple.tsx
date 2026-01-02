import React from 'react';
import { Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonAudioPlayerSimpleProps {
  audioUrl: string | null | undefined;
  label?: string;
  className?: string;
}

export const LessonAudioPlayerSimple: React.FC<LessonAudioPlayerSimpleProps> = ({
  audioUrl,
  label = "Écouter cette section",
  className,
}) => {
  if (!audioUrl) return null;

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20",
      className
    )}>
      <Volume2 className="h-4 w-4 text-primary flex-shrink-0" />
      <audio 
        controls 
        src={audioUrl}
        className="flex-1 h-8"
        preload="metadata"
      >
        Votre navigateur ne supporte pas l'audio.
      </audio>
      <span className="hidden sm:inline text-xs text-muted-foreground whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};
