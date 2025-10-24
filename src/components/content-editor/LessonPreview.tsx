import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Target, FileText, PenTool, GraduationCap, Video } from "lucide-react";

interface LessonPreviewProps {
  lesson: any;
}

export const LessonPreview = ({ lesson }: LessonPreviewProps) => {
  if (!lesson) {
    return (
      <Card className="h-full">
        <CardContent className="p-8 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p>Sélectionnez une leçon pour la prévisualiser</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="gap-1">
                  <GraduationCap className="h-3 w-3" />
                  {lesson.grade_level}
                </Badge>
                {lesson.is_published ? (
                  <Badge className="bg-green-500">Publié</Badge>
                ) : (
                  <Badge variant="secondary">Brouillon</Badge>
                )}
                {lesson.mois && (
                  <Badge variant="outline">{lesson.mois}</Badge>
                )}
              </div>
              <CardTitle className="text-3xl">{lesson.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Objectif */}
      {lesson.objectif && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Target className="h-5 w-5" />
              Objectif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{lesson.objectif}</p>
          </CardContent>
        </Card>
      )}

      {/* Introduction */}
      {lesson.introduction && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.introduction }}
            />
          </CardContent>
        </Card>
      )}

      {/* Contenu */}
      {lesson.contenu && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <BookOpen className="h-5 w-5" />
              Contenu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.contenu }}
            />
          </CardContent>
        </Card>
      )}

      {/* Exemples et Exercices */}
      {lesson.exemples_exercices && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <PenTool className="h-5 w-5" />
              Exemples et Exercices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
            />
          </CardContent>
        </Card>
      )}

      {/* YouTube Video */}
      {lesson.youtube_url && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Video className="h-5 w-5" />
              Vidéo YouTube
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a 
              href={lesson.youtube_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              {lesson.youtube_url}
            </a>
          </CardContent>
        </Card>
      )}

      {/* References */}
      {lesson.references && lesson.references.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <BookOpen className="h-5 w-5" />
              Références
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {lesson.references.map((ref: string, index: number) => (
                <li key={index}>{ref}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Review Notes (admin only section) */}
      {lesson.review_notes && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              📝 Notes de révision (Visible uniquement par les éditeurs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-900 dark:text-yellow-100">{lesson.review_notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
