import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, AlertCircle, Sparkles, Star, Volume2, VolumeX, Square, Loader2 } from 'lucide-react';
import { MathText } from '@/components/MathContent';
import { JudeGeneratingOverlay } from '@/components/jude/JudeGeneratingOverlay';
import { useJudeVoice } from '@/hooks/useJudeVoice';
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

/* ── Color system — maps section type to saturated mind-map colors ── */
const SECTION_COLORS: Record<string, {
  headerBg: string;
  border: string;
  nodeBg: string;
  nodeText: string;
  highlightBg: string;
  highlightText: string;
  mindmapBg: string;
  mindmapText: string;
}> = {
  explicatif: {
    headerBg: 'bg-blue-500 dark:bg-blue-600',
    border: 'border-blue-300 dark:border-blue-700',
    nodeBg: 'bg-blue-50 dark:bg-blue-950/40',
    nodeText: 'text-blue-900 dark:text-blue-100',
    highlightBg: 'bg-blue-100 dark:bg-blue-900/40',
    highlightText: 'text-blue-900 dark:text-blue-100',
    mindmapBg: 'bg-blue-100 dark:bg-blue-900/50',
    mindmapText: 'text-blue-700 dark:text-blue-200',
  },
  approfondissement: {
    headerBg: 'bg-purple-500 dark:bg-purple-600',
    border: 'border-purple-300 dark:border-purple-700',
    nodeBg: 'bg-purple-50 dark:bg-purple-950/40',
    nodeText: 'text-purple-900 dark:text-purple-100',
    highlightBg: 'bg-purple-100 dark:bg-purple-900/40',
    highlightText: 'text-purple-900 dark:text-purple-100',
    mindmapBg: 'bg-purple-100 dark:bg-purple-900/50',
    mindmapText: 'text-purple-700 dark:text-purple-200',
  },
  a_retenir: {
    headerBg: 'bg-emerald-500 dark:bg-emerald-600',
    border: 'border-emerald-300 dark:border-emerald-700',
    nodeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    nodeText: 'text-emerald-900 dark:text-emerald-100',
    highlightBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    highlightText: 'text-emerald-900 dark:text-emerald-100',
    mindmapBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    mindmapText: 'text-emerald-700 dark:text-emerald-200',
  },
  resume_visuel: {
    headerBg: 'bg-amber-500 dark:bg-amber-600',
    border: 'border-amber-300 dark:border-amber-700',
    nodeBg: 'bg-amber-50 dark:bg-amber-950/40',
    nodeText: 'text-amber-900 dark:text-amber-100',
    highlightBg: 'bg-amber-100 dark:bg-amber-900/40',
    highlightText: 'text-amber-900 dark:text-amber-100',
    mindmapBg: 'bg-amber-100 dark:bg-amber-900/50',
    mindmapText: 'text-amber-700 dark:text-amber-200',
  },
};

/* Fallback color if section type is unknown */
function getColors(type: string) {
  return SECTION_COLORS[type] ?? SECTION_COLORS.explicatif;
}

/* ── JudeSpeakerButton — emerald-themed voice button for À Retenir nodes ── */
function JudeSpeakerButton({ text, storageKey }: { text: string; storageKey: string }) {
  const { play, stop, isSpeaking, isLoading, isError } = useJudeVoice({
    text,
    storageKey,
    context: 'studygram',
    autoPreload: true,
  });

  /* Error state — disabled icon */
  if (isError) return (
    <button className="opacity-40 cursor-not-allowed p-1.5" disabled aria-label="Erreur audio">
      <VolumeX className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  );

  return (
    <button
      onClick={isSpeaking ? stop : play}
      className="p-1.5 rounded-full bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-800/40 transition-colors"
      aria-label={isSpeaking ? 'Arrêter' : 'Écouter'}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300 animate-spin" />
      ) : isSpeaking ? (
        <Square className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300 fill-current" />
      ) : (
        <Volume2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
      )}
    </button>
  );
}

