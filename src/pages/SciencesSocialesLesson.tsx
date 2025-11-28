import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  BookOpen,
  Lightbulb,
  ClipboardCheck,
  Globe,
  Trophy,
  NotebookPen,
  Save,
  Award,
  Gamepad2
} from "lucide-react";
import DOMPurify from 'dompurify';
import { sciencesSocialesLessons7AF } from "@/data/sciencesSocialesLessons";
import {
  evolutionSocietesQuiz,
  evolutionSocietesMatching,
  espaceGeographiqueQuiz,
  espaceGeographiqueMatching,
  terreHumanisationQuiz,
  terreHumanisationMatching,
  cultureSocieteQuiz,
  cultureSocieteMatching,
  formesOrganisationQuiz,
  formesOrganisationMatching,
  espaceCaraibeenQuiz,
  espaceCaraibeenMatching,
  reliefHaitienQuiz,
  reliefHaitienMatching,
  systemeSolaireQuiz,
  systemeSolaireMatching,
  civilisationsAnciennesQuiz,
  civilisationsAnciennesMatching,
  familleOrganisationQuiz,
  familleOrganisationMatching,
  fossesMarinesQuiz,
  fossesMarinesMatching,
  climatHaitiQuiz,
  climatHaitiMatching,
  societesAntillaisesQuiz,
  societesAntillaisesMatching,
  formeConstitutionTerreQuiz,
  formeConstitutionTerreMatching,
  premiersHabitantsQuiz,
  premiersHabitantsMatching,
  mouvementsTerreQuiz,
  mouvementsTerreMatching,
  humaniteCaraibeQuiz,
  humaniteCaraibeMatching,
  particularitesClimatiquesQuiz,
  particularitesClimatiquesMatching,
  vieEconomiqueQuiz,
  vieEconomiqueMatching,
  representationTerreQuiz,
  representationTerreMatching,
  regionsClimatiquesQuiz,
  regionsClimatiquesMatching,
  modesFigurationQuiz,
  modesFigurationMatching,
  potentielHydrauliqueQuiz,
  potentielHydrauliqueMatching,
  societePrecolombienneQuiz,
  societePrecolombienneMatching,
  formationsVegetalesCaraibeQuiz,
  formationsVegetalesCaraibeMatching,
  systemeEcologiqueQuiz,
  systemeEcologiqueMatching,
  hydrosphereQuiz,
  hydrosphereMatching,
  formationsVegetalesHaitiQuiz,
  formationsVegetalesHaitiMatching,
  analyseClimatologiqueQuiz,
  analyseClimatologiqueMatching,
  languesAfricainesQuiz,
  languesAfricainesMatching
} from "@/data/sciencesSocialesActivities";
import { QuizGame } from "@/components/math-activities/QuizGame";
import { MatchingGame } from "@/components/math-activities/MatchingGame";
import { ThemeToggle } from "@/components/ThemeToggle";
import { YouTubeVideoSection } from "@/components/YouTubeVideoSection";
import { DownloadLessonButton } from "@/components/DownloadLessonButton";
import { InteractiveActivitiesEnhanced } from "@/components/InteractiveActivitiesEnhanced";
import { HTMLQuizParser } from "@/components/HTMLQuizParser";
import { EricChatbot } from "@/components/EricChatbot";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DBLesson {
  id: string;
  title: string;
  slug: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemples_exercices: string;
  activites_interactives?: string;
  quiz_final?: string;
  youtube_url?: string;
}

