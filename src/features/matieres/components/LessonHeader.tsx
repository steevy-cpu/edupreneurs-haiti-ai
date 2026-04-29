import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { LessonAudioIconButton } from "@/components/LessonAudioIconButton";
import { MathContent, isMathSubject } from "@/components/MathContent";
import { sanitizeHtml } from "@/lib/sanitize";
import { stripHtmlToText } from "@/lib/text-utils";
import { getSubjectGradient, MOTIVATIONAL_MESSAGES } from "@/features/matieres/utils/lesson-stats";
import { GoldBadge } from "@/components/shared/GoldBadge";
import type { LessonData } from "@/features/matieres/types/lesson.types";

interface LessonHeaderProps {
  lesson: LessonData;
  subjectName: string;
  subjectSlug: string;
  gradeLevel: string;
  judeImage: string;
  isLessonCompleted: boolean;
  /** Initial gold balance from profile */
  goldEarned?: number;
  /** Called by parent when gold is awarded in a child component */
  onGoldUpdate?: (amount: number) => void;
}

export const LessonHeader = ({
  lesson,
  subjectName,
  subjectSlug,
  gradeLevel,
  judeImage,
  isLessonCompleted,
  goldEarned = 0,
  onGoldUpdate,
}: LessonHeaderProps) => {
  const navigate = useNavigate();
  const [isObjectifExpanded, setIsObjectifExpanded] = useState(false);

  // Local gold state for immediate UI feedback before query refetch
  const [currentGold, setCurrentGold] = useState(goldEarned);
  const [isGoldAnimated, setIsGoldAnimated] = useState(false);

  // Sync when profile data loads/changes
  useEffect(() => {
    setCurrentGold(goldEarned);
  }, [goldEarned]);

  // Stable per session
  const [motivationalMessage] = useState(() =>
    MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
  );

  const objectifText = stripHtmlToText(lesson.objectif);
  const showExpandToggle = objectifText.length > 150;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${getSubjectGradient(subjectName)} border-b border-border/50`}>
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 relative">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate(`/course/${subjectSlug}`)}
          className="mb-4 sm:mb-6 hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-base">Retour au cours</span>
        </Button>

        <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-8 max-w-6xl mx-auto">
          {/* Title + Jude row */}
          <div className="flex items-start gap-4 flex-1 w-full">
            <div className="flex-1 space-y-2 sm:space-y-3">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs sm:text-sm">{gradeLevel}</Badge>
                <Badge variant="outline" className="text-xs sm:text-sm">{subjectName}</Badge>
                {isLessonCompleted && (
                  <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs sm:text-sm">
                    ✓ Terminée
                  </Badge>
                )}
                {/* Gold balance indicator — updates reactively on gold award */}
                <GoldBadge goldAmount={currentGold} animated={isGoldAnimated} />
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent break-words">
                {lesson.title}
              </h1>

              {/* Objectif */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Objectif</span>
                  <LessonAudioIconButton audioUrl={lesson.audio_objectif_url} />
                </div>
                <div>
                  {isObjectifExpanded ? (
                    isMathSubject(subjectName) ? (
                      <MathContent content={lesson.objectif} className="text-muted-foreground text-sm sm:text-base" />
                    ) : (
                      <div
                        className="text-muted-foreground lesson-content text-sm sm:text-base"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.objectif) }}
                      />
                    )
                  ) : (
                    <p className="text-muted-foreground text-sm sm:text-base line-clamp-2">
                      {objectifText.slice(0, 150)}{showExpandToggle ? '...' : ''}
                    </p>
                  )}
                </div>
                {showExpandToggle && (
                  <button
                    onClick={() => setIsObjectifExpanded(!isObjectifExpanded)}
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    {isObjectifExpanded ? 'Lire moins' : 'Lire plus...'}
                  </button>
                )}
              </div>

              {/* Motivational message */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 rounded-lg px-3 py-2">
                <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{motivationalMessage}</span>
              </div>

              {/* Download button */}
              <div className="flex gap-2 flex-wrap">
                <DownloadLessonButton
                  subjectName={subjectName}
                  lessonData={{
                    title: lesson.title,
                    objectif: lesson.objectif,
                    introduction: lesson.introduction,
                    contenu: lesson.contenu,
                    exemples_exercices: lesson.exemples_exercices,
                    youtube_url: lesson.youtube_url,
                    grade_level: lesson.grade_level,
                  }}
                />
              </div>
            </div>

            {/* Jude image */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-2xl lg:blur-3xl" />
              <img
                src={judeImage}
                alt="Jude - Professeur"
                className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-48 lg:h-48 object-contain drop-shadow-xl lg:drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