/* ── MindMapNode — renders a single node with shape based on style ── */
function MindMapNode({ node, sectionType }: { node: StudygramNode; sectionType: string }) {
  const colors = getColors(sectionType);

  switch (node.style) {
    case 'highlight':
      /* Saturated pill — bold white text for key definitions */
      /* Light bg + dark text for readable contrast on any background */
      return (
        <div className={`${colors.highlightBg} ${colors.highlightText} border ${colors.border} rounded-2xl px-4 py-1.5 text-sm font-semibold shadow-sm max-w-full break-words`}>
          <MathText text={node.text} />
        </div>
      );
    case 'mindmap':
      /* Pastel pill — colored text, subtle shadow for mind map nodes */
      return (
        <div className={`${colors.mindmapBg} ${colors.mindmapText} rounded-2xl px-4 py-1.5 text-sm font-medium shadow-sm max-w-full break-words`}>
          <MathText text={node.text} />
        </div>
      );
    case 'outline':
      /* Bordered rectangle — definitions/concepts */
      return (
        <div className={`border ${colors.border} ${colors.nodeBg} rounded-lg px-3 py-2 text-sm ${colors.nodeText} max-w-full break-words`}>
          <MathText text={node.text} />
        </div>
      );
    case 'quote':
      /* Italic blockquote with left bar — citations/formulas */
      return (
        <div className={`border-l-4 ${colors.border} ${colors.nodeBg} pl-3 py-1.5 text-sm italic text-muted-foreground rounded-r-md max-w-full break-words`}>
          «&nbsp;<MathText text={node.text} />&nbsp;»
        </div>
      );
    case 'plain':
    default:
      /* Simple text node with bullet */
      return (
        <div className={`${colors.nodeBg} rounded-lg px-3 py-1.5 text-sm ${colors.nodeText} max-w-full break-words`}>
          • <MathText text={node.text} />
        </div>
      );
  }
}

/* ── Branch connector — L-shaped line from vertical trunk to node ── */
function BranchNode({ node, sectionType, isLast }: { node: StudygramNode; sectionType: string; isLast: boolean }) {
  const colors = getColors(sectionType);
  return (
    <div className="flex items-stretch">
      {/* Vertical trunk segment + horizontal branch arm */}
      <div className="flex flex-col items-center w-6 shrink-0">
        {/* Top half of trunk — always visible */}
        <div className={`w-px flex-1 ${colors.border} border-l-2 border-dashed`} />
        {/* Bottom half — hidden on last node to terminate the branch */}
        <div className={`w-px flex-1 ${isLast ? 'border-transparent' : colors.border} ${isLast ? '' : 'border-l-2 border-dashed'}`} />
      </div>
      {/* Horizontal connector arm */}
      <div className="flex items-center">
        <div className={`w-4 h-px ${colors.border} border-t-2 border-dashed`} />
      </div>
      {/* The actual node content */}
      {/* min-w-0 lets flex child shrink below content size */}
      <div className="flex-1 min-w-0 py-1">
        <MindMapNode node={node} sectionType={sectionType} />
      </div>
    </div>
  );
}

/* ── MindMapSectionCluster — header bubble + branching nodes ── */
function MindMapSectionCluster({ section, lessonId }: { section: StudygramSection; lessonId: string }) {
  const colors = getColors(section.type);
  const isRetenir = section.type === 'a_retenir';
  const isResumeVisuel = section.type === 'resume_visuel';

  /* Resume visuel uses a radial mind-map layout instead of branching */
  if (isResumeVisuel) {
    return <RadialMindMapCluster section={section} />;
  }

  return (
    <div className={`relative rounded-xl ${isRetenir ? 'border-2' : 'border'} ${colors.border} bg-background/50 dark:bg-background/30 overflow-hidden`}>
      {/* Section header bubble — with "read all" speaker for À Retenir */}
      <div className={`${colors.headerBg} text-white px-5 py-2.5 flex items-center gap-2`}>
        {isRetenir && <Star className="h-4 w-4 fill-current shrink-0" />}
        <span className="text-lg select-none">{section.emoji}</span>
        <h3 className="font-bold text-sm sm:text-base truncate flex-1">{section.heading}</h3>
        {/* "Read all" button — reads every À Retenir point in one tap */}
        {isRetenir && (
          <JudeSpeakerButton
            text={section.nodes.map(n => n.text).join('. ')}
            storageKey={`studygram/${lessonId}-retenir-all`}
          />
        )}
      </div>

      {/* Branching node tree — À Retenir nodes get per-node speaker buttons */}
      <div className="p-3 pl-5">
        {section.nodes.map((node, i) => (
          isRetenir ? (
            /* Flex row: branch node + speaker button for À Retenir */
            <div key={i} className="flex items-center gap-1">
              <div className="flex-1 min-w-0">
                <BranchNode node={node} sectionType={section.type} isLast={i === section.nodes.length - 1} />
              </div>
              <div className="flex-shrink-0 self-center">
                <JudeSpeakerButton text={node.text} storageKey={`studygram/${lessonId}-retenir-${i}`} />
              </div>
            </div>
          ) : (
            <BranchNode key={i} node={node} sectionType={section.type} isLast={i === section.nodes.length - 1} />
          )
        ))}
      </div>
    </div>
  );
}

