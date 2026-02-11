import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Lightbulb } from 'lucide-react';
import { ProgressiveContent } from '@/components/lesson/ProgressiveContent';
import { LessonAudioIconButton } from '@/components/LessonAudioIconButton';
import { YouTubeVideoSection } from '@/components/YouTubeVideoSection';

interface LessonContenuTabProps {
  lessonId: string;
  lessonTitle: string;
  contenu?: string | null;
  exemplesExercices?: string | null;
  youtubeUrl?: string | null;
  audioContenuUrl?: string | null;
  audioExemplesUrl?: string | null;
  subjectName: string;
  gradeLevel: string;
  objectif: string;
}

/**
 * Contenu Tab Component
 * Renders lesson content, examples, and YouTube videos
 */
export function LessonContenuTab({ 
  lessonId,
  lessonTitle,
  contenu, 
  exemplesExercices,
  youtubeUrl,
  audioContenuUrl,
  audioExemplesUrl,
  subjectName,
  gradeLevel,
  objectif
}: LessonContenuTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Content */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
            Contenu du cours
            <LessonAudioIconButton audioUrl={audioContenuUrl} />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 space-y-4">
          {contenu ? (
            <ProgressiveContent 
              content={contenu}
              subjectName={subjectName}
              showProgressBar={true}
              className="overflow-x-auto"
            />
          ) : (
            <p className="text-muted-foreground text-sm sm:text-base">
              Pas de contenu disponible
            </p>
          )}
        </CardContent>
      </Card>

      {/* Examples */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
            <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
            Exemples et Exercices
            <LessonAudioIconButton audioUrl={audioExemplesUrl} />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 space-y-4">
          {exemplesExercices ? (
            <ProgressiveContent 
              content={exemplesExercices}
              subjectName={subjectName}
              showProgressBar={true}
              className="overflow-x-auto"
            />
          ) : (
            <p className="text-muted-foreground text-sm sm:text-base">
              Pas d'exemples disponibles
            </p>
          )}
        </CardContent>
      </Card>

      {/* YouTube Videos */}
      <YouTubeVideoSection 
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        objectives={objectif}
        gradeLevel={gradeLevel}
        subject={subjectName.toLowerCase()}
        customYoutubeUrl={youtubeUrl}
      />
    </div>
  );
}
