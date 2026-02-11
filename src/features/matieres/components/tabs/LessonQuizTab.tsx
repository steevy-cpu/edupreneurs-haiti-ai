import { QuizRenderer } from '@/features/matieres/renderers/QuizRenderer';
import { HTMLQuizParser } from '@/components/HTMLQuizParser';
import { useAIGeneratedQuiz } from '@/features/matieres/hooks/useAIGeneratedContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

interface LessonQuizTabProps {
  lessonId: string;
  lessonSlug: string;
  subjectName: string;
  subjectSlug?: string;
  gradeLevel: string;
  lessonContent: string;
  lessonExamples: string;
  legacyQuizHtml?: string | null;
}

/**
 * AI-Generated Quiz Tab
 * Generates quiz on-demand via edge function, caches in localStorage.
 * Falls back to legacy HTML if AI generation is unavailable.
 */
export function LessonQuizTab({
  lessonId,
  lessonSlug,
  subjectName,
  subjectSlug,
  gradeLevel,
  lessonContent,
  lessonExamples,
  legacyQuizHtml,
}: LessonQuizTabProps) {
  const { data, isLoading, isGenerating, error, isStale, regenerate } = useAIGeneratedQuiz({
    lessonId,
    contentType: 'quiz',
    lessonTitle: lessonSlug,
    lessonContent,
    lessonExamples,
    gradeLevel,
    subjectName,
    subjectSlug,
    lessonSlug,
  });

  // Loading / Generating state
  if (isLoading || isGenerating) {
    return (
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
            Quiz Final
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 space-y-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Sparkles className="h-4 w-4 animate-pulse text-primary" />
            <p className="text-sm animate-pulse">
              {isGenerating ? 'Génération du quiz en cours...' : 'Chargement...'}
            </p>
          </div>
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
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
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
            Quiz Final
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
          {legacyQuizHtml && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-3">Quiz statique disponible :</p>
              <HTMLQuizParser
                htmlContent={legacyQuizHtml}
                lessonSlug={lessonSlug}
                subject={subjectName.toLowerCase()}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Quiz ready
  if (data) {
    return (
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
              Quiz Final
            </CardTitle>
            <Button
              onClick={regenerate}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              title="Régénérer le quiz"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline ml-1 text-xs">Régénérer</span>
            </Button>
          </div>
          {isStale && (
            <p className="text-xs text-muted-foreground mt-1">
              Quiz généré il y a plus de 7 jours — 
              <button onClick={regenerate} className="underline text-primary ml-1">
                Régénérer ?
              </button>
            </p>
          )}
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <QuizRenderer
            payload={data}
            onComplete={(score, total) => {
              console.log(`Quiz completed: ${score}/${total}`);
            }}
          />
        </CardContent>
      </Card>
    );
  }

  // No content at all — show empty state
  return (
    <Card>
      <CardContent className="p-3 sm:p-6">
        <p className="text-muted-foreground text-sm sm:text-base">
          Aucun quiz disponible pour le moment
        </p>
      </CardContent>
    </Card>
  );
}