/* ── RadialMindMapCluster — central node with radiating children ── */
function RadialMindMapCluster({ section }: { section: StudygramSection }) {
  const colors = getColors(section.type);
  const [centralNode, ...childNodes] = section.nodes;

  return (
    <div className={`relative rounded-xl border ${colors.border} bg-background/50 dark:bg-background/30 overflow-hidden`}>
      {/* Section header */}
      <div className={`${colors.headerBg} text-white px-5 py-2.5 flex items-center gap-2`}>
        <span className="text-lg select-none">{section.emoji}</span>
        <h3 className="font-bold text-sm sm:text-base truncate">{section.heading}</h3>
      </div>

      <div className="p-4 flex flex-col items-center gap-3">
        {/* Central concept node */}
        {centralNode && (
          <div className={`${colors.highlightBg} ${colors.highlightText} border ${colors.border} rounded-2xl px-6 py-2.5 text-sm font-bold text-center shadow-md max-w-full break-words`}>
            <MathText text={centralNode.text} />
          </div>
        )}

        {/* Vertical connector from center to horizontal bar */}
        {childNodes.length > 0 && (
          <div className={`w-px h-5 ${colors.border} border-l-2 border-dashed`} />
        )}

        {/* Horizontal bar with child pills */}
        {childNodes.length > 0 && (
          <div className="relative w-full">
            {/* Horizontal connecting line behind nodes */}
            <div className={`absolute top-1/2 left-[8%] right-[8%] h-px ${colors.border} border-t-2 border-dashed -translate-y-1/2`} />
            <div className="relative flex flex-wrap justify-center gap-2">
              {childNodes.map((node, i) => (
                <div
                  key={i}
                  className={`${colors.mindmapBg} ${colors.mindmapText} rounded-2xl px-3 py-1.5 text-xs sm:text-sm text-center shadow-sm font-medium break-words`}
                >
                  <MathText text={node.text} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Loading skeleton — matches the 4-block grid layout ── */
function StudygramSkeleton() {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <Skeleton className="h-7 w-64 mx-auto rounded-full" />
        <Skeleton className="h-4 w-40 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-muted p-4 space-y-3">
            <Skeleton className="h-9 w-full rounded-lg" />
            <div className="pl-6 space-y-2">
              <Skeleton className="h-7 w-full rounded-full" />
              <Skeleton className="h-7 w-5/6 rounded-lg" />
              <Skeleton className="h-7 w-4/6 rounded-lg" />
            </div>
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

/* ── Graph paper background style — subtle grid lines ── */
const graphPaperStyle: React.CSSProperties = {
  backgroundImage: `
    repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(0,0,0,0.04) 19px, rgba(0,0,0,0.04) 20px),
    repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(0,0,0,0.04) 19px, rgba(0,0,0,0.04) 20px)
  `,
};

/* Dark mode graph paper — applied via a class check would be complex, so we use a wrapper */
const graphPaperStyleDark: React.CSSProperties = {
  backgroundImage: `
    repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.03) 19px, rgba(255,255,255,0.03) 20px),
    repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.03) 19px, rgba(255,255,255,0.03) 20px)
  `,
};

/* ── Main export — LessonStudygramTab ── */
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

  /* Loading state */
  if (isLoading || isGenerating) {
    return (
      <Card>
        <CardContent className="p-3 sm:p-6">
          <JudeGeneratingOverlay
            isVisible={true}
            message={isGenerating ? 'Jude prépare ton studygram...' : 'Chargement...'}
          />
        </CardContent>
      </Card>
    );
  }

  /* Error state */
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

  /* No data generated */
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
    <div
      className="relative space-y-6 rounded-xl border border-border/50 p-4 sm:p-6"
      style={graphPaperStyle}
    >
      {/* Dark mode overlay — graph paper lines swap via a second layer */}
      <div className="hidden dark:block absolute inset-0 rounded-xl pointer-events-none z-0" style={graphPaperStyleDark} />

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

      {/* Central title pill — gradient bubble */}
      <div className="flex flex-col items-center gap-1 py-2">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl px-6 py-2.5 text-lg sm:text-xl font-bold text-center shadow-lg max-w-full break-words">
          {studygram.title}
        </div>
        <p className="text-sm text-muted-foreground">{studygram.subtitle}</p>
      </div>

      {/* Vertical connector from title to grid — desktop only */}
      <div className="hidden md:flex justify-center">
        <div className="w-px h-8 border-l-2 border-dashed border-purple-300 dark:border-purple-700" />
      </div>

      {/* 4-block section grid — 2 cols desktop, 1 col mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {studygram.sections.map((section, i) => (
          <MindMapSectionCluster key={i} section={section} lessonId={lessonId} />
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