export default function SciencesSocialesLesson() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("introduction");
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [personalNotes, setPersonalNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [dbLesson, setDbLesson] = useState<DBLesson | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(true);

  // Fallback to static data if no DB lesson found
  const currentIndex = sciencesSocialesLessons7AF.findIndex(
    (lesson) => lesson.id === topicId
  );
  const staticLesson = sciencesSocialesLessons7AF[currentIndex];
  
  // Use DB lesson if available, otherwise use static lesson
  const lesson = dbLesson || staticLesson;
  
  // Get the correct property based on source
  const lessonExercises = dbLesson?.exemples_exercices || staticLesson?.exemplesExercices || '';
  const lessonMonth = dbLesson ? '' : staticLesson?.mois || '';
  const lessonYoutubeUrl = dbLesson?.youtube_url;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchLessonFromDB();
    loadPersonalNotes();
  }, [topicId]);

  const fetchLessonFromDB = async () => {
    if (!topicId) return;
    
    try {
      setLoadingLesson(true);
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('slug', topicId)
        .eq('grade_level', '7AF')
        .maybeSingle();

      if (data && !error) {
        setDbLesson(data as DBLesson);
      }
    } catch (error) {
      console.error('Error fetching lesson from DB:', error);
    } finally {
      setLoadingLesson(false);
    }
  };

  const loadPersonalNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('lesson_notes' as any)
        .select('notes')
        .eq('user_id', user.id)
        .eq('lesson_id', `sciences-sociales-${topicId}`)
        .maybeSingle();

      if (!error && data) {
        setPersonalNotes((data as any)?.notes || "");
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const savePersonalNotes = async () => {
    try {
      setIsSavingNotes(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Tu dois être connecté pour sauvegarder tes notes",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('lesson_notes' as any)
        .upsert({
          user_id: user.id,
          lesson_id: `sciences-sociales-${topicId}`,
          notes: personalNotes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;

      toast({
        title: "✅ Notes sauvegardées !",
        description: "Tes notes personnelles ont été enregistrées",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les notes",
        variant: "destructive"
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const getQuizData = () => {
    const quizMap: Record<string, { quiz: any; matching: any }> = {
      "evolution-societes-humaines": { quiz: evolutionSocietesQuiz, matching: evolutionSocietesMatching },
      "espace-geographique": { quiz: espaceGeographiqueQuiz, matching: espaceGeographiqueMatching },
      "terre-humanisation": { quiz: terreHumanisationQuiz, matching: terreHumanisationMatching },
      "culture-societe": { quiz: cultureSocieteQuiz, matching: cultureSocieteMatching },
      "formes-organisation-sociale": { quiz: formesOrganisationQuiz, matching: formesOrganisationMatching },
      "espace-caribeen": { quiz: espaceCaraibeenQuiz, matching: espaceCaraibeenMatching },
      "relief-haitien": { quiz: reliefHaitienQuiz, matching: reliefHaitienMatching },
      "systeme-solaire-terre": { quiz: systemeSolaireQuiz, matching: systemeSolaireMatching },
      "civilisations-anciennes": { quiz: civilisationsAnciennesQuiz, matching: civilisationsAnciennesMatching },
      "famille-organisation": { quiz: familleOrganisationQuiz, matching: familleOrganisationMatching },
      "fosses-marines": { quiz: fossesMarinesQuiz, matching: fossesMarinesMatching },
      "climat-haiti": { quiz: climatHaitiQuiz, matching: climatHaitiMatching },
      "societes-antillaises": { quiz: societesAntillaisesQuiz, matching: societesAntillaisesMatching },
      "forme-constitution-terre": { quiz: formeConstitutionTerreQuiz, matching: formeConstitutionTerreMatching },
      "premiers-habitants-antilles": { quiz: premiersHabitantsQuiz, matching: premiersHabitantsMatching },
      "mouvements-terre": { quiz: mouvementsTerreQuiz, matching: mouvementsTerreMatching },
      "humanite-caraibe": { quiz: humaniteCaraibeQuiz, matching: humaniteCaraibeMatching },
      "particularites-climatiques": { quiz: particularitesClimatiquesQuiz, matching: particularitesClimatiquesMatching },
      "vie-economique": { quiz: vieEconomiqueQuiz, matching: vieEconomiqueMatching },
      "representation-terre": { quiz: representationTerreQuiz, matching: representationTerreMatching },
      "regions-climatiques": { quiz: regionsClimatiquesQuiz, matching: regionsClimatiquesMatching },
      "modes-figuration-relief": { quiz: modesFigurationQuiz, matching: modesFigurationMatching },
      "potentiel-hydraulique": { quiz: potentielHydrauliqueQuiz, matching: potentielHydrauliqueMatching },
      "societe-precolombienne": { quiz: societePrecolombienneQuiz, matching: societePrecolombienneMatching },
      "formations-vegetales-caraibe": { quiz: formationsVegetalesCaraibeQuiz, matching: formationsVegetalesCaraibeMatching },
      "systeme-ecologique": { quiz: systemeEcologiqueQuiz, matching: systemeEcologiqueMatching },
      "hydrosphere": { quiz: hydrosphereQuiz, matching: hydrosphereMatching },
      "formations-vegetales-haiti": { quiz: formationsVegetalesHaitiQuiz, matching: formationsVegetalesHaitiMatching },
      "analyse-climatologique": { quiz: analyseClimatologiqueQuiz, matching: analyseClimatologiqueMatching },
      "langues-africaines-haiti": { quiz: languesAfricainesQuiz, matching: languesAfricainesMatching }
    };
    return topicId ? quizMap[topicId] || null : null;
  };

  const quizData = getQuizData();

  const handleQuizComplete = (goldEarned: number) => {
    setEarnedPoints(prev => prev + goldEarned);
    setLessonCompleted(true);

    toast({
      title: "🎉 Bravo !",
      description: `Tu as gagné ${goldEarned} points !`,
    });
  };

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-orange-600 to-orange-700 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate("/sciences-sociales-course")}
                className="gap-2 text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="font-semibold">Retour au cours</span>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {lesson && (
                <DownloadLessonButton
                  lessonData={{
                    title: lesson.title,
                    objectif: lesson.objectif,
                    introduction: lesson.introduction,
                    contenu: lesson.contenu,
                    exemples_exercices: lessonExercises,
                    youtube_url: lessonYoutubeUrl,
                  }}
                  personalNotes={personalNotes}
                  subjectName="Sciences Sociales 7AF"
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                />
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        {/* Lesson Header */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-orange-500/10 to-orange-600/10">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center flex-shrink-0">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="secondary">Sciences Sociales</Badge>
                <Badge variant="outline">Niveau AF7</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 hyphens-auto [overflow-wrap:break-word]">{lesson.title}</h1>
              <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  45 min
                </span>
                <span className="flex items-center gap-1">
                  📅 {lessonMonth || 'Année scolaire'}
                </span>
                {lessonCompleted && (
                  <span className="flex items-center gap-1 text-green-600 font-semibold">
                    <Award className="w-4 h-4" />
                    +{earnedPoints} points gagnés
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Lesson Content Tabs */}
        <Card className="p-4 md:p-6 mb-8 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6 h-auto">
              <TabsTrigger value="introduction" className="gap-2 text-xs md:text-sm px-2 py-2">
                <Lightbulb className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Introduction</span>
              </TabsTrigger>
              <TabsTrigger value="contenu" className="gap-2 text-xs md:text-sm px-2 py-2">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Contenu & Exemples</span>
              </TabsTrigger>
              <TabsTrigger value="activites" className="gap-2 text-xs md:text-sm px-2 py-2">
                <Gamepad2 className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Activités</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2 text-xs md:text-sm px-2 py-2">
                <NotebookPen className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Mes Notes</span>
              </TabsTrigger>
              <TabsTrigger value="quiz" className="gap-2 text-xs md:text-sm px-2 py-2">
                <Trophy className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Quiz Final</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="introduction" className="space-y-6">
              <Card className="p-6 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/20 dark:to-transparent">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">Objectif de la leçon</h2>
                    <div 
                      className="text-foreground leading-relaxed prose dark:prose-invert max-w-none lesson-content"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.objectif) }}
                    />
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-background to-orange-50/30 dark:to-orange-950/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Introduction</h2>
                </div>
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none lesson-content [&_p]:text-foreground [&_ul]:text-foreground [&_li]:text-foreground [&_strong]:text-orange-600 dark:[&_strong]:text-orange-400"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.introduction) }}
                />
              </Card>
            </TabsContent>

            <TabsContent value="contenu" className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-background to-orange-50/30 dark:to-orange-950/10">
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none lesson-content
                    [&_p]:text-foreground [&_p]:leading-relaxed [&_p]:mb-4
                    [&_ul]:text-foreground [&_ul]:my-4
                    [&_li]:text-foreground [&_li]:mb-2
                    [&_strong]:text-orange-600 dark:[&_strong]:text-orange-400 [&_strong]:font-semibold
                    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-orange-600 dark:[&_h3]:text-orange-400 [&_h3]:mb-4 [&_h3]:mt-6
                    [&_section]:p-4 [&_section]:rounded-lg [&_section]:bg-card [&_section]:border [&_section]:border-orange-200/50 dark:[&_section]:border-orange-800/30 [&_section]:mb-6"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.contenu) }}
                />
              </Card>
              
              <div className="mt-8">
                <YouTubeVideoSection 
                  lessonTitle={lesson.title}
                  objectives={lesson.objectif || ""}
                  gradeLevel="7AF"
                  customYoutubeUrl={lessonYoutubeUrl}
                  subject="Sciences Sociales"
                />
              </div>

              {/* Additional Resources Card */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20 border-l-4 border-l-blue-500">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">💡 Le savais-tu ?</h3>
                    <p className="text-foreground">
                      L'évolution des sociétés humaines est un processus continu. Les technologies que nous utilisons aujourd'hui (internet, smartphones) transforment nos sociétés aussi profondément que l'invention de l'agriculture il y a 10 000 ans !
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="activites" className="space-y-6">
              {dbLesson?.activites_interactives ? (
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Activités Interactives</h3>
                  <InteractiveActivitiesEnhanced 
                    content={dbLesson.activites_interactives}
                    isLoading={false}
                  />
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
                    <Gamepad2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Activités interactives</h3>
                  <p className="text-muted-foreground mb-4">
                    Les activités interactives pour cette leçon seront bientôt disponibles !
                  </p>
                  <p className="text-sm text-muted-foreground">
                    En attendant, tu peux consulter le Quiz Final pour tester tes connaissances.
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="exemples" className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-background to-orange-50/30 dark:to-orange-950/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Exemples concrets et exercices</h2>
                </div>
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none
                    [&_p]:text-foreground [&_p]:leading-relaxed [&_p]:mb-4
                    [&_ul]:text-foreground [&_ul]:my-4
                    [&_ol]:text-foreground [&_ol]:my-4
                    [&_li]:text-foreground [&_li]:mb-2
                    [&_strong]:text-orange-600 dark:[&_strong]:text-orange-400 [&_strong]:font-semibold
                    [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-orange-600 dark:[&_h3]:text-orange-400 [&_h3]:mb-4 [&_h3]:mt-6
                    [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-orange-600 dark:[&_h4]:text-orange-400 [&_h4]:mb-3 [&_h4]:mt-4"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lessonExercises) }}
                />
              </Card>

              {/* Practice Exercise Card */}
              <Card className="p-6 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20 border-l-4 border-l-green-500">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                    <ClipboardCheck className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-3">📝 Exercice de réflexion</h3>
                    <p className="text-foreground mb-4">
                      Pense à la société haïtienne d'aujourd'hui. Quels changements ont eu lieu au cours des 50 dernières années ? Comment la technologie (téléphones, internet) a-t-elle transformé notre façon de vivre ?
                    </p>
                    <div className="p-4 bg-card rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-muted-foreground italic">
                        💭 Réfléchis à ces questions et note tes idées dans l'onglet "Mes Notes" pour y revenir plus tard.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <NotebookPen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Notes Personnelles</h2>
                  <p className="text-muted-foreground">Prends des notes pour mieux retenir la leçon</p>
                </div>
              </div>
              
              <Card className="p-6">
                <Textarea
                  placeholder="Écris tes notes ici... Ce que tu as appris, les points importants à retenir, tes questions..."
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  className="min-h-[400px] text-base resize-none"
                />
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={savePersonalNotes}
                    disabled={isSavingNotes}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingNotes ? "Sauvegarde..." : "Sauvegarder mes notes"}
                  </Button>
                </div>
              </Card>
              
              <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  Conseils pour prendre des notes efficaces
                </h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Note les définitions importantes et les dates clés</li>
                  <li>• Écris avec tes propres mots pour mieux comprendre</li>
                  <li>• Dessine des cartes ou schémas si ça t'aide à visualiser</li>
                  <li>• Note les questions que tu as pour les réviser plus tard</li>
                  <li>• Relis tes notes régulièrement pour mieux mémoriser</li>
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="quiz" className="space-y-6">
              {dbLesson?.quiz_final ? (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Quiz Final</h2>
                      <p className="text-muted-foreground">Teste tes connaissances sur cette leçon</p>
                    </div>
                  </div>
                  <HTMLQuizParser 
                    htmlContent={dbLesson.quiz_final}
                    lessonSlug={topicId || ''}
                    subject="sciences-sociales"
                  />
                </Card>
              ) : quizData ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Quiz Final</h2>
                      <p className="text-muted-foreground">Teste tes connaissances sur cette leçon</p>
                    </div>
                  </div>

                  <QuizGame
                    topic={lesson.title}
                    questions={quizData.quiz}
                    onComplete={handleQuizComplete}
                  />

                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Jeu d'Association</h3>
                    <MatchingGame
                      pairs={quizData.matching}
                      onComplete={handleQuizComplete}
                    />
                  </div>
                </>
              ) : (
                <Card className="p-8 text-center">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">
                    Quiz bientôt disponible pour cette leçon
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Navigation entre leçons */}
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
            <ChevronLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>

      {/* Eric Chatbot */}
      <EricChatbot />
    </div>
  );
}
