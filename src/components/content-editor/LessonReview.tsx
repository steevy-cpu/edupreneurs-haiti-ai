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
              {lesson.is_published ? (
                <Badge className="bg-green-500">Publié</Badge>
              ) : (
                <Badge variant="secondary">Brouillon</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="prose prose-sm lg:prose-base max-w-none dark:prose-invert">
          {/* Objectif d'apprentissage */}
          {lesson.objectif && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-primary">📚 Objectif d'apprentissage</h2>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p>{lesson.objectif}</p>
              </div>
            </div>
          )}

          {/* Introduction */}
          {lesson.introduction && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-primary">🎯 Introduction</h2>
              <div dangerouslySetInnerHTML={{ __html: lesson.introduction }} />
            </div>
          )}
          
          {/* Contenu principal */}
          {lesson.contenu && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-primary">📖 Contenu</h2>
              <div dangerouslySetInnerHTML={{ __html: lesson.contenu }} />
            </div>
          )}
          
          {/* Exemples et Exercices */}
          {lesson.exemples_exercices && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-primary">✏️ Exemples et Exercices</h2>
              <div dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }} />
            </div>
          )}

          {/* References */}
          {lesson.references && lesson.references.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-primary">📚 Références</h2>
              <ul className="list-disc list-inside space-y-1">
                {lesson.references.map((ref: string, index: number) => (
                  <li key={index}>{ref}</li>
                ))}
              </ul>
            </div>
          )}

          {/* YouTube Video */}
          {lesson.youtube_url && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-primary">🎥 Vidéo YouTube</h2>
              <div className="aspect-video w-full bg-muted/30 rounded-lg flex items-center justify-center">
                <a 
                  href={lesson.youtube_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Voir la vidéo →
                </a>
              </div>
            </div>
          )}

          {/* Review Notes (if any) */}
          {lesson.review_notes && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-primary">📝 Notes de révision</h2>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p>{lesson.review_notes}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
