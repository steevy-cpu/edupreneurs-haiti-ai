import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, AlertCircle, Sparkles, Star } from 'lucide-react';
import {
  useStudygramVisual,
  type StudygramSection,
  type StudygramNode,
} from '@/features/matieres/hooks/useStudygramVisual';

interface LessonStudygramTabProps {
  lessonId: string;
  lessonTitle: string;
  contenu: string;
  exemplesExercices: string;
  objectif: string;
  gradeLevel: string;
  subjectName: string;
}

// Pastel color mapping — light & dark mode support via Tailwind classes
const COLOR_MAP: Record<StudygramSection['color'], { bg: string; border: string; headingBg: string; headingText: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-200 dark:border-blue-800',
    headingBg: 'bg-blue-100 dark:bg-blue-900/60',
    headingText: 'text-blue-800 dark:text-blue-200',
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-950/40',
    border: 'border-pink-200 dark:border-pink-800',
    headingBg: 'bg-pink-100 dark:bg-pink-900/60',
    headingText: 'text-pink-800 dark:text-pink-200',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-800',
    headingBg: 'bg-emerald-100 dark:bg-emerald-900/60',
    headingText: 'text-emerald-800 dark:text-emerald-200',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-200 dark:border-purple-800',
    headingBg: 'bg-purple-100 dark:bg-purple-900/60',
    headingText: 'text-purple-800 dark:text-purple-200',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    headingBg: 'bg-amber-100 dark:bg-amber-900/60',
    headingText: 'text-amber-800 dark:text-amber-200',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-800',
    headingBg: 'bg-rose-100 dark:bg-rose-900/60',
    headingText: 'text-rose-800 dark:text-rose-200',
  },
};

// Render a single node with its visual style
function StudygramNodeItem({ node, color }: { node: StudygramNode; color: StudygramSection['color'] }) {
  const colors = COLOR_MAP[color];

  switch (node.style) {
    case 'highlight':
      // Bold text on colored background — visually prominent
      return (
        <div className={`${colors.headingBg} ${colors.headingText} rounded-lg px-3 py-2 text-sm font-semibold`}>
          {node.text}
        </div>
      );
    case 'outline':
      // Bordered box — used for definitions/concepts
      return (
        <div className={`border ${colors.border} rounded-lg px-3 py-2 text-sm text-foreground`}>
          {node.text}
        </div>
      );
    case 'quote':
      // Italic with french quotes — citations/formulas
      return (
        <div className={`border-l-3 ${colors.border} pl-3 py-1 text-sm italic text-muted-foreground`}>
          «&nbsp;{node.text}&nbsp;»
        </div>
      );
    case 'plain':
    default:
      // Simple text with subtle padding
      return (
        <div className="px-3 py-1.5 text-sm text-foreground/80">
          • {node.text}
        </div>
      );
  }
}

