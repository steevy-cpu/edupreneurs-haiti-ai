import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";

interface ExamProgressBarProps {
  currentExercise: number;
  totalExercises: number;
  completedExercises: number[];
  onExerciseClick?: (exerciseNumber: number) => void;
}

export const ExamProgressBar = ({
  currentExercise,
  totalExercises,
  completedExercises,
  onExerciseClick,
}: ExamProgressBarProps) => {
  const progressPercentage = (completedExercises.length / totalExercises) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Progression de l'examen</h3>
        <span className="text-sm text-muted-foreground">
          {completedExercises.length} / {totalExercises} complétés
        </span>
      </div>
      
      <Progress value={progressPercentage} className="h-2" />
      
      {/* Responsive grid — scrollable on mobile for exams with many exercises */}
      <div className="overflow-x-auto -mx-2 px-2">
        <div className="grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-9 gap-1.5 sm:gap-2 min-w-0">
          {Array.from({ length: totalExercises }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => onExerciseClick?.(num)}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all cursor-pointer ${
                num === currentExercise
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                  : completedExercises.includes(num)
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {completedExercises.includes(num) ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <span>{num}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
