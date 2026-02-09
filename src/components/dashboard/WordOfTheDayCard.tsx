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
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 p-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-20 bg-white/20" />
              <Skeleton className="h-7 w-40 bg-white/20" />
              <Skeleton className="h-4 w-full bg-white/20" />
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
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 p-4 sm:p-5">
          {/* Label */}
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-purple-300" />
            <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Mot du jour</span>
          </div>

          {/* Word + phonetic row */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
              {word.word}
            </h2>
            <button
              onClick={isPlaying ? stopAudio : playAudio}
              disabled={isGenerating}
              className={cn(
                "inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-full px-2.5 py-1 transition-colors",
                isGenerating && "opacity-70 cursor-wait"
              )}
              aria-label={isPlaying ? "Arrêter la lecture" : "Écouter la prononciation"}
            >
              <span className="text-white/80 font-mono text-xs">[{word.phonetic}]</span>
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 text-white/80 animate-spin" />
              ) : isPlaying ? (
                <VolumeX className="w-3.5 h-3.5 text-white/80" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-white/80" />
              )}
            </button>
          </div>

          {/* Definition — always full width */}
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            <span className="text-purple-300 font-medium">({word.part_of_speech})</span>{' '}
            {word.definition}
          </p>

          {/* Example */}
          <p className="text-white/50 text-xs sm:text-sm italic mt-2">
            « {word.example} »
          </p>

          {isVisitor && (
            <p className="text-white/40 text-[10px] mt-2">
              Créez un compte pour ne plus voir les mêmes mots
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
