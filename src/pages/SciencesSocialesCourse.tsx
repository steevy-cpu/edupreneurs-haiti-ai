import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Globe, Calendar, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import { sciencesSocialesLessons7AF } from "@/data/sciencesSocialesLessons";
import { ThemeToggle } from "@/components/ThemeToggle";

const SciencesSocialesCourse = () => {
  const navigate = useNavigate();

  // Group lessons by month for better organization
  const lessonsByMonth = sciencesSocialesLessons7AF.reduce((acc, lesson) => {
    if (!acc[lesson.mois]) {
      acc[lesson.mois] = [];
    }
    acc[lesson.mois].push(lesson);
    return acc;
  }, {} as Record<string, typeof sciencesSocialesLessons7AF>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-orange-50/30 dark:via-orange-950/10 to-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 text-white">
        <div className="container max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/matieres")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux matières
            </Button>
            <ThemeToggle />
          </div>

          <div className="flex items-start gap-6 animate-fade-in">
            <div className="hidden md:flex w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm items-center justify-center flex-shrink-0">
              <Globe className="w-14 h-14 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                Sciences Sociales
              </h1>
              <p className="text-orange-100 text-lg mb-4">
                Niveau 7ème Année Fondamentale • Programme MENFP
              </p>
              <p className="text-white/90 max-w-2xl">
                Explore l'histoire, la géographie et les sociétés humaines. Comprends comment les civilisations évoluent et comment notre monde s'organise.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container max-w-6xl mx-auto px-4 -mt-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 hover:shadow-lg transition-all hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{sciencesSocialesLessons7AF.length}</p>
                  <p className="text-sm text-muted-foreground">Leçons au total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{Object.keys(lessonsByMonth).length}</p>
                  <p className="text-sm text-muted-foreground">Mois de cours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">AF7</p>
                  <p className="text-sm text-muted-foreground">Année fondamentale</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="container max-w-6xl mx-auto px-4 pb-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            Programme des leçons
          </h2>
          <p className="text-muted-foreground">
            Parcours les 30 leçons de Sciences Sociales organisées par mois
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(lessonsByMonth).map(([mois, lessons]) => (
            <div key={mois} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-950 rounded-full">
                  <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="font-semibold text-orange-600 dark:text-orange-400">{mois}</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-orange-200 dark:from-orange-800 to-transparent" />
                <Badge variant="outline" className="text-xs">
                  {lessons.length} leçon{lessons.length > 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessons.map((lesson, index) => {
                  const globalIndex = sciencesSocialesLessons7AF.findIndex(l => l.id === lesson.id);
                  return (
                    <Card
                      key={lesson.id}
                      className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-orange-500 animate-fade-in hover-scale"
                      onClick={() => navigate(`/sciences-sociales-lesson/${lesson.id}`)}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold text-lg">{globalIndex + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                              {lesson.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                <Globe className="w-3 h-3 mr-1" />
                                Sciences Sociales
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                45 min
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {lesson.objectif}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Objectif pédagogique
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/sciences-sociales-lesson/${lesson.id}`);
                            }}
                          >
                            Commencer
                            <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-2 border-orange-200 dark:border-orange-800">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Prêt à commencer ?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Commence par la première leçon et progresse à ton rythme. Chaque leçon contient des quiz interactifs pour tester tes connaissances !
            </p>
            <Button
              size="lg"
              onClick={() => navigate(`/sciences-sociales-lesson/${sciencesSocialesLessons7AF[0].id}`)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Commencer la première leçon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SciencesSocialesCourse;
