import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWordOfTheDay } from '@/hooks/useWordOfTheDay';
import { BookOpen, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVisitor } from '@/contexts/VisitorContext';

export const WordOfTheDayCard = () => {
  const { word, isLoading, isPlaying, isGenerating, playAudio, stopAudio, error } = useWordOfTheDay();
  const { isVisitor } = useVisitor();

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-none rounded-xl shadow-md">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-24 bg-white/20" />
              <Skeleton className="h-5 w-32 bg-white/20" />
              <Skeleton className="h-4 w-48 bg-white/20 flex-1" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !word) return null;

  return (
    <Card className="overflow-hidden border-none rounded-xl shadow-md">
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 p-3 sm:p-4">
          {/* Desktop: single-line layout / Mobile: stacked */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            {/* Word + phonetic + audio */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <BookOpen className="w-4 h-4 text-primary hidden sm:block" />
              <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider">
                {word.word}
              </h2>
              <button
                onClick={isPlaying ? stopAudio : playAudio}
                disabled={isGenerating}
                className={cn(
                  "flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-full px-2.5 py-1 transition-colors",
                  isGenerating && "opacity-70 cursor-wait"
                )}
                aria-label={isPlaying ? "Arrêter la lecture" : "Écouter la prononciation"}
              >
                <span className="text-white/90 font-mono text-xs">[{word.phonetic}]</span>
                {isGenerating ? (
                  <Loader2 className="w-3.5 h-3.5 text-white/80 animate-spin" />
                ) : isPlaying ? (
                  <VolumeX className="w-3.5 h-3.5 text-white/80" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-white/80" />
                )}
              </button>
            </div>
            {/* Definition */}
            <p className="text-white/90 text-sm flex-1 min-w-0">
              <span className="text-purple-300 font-medium">({word.part_of_speech})</span>{' '}
              {word.definition}
            </p>
          </div>
          {/* Example */}
          <p className="text-white/60 text-xs italic mt-1.5 line-clamp-1">
            « {word.example} »
          </p>
          {isVisitor && (
            <p className="text-white/40 text-[10px] mt-1">
              Créez un compte pour ne plus voir les mêmes mots
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
