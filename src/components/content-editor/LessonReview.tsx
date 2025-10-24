import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap } from "lucide-react";

interface LessonReviewProps {
  lesson: any;
}

export const LessonReview = ({ lesson }: LessonReviewProps) => {
  if (!lesson) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p>Sélectionnez une leçon pour la réviser</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] max-h-[600px] overflow-hidden flex flex-col">
      <CardHeader className="flex-shrink-0 border-b bg-muted/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                <GraduationCap className="h-3 w-3" />
                {lesson.grade_level}
              </Badge>
              {lesson.is_published ? (
                <Badge className="bg-green-500">Publié</Badge>
              ) : (
                <Badge variant="secondary">Brouillon</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-6">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {lesson.introduction && (
            <div className="mb-6">
              <div dangerouslySetInnerHTML={{ __html: lesson.introduction }} />
            </div>
          )}
          
          {lesson.contenu && (
            <div className="mb-6">
              <div dangerouslySetInnerHTML={{ __html: lesson.contenu }} />
            </div>
          )}
          
          {lesson.exemples_exercices && (
            <div className="mb-6">
              <div dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
