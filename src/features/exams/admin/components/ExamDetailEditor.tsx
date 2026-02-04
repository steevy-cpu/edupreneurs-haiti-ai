/**
 * ExamDetailEditor - Main container for editing exam exercises
 */
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  FileText, 
  BookOpen, 
  Settings,
  Filter,
  X
} from "lucide-react";
import { useExamExercises, calculateQualityMetrics } from "../hooks/useExamExercises";
import { QualityIndicators } from "./QualityIndicators";
import { ExerciseCard } from "./ExerciseCard";
import type { ExistingExam } from "./ExistingExamsList";

interface ExamDetailEditorProps {
  exam: ExistingExam;
  onBack: () => void;
}

type FilterType = 'all' | 'missing-answer' | 'missing-explanation' | 'missing-blocks';

export function ExamDetailEditor({ exam, onBack }: ExamDetailEditorProps) {
  const [activeTab, setActiveTab] = useState("exercises");
  const [filter, setFilter] = useState<FilterType>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { 
    exercises, 
    isLoading, 
    updateExercise, 
    deleteExercise 
  } = useExamExercises(exam.id);

  // Calculate quality metrics
  const metrics = useMemo(() => calculateQualityMetrics(exercises), [exercises]);

  // Filter exercises based on selected filter
  const filteredExercises = useMemo(() => {
    switch (filter) {
      case 'missing-answer':
        return exercises.filter(ex => !ex.correct_answer || ex.correct_answer.trim() === '');
      case 'missing-explanation':
        return exercises.filter(ex => !ex.explanation || ex.explanation.trim() === '');
      case 'missing-blocks':
        return exercises.filter(ex => !ex.prompt_blocks || !Array.isArray(ex.prompt_blocks) || ex.prompt_blocks.length === 0);
      default:
        return exercises;
    }
  }, [exercises, filter]);

  const handleUpdateExercise = async (id: string, updates: any) => {
    setUpdatingId(id);
    try {
      await updateExercise.mutateAsync({ id, updates });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    await deleteExercise.mutateAsync({ id });
  };

  const handleFilterClick = (filterType: 'missing-answer' | 'missing-explanation' | 'missing-blocks') => {
    setFilter(current => current === filterType ? 'all' : filterType);
  };

  const getFilterLabel = (f: FilterType) => {
    switch (f) {
      case 'missing-answer': return 'Sans réponse';
      case 'missing-explanation': return 'Sans explication';
      case 'missing-blocks': return 'Sans contenu structuré';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold truncate">{exam.title}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{exam.subject}</span>
            <span>•</span>
            <span>{exam.year}</span>
            {exam.series && (
              <>
                <span>•</span>
                <Badge variant="secondary">{exam.series}</Badge>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quality Indicators */}
      <QualityIndicators 
        metrics={metrics} 
        onFilterClick={handleFilterClick}
      />

      {/* Active Filter Badge */}
      {filter !== 'all' && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Badge variant="secondary" className="gap-1">
            {getFilterLabel(filter)}
            <button onClick={() => setFilter('all')} className="ml-1 hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </Badge>
          <span className="text-sm text-muted-foreground">
            {filteredExercises.length} exercice(s)
          </span>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="exercises" className="gap-2">
            <FileText className="h-4 w-4" />
            Exercices ({exercises.length})
          </TabsTrigger>
          <TabsTrigger value="references" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Textes de référence
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        {/* Exercises Tab */}
        <TabsContent value="exercises" className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="py-4">
                    <Skeleton className="h-6 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredExercises.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  {filter !== 'all' 
                    ? "Aucun exercice ne correspond au filtre sélectionné"
                    : "Aucun exercice dans cet examen"
                  }
                </p>
                {filter !== 'all' && (
                  <Button variant="link" onClick={() => setFilter('all')} className="mt-2">
                    Afficher tous les exercices
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-400px)] min-h-[400px]">
              <div className="space-y-3 pr-4">
                {filteredExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onUpdate={(updates) => handleUpdateExercise(exercise.id, updates)}
                    onDelete={() => handleDeleteExercise(exercise.id)}
                    isUpdating={updatingId === exercise.id}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Reference Texts Tab */}
        <TabsContent value="references" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Textes de référence</CardTitle>
            </CardHeader>
            <CardContent>
              {exam.reference_texts && exam.reference_texts.length > 0 ? (
                <div className="space-y-4">
                  {exam.reference_texts.map((text: any, index: number) => (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg">
                      {text.title && (
                        <h4 className="font-medium mb-2">{text.title}</h4>
                      )}
                      {text.section && (
                        <Badge variant="outline" className="mb-2">{text.section}</Badge>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{text.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun texte de référence</p>
                  <p className="text-sm">Les textes de référence sont utilisés pour les questions de compréhension</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Paramètres de l'examen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total exercices:</span>
                  <span className="ml-2 font-medium">{exam.total_exercises}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total points:</span>
                  <span className="ml-2 font-medium">{exam.total_points}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Niveau:</span>
                  <span className="ml-2 font-medium">{exam.grade_level}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Année:</span>
                  <span className="ml-2 font-medium">{exam.year}</span>
                </div>
                {exam.series && (
                  <div>
                    <span className="text-muted-foreground">Série:</span>
                    <span className="ml-2 font-medium">{exam.series}</span>
                  </div>
                )}
                {exam.session && (
                  <div>
                    <span className="text-muted-foreground">Session:</span>
                    <span className="ml-2 font-medium">{exam.session}</span>
                  </div>
                )}
              </div>
              
              {exam.pdf_url && (
                <div className="pt-4 border-t">
                  <Button variant="outline" asChild>
                    <a href={exam.pdf_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2" />
                      Voir le PDF original
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
