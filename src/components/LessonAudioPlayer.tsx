import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2, Play, Pause, Square } from 'lucide-react';
import { useElevenLabsTTS } from '@/hooks/useElevenLabsTTS';
import { cn } from '@/lib/utils';

interface LessonAudioPlayerProps {
  subjectSlug: string;
  lessonSlug: string;
  text: string;
  className?: string;
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const LessonAudioPlayer: React.FC<LessonAudioPlayerProps> = ({
  subjectSlug,
  lessonSlug,
  text,
  className,
}) => {
  const {
    isLoading,
    isPlaying,
    error,
    audioUrl,
    play,
    pause,
    stop,
    currentTime,
    duration,
  } = useElevenLabsTTS({
    subjectSlug,
    lessonSlug,
    text,
  });

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (error) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-lg bg-destructive/10 text-destructive text-sm",
        className
      )}>
        <VolumeX className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{error}</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 p-2 sm:p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20",
      className
    )}>
      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={isPlaying ? pause : play}
        disabled={isLoading}
        className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Play className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />
        )}
      </Button>

      {/* Progress and Time */}
      <div className="flex-1 min-w-0">
        {/* Progress Bar */}
        <div className="relative h-1.5 sm:h-2 bg-primary/20 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Time Display */}
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
        </div>
      </div>

      {/* Stop Button */}
      {(isPlaying || currentTime > 0) && (
        <Button
          variant="ghost"
          size="icon"
          onClick={stop}
          className="h-8 w-8 rounded-full hover:bg-primary/10 flex-shrink-0"
        >
          <Square className="h-3.5 w-3.5" />
        </Button>
      )}

      {/* Audio indicator */}
      <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
        <Volume2 className="h-3.5 w-3.5" />
        <span className="hidden md:inline">
          {audioUrl ? 'Audio prêt' : 'Cliquez pour écouter'}
        </span>
      </div>
    </div>
  );
};
