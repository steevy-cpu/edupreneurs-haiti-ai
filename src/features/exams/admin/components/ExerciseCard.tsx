/**
 * ExerciseCard - Single exercise editor component
 */
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ChevronDown, 
  ChevronRight, 
  Save, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Loader2 
} from "lucide-react";
import type { DbExamExercise } from "../hooks/useExamExercises";

interface ExerciseCardProps {
  exercise: DbExamExercise;
  onUpdate: (updates: Partial<Pick<DbExamExercise, 'correct_answer' | 'explanation' | 'concept' | 'points'>>) => void;
  onDelete: () => void;
  isUpdating?: boolean;
  isExpanded?: boolean;
}

const MCQ_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function ExerciseCard({ 
  exercise, 
  onUpdate, 
  onDelete, 
  isUpdating = false,
  isExpanded: defaultExpanded = false 
}: ExerciseCardProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Local state for form fields
  const [correctAnswer, setCorrectAnswer] = useState(exercise.correct_answer || '');
  const [explanation, setExplanation] = useState(exercise.explanation || '');
  const [concept, setConcept] = useState(exercise.concept || '');
  const [points, setPoints] = useState(exercise.points || 1);
  
  // Track if form has unsaved changes
  const hasChanges = 
    correctAnswer !== (exercise.correct_answer || '') ||
    explanation !== (exercise.explanation || '') ||
    concept !== (exercise.concept || '') ||
    points !== (exercise.points || 1);

  // Check data completeness
  const hasAnswer = correctAnswer.trim() !== '';
  const hasExplanation = explanation.trim() !== '';

  const handleSave = useCallback(() => {
    onUpdate({
      correct_answer: correctAnswer.trim() || null,
      explanation: explanation.trim() || null,
      concept: concept.trim(),
      points,
    });
  }, [correctAnswer, explanation, concept, points, onUpdate]);

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete();
  };

  // Parse options for display
  const getOptionsDisplay = () => {
    if (exercise.options_json && typeof exercise.options_json === 'object') {
      return Object.entries(exercise.options_json).map(([key, value]) => {
        const optValue = typeof value === 'object' && value !== null ? (value as any).value : String(value);
        return `${key}) ${optValue}`;
      }).join('  ');
    }
    if (exercise.options && Array.isArray(exercise.options)) {
      return exercise.options.map((opt, i) => 
        `${String.fromCharCode(65 + i)}) ${opt}`
      ).join('  ');
    }
    return null;
  };

  const optionsDisplay = getOptionsDisplay();
  const isMCQ = exercise.exercise_type === 'multiple_choice' || !!optionsDisplay;

  return (
    <>
      <Card className={`transition-all ${hasChanges ? 'ring-2 ring-primary/50' : ''}`}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="py-3 px-4">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                )}
                
                <Badge variant="outline" className="flex-shrink-0">
                  Q{exercise.exercise_number}
                </Badge>
                
                <span className="truncate text-sm">
                  {exercise.question_text.slice(0, 60)}
                  {exercise.question_text.length > 60 ? '...' : ''}
                </span>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                {hasAnswer ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                )}
                <Badge variant="secondary" className="text-xs">
                  {points} pt{points > 1 ? 's' : ''}
                </Badge>
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          
          <CollapsibleContent>
            <CardContent className="pt-0 px-4 pb-4 space-y-4">
              {/* Question Text */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{exercise.question_text}</p>
                {optionsDisplay && (
                  <p className="text-sm text-muted-foreground mt-2 font-mono">
                    {optionsDisplay}
                  </p>
                )}
              </div>

              {/* Editable Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Correct Answer */}
                <div className="space-y-2">
                  <Label htmlFor={`answer-${exercise.id}`}>
                    Réponse correcte
                    {!hasAnswer && <span className="text-yellow-600 dark:text-yellow-500 ml-1">*</span>}
                  </Label>
                  {isMCQ ? (
                    <Select
                      value={correctAnswer}
                      onValueChange={setCorrectAnswer}
                    >
                      <SelectTrigger id={`answer-${exercise.id}`}>
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Non défini</SelectItem>
                        {MCQ_OPTIONS.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`answer-${exercise.id}`}
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      placeholder="Entrer la réponse..."
                    />
                  )}
                </div>

                {/* Concept */}
                <div className="space-y-2">
                  <Label htmlFor={`concept-${exercise.id}`}>Concept</Label>
                  <Input
                    id={`concept-${exercise.id}`}
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="Ex: algèbre, géométrie..."
                  />
                </div>

                {/* Points */}
                <div className="space-y-2">
                  <Label htmlFor={`points-${exercise.id}`}>Points</Label>
                  <Input
                    id={`points-${exercise.id}`}
                    type="number"
                    min={1}
                    max={20}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value) || 1)}
                  />
                </div>

                {/* Exercise Type Badge */}
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="h-10 flex items-center">
                    <Badge variant={isMCQ ? "default" : "secondary"}>
                      {isMCQ ? "QCM" : "Réponse ouverte"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-2">
                <Label htmlFor={`explanation-${exercise.id}`}>
                  Explication
                  {!hasExplanation && <span className="text-muted-foreground ml-1">(optionnel)</span>}
                </Label>
                <Textarea
                  id={`explanation-${exercise.id}`}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Expliquer pourquoi cette réponse est correcte..."
                  rows={3}
                  className="resize-y"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>

                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasChanges || isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet exercice ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'exercice Q{exercise.exercise_number} sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
