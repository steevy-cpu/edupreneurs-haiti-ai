/**
 * @file ValidationItem.tsx
 * @description Collapsible validation result for a single lesson —
 * shows quiz/activity errors, parsed content previews, and action buttons.
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  CheckCircle2, XCircle, ChevronDown, ChevronUp, FileText, Gamepad2,
  AlertTriangle, RotateCcw, Loader2,
} from "lucide-react";
import type { LessonValidation } from "@/types/batch-generation.types";
import type { ParsedQuizActivity, ParsedTrueFalseActivity } from "@/utils/quizActivityParsing";

export interface ValidationItemProps {
  validation: LessonValidation;
  isExpanded: boolean;
  onToggle: () => void;
  onRegenerateQuiz: (lessonId: string) => void;
  onRegenerateActivities: (lessonId: string) => void;
  isRegenerating: string | null;
  onPublish: (lessonId: string) => void;
  isPublishing: string | null;
  isPublished: boolean;
}

export const ValidationItem = ({ 
  validation, 
  isExpanded, 
  onToggle,
  onRegenerateQuiz,
  onRegenerateActivities,
  isRegenerating,
  onPublish,
  isPublishing,
  isPublished
}: ValidationItemProps) => {
  const hasQuizErrors = validation.quizErrors.length > 0;
  const hasActivityErrors = validation.activityErrors.length > 0;
  const hasAnyContent = validation.quizParsed.length > 0 || validation.activitiesParsed.length > 0;
  const isCurrentlyRegenerating = isRegenerating === validation.lesson.id;
  const isCurrentlyPublishing = isPublishing === validation.lesson.id;
  const isValid = !hasQuizErrors && !hasActivityErrors && hasAnyContent;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className={`border ${hasQuizErrors || hasActivityErrors ? 'border-destructive/50' : hasAnyContent ? 'border-green-500/50' : 'border-muted'}`}>
        <CollapsibleTrigger asChild>
          <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {hasQuizErrors || hasActivityErrors ? (
                  <XCircle className="h-5 w-5 text-destructive" />
                ) : hasAnyContent ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                )}
                <div>
                  <p className="font-medium">{validation.lesson.title}</p>
                  <p className="text-sm text-muted-foreground">{validation.lesson.subject_name} • {validation.lesson.grade_level}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isPublished && (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Publiée
                  </Badge>
                )}
                {isValid && !isPublished && (
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPublish(validation.lesson.id);
                    }}
                    disabled={isCurrentlyPublishing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isCurrentlyPublishing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Publier
                  </Button>
                )}
                {validation.quizParsed.length > 0 && (
                  <Badge variant={hasQuizErrors ? "destructive" : "default"}>Quiz: {validation.quizParsed.length}Q</Badge>
                )}
                {validation.activitiesParsed.length > 0 && (
                  <Badge variant={hasActivityErrors ? "destructive" : "secondary"}>Activités: {validation.activitiesParsed.length}</Badge>
                )}
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Quiz Errors */}
            {validation.quizErrors.length > 0 && (
              <div className="p-3 bg-destructive/10 rounded-lg">
                <p className="font-medium text-destructive mb-2">Erreurs Quiz:</p>
                <ul className="text-sm space-y-1">
                  {validation.quizErrors.map((err, idx) => (
                    <li key={idx} className="text-destructive">{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Activity Errors */}
            {validation.activityErrors.length > 0 && (
              <div className="p-3 bg-destructive/10 rounded-lg">
                <p className="font-medium text-destructive mb-2">Erreurs Activités:</p>
                <ul className="text-sm space-y-1">
                  {validation.activityErrors.map((err, idx) => (
                    <li key={idx} className="text-destructive">{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Regeneration Buttons */}
            {(hasQuizErrors || hasActivityErrors) && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {hasQuizErrors && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegenerateQuiz(validation.lesson.id);
                    }}
                    disabled={isCurrentlyRegenerating}
                  >
                    {isCurrentlyRegenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Régénérer Quiz
                  </Button>
                )}
                {hasActivityErrors && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegenerateActivities(validation.lesson.id);
                    }}
                    disabled={isCurrentlyRegenerating}
                  >
                    {isCurrentlyRegenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Régénérer Activités
                  </Button>
                )}
              </div>
            )}

            {/* Parsed Questions Preview */}
            {validation.quizParsed.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Questions du Quiz ({validation.quizParsed.length})
                </h4>
                <div className="space-y-2">
                  {validation.quizParsed.slice(0, 3).map((q, idx) => (
                    <div key={idx} className="p-2 bg-muted rounded text-sm">
                      <p className="font-medium">Q{idx + 1}: {q.question.substring(0, 80)}...</p>
                      <p className="text-xs text-muted-foreground">
                        Réponse: {String.fromCharCode(65 + q.correctAnswer)} - {q.options[q.correctAnswer]?.substring(0, 40)}...
                      </p>
                    </div>
                  ))}
                  {validation.quizParsed.length > 3 && (
                    <p className="text-xs text-muted-foreground">+ {validation.quizParsed.length - 3} autres questions</p>
                  )}
                </div>
              </div>
            )}

            {/* Parsed Activities Preview */}
            {validation.activitiesParsed.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Activités ({validation.activitiesParsed.length})
                </h4>
                <div className="space-y-2">
                  {validation.activitiesParsed.slice(0, 3).map((activity, idx) => (
                    <div key={idx} className="p-2 bg-muted rounded text-sm">
                      <Badge variant="outline" className="mb-1">{activity.activityType}</Badge>
                      <p className="font-medium">
                        {activity.activityType === 'QUIZ' 
                          ? (activity as ParsedQuizActivity).question.substring(0, 80) + '...'
                          : (activity as ParsedTrueFalseActivity).statement.substring(0, 80) + '...'
                        }
                      </p>
                    </div>
                  ))}
                  {validation.activitiesParsed.length > 3 && (
                    <p className="text-xs text-muted-foreground">+ {validation.activitiesParsed.length - 3} autres activités</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
