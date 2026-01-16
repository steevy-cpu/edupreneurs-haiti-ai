import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWordOfTheDay } from '@/hooks/useWordOfTheDay';
import { BookOpen, Volume2, VolumeX, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVisitor } from '@/contexts/VisitorContext';

export const WordOfTheDayCard = () => {
  const { word, isLoading, isPlaying, isGenerating, playAudio, stopAudio, error } = useWordOfTheDay();
  const { isVisitor } = useVisitor();

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-none rounded-[20px] shadow-lg">
        <CardContent className="p-0">
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 p-4 sm:p-5">
            <div className="flex flex-col items-center text-center space-y-2">
              <Skeleton className="h-5 w-28 bg-white/20" />
              <Skeleton className="h-7 w-36 bg-white/20" />
              <Skeleton className="h-6 w-24 bg-white/20" />
              <Skeleton className="h-4 w-48 bg-white/20" />
              <Skeleton className="h-3 w-40 bg-white/20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !word) return null;

  return (
    <Card className="overflow-hidden border-none rounded-[20px] shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 p-4 sm:p-5">
          {/* Compact Header */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-white/80 text-sm font-medium">Le mot du jour</span>
            <Sparkles className="w-3 h-3 text-yellow-500" />
          </div>

          <div className="flex flex-col items-center text-center space-y-2">
            {/* The Word */}
            <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-wider">
              {word.word}
            </h2>

            {/* Phonetic with integrated audio button */}
            <button
              onClick={isPlaying ? stopAudio : playAudio}
              disabled={isGenerating}
              className={cn(
                "flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full px-4 py-1.5 transition-colors",
                isGenerating && "opacity-70 cursor-wait"
              )}
              aria-label={isPlaying ? "Arrêter la lecture" : "Écouter la prononciation"}
            >
              <span className="text-white/90 font-mono text-sm">[{word.phonetic}]</span>
              {isGenerating ? (
                <Loader2 className="w-4 h-4 text-white/80 animate-spin" />
              ) : isPlaying ? (
                <VolumeX className="w-4 h-4 text-white/80" />
              ) : (
                <Volume2 className="w-4 h-4 text-white/80" />
              )}
            </button>

            {/* Definition */}
            <p className="text-white/90 text-sm sm:text-base max-w-md">
              <span className="text-purple-300 font-medium">({word.part_of_speech})</span>{' '}
              {word.definition}
            </p>

            {/* Example */}
            <p className="text-white/70 text-xs sm:text-sm italic max-w-md">
              « {word.example} »
            </p>

            {/* Visitor prompt */}
            {isVisitor && (
              <p className="text-white/50 text-xs mt-1">
                Créez un compte pour ne plus voir les mêmes mots
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
