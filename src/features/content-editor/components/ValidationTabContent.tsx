/**
 * @file ValidationTabContent.tsx
 * @description Validation results tab — stats cards, filtered lists, and bulk publish.
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
import { ValidationItem } from "./ValidationItem";
import type { LessonValidation, ValidationStats } from "@/types/batch-generation.types";

interface ValidationTabContentProps {
  validations: LessonValidation[];
  validationStats: ValidationStats;
  isValidating: boolean;
  expandedLessons: Set<string>;
  toggleExpanded: (lessonId: string) => void;
  // Regeneration
  regenerateQuiz: (lessonId: string) => void;
  regenerateActivities: (lessonId: string) => void;
  isRegenerating: string | null;
  // Publishing
  publishLesson: (lessonId: string) => void;
  publishAllValidLessons: () => void;
  isPublishing: string | null;
  publishedLessons: Set<string>;
  validLessonsCount: number;
  // Export
  exportValidationCSV: () => void;
}

export const ValidationTabContent = ({
  validations, validationStats, isValidating,
  expandedLessons, toggleExpanded,
  regenerateQuiz, regenerateActivities, isRegenerating,
  publishLesson, publishAllValidLessons, isPublishing, publishedLessons, validLessonsCount,
  exportValidationCSV,
}: ValidationTabContentProps) => {
  return (
    <div className="space-y-4 mt-4">
      {/* Validation Stats */}
      {validations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{validationStats.total}</div>
              <div className="text-sm text-muted-foreground">Leçons analysées</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{validationStats.quizValid}</div>
              <div className="text-sm text-muted-foreground">Quiz valides</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">{validationStats.quizInvalid}</div>
              <div className="text-sm text-muted-foreground">Quiz invalides</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{validationStats.activitiesValid}</div>
              <div className="text-sm text-muted-foreground">Activités valides</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-destructive">{validationStats.activitiesInvalid}</div>
              <div className="text-sm text-muted-foreground">Activités invalides</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Validation Loading */}
      {isValidating && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Analyse en cours...</p>
              <Progress value={33} className="animate-pulse" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Results with filtered tabs */}
      {validations.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Résultats de validation</CardTitle>
            <div className="flex gap-2">
              {validLessonsCount > 0 && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={publishAllValidLessons}
                  disabled={isPublishing === 'bulk'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isPublishing === 'bulk' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Publier toutes les valides ({validLessonsCount})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={exportValidationCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Tous ({validations.length})</TabsTrigger>
                <TabsTrigger value="errors">Avec erreurs ({validations.filter(v => v.quizErrors.length > 0 || v.activityErrors.length > 0).length})</TabsTrigger>
                <TabsTrigger value="valid">Valides ({validations.filter(v => v.quizErrors.length === 0 && v.activityErrors.length === 0 && (v.quizParsed.length > 0 || v.activitiesParsed.length > 0)).length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {validations.map(validation => (
                      <ValidationItem
                        key={validation.lesson.id}
                        validation={validation}
                        isExpanded={expandedLessons.has(validation.lesson.id)}
                        onToggle={() => toggleExpanded(validation.lesson.id)}
                        onRegenerateQuiz={regenerateQuiz}
                        onRegenerateActivities={regenerateActivities}
                        isRegenerating={isRegenerating}
                        onPublish={publishLesson}
                        isPublishing={isPublishing}
                        isPublished={publishedLessons.has(validation.lesson.id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="errors" className="mt-4">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {validations.filter(v => v.quizErrors.length > 0 || v.activityErrors.length > 0).map(validation => (
                      <ValidationItem
                        key={validation.lesson.id}
                        validation={validation}
                        isExpanded={expandedLessons.has(validation.lesson.id)}
                        onToggle={() => toggleExpanded(validation.lesson.id)}
                        onRegenerateQuiz={regenerateQuiz}
                        onRegenerateActivities={regenerateActivities}
                        isRegenerating={isRegenerating}
                        onPublish={publishLesson}
                        isPublishing={isPublishing}
                        isPublished={publishedLessons.has(validation.lesson.id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="valid" className="mt-4">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {validations.filter(v => v.quizErrors.length === 0 && v.activityErrors.length === 0 && (v.quizParsed.length > 0 || v.activitiesParsed.length > 0)).map(validation => (
                      <ValidationItem
                        key={validation.lesson.id}
                        validation={validation}
                        isExpanded={expandedLessons.has(validation.lesson.id)}
                        onToggle={() => toggleExpanded(validation.lesson.id)}
                        onRegenerateQuiz={regenerateQuiz}
                        onRegenerateActivities={regenerateActivities}
                        isRegenerating={isRegenerating}
                        onPublish={publishLesson}
                        isPublishing={isPublishing}
                        isPublished={publishedLessons.has(validation.lesson.id)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isValidating && validations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Cliquez sur "Lancer validation" pour analyser les quiz et activités</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
