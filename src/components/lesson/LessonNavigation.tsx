import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SiblingLesson {
  slug: string;
  title: string;
}

interface LessonNavigationProps {
  currentIndex: number;
  totalLessons: number;
  previousLesson?: SiblingLesson | null;
  nextLesson?: SiblingLesson | null;
  subjectSlug: string;
}

export const LessonNavigation = ({
  currentIndex,
  totalLessons,
  previousLesson,
  nextLesson,
  subjectSlug
}: LessonNavigationProps) => {
  const navigate = useNavigate();

  const handleNavigate = (lessonSlug: string) => {
    navigate(`/course/${subjectSlug}/${lessonSlug}`);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">
          Leçon <span className="font-semibold text-foreground">{currentIndex}</span> sur {totalLessons}
        </span>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1 flex-wrap max-w-md mx-auto">
        {Array.from({ length: Math.min(totalLessons, 12) }).map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx + 1 === currentIndex
                ? "w-4 bg-primary"
                : idx + 1 < currentIndex
                ? "w-1.5 bg-primary/50"
                : "w-1.5 bg-muted-foreground/30"
            }`}
          />
        ))}
        {totalLessons > 12 && (
          <span className="text-xs text-muted-foreground ml-1">+{totalLessons - 12}</span>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => previousLesson && handleNavigate(previousLesson.slug)}
          disabled={!previousLesson}
          className="flex-1 max-w-[45%] text-xs sm:text-sm h-auto py-2"
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
          <span className="truncate">
            {previousLesson?.title || "Début du cours"}
          </span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => nextLesson && handleNavigate(nextLesson.slug)}
          disabled={!nextLesson}
          className="flex-1 max-w-[45%] text-xs sm:text-sm h-auto py-2"
        >
          <span className="truncate">
            {nextLesson?.title || "Fin du cours"}
          </span>
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 flex-shrink-0" />
        </Button>
      </div>
    </div>
  );
};