// Mindmap visual layout — central node with radiating sub-nodes
function MindmapSection({ section }: { section: StudygramSection }) {
  const colors = COLOR_MAP[section.color] ?? COLOR_MAP.rose;
  const [centralNode, ...childNodes] = section.nodes;

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl overflow-hidden`}>
      {/* Section heading */}
      <div className={`${colors.headingBg} px-4 py-3 flex items-center gap-2`}>
        <span className="text-xl select-none">{section.emoji}</span>
        <h3 className={`${colors.headingText} font-bold text-sm sm:text-base`}>
          {section.heading}
        </h3>
      </div>
      {/* Mindmap layout — central concept with connected branches */}
      <div className="p-4 flex flex-col items-center gap-3">
        {/* Central node — the main concept */}
        {centralNode && (
          <div className={`${colors.headingBg} ${colors.headingText} rounded-full px-5 py-2.5 text-sm font-bold text-center shadow-sm`}>
            {centralNode.text}
          </div>
        )}
        {/* Connecting line from center to branches */}
        {childNodes.length > 0 && (
          <div className={`w-px h-4 ${colors.border} border-l-2 border-dashed`} />
        )}
        {/* Branch nodes — radiate from center in a flex row */}
        {childNodes.length > 0 && (
          <div className="relative w-full">
            {/* Horizontal connecting line behind the nodes */}
            <div className={`absolute top-1/2 left-[10%] right-[10%] h-px ${colors.border} border-t-2 border-dashed -translate-y-1/2`} />
            <div className="relative flex flex-wrap justify-center gap-2">
              {childNodes.map((node, i) => (
                <div
                  key={i}
                  className={`border ${colors.border} ${colors.bg} rounded-lg px-3 py-2 text-xs sm:text-sm text-center max-w-[140px] shadow-sm bg-background dark:bg-background/50`}
                >
                  {node.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// "À retenir" section — special bordered card with star icon
function ARetenirSection({ section }: { section: StudygramSection }) {
  const colors = COLOR_MAP[section.color] ?? COLOR_MAP.green;

  return (
    <div className={`${colors.bg} border-2 ${colors.border} rounded-xl overflow-hidden`}>
      {/* Heading with star icon for emphasis */}
      <div className={`${colors.headingBg} px-4 py-3 flex items-center gap-2`}>
        <Star className={`h-5 w-5 ${colors.headingText} fill-current`} />
        <h3 className={`${colors.headingText} font-bold text-sm sm:text-base`}>
          {section.heading}
        </h3>
      </div>
      {/* Nodes with numbered list styling for essentials */}
      <div className="p-3 space-y-2">
        {section.nodes.map((node, i) => (
          <StudygramNodeItem key={i} node={node} color={section.color} />
        ))}
      </div>
    </div>
  );
}

// Standard section card for explicatif and approfondissement blocks
function StandardSectionCard({ section }: { section: StudygramSection }) {
  const colors = COLOR_MAP[section.color] ?? COLOR_MAP.blue;

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-xl overflow-hidden`}>
      {/* Section heading with emoji */}
      <div className={`${colors.headingBg} px-4 py-3 flex items-center gap-2`}>
        <span className="text-xl select-none">{section.emoji}</span>
        <h3 className={`${colors.headingText} font-bold text-sm sm:text-base`}>
          {section.heading}
        </h3>
      </div>
      {/* Node list */}
      <div className="p-3 space-y-2">
        {section.nodes.map((node, i) => (
          <StudygramNodeItem key={i} node={node} color={section.color} />
        ))}
      </div>
    </div>
  );
}

// Route each section to its appropriate visual renderer based on type
function StudygramSectionCard({ section }: { section: StudygramSection }) {
  switch (section.type) {
    case 'resume_visuel':
      return <MindmapSection section={section} />;
    case 'a_retenir':
      return <ARetenirSection section={section} />;
    default:
      return <StandardSectionCard section={section} />;
  }
}

// Loading skeleton matching the 4-block grid layout
function StudygramSkeleton() {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <Skeleton className="h-7 w-64 mx-auto" />
        <Skeleton className="h-4 w-40 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-muted p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-3/4 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
        <Sparkles className="h-4 w-4 animate-pulse" />
        <span>Génération du studygram…</span>
      </div>
    </div>
  );
}

export function LessonStudygramTab({
  lessonId,
  lessonTitle,
  contenu,
  exemplesExercices,
  objectif,
  gradeLevel,
  subjectName,
}: LessonStudygramTabProps) {
  const { studygram, isLoading, isGenerating, error, isStale, regenerate } = useStudygramVisual({
    lessonId,
    lessonTitle,
    contenu,
    exemplesExercices,
    objectif,
    gradeLevel,
    subjectName,
  });

  // Loading state
  if (isLoading || isGenerating) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <StudygramSkeleton />
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

  // No data generated
  if (!studygram || !studygram.sections?.length) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">Aucun studygram disponible.</p>
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
      {/* Stale content banner */}
      {isStale && (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <span className="text-amber-700 dark:text-amber-300">Contenu mis en cache il y a plus de 7 jours</span>
          <Button onClick={regenerate} variant="ghost" size="sm" className="text-amber-700 dark:text-amber-300">
            <RefreshCw className="h-3 w-3 mr-1" />
            Actualiser
          </Button>
        </div>
      )}

      {/* Studygram title */}
      <div className="text-center space-y-1 py-2">
        <h2 className="text-lg sm:text-xl font-bold text-foreground">{studygram.title}</h2>
        <p className="text-sm text-muted-foreground">{studygram.subtitle}</p>
      </div>

      {/* 4-block grid — 2 columns on desktop, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {studygram.sections.map((section, i) => (
          <StudygramSectionCard key={i} section={section} />
        ))}
      </div>

      {/* Regenerate action */}
      <div className="flex justify-center pt-2">
        <Button onClick={regenerate} variant="ghost" size="sm" className="text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3 mr-1" />
          Régénérer le studygram
        </Button>
      </div>
    </div>
  );
}
