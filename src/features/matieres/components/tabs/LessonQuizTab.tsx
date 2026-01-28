import { useLessonQuizAsset } from '@/features/matieres/data/lessonAssets.queries';
import { QuizRenderer } from '@/features/matieres/renderers/QuizRenderer';
import { HTMLQuizParser } from '@/components/HTMLQuizParser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, AlertCircle } from 'lucide-react';
import type { QuizPayload } from '@/features/matieres/validation/quiz.schema';

interface LessonQuizTabProps {
  lessonId: string;
  lessonSlug: string;
  subjectName: string;
  legacyQuizHtml?: string | null;
}

/**
 * Lazy-loading Quiz Tab
 * Fetches quiz content only when tab is active
 * Falls back to legacy HTML if no JSON asset exists
 */
export function LessonQuizTab({ 
  lessonId, 
  lessonSlug, 
  subjectName, 
  legacyQuizHtml 
}: LessonQuizTabProps) {
  const { data: quizAsset, isLoading, error } = useLessonQuizAsset(lessonId);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
            Quiz Final
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 space-y-4">
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

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-3 sm:p-6 flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">Erreur lors du chargement du quiz</p>
        </CardContent>
      </Card>
    );
  }

  // Check for JSON asset first (Phase 2+ content)
  if (quizAsset?.payload_json && quizAsset.status === 'published') {
    const payload = quizAsset.payload_json as QuizPayload;
    return (
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
            Quiz Final
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <QuizRenderer 
            payload={payload}
            onComplete={(score, total) => {
              console.log(`Quiz completed: ${score}/${total}`);
            }}
          />
        </CardContent>
      </Card>
    );
  }

  // Fallback to legacy HTML content
  if (legacyQuizHtml) {
    return (
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
            <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
            Quiz Final
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <HTMLQuizParser
            htmlContent={legacyQuizHtml}
            lessonSlug={lessonSlug}
            subject={subjectName.toLowerCase()}
          />
        </CardContent>
      </Card>
    );
  }

  // No quiz available
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
