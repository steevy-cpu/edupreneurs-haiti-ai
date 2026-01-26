import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExamPDFViewer } from "@/components/exam/ExamPDFViewer";
import { ExamTutorChat } from "@/components/exam/ExamTutorChat";
import { ExamProgressBar } from "@/components/exam/ExamProgressBar";
import { ArrowLeft, FileText, MessageCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ExamPreparation() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [exam, setExam] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [currentExercise, setCurrentExercise] = useState(1);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [referenceTexts, setReferenceTexts] = useState<any[]>([]);

  useEffect(() => {
    loadExamData();
  }, [examId]);

  const loadExamData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        navigate('/auth/login');
        return;
      }

      if (!examId) {
        console.error('No exam ID provided');
        navigate('/examens-officiels');
        return;
      }

      // Load exam by ID
      const { data: examData, error: examError } = await supabase
        .from('official_exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (examError) throw examError;
      setExam(examData);
      
      // Set reference texts from exam data
      const refTexts = examData.reference_texts;
      if (refTexts && Array.isArray(refTexts)) {
        setReferenceTexts(refTexts);
      }

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
    if (currentExercise < exercises.length && session?.id) {
      const nextExercise = currentExercise + 1;
      setCurrentExercise(nextExercise);

      const { error } = await supabase
        .from('exam_practice_sessions')
        .update({ current_exercise: nextExercise })
        .eq('id', session.id);
      
      if (error) console.error('Failed to update session:', error);
    }
  };

  const handlePreviousExercise = async () => {
    if (currentExercise > 1 && session?.id) {
      const prevExercise = currentExercise - 1;
      setCurrentExercise(prevExercise);

      const { error } = await supabase
        .from('exam_practice_sessions')
        .update({ current_exercise: prevExercise })
        .eq('id', session.id);
      
      if (error) console.error('Failed to update session:', error);
    }
  };

  const handleExerciseClick = async (exerciseNumber: number) => {
    if (!session?.id) return;
    setCurrentExercise(exerciseNumber);

    const { error } = await supabase
      .from('exam_practice_sessions')
      .update({ current_exercise: exerciseNumber })
      .eq('id', session.id);
    
    if (error) console.error('Failed to update session:', error);
  };

  const handleAnswerValidated = async (isCorrect: boolean, points: number) => {
    if (!session?.id) return;
    
    if (isCorrect && !completedExercises.includes(currentExercise)) {
      const newScore = score + points;
      const newCompleted = [...completedExercises, currentExercise];

      setScore(newScore);
      setCompletedExercises(newCompleted);

      // Update session with error handling
      const { error: sessionError } = await supabase
        .from('exam_practice_sessions')
        .update({
          score: newScore,
          completed_exercises: newCompleted,
        })
        .eq('id', session.id);

      if (sessionError) {
        console.error('Failed to update session score:', sessionError);
      }

      // Award gold to profile with error handling
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('gold_earned')
            .eq('user_id', user.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Failed to fetch profile:', profileError);
          } else if (profile) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ gold_earned: (profile.gold_earned || 0) + points })
              .eq('user_id', user.user.id);
            
            if (updateError) {
              console.error('Failed to award gold:', updateError);
            }
          }
        }
      } catch (error) {
        console.error('Error in gold award flow:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-20 w-full" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-[600px]" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  if (!exam || exercises.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p>Examen non trouvé</p>
          <Button onClick={() => navigate('/examens-officiels')} className="mt-4">
            Retour aux examens
          </Button>
        </Card>
      </div>
    );
  }

  const currentExerciseData = exercises[currentExercise - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-4">
          {/* Header - Compact for mobile */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/examens-officiels")}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Retour aux examens</span>
                <span className="sm:hidden">Retour</span>
              </Button>
              <ThemeToggle />
            </div>

            <h1 className="text-lg sm:text-xl font-bold line-clamp-1">
              {exam?.title || "Préparation à l'examen"}
            </h1>
          </div>

          {/* Progress Bar */}
          {exam && exercises.length > 0 && (
            <ExamProgressBar
              currentExercise={currentExercise}
              totalExercises={exercises.length}
              completedExercises={completedExercises}
              onExerciseClick={handleExerciseClick}
            />
          )}

          {/* Main Content */}
          <div className="mt-4">
            {/* Mobile: Tabs Layout */}
            <div className="lg:hidden">
              <Tabs defaultValue="tutor" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12">
                  <TabsTrigger value="pdf" className="text-sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Document PDF
                  </TabsTrigger>
                  <TabsTrigger value="tutor" className="text-sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Tuteur Jude
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="pdf" className="mt-4">
                  <div className="h-[calc(100dvh-200px)] min-h-[560px]">
                    <ExamPDFViewer
                      pdfUrl={exam?.pdf_url || null}
                      examTitle={exam?.title || "Examen"}
                    />
                  </div>
                </TabsContent>
 
                <TabsContent value="tutor" className="mt-4">
                  <div className="h-[calc(100dvh-200px)] min-h-[560px]">
                    {session && currentExerciseData ? (
                    <ExamTutorChat
                        sessionId={session.id}
                        exerciseId={currentExerciseData.id}
                        exercise={currentExerciseData}
                        examInfo={{
                          subject: exam.subject,
                          year: exam.year,
                          title: exam.title,
                        }}
                        referenceTexts={referenceTexts}
                        totalExercises={exercises.length}
                        currentExerciseIndex={currentExercise - 1}
                        onAnswerValidated={handleAnswerValidated}
                        onPreviousExercise={handlePreviousExercise}
                        onNextExercise={handleNextExercise}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">Chargement du tuteur...</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Desktop: Side by Side Layout */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
              {/* Left: PDF Viewer */}
              <div className="h-[calc(100vh-140px)] min-h-[550px]">
                <ExamPDFViewer
                  pdfUrl={exam?.pdf_url || null}
                  examTitle={exam?.title || "Examen"}
                />
              </div>

              {/* Right: Jude Tutor Chat */}
              <div className="h-[calc(100vh-140px)] min-h-[550px]">
                {session && currentExerciseData ? (
                  <ExamTutorChat
                    sessionId={session.id}
                    exerciseId={currentExerciseData.id}
                    exercise={currentExerciseData}
                    examInfo={{
                      subject: exam.subject,
                      year: exam.year,
                      title: exam.title,
                    }}
                    referenceTexts={referenceTexts}
                    totalExercises={exercises.length}
                    currentExerciseIndex={currentExercise - 1}
                    onAnswerValidated={handleAnswerValidated}
                    onPreviousExercise={handlePreviousExercise}
                    onNextExercise={handleNextExercise}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Chargement du tuteur...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
