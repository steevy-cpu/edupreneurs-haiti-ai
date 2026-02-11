import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Volume2, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LessonAudioIconButtonProps {
  audioUrl: string | null | undefined;
  className?: string;
}

export const LessonAudioIconButton: React.FC<LessonAudioIconButtonProps> = ({
  audioUrl,
  className,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Reset when URL changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  }, [audioUrl]);

  const togglePlay = useCallback(() => {
    if (!audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.preload = 'metadata';
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      audioRef.current.addEventListener('error', () => setIsPlaying(false));
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [audioUrl, isPlaying]);

  if (!audioUrl) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={togglePlay}
      className={cn(
        'h-7 w-7 rounded-full flex-shrink-0',
        isPlaying && 'bg-primary/15 animate-pulse',
        className
      )}
      title={isPlaying ? 'Mettre en pause' : 'Écouter'}
      aria-label={isPlaying ? 'Mettre en pause' : 'Écouter'}
    >
      {isPlaying ? (
        <Pause className="h-3.5 w-3.5 text-primary" />
      ) : (
        <Volume2 className="h-3.5 w-3.5 text-primary" />
      )}
    </Button>
  );
};
