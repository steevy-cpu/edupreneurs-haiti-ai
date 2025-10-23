import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { sciencesSocialesLessons7AF } from "@/data/sciencesSocialesLessons";

const SciencesSocialesCourse = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/matieres")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux matières
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Sciences Sociales
          </h1>
          <p className="text-muted-foreground text-lg">
            Niveau 7ème Année Fondamentale - Programme MENFP
          </p>
        </div>

        <div className="space-y-4">
          {sciencesSocialesLessons7AF.map((lesson, index) => (
            <Card
              key={lesson.id}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-orange-500"
              onClick={() => navigate(`/sciences-sociales-lesson/${lesson.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-orange-500" />
                      Leçon {index + 1}: {lesson.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      <span className="font-semibold text-orange-600">Mois: {lesson.mois}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {lesson.objectif}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SciencesSocialesCourse;
