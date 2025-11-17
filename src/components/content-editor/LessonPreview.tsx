import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Target, FileText, PenTool, GraduationCap, Video, Gamepad2 } from "lucide-react";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";

interface LessonPreviewProps {
  lesson: any;
}

export const LessonPreview = ({ lesson }: LessonPreviewProps) => {
  // Debug: Log lesson data to check what fields are available
  console.log('Lesson data in preview:', lesson);
  
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
                <Badge 
                  variant={lesson.workflow_status === 'published' ? "default" : lesson.workflow_status === 'approved' ? "secondary" : "outline"}
                  className={lesson.workflow_status === 'published' ? "bg-green-500" : ""}
                >
                  {lesson.workflow_status === 'published' ? 'Publié' : 
                   lesson.workflow_status === 'approved' ? 'Approuvé' :
                   lesson.workflow_status === 'in_review' ? 'En révision' :
                   lesson.workflow_status === 'rejected' ? 'Rejeté' : 'Brouillon'}
                </Badge>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Target className="h-5 w-5" />
            Objectif
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lesson.objectif && lesson.objectif.trim() ? (
            <div 
              className="prose dark:prose-invert max-w-none lesson-content"
              dangerouslySetInnerHTML={{ __html: lesson.objectif }}
            />
          ) : (
            <p className="text-muted-foreground italic">Contenu pas encore généré</p>
          )}
        </CardContent>
      </Card>

      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <FileText className="h-5 w-5" />
            Introduction
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lesson.introduction && lesson.introduction.trim() ? (
            <div 
              className="prose dark:prose-invert max-w-none lesson-content"
              dangerouslySetInnerHTML={{ __html: lesson.introduction }}
            />
          ) : (
            <p className="text-muted-foreground italic">Contenu pas encore généré</p>
          )}
        </CardContent>
      </Card>

      {/* Contenu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <BookOpen className="h-5 w-5" />
            Contenu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lesson.contenu && lesson.contenu.trim() ? (
            <div 
              className="prose dark:prose-invert max-w-none lesson-content"
              dangerouslySetInnerHTML={{ __html: lesson.contenu }}
            />
          ) : (
            <p className="text-muted-foreground italic">Contenu pas encore généré</p>
          )}
        </CardContent>
      </Card>

      {/* Exemples et Exercices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <PenTool className="h-5 w-5" />
            Exemples et Exercices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lesson.exemples_exercices && lesson.exemples_exercices.trim() ? (
            <div 
              className="prose dark:prose-invert max-w-none lesson-content"
              dangerouslySetInnerHTML={{ __html: lesson.exemples_exercices }}
            />
          ) : (
            <p className="text-muted-foreground italic">Contenu pas encore généré</p>
          )}
        </CardContent>
      </Card>

      {/* Activités Interactives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Gamepad2 className="h-5 w-5" />
            Activités Interactives
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lesson.activites_interactives ? (
            <InteractiveActivitiesEnhanced 
              content={lesson.activites_interactives}
              isLoading={false}
            />
          ) : (
            <p className="text-muted-foreground italic">Contenu pas encore généré</p>
          )}
        </CardContent>
      </Card>

      {/* Quiz Final */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <FileText className="h-5 w-5" />
            Quiz Final
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lesson.quiz_final && lesson.quiz_final.trim() ? (
            <div 
              className="prose dark:prose-invert max-w-none lesson-content"
              dangerouslySetInnerHTML={{ __html: lesson.quiz_final }}
            />
          ) : (
            <p className="text-muted-foreground italic">Contenu pas encore généré</p>
          )}
        </CardContent>
      </Card>

      {/* YouTube Video */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Video className="h-5 w-5" />
            Vidéo YouTube
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lesson.youtube_url ? (
            <div className="space-y-4">
              {lesson.youtube_url.includes('youtube.com') || lesson.youtube_url.includes('youtu.be') ? (
                <div className="aspect-video w-full">
                  <iframe
                    className="w-full h-full rounded-lg"
                    src={lesson.youtube_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title="YouTube video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a 
                  href={lesson.youtube_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium block"
                >
                  {lesson.youtube_url}
                </a>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground italic">Aucune vidéo ajoutée</p>
          )}
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <BookOpen className="h-5 w-5" />
            Références
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lesson.references && lesson.references.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {lesson.references.map((ref: string, index: number) => (
                <li key={index}>{ref}</li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic">Aucune référence ajoutée</p>
          )}
        </CardContent>
      </Card>

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
