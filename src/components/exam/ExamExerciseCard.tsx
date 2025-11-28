import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";

interface Exercise {
  id: string;
  exercise_number: number;
  question_text: string;
  options: string;
  correct_answer: string;
  concept: string;
  points: number;
}

interface ExamExerciseCardProps {
  exercise: Exercise;
  currentExercise: number;
  totalExercises: number;
  completedExercises: number[];
  score: number;
  onPrevious: () => void;
  onNext: () => void;
  onSelectAnswer: (answer: string) => void;
  selectedAnswer?: string;
  isAnswered: boolean;
}

export const ExamExerciseCard = ({
  exercise,
  currentExercise,
  totalExercises,
  completedExercises,
  score,
  onPrevious,
  onNext,
  onSelectAnswer,
  selectedAnswer,
  isAnswered,
}: ExamExerciseCardProps) => {
  const options = JSON.parse(exercise.options || '[]');
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="outline" className="mb-2">
            {exercise.concept}
          </Badge>
          <h2 className="text-2xl font-bold">
            Question {currentExercise} sur {totalExercises}
          </h2>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-primary">
            <Trophy className="h-5 w-5" />
            <span className="text-2xl font-bold">{score}</span>
            <span className="text-muted-foreground">points</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {completedExercises.length} exercices complétés
          </p>
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Badge className="mt-1">{exercise.points} pts</Badge>
            <p className="text-lg flex-1">{exercise.question_text}</p>
          </div>

          {/* Multiple choice options */}
          <div className="space-y-3 mt-6">
            {options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => !isAnswered && onSelectAnswer(letters[index])}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAnswer === letters[index]
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-accent'
                } ${isAnswered ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary">{letters[index]})</span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentExercise === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>
        <Button
          onClick={onNext}
          disabled={currentExercise === totalExercises}
        >
          Suivant
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
