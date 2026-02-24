import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel';
import { RefreshCw, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import { usePointsClesCards, type PointsClesCard } from '@/features/matieres/hooks/usePointsClesCards';

interface LessonPointsClesTabProps {
  lessonId: string;
  lessonTitle: string;
  contenu: string;
  exemplesExercices: string;
  objectif: string;
  gradeLevel: string;
  subjectName: string;
}

// Gradient map per card type — saturated colors work on both light/dark themes
const CARD_GRADIENTS: Record<PointsClesCard['type'], string> = {
  concept: 'from-blue-500 to-indigo-600',
  example: 'from-emerald-500 to-teal-600',
  formula: 'from-purple-500 to-violet-600',
  tip: 'from-amber-500 to-orange-600',
  remember: 'from-rose-500 to-pink-600',
};

// French labels for card type badges
const TYPE_LABELS: Record<PointsClesCard['type'], string> = {
  concept: 'Concept',
  example: 'Exemple',
  formula: 'Formule',
  tip: 'Astuce',
  remember: 'À retenir',
};

// Progress dots showing current card position
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex justify-center gap-1.5 mb-4">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
          }`}
        />
      ))}
    </div>
  );
}

// Single flashcard slide
function PointsClesCardSlide({ card, index, total }: { card: PointsClesCard; index: number; total: number }) {
  return (
    <div
      className={`relative bg-gradient-to-br ${CARD_GRADIENTS[card.type]} rounded-2xl p-6 sm:p-8 min-h-[360px] sm:min-h-[420px] flex flex-col items-center justify-center text-white shadow-lg`}
    >
      {/* Progress dots at top */}
      <div className="absolute top-4 left-0 right-0">
        <ProgressDots total={total} current={index} />
      </div>

      {/* Emoji */}
      <div className="text-5xl sm:text-6xl mb-4 select-none">{card.emoji}</div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-bold text-center mb-3 leading-tight">
        {card.title}
      </h3>

      {/* Content */}
      <p className="text-sm sm:text-base text-center text-white/90 leading-relaxed max-w-md">
        {card.content}
      </p>

      {/* Type badge */}
      <span className="mt-4 inline-block px-3 py-1 rounded-full bg-white/20 text-xs sm:text-sm font-medium backdrop-blur-sm">
        {TYPE_LABELS[card.type]}
      </span>

      {/* Swipe hint on first card */}
      {index === 0 && total > 1 && (
        <div className="absolute bottom-4 right-4 flex items-center gap-1 text-white/50 text-xs animate-pulse">
          <span>Glisser</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}

// Loading skeleton matching card dimensions
function PointsClesSkeleton() {
  return (
    <div className="rounded-2xl p-6 sm:p-8 min-h-[360px] sm:min-h-[420px] flex flex-col items-center justify-center gap-4 bg-muted">
      <Skeleton className="h-14 w-14 rounded-full" />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-6 w-20 rounded-full" />
      <div className="flex items-center gap-2 mt-4 text-muted-foreground text-sm">
        <Sparkles className="h-4 w-4 animate-pulse" />
        <span>Génération en cours…</span>
      </div>
    </div>
  );
}

export function LessonPointsClesTab({
  lessonId,
  lessonTitle,
  contenu,
  exemplesExercices,
  objectif,
  gradeLevel,
  subjectName,
}: LessonPointsClesTabProps) {
  const { cards, isLoading, isGenerating, error, isStale, regenerate } = usePointsClesCards({
    lessonId,
    lessonTitle,
    contenu,
    exemplesExercices,
    objectif,
    gradeLevel,
    subjectName,
  });

  // Track current slide for progress dots
  const [currentSlide, setCurrentSlide] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  // Sync carousel state with progress dots
  const onApiChange = useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return;
    setApi(emblaApi);
    emblaApi.on('select', () => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
    });
  }, []);

  // Loading state
  if (isLoading || isGenerating) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <PointsClesSkeleton />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button onClick={regenerate} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No cards generated
  if (!cards || cards.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">Aucune flashcard disponible.</p>
            <Button onClick={regenerate} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Générer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stale content banner — prompt user to regenerate outdated cards */}
      {isStale && (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <span className="text-amber-700 dark:text-amber-300">Contenu mis en cache il y a plus de 7 jours</span>
          <Button onClick={regenerate} variant="ghost" size="sm" className="text-amber-700 dark:text-amber-300">
            <RefreshCw className="h-3 w-3 mr-1" />
            Actualiser
          </Button>
        </div>
      )}

      {/* Carousel of flashcards */}
      <Carousel
        opts={{ align: 'center', containScroll: 'trimSnaps' }}
        setApi={onApiChange}
        className="w-full max-w-lg mx-auto"
      >
        <CarouselContent>
          {cards.map((card, index) => (
            <CarouselItem key={index}>
              <PointsClesCardSlide card={card} index={index} total={cards.length} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Nav arrows — hidden on mobile where swipe is primary */}
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>

      {/* Card counter + regenerate action */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
        <span>{currentSlide + 1} / {cards.length} cartes</span>
        <Button onClick={regenerate} variant="ghost" size="sm" className="text-xs">
          <RefreshCw className="h-3 w-3 mr-1" />
          Régénérer
        </Button>
      </div>
    </div>
  );
}
