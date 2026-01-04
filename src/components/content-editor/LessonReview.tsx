import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap } from "lucide-react";
import { MathContent, isMathSubject } from "@/components/MathContent";

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
    <Card className="overflow-hidden flex flex-col">
      <CardHeader className="flex-shrink-0 border-b bg-muted/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                <GraduationCap className="h-3 w-3" />
                {lesson.grade_level}
              </Badge>
              {lesson.series && (
                <Badge variant="secondary">
                  {lesson.series}
                </Badge>
              )}
              <Badge 
                variant={lesson.workflow_status === 'published' ? "default" : lesson.workflow_status === 'approved' ? "secondary" : "outline"}
                className={lesson.workflow_status === 'published' ? "bg-green-500" : ""}
              >
                {lesson.workflow_status === 'published' ? 'Publié' : 
                 lesson.workflow_status === 'approved' ? 'Approuvé' :
                 lesson.workflow_status === 'in_review' ? 'En révision' :
                 lesson.workflow_status === 'rejected' ? 'Rejeté' : 'Brouillon'}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="prose prose-sm lg:prose-base max-w-none dark:prose-invert">
          {/* Show all content sections */}
          {lesson.objectif && (
            <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="text-lg font-semibold text-primary mb-2">🎯 Objectif</h3>
              <p>{lesson.objectif}</p>
            </div>
          )}

          {lesson.introduction && (
            <div className="mb-6">
              {isMathSubject(lesson.subjects?.name || '') ? (
                <MathContent content={lesson.introduction} />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: lesson.introduction }} />
              )}
            </div>
          )}
          
          {lesson.contenu && (
            <div className="mb-6">
              {isMathSubject(lesson.subjects?.name || '') ? (
                <MathContent content={lesson.contenu} />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: lesson.contenu }} />
              )}
            </div>
          )}
          
          {lesson.exemples_exercices && (
            <div className="mb-6">
              {isMathSubject(lesson.subjects?.name || '') ? (
                <MathContent content={lesson.exemples_exercices} />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }} />
              )}
            </div>
          )}

          {lesson.references && lesson.references.length > 0 && (
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">📚 Références</h3>
              <ul className="list-disc list-inside space-y-1">
                {lesson.references.map((ref: string, index: number) => (
                  <li key={index}>{ref}</li>
                ))}
              </ul>
            </div>
          )}

          {lesson.youtube_url && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
              <h3 className="text-lg font-semibold mb-3">🎥 Vidéo YouTube</h3>
              <a 
                href={lesson.youtube_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                {lesson.youtube_url}
              </a>
            </div>
          )}

          {lesson.review_notes && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">📝 Notes de révision</h3>
              <p className="text-yellow-900 dark:text-yellow-100">{lesson.review_notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
