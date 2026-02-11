import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { ProgressiveContent } from '@/components/lesson/ProgressiveContent';
import { LessonAudioIconButton } from '@/components/LessonAudioIconButton';

interface LessonIntroductionTabProps {
  introduction?: string | null;
  audioUrl?: string | null;
  subjectName: string;
}

/**
 * Introduction Tab Component
 * Renders introduction content with optional audio icon next to title
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
          <LessonAudioIconButton audioUrl={audioUrl} />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 space-y-4">
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
