import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useWordOfTheDay } from '@/hooks/useWordOfTheDay';
import { BookOpen, Volume2, VolumeX, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVisitor } from '@/contexts/VisitorContext';

export const WordOfTheDayCard = () => {
  const { word, isLoading, isDismissed, isPlaying, playAudio, stopAudio, dismiss, error } = useWordOfTheDay();
  const { isVisitor } = useVisitor();
  const [isHovered, setIsHovered] = useState(false);

  // Don't render if dismissed or no word
  if (isDismissed) return null;

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-none rounded-[20px] shadow-lg">
        <CardHeader className="pb-2 bg-gradient-to-r from-primary/10 to-purple-500/10">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 p-6 sm:p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <Skeleton className="h-10 w-48 bg-white/20" />
              <Skeleton className="h-8 w-32 bg-white/20" />
              <Skeleton className="h-5 w-64 bg-white/20" />
              <Skeleton className="h-4 w-56 bg-white/20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !word) return null;

  return (
    <Card 
      className="overflow-hidden border-none rounded-[20px] shadow-lg hover:shadow-xl transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <CardHeader className="pb-2 px-4 sm:px-6 bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="flex items-center justify-between">
          <CardTitle className="font-semibold text-base sm:text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>Le mot du jour</span>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
            onClick={dismiss}
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Content with dark background */}
      <CardContent className="p-0">
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 p-6 sm:p-8 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-20 h-20 border border-white/20 rounded-lg rotate-12" />
            <div className="absolute bottom-4 right-4 w-16 h-16 border border-white/20 rounded-lg -rotate-12" />
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <div className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse delay-300" />
          </div>

          <div className="relative flex flex-col items-center text-center space-y-4">
            {/* The Word */}
            <h2 className={cn(
              "text-3xl sm:text-4xl lg:text-5xl font-bold text-white uppercase tracking-wider",
              "transition-transform duration-300",
              isHovered && "scale-105"
            )}>
              {word.word}
            </h2>

            {/* Phonetic with audio button */}
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-4 py-2 text-sm sm:text-base font-mono"
              >
                [{word.phonetic}]
              </Badge>
              {word.audio_url && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-full text-white hover:bg-white/20",
                    isPlaying && "bg-primary/50 animate-pulse"
                  )}
                  onClick={isPlaying ? stopAudio : playAudio}
                  aria-label={isPlaying ? "Arrêter la lecture" : "Écouter la prononciation"}
                >
                  {isPlaying ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>

            {/* Definition */}
            <p className="text-white/90 text-base sm:text-lg max-w-md">
              <span className="text-purple-300 font-medium">({word.part_of_speech})</span>{' '}
              {word.definition}
            </p>

            {/* Example */}
            <p className="text-white/70 text-sm sm:text-base italic max-w-md">
              « {word.example} »
            </p>

            {/* Category badge */}
            {word.category && (
              <Badge variant="outline" className="text-white/60 border-white/30 text-xs">
                {word.category}
              </Badge>
            )}

            {/* Visitor prompt */}
            {isVisitor && (
              <p className="text-white/50 text-xs mt-2">
                Créez un compte pour ne plus voir les mêmes mots
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
