import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { parseQuizQuestions } from "@/utils/quizActivityParsing";
import type { BatchOperationConfig, BatchLesson, OperationResult, BatchOperationTheme, BatchDialogConfig } from "../types";

// Quiz validator theme
export const quizValidatorTheme: BatchOperationTheme = {
  color: 'amber',
  icon: Search,
  progressBgClass: 'bg-amber-500/5',
  borderClass: 'border-amber-500/20',
  textClass: 'text-amber-700',
  hoverClass: 'hover:bg-amber-500/10',
  buttonClass: '[&>div]:bg-amber-500 bg-amber-600 hover:bg-amber-700',
};

// Quiz validator dialog config
export const quizValidatorDialogConfig: BatchDialogConfig = {
  title: 'Valider alignement contenu',
  description: 'Cette action va analyser {count} quiz(s) pour vérifier si les questions sont alignées avec le contenu.',
  confirmLabel: 'Commencer',
  skipCheckboxLabel: 'Ignorer les leçons déjà validées',
  showSkipCheckbox: true,
};

// Create quiz validator config
export const createQuizValidatorConfig = (): BatchOperationConfig => ({
  operationType: 'validate',
  contentType: 'quiz',
  rateLimit: 2000,
  theme: quizValidatorTheme,
  messages: {
    empty: "Aucun quiz à valider (tous déjà validés ou liste vide)!",
    progress: "Validation en cours...",
    success: "✓ Tous les {count} quizzes sont alignés avec le contenu!",
    partial: "{aligned} aligné(s), {misaligned} à régénérer{errors > 0 ? `, {errors} erreur(s)` : ''}",
    error: "⚠ {count} quiz(s) nécessite(nt) régénération",
    pauseInfo: "Validation arrêtée. Les progrès ont été sauvegardés.",
  },

  filterLesson: (lesson: BatchLesson, skipCompleted: boolean) => {
    // Must have valid quiz content
    const hasQuiz = lesson.quiz_final && (
      lesson.quiz_final.includes('quiz-question') || 
      lesson.quiz_final.includes('quiz-container')
    );
    if (!hasQuiz) return false;
    
    // Skip already validated if checkbox is checked
    if (skipCompleted && lesson.last_content_validated_at) return false;
    
    return true;
  },

  processLesson: async (lesson: BatchLesson): Promise<OperationResult> => {
    // Fetch full content if not already loaded
    let contenu = lesson.contenu;
    let exemples = lesson.exemples_exercices;
    let quizFinal = lesson.quiz_final;
    
    if (!contenu || !quizFinal) {
      const { data: fullLesson, error: fetchError } = await supabase
        .from('lessons')
        .select('contenu, exemples_exercices, quiz_final')
        .eq('id', lesson.id)
        .single();

      if (fetchError) throw new Error('Erreur de chargement');
      
      contenu = fullLesson?.contenu || '';
      exemples = fullLesson?.exemples_exercices || '';
      quizFinal = fullLesson?.quiz_final;
    }

    if (!quizFinal) throw new Error('Pas de quiz disponible');

    // Parse quiz questions
    const parseResult = parseQuizQuestions(quizFinal);
    const questions = parseResult.items.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation
    }));

    if (questions.length === 0) throw new Error('Aucune question trouvée dans le quiz');

    // Call validation edge function
    const { data, error } = await supabase.functions.invoke('validate-quiz-content-alignment', {
      body: {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        gradeLevel: lesson.grade_level,
        contenu: contenu || '',
        exemples: exemples || '',
        questions
      }
    });

    if (error) throw new Error(error.message || 'Erreur de validation');

    return {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      success: true,
      aligned: data?.aligned ?? false,
      confidence: data?.confidence || 0,
      offContentCount: data?.offContentQuestions?.length || 0,
      // Store full response for database update
      _rawData: data,
    } as OperationResult & { _rawData: any };
  },

  updateLesson: async (lessonId: string, result: OperationResult, existingDetails: any) => {
    const rawData = (result as any)._rawData;
    const aligned = result.aligned ?? false;
    const confidence = result.confidence ?? 0;

    // MERGE LOGIC: Preserve existing activities validation
    const mergedDetails = {
      ...existingDetails,
      quiz: {
        aligned,
        confidence,
        offContentQuestions: rawData?.offContentQuestions || [],
        summary: rawData?.summary || `${result.offContentCount === 0 ? 'Aligné' : 'Hors-contenu'}`,
        totalQuestions: rawData?.totalQuestions || 0,
        alignedCount: rawData?.alignedCount || 0,
      },
      quizValidatedAt: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('lessons')
      .update({
        needs_quiz_regeneration: !aligned,
        content_alignment_score: confidence,
        last_content_validated_at: new Date().toISOString(),
        validation_details_json: mergedDetails,
      })
      .eq('id', lessonId);

    if (updateError) {
      console.error('Error updating lesson:', updateError);
      throw updateError;
    }
  },
});
