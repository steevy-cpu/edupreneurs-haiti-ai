import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { francaisLessons7AF } from "@/data/francaisLessons";

const FrancaisCourse = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/matieres")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux matières
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            Français - 7ème AF
          </h1>
          <p className="text-lg text-muted-foreground">
            Communication française - Programme MENFP
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {francaisLessons7AF.map((lesson, index) => (
            <Card
              key={lesson.id}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-purple-500 hover:scale-105"
              onClick={() => navigate(`/francais-lesson/${lesson.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      {lesson.mois}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  <span className="font-semibold">Objectif:</span> {lesson.objectif}
                </p>
                <Button
                  variant="outline"
                  className="w-full group hover:bg-purple-50 dark:hover:bg-purple-950"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/francais-lesson/${lesson.id}`);
                  }}
                >
                  <BookOpen className="mr-2 h-4 w-4 group-hover:text-purple-600" />
                  Commencer la leçon
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FrancaisCourse;
