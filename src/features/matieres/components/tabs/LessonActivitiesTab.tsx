import { useAIGeneratedActivities } from '@/features/matieres/hooks/useAIGeneratedContent';
import { InteractiveActivitiesEnhanced } from '@/components/InteractiveActivitiesEnhanced';
import { JudeGeneratingOverlay } from '@/components/jude/JudeGeneratingOverlay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import judeChairDesk from '@/assets/eric-chair-desk.png';

interface LessonActivitiesTabProps {
  lessonId: string;
  subjectName: string;
  gradeLevel: string;
  lessonTitle: string;
  lessonContent: string;
  lessonExamples: string;
  legacyActivitiesHtml?: string | null;
  /** Called when gold is awarded during an activity */
  onGoldUpdate?: () => void;
  /** When true, network-dependent features are disabled */
  isOfflineMode?: boolean;
}

/**
 * AI-Generated Activities Tab
 * Generates activities on-demand via edge function, caches in localStorage.
 * Falls back to legacy HTML if AI generation is unavailable.
 */
export function LessonActivitiesTab({
  lessonId,
  subjectName,
  gradeLevel,
  lessonTitle,
  lessonContent,
  lessonExamples,
  legacyActivitiesHtml,
  onGoldUpdate,
  isOfflineMode = false,
}: LessonActivitiesTabProps) {
  const { data, isLoading, isGenerating, error, isStale, regenerate } = useAIGeneratedActivities({
    lessonId,
    contentType: 'activities',
    lessonTitle,
    lessonContent,
    lessonExamples,
    gradeLevel,
    subjectName,
  });

  // Offline guard — must be after all hooks to satisfy React rules
  if (isOfflineMode) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6 flex items-center gap-3 text-amber-700 dark:text-amber-300">
          <WifiOff className="h-5 w-5 shrink-0" />
          <p className="text-sm">Activités non disponibles hors-ligne. Reconnectez-vous pour accéder à cet onglet.</p>
        </CardContent>
      </Card>
    );
  }

  // Loading / Generating state
  if (isLoading || isGenerating) {
    return (
      <Card>
        <CardContent className="p-3 sm:p-6">
          <JudeGeneratingOverlay
            isVisible={true}
            message={isGenerating ? 'Jude prépare tes activités...' : 'Chargement...'}
          />
        </CardContent>
      </Card>
    );
  }

  // Error state — offer retry + legacy fallback
  if (error && !data) {
    return (
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
            <img src={judeChairDesk} alt="Jude" className="h-6 w-6 sm:h-7 sm:w-7 object-contain rounded-full" loading="lazy" decoding="async" />
            Activités par Jude
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={regenerate} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>

          {/* Legacy fallback */}
          {legacyActivitiesHtml && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-3">Activités statiques disponibles :</p>
              <InteractiveActivitiesEnhanced
                content={legacyActivitiesHtml}
                isLoading={false}
                onGoldUpdate={onGoldUpdate}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Activities ready
  if (data) {
    return (
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
              <img src={judeChairDesk} alt="Jude" className="h-6 w-6 sm:h-7 sm:w-7 object-contain rounded-full" loading="lazy" decoding="async" />
              Activités par Jude
            </CardTitle>
            <Button
              onClick={regenerate}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              title="Régénérer les activités"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline ml-1 text-xs">Régénérer</span>
            </Button>
          </div>
          {isStale && (
            <p className="text-xs text-muted-foreground mt-1">
              Activités générées il y a plus de 7 jours — 
              <button onClick={regenerate} className="underline text-primary ml-1">
                Régénérer ?
              </button>
            </p>
          )}
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <InteractiveActivitiesEnhanced
            content={data}
            isLoading={false}
            onGoldUpdate={onGoldUpdate}
          />
        </CardContent>
      </Card>
    );
  }

  // No content at all
  return (
    <Card>
      <CardContent className="p-3 sm:p-6">
        <p className="text-muted-foreground text-sm sm:text-base">
          Aucune activité interactive disponible
        </p>
      </CardContent>
    </Card>
  );
}
