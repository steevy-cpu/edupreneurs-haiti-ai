import { useState, useCallback, useEffect, useRef } from 'react';
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
import { RefreshCw, AlertCircle, Sparkles, ChevronRight, BookOpen, Lightbulb, Calculator, Star } from 'lucide-react';
import { usePointsClesCards, type PointsClesCard } from '@/features/matieres/hooks/usePointsClesCards';
import { JudeGeneratingOverlay } from '@/components/jude/JudeGeneratingOverlay';

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

// Lucide icons per card type — all already in the bundle
const TYPE_ICONS: Record<PointsClesCard['type'], React.FC<{ className?: string }>> = {
  concept: BookOpen,
  example: Lightbulb,
  formula: Calculator,
  tip: Sparkles,
  remember: Star,
};

// Tailwind color tokens for external dots — maps to each card type's gradient
const DOT_COLORS: Record<PointsClesCard['type'], string> = {
  concept: 'bg-blue-500',
  example: 'bg-emerald-500',
  formula: 'bg-purple-500',
  tip: 'bg-amber-500',
  remember: 'bg-rose-500',
};

// Type-specific content renderer — formula gets monospace, example gets label, remember gets larger text
function CardContent_Typed({ card }: { card: PointsClesCard }) {
  if (card.type === 'formula') {
    return (
      <div className="bg-white/10 rounded-lg p-3 font-mono text-sm text-white/90 leading-relaxed max-w-md text-center">
        {card.content}
      </div>
    );
  }
  if (card.type === 'example') {
    return (
      <div className="max-w-md text-center">
        <span className="italic text-white/70 text-xs sm:text-sm">Par exemple :</span>
        <p className="text-sm sm:text-base text-white/90 leading-relaxed mt-1">{card.content}</p>
      </div>
    );
  }
  if (card.type === 'remember') {
    return (
      <p className="text-base sm:text-lg text-center text-white/90 leading-relaxed max-w-md font-medium">
        {card.content}
      </p>
    );
  }
  // concept + tip — default centered paragraph
  return (
    <p className="text-sm sm:text-base text-center text-white/90 leading-relaxed max-w-md">
      {card.content}
    </p>
  );
}

// Single flashcard slide — type-aware layout with icon + optional decorations
function PointsClesCardSlide({ card }: { card: PointsClesCard }) {
  const Icon = TYPE_ICONS[card.type];
  const isRemember = card.type === 'remember';

  return (
    <div
      className={`relative bg-gradient-to-br ${CARD_GRADIENTS[card.type]} rounded-2xl p-6 sm:p-8 min-h-[360px] sm:min-h-[420px] flex flex-col items-center justify-center text-white shadow-lg ${
        isRemember ? 'ring-2 ring-white/30' : ''
      }`}
    >
      {/* Pulsing star decoration for "remember" cards — draws attention */}
      {isRemember && (
        <Star className="absolute top-4 right-4 h-5 w-5 text-white/40 animate-pulse" />
      )}

      {/* Emoji + type icon side by side */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-5xl sm:text-6xl select-none">{card.emoji}</span>
        <Icon className="h-6 w-6 text-white/70" />
      </div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-bold text-center mb-3 leading-tight">
        {card.title}
      </h3>

      {/* Type-specific content layout */}
      <CardContent_Typed card={card} />

      {/* Type badge */}
      <span className="mt-4 inline-block px-3 py-1 rounded-full bg-white/20 text-xs sm:text-sm font-medium backdrop-blur-sm">
        {TYPE_LABELS[card.type]}
      </span>
    </div>
  );
}

// External dot indicators below carousel — colored to match active card type
function ExternalDots({ total, current, cards }: { total: number; current: number; cards: PointsClesCard[] }) {
  return (
    <div className="flex justify-center gap-2 mt-3">
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          aria-label={`Carte ${i + 1}`}
          className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
            i === current
              ? `${DOT_COLORS[cards[i]?.type ?? 'concept']} scale-125`
              : 'bg-muted-foreground/30'
          }`}
        />
      ))}
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

  // Track current slide for external dots
  const [currentSlide, setCurrentSlide] = useState(0);
  const emblaRef = useRef<CarouselApi | null>(null);

  // Sync carousel state with external dot indicators
  const onApiChange = useCallback((emblaApi: CarouselApi) => {
    if (!emblaApi) return;
    emblaRef.current = emblaApi;
    emblaApi.on('select', () => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
    });
  }, []);

  // Keyboard navigation — arrow keys scroll carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!emblaRef.current) return;
      if (e.key === 'ArrowLeft') emblaRef.current.scrollPrev();
      if (e.key === 'ArrowRight') emblaRef.current.scrollNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Loading state
  if (isLoading || isGenerating) {
    return (
      <Card>
        <CardContent className="p-3 sm:p-6">
          <JudeGeneratingOverlay
            isVisible={true}
            message={isGenerating ? 'Jude prépare tes points clés...' : 'Chargement...'}
          />
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

      {/* Carousel of flashcards — wider on desktop, arrows visible everywhere */}
      <Carousel
        opts={{ align: 'center', containScroll: 'trimSnaps' }}
        setApi={onApiChange}
        className="w-full max-w-2xl mx-auto"
      >
        <CarouselContent>
          {cards.map((card, index) => (
            <CarouselItem key={index}>
              <PointsClesCardSlide card={card} />
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Nav arrows — visible on all screen sizes with semi-transparent bg */}
        <CarouselPrevious className="flex h-10 w-10 bg-black/20 hover:bg-black/40 border-0 text-white" />
        <CarouselNext className="flex h-10 w-10 bg-black/20 hover:bg-black/40 border-0 text-white" />
      </Carousel>

      {/* External dot indicators — colored per active card type */}
      <ExternalDots total={cards.length} current={currentSlide} cards={cards} />

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
