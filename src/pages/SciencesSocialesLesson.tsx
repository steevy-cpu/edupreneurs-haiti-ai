import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { sciencesSocialesLessons7AF } from "@/data/sciencesSocialesLessons";

const SciencesSocialesLesson = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const currentIndex = sciencesSocialesLessons7AF.findIndex(
    (lesson) => lesson.id === topicId
  );
  const lesson = sciencesSocialesLessons7AF[currentIndex];

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Leçon non trouvée</h2>
          <Button onClick={() => navigate("/sciences-sociales-course")}>
            Retour au cours
          </Button>
        </div>
      </div>
    );
  }

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < sciencesSocialesLessons7AF.length - 1;

  const goToPrevious = () => {
    if (hasPrevious) {
      navigate(`/sciences-sociales-lesson/${sciencesSocialesLessons7AF[currentIndex - 1].id}`);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      navigate(`/sciences-sociales-lesson/${sciencesSocialesLessons7AF[currentIndex + 1].id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/sciences-sociales-course")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au cours
        </Button>

        <Card className="mb-8">
          <CardHeader className="border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-orange-600">
                Leçon {currentIndex + 1} • {lesson.mois}
              </span>
            </div>
            <CardTitle className="text-3xl">{lesson.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-orange-600">
                Objectif
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {lesson.objectif}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-orange-600">
                Introduction
              </h3>
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: lesson.introduction }}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-orange-600">
                Contenu
              </h3>
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: lesson.contenu }}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2 text-orange-600">
                Exemples et Exercices
              </h3>
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: lesson.exemplesExercices }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={!hasPrevious}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Leçon précédente
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {sciencesSocialesLessons7AF.length}
          </span>
          <Button variant="outline" onClick={goToNext} disabled={!hasNext}>
            Leçon suivante
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SciencesSocialesLesson;
