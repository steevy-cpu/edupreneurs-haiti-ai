import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { ProgressiveContent } from '@/components/lesson/ProgressiveContent';
import { LessonAudioPlayerSimple } from '@/components/LessonAudioPlayerSimple';

interface LessonIntroductionTabProps {
  introduction?: string | null;
  audioUrl?: string | null;
  subjectName: string;
}

/**
 * Introduction Tab Component
 * Renders introduction content with optional audio
 */
export function LessonIntroductionTab({ 
  introduction, 
  audioUrl, 
  subjectName 
}: LessonIntroductionTabProps) {
  return (
    <Card>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-xl">
          <Target className="h-4 w-4 sm:h-5 sm:w-5" />
          Introduction
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 space-y-4">
        {audioUrl && (
          <LessonAudioPlayerSimple
            audioUrl={audioUrl}
            label="Écouter l'introduction"
            className="w-full"
          />
        )}
        {introduction ? (
          <ProgressiveContent 
            content={introduction}
            subjectName={subjectName}
            showProgressBar={false}
          />
        ) : (
          <p className="text-muted-foreground text-sm sm:text-base">
            Pas d'introduction disponible
          </p>
        )}
      </CardContent>
    </Card>
  );
}
