import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  Gamepad2,
  Wand2
} from "lucide-react";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  parseQuizQuestions,
  parseActivities,
  getValidationStatus,
  type ParsedQuestion,
  type ParsedActivity,
  type ParsedQuizActivity,
  type ParsedTrueFalseActivity,
  type ParseResult
} from "@/utils/quizActivityParsing";

interface LessonValidationPanelProps {
  lesson: any;
  onRefresh: () => void;
}

interface AIValidationResult {
  confidence: number;
  issues: Array<{
    questionIndex?: number;
    activityIndex?: number;
    issue: string;
    suggestedFix?: string;
  }>;
  summary?: string;
}

export const LessonValidationPanel = ({ lesson, onRefresh }: LessonValidationPanelProps) => {
  const [quizResult, setQuizResult] = useState<ParseResult<ParsedQuestion>>({ items: [], errors: [] });
  const [activityResult, setActivityResult] = useState<ParseResult<ParsedActivity>>({ items: [], errors: [] });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isValidatingQuiz, setIsValidatingQuiz] = useState(false);
  const [isValidatingActivities, setIsValidatingActivities] = useState(false);
  const [isRegeneratingQuiz, setIsRegeneratingQuiz] = useState(false);
  const [isRegeneratingActivities, setIsRegeneratingActivities] = useState(false);
  const [quizAIValidation, setQuizAIValidation] = useState<AIValidationResult | null>(null);
  const [activityAIValidation, setActivityAIValidation] = useState<AIValidationResult | null>(null);
  const [showQuizDetails, setShowQuizDetails] = useState(false);
  const [showActivityDetails, setShowActivityDetails] = useState(false);

  // Parse content when lesson changes
  const validateContent = useCallback(() => {
    if (!lesson) {
      setQuizResult({ items: [], errors: [] });
      setActivityResult({ items: [], errors: [] });
      return;
    }

    const quiz = lesson.quiz_final ? parseQuizQuestions(lesson.quiz_final) : { items: [], errors: [] };
    const activities = lesson.activites_interactives ? parseActivities(lesson.activites_interactives) : { items: [], errors: [] };
    
    setQuizResult(quiz);
    setActivityResult(activities);
    setQuizAIValidation(null);
    setActivityAIValidation(null);
  }, [lesson]);

  useEffect(() => {
    validateContent();
  }, [validateContent]);

  const status = getValidationStatus(quizResult, activityResult);

  const runQuizAIValidation = async () => {
    if (!lesson?.id || quizResult.items.length === 0) {
      toast.error("Pas de quiz à valider");
      return;
    }

    setIsValidatingQuiz(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-quiz-accuracy', {
        body: {
          lessonId: lesson.id,
          questions: quizResult.items.slice(0, 5),
        }
      });

      if (error) throw error;

      setQuizAIValidation(data);
      
      if (data.confidence >= 0.8) {
        toast.success(`Quiz validé avec ${Math.round(data.confidence * 100)}% de confiance`);
      } else {
        toast.warning(`${data.issues?.length || 0} problème(s) potentiel(s) détecté(s)`);
      }
    } catch (error) {
      console.error('AI validation error:', error);
      toast.error("Erreur lors de la validation IA");
    } finally {
      setIsValidatingQuiz(false);
    }
  };

  const runActivityAIValidation = async () => {
    if (!lesson?.id || activityResult.items.length === 0) {
      toast.error("Pas d'activités à valider");
      return;
    }

    setIsValidatingActivities(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-activities-accuracy', {
        body: {
          lessonId: lesson.id,
          activities: activityResult.items.slice(0, 5),
        }
      });

      if (error) throw error;

      setActivityAIValidation(data);
      
      if (data.confidence >= 0.8) {
        toast.success(`Activités validées avec ${Math.round(data.confidence * 100)}% de confiance`);
      } else {
        toast.warning(`${data.issues?.length || 0} problème(s) potentiel(s) détecté(s)`);
      }
    } catch (error) {
      console.error('AI validation error:', error);
      toast.error("Erreur lors de la validation IA");
    } finally {
      setIsValidatingActivities(false);
    }
  };

  const regenerateQuiz = async () => {
    if (!lesson?.id) return;

    setIsRegeneratingQuiz(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz-final', {
        body: {
          lessonId: lesson.id,
          exercisesContent: lesson.exemples_exercices || lesson.contenu || '',
          isCreole: lesson.grade_level?.includes('creole'),
        }
      });

      if (error) throw error;

      if (data?.content) {
        await supabase
          .from('lessons')
          .update({ quiz_final: data.content })
          .eq('id', lesson.id);

        toast.success("Quiz régénéré avec succès");
        onRefresh();
      }
    } catch (error) {
      console.error('Regeneration error:', error);
      toast.error("Erreur lors de la régénération");
    } finally {
      setIsRegeneratingQuiz(false);
    }
  };

  const regenerateActivities = async () => {
    if (!lesson?.id) return;

    setIsRegeneratingActivities(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-interactive-activities', {
        body: {
          lessonId: lesson.id,
          exercisesContent: lesson.exemples_exercices || lesson.contenu || '',
          isCreole: lesson.grade_level?.includes('creole'),
        }
      });

      if (error) throw error;

      if (data?.content) {
        await supabase
          .from('lessons')
          .update({ activites_interactives: data.content })
          .eq('id', lesson.id);

        toast.success("Activités régénérées avec succès");
        onRefresh();
      }
    } catch (error) {
      console.error('Regeneration error:', error);
      toast.error("Erreur lors de la régénération");
    } finally {
      setIsRegeneratingActivities(false);
    }
  };

  if (!lesson) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Sélectionnez une leçon pour valider son contenu</p>
        </CardContent>
      </Card>
    );
  }

  const hasContent = lesson.quiz_final || lesson.activites_interactives;

  if (!hasContent) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-warning" />
          <p>Aucun quiz ou activité à valider</p>
          <p className="text-sm mt-1">Générez du contenu d'abord</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Validation du contenu
            </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>

          {/* Summary badges - always visible */}
          <div className="flex flex-wrap gap-2 mt-2">
            {lesson.quiz_final && (
              <Badge variant={status.quizValid ? "default" : "destructive"} className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Quiz: {status.quizCount} questions
                {status.quizValid ? (
                  <CheckCircle2 className="h-3 w-3 ml-1" />
                ) : (
                  <XCircle className="h-3 w-3 ml-1" />
                )}
              </Badge>
            )}
            {lesson.activites_interactives && (
              <Badge variant={status.activitiesValid ? "default" : "destructive"} className="flex items-center gap-1">
                <Gamepad2 className="h-3 w-3" />
                Activités: {status.activityCount} items
                {status.activitiesValid ? (
                  <CheckCircle2 className="h-3 w-3 ml-1" />
                ) : (
                  <XCircle className="h-3 w-3 ml-1" />
                )}
              </Badge>
            )}
            {quizAIValidation && (
              <Badge variant={quizAIValidation.confidence >= 0.8 ? "outline" : "secondary"} className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                IA: {Math.round(quizAIValidation.confidence * 100)}%
              </Badge>
            )}
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Quiz Section */}
            {lesson.quiz_final && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Quiz Final
                  </h4>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={runQuizAIValidation}
                      disabled={isValidatingQuiz || quizResult.items.length === 0}
                    >
                      {isValidatingQuiz ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-1" />
                      )}
                      Valider IA
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={regenerateQuiz}
                      disabled={isRegeneratingQuiz}
                    >
                      {isRegeneratingQuiz ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-1" />
                      )}
                      Régénérer
                    </Button>
                  </div>
                </div>

                {/* Quiz errors */}
                {quizResult.errors.length > 0 && (
                  <div className="bg-destructive/10 rounded-lg p-3 space-y-1">
                    {quizResult.errors.map((error, idx) => (
                      <p key={idx} className="text-sm text-destructive flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {error}
                      </p>
                    ))}
                  </div>
                )}

                {/* AI validation results */}
                {quizAIValidation && quizAIValidation.issues.length > 0 && (
                  <div className="bg-warning/10 rounded-lg p-3 space-y-1">
                    <p className="text-sm font-medium text-warning-foreground">Problèmes détectés par IA:</p>
                    {quizAIValidation.issues.map((issue, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">
                        <span className="font-medium">Q{(issue.questionIndex ?? 0) + 1}:</span> {issue.issue}
                        {issue.suggestedFix && (
                          <p className="text-xs text-primary ml-4">→ {issue.suggestedFix}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Expandable quiz details */}
                <Collapsible open={showQuizDetails} onOpenChange={setShowQuizDetails}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between">
                      <span>Voir les {quizResult.items.length} questions</span>
                      {showQuizDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ScrollArea className="h-[200px] mt-2">
                      <div className="space-y-3">
                        {quizResult.items.map((q, idx) => (
                          <div key={idx} className="bg-muted/50 rounded-lg p-3 text-sm">
                            <p className="font-medium">Q{idx + 1}: {q.question.substring(0, 100)}...</p>
                            <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                              {q.options.map((opt, optIdx) => (
                                <span 
                                  key={optIdx} 
                                  className={optIdx === q.correctAnswer ? "text-primary font-medium" : "text-muted-foreground"}
                                >
                                  {String.fromCharCode(65 + optIdx)}) {opt.substring(0, 40)}...
                                </span>
                              ))}
                            </div>
                            <p className="text-xs text-primary mt-1">
                              Réponse: {String.fromCharCode(65 + q.correctAnswer)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Activities Section */}
            {lesson.activites_interactives && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4" />
                    Activités Interactives
                  </h4>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={runActivityAIValidation}
                      disabled={isValidatingActivities || activityResult.items.length === 0}
                    >
                      {isValidatingActivities ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-1" />
                      )}
                      Valider IA
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={regenerateActivities}
                      disabled={isRegeneratingActivities}
                    >
                      {isRegeneratingActivities ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-1" />
                      )}
                      Régénérer
                    </Button>
                  </div>
                </div>

                {/* Activity errors */}
                {activityResult.errors.length > 0 && (
                  <div className="bg-destructive/10 rounded-lg p-3 space-y-1">
                    {activityResult.errors.map((error, idx) => (
                      <p key={idx} className="text-sm text-destructive flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {error}
                      </p>
                    ))}
                  </div>
                )}

                {/* AI validation results */}
                {activityAIValidation && activityAIValidation.issues.length > 0 && (
                  <div className="bg-warning/10 rounded-lg p-3 space-y-1">
                    <p className="text-sm font-medium text-warning-foreground">Problèmes détectés par IA:</p>
                    {activityAIValidation.issues.map((issue, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">
                        <span className="font-medium">#{(issue.activityIndex ?? 0) + 1}:</span> {issue.issue}
                        {issue.suggestedFix && (
                          <p className="text-xs text-primary ml-4">→ {issue.suggestedFix}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Expandable activity details */}
                <Collapsible open={showActivityDetails} onOpenChange={setShowActivityDetails}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between">
                      <span>Voir les {activityResult.items.length} activités</span>
                      {showActivityDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ScrollArea className="h-[200px] mt-2">
                      <div className="space-y-3">
                        {activityResult.items.map((activity, idx) => (
                          <div key={idx} className="bg-muted/50 rounded-lg p-3 text-sm">
                            {activity.activityType === 'QUIZ' ? (
                              <>
                                <p className="font-medium flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs">QUIZ</Badge>
                                  {(activity as ParsedQuizActivity).question.substring(0, 80)}...
                                </p>
                                <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                                  {(activity as ParsedQuizActivity).options.map((opt, optIdx) => (
                                    <span 
                                      key={optIdx} 
                                      className={optIdx === (activity as ParsedQuizActivity).correctAnswer ? "text-primary font-medium" : "text-muted-foreground"}
                                    >
                                      {String.fromCharCode(65 + optIdx)}) {opt.substring(0, 30)}...
                                    </span>
                                  ))}
                                </div>
                                <p className="text-xs text-primary mt-1">
                                  Réponse: {String.fromCharCode(65 + (activity as ParsedQuizActivity).correctAnswer)}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-medium flex items-center gap-1">
                                  <Badge variant="secondary" className="text-xs">VRAI/FAUX</Badge>
                                  {(activity as ParsedTrueFalseActivity).statement.substring(0, 80)}...
                                </p>
                                <p className="text-xs mt-1">
                                  <span className={`font-medium ${(activity as ParsedTrueFalseActivity).isTrue ? 'text-primary' : 'text-destructive'}`}>
                                    {(activity as ParsedTrueFalseActivity).isTrue ? 'VRAI' : 'FAUX'}
                                  </span>
                                </p>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Refresh button */}
            <div className="pt-2 border-t">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  validateContent();
                  toast.info("Validation actualisée");
                }}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser la validation
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
