import { useState, useEffect, useCallback } from 'react';
import { QuizRenderer } from '@/features/matieres/renderers/QuizRenderer';
import { HTMLQuizParser } from '@/components/HTMLQuizParser';
import { useAIGeneratedQuiz } from '@/features/matieres/hooks/useAIGeneratedContent';
import { JudeGeneratingOverlay } from '@/components/jude/JudeGeneratingOverlay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import judeChairDesk from '@/assets/eric-chair-desk.png';
import { supabase } from '@/integrations/supabase/client';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { celebrateFirstGold } from '@/hooks/useFirstGoldCelebration';

interface LessonQuizTabProps {
  lessonId: string;
  lessonSlug: string;
  subjectName: string;
  subjectSlug?: string;
  gradeLevel: string;
  lessonContent: string;
  lessonExamples: string;
  legacyQuizHtml?: string | null;
  /** Called when gold is awarded after quiz completion */
  onGoldUpdate?: () => void;
  /** When true, network-dependent features are disabled */
  isOfflineMode?: boolean;
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
  onGoldUpdate,
  isOfflineMode = false,
}: LessonQuizTabProps) {
  const { user } = useSessionAuth();
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);

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

  // Check if lesson is already completed on mount — prevents duplicate gold awards
  useEffect(() => {
    if (!user?.id || !lessonSlug) return;
    supabase
      .from('lesson_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_slug', lessonSlug)
      .eq('subject', subjectName.toLowerCase())
      .maybeSingle()
      .then(({ data }) => {
        if (data) setIsLessonCompleted(true);
      });
  }, [user?.id, lessonSlug, subjectName]);

  // Handles quiz completion: validates score, records completion, awards gold
  const handleQuizComplete = useCallback(async (score: number, total: number) => {
    const percentage = Math.round((score / total) * 100);

    // Require 80% to pass
    if (percentage < 80) {
      toast.info('Tu as besoin de 80% pour valider la leçon. Réessaie!');
      return;
    }

    // Guard against duplicate gold — lesson already completed
    if (isLessonCompleted) {
      toast.info('Leçon déjà complétée!');
      return;
    }

    if (!user?.id) return;

    // Upsert completion record (conflict on user_id + lesson_slug + subject)
    const { error: upsertErr } = await supabase
      .from('lesson_completions')
      .upsert(
        {
          user_id: user.id,
          lesson_slug: lessonSlug,
          subject: subjectName.toLowerCase(),
          score: percentage,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_slug' }
      );

    if (upsertErr) {
      console.error('Completion upsert failed:', upsertErr);
      toast.error('Erreur lors de l\'enregistrement. Réessaie.');
      return;
    }

    // Award gold — capped at 100 by Math.min, validated 1-100 server-side
    const goldAmount = Math.min(score + 50, 100);
    await supabase.rpc('increment_gold', { p_user_id: user.id, amount: goldAmount });
    celebrateFirstGold();

    // Refresh GoldBadge in lesson header
    onGoldUpdate?.();
    setIsLessonCompleted(true);

    // First-ever completion celebration
    if (!localStorage.getItem('first-lesson-celebrated')) {
      localStorage.setItem('first-lesson-celebrated', 'true');
      confetti({ particleCount: 120, spread: 80, colors: ['#8b5cf6', '#f59e0b', '#10b981'] });
    }

    toast.success(`🎉 Leçon complétée! Tu as gagné ${goldAmount} Gold!`);
  }, [user?.id, lessonSlug, subjectName, isLessonCompleted, onGoldUpdate]);

  // Offline guard — must be after all hooks to satisfy React rules
  if (isOfflineMode) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6 flex items-center gap-3 text-amber-700 dark:text-amber-300">
          <WifiOff className="h-5 w-5 shrink-0" />
          <p className="text-sm">Quiz non disponible hors-ligne. Reconnectez-vous pour accéder à cet onglet.</p>
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
            message={isGenerating ? 'Jude prépare ton quiz...' : 'Chargement...'}
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
            Quiz par Jude
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
              <img src={judeChairDesk} alt="Jude" className="h-6 w-6 sm:h-7 sm:w-7 object-contain rounded-full" loading="lazy" decoding="async" />
              Quiz par Jude
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
            onComplete={handleQuizComplete}
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
