import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExamPDFViewer } from "@/components/exam/ExamPDFViewer";
import { ExamTutorChat } from "@/components/exam/ExamTutorChat";
import { ExamProgressBar } from "@/components/exam/ExamProgressBar";
import { ArrowLeft, FileText, MessageCircle } from "lucide-react";

export default function ExamPreparation() {
  const { examSlug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [exam, setExam] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [currentExercise, setCurrentExercise] = useState(1);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExamData();
  }, [examSlug]);

  const loadExamData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        navigate('/auth');
        return;
      }

      // Load exam
      const { data: examData, error: examError } = await supabase
        .from('official_exams')
        .select('*')
        .eq('grade_level', '9AF')
        .single();

      if (examError) throw examError;
      setExam(examData);

      // Load exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exam_exercises')
        .select('*')
        .eq('exam_id', examData.id)
        .order('exercise_number');

      if (exercisesError) throw exercisesError;
      setExercises(exercisesData);

      // Load or create session
      let { data: sessionData, error: sessionError } = await supabase
        .from('exam_practice_sessions')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('exam_id', examData.id)
        .is('completed_at', null)
        .single();

      if (sessionError && sessionError.code !== 'PGRST116') {
        throw sessionError;
      }

      if (!sessionData) {
        const { data: newSession, error: createError } = await supabase
          .from('exam_practice_sessions')
          .insert({
            user_id: user.user.id,
            exam_id: examData.id,
          })
          .select()
          .single();

        if (createError) throw createError;
        sessionData = newSession;
      }

      setSession(sessionData);
      setCurrentExercise(sessionData.current_exercise);
      setScore(sessionData.score);
      const completed = sessionData.completed_exercises as number[];
      setCompletedExercises(Array.isArray(completed) ? completed : []);
    } catch (error) {
      console.error('Error loading exam data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'examen",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextExercise = async () => {
    if (currentExercise < exercises.length) {
      const nextExercise = currentExercise + 1;
      setCurrentExercise(nextExercise);

      await supabase
        .from('exam_practice_sessions')
        .update({ current_exercise: nextExercise })
        .eq('id', session.id);
    }
  };

  const handlePreviousExercise = async () => {
    if (currentExercise > 1) {
      const prevExercise = currentExercise - 1;
      setCurrentExercise(prevExercise);

      await supabase
        .from('exam_practice_sessions')
        .update({ current_exercise: prevExercise })
        .eq('id', session.id);
    }
  };

  const handleAnswerValidated = async (isCorrect: boolean, points: number) => {
    if (isCorrect && !completedExercises.includes(currentExercise)) {
      const newScore = score + points;
      const newCompleted = [...completedExercises, currentExercise];

      setScore(newScore);
      setCompletedExercises(newCompleted);

      await supabase
        .from('exam_practice_sessions')
        .update({
          score: newScore,
          completed_exercises: newCompleted,
        })
        .eq('id', session.id);

      // Award gold to profile
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('gold_earned')
          .eq('user_id', user.user.id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ gold_earned: (profile.gold_earned || 0) + points })
            .eq('user_id', user.user.id);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 space-y-8">
          <Skeleton className="h-20 w-full" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-[600px]" />
            <Skeleton className="h-[600px]" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!exam || exercises.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <p>Examen non trouvé</p>
            <Button onClick={() => navigate('/matieres')} className="mt-4">
              Retour aux matières
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const currentExerciseData = exercises[currentExercise - 1];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/matieres")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux matières
            </Button>

            <div className="space-y-1">
              <h1 className="text-xl font-bold">
                {exam?.title || "Préparation à l'examen"}
              </h1>
              <p className="text-sm text-muted-foreground">
                Consulte l'examen PDF à gauche, Eric te guide exercice par exercice à droite
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {exam && exercises.length > 0 && (
            <ExamProgressBar
              currentExercise={currentExercise}
              totalExercises={exercises.length}
              completedExercises={completedExercises}
            />
          )}

          {/* Main Content */}
          <div className="mt-6">
            {/* Mobile: Tabs Layout */}
            <div className="lg:hidden">
              <Tabs defaultValue="pdf" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pdf">
                    <FileText className="h-4 w-4 mr-2" />
                    Document PDF
                  </TabsTrigger>
                  <TabsTrigger value="tutor">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Tuteur Eric
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pdf" className="mt-6">
                  <div className="h-[600px]">
                    <ExamPDFViewer
                      pdfUrl={exam?.pdf_url || null}
                      examTitle={exam?.title || "Examen"}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="tutor" className="mt-6">
                  <div className="h-[600px]">
                    <ExamTutorChat
                      sessionId={session?.id || ""}
                      exerciseId={currentExerciseData?.id || ""}
                      exercise={currentExerciseData}
                      examInfo={{
                        subject: exam.subject,
                        year: exam.year,
                        title: exam.title,
                      }}
                      totalExercises={exercises.length}
                      currentExerciseIndex={currentExercise - 1}
                      onAnswerValidated={handleAnswerValidated}
                      onPreviousExercise={handlePreviousExercise}
                      onNextExercise={handleNextExercise}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Desktop: Side by Side Layout */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
              {/* Left: PDF Viewer */}
              <div className="h-[700px]">
                <ExamPDFViewer
                  pdfUrl={exam?.pdf_url || null}
                  examTitle={exam?.title || "Examen"}
                />
              </div>

              {/* Right: Eric Tutor Chat */}
              <div className="h-[700px]">
                <ExamTutorChat
                  sessionId={session?.id || ""}
                  exerciseId={currentExerciseData?.id || ""}
                  exercise={currentExerciseData}
                  examInfo={{
                    subject: exam.subject,
                    year: exam.year,
                    title: exam.title,
                  }}
                  totalExercises={exercises.length}
                  currentExerciseIndex={currentExercise - 1}
                  onAnswerValidated={handleAnswerValidated}
                  onPreviousExercise={handlePreviousExercise}
                  onNextExercise={handleNextExercise}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
