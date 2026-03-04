import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";

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
  const [jumpValue, setJumpValue] = useState("");
  const progressPercentage = (completedExercises.length / totalExercises) * 100;

  /** Validate input and jump to the requested question number */
  const handleJump = () => {
    const num = parseInt(jumpValue);
    if (num >= 1 && num <= totalExercises) {
      onExerciseClick?.(num);
      setJumpValue("");
    }
  };

  return (
    <div className="space-y-2">
      {/* Slim progress bar */}
      <Progress value={progressPercentage} className="h-2" />

      {/* Compact navigation row — position, jump input, completed count */}
      <div className="flex items-center justify-between gap-2">
        {/* Current position indicator */}
        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
          Q{currentExercise} / {totalExercises}
        </span>

        {/* Jump-to-question input with arrow trigger */}
        <div className="flex items-center gap-1">
          <Input
            type="number"
            id="jump-to-question"
            name="jump-to-question"
            autoComplete="off"
            min={1}
            max={totalExercises}
            placeholder="N°"
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleJump();
            }}
            className="w-14 h-7 text-xs text-center px-1 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            onClick={handleJump}
            aria-label="Aller à la question"
            className="h-7 w-7 flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Completed count */}
        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
          {completedExercises.length} / {totalExercises} complétées
        </span>
      </div>
    </div>
  );
};
