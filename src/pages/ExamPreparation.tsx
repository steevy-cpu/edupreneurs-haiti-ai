import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExamPDFViewer } from "@/components/exam/ExamPDFViewer";
import { ExamTutorPanel } from "@/features/exams/practice";
import type { ExerciseForRunner, SessionForRunner, ReferenceText } from "@/features/exams/practice";
import { ExamProgressBar } from "@/components/exam/ExamProgressBar";
import { ArrowLeft, FileText, MessageCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { GoldBadge } from "@/components/shared/GoldBadge";
import { useUserProfile, useInvalidateUserProfile } from "@/hooks/useUserProfile";
import judeProfile from "@/assets/jude-profile.jpeg";

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
  const [referenceTexts, setReferenceTexts] = useState<ReferenceText[]>([]);
  // Tracks exercises completed across ALL sessions — prevents cross-session gold farming
  const [globallyCompletedExercises, setGloballyCompletedExercises] = useState<number[]>([]);

  // Gold display — uses cached profile, no extra query
  const { profile } = useUserProfile();
  const invalidateUserProfile = useInvalidateUserProfile();
  const [localGold, setLocalGold] = useState(0);
  const [isGoldAnimated, setIsGoldAnimated] = useState(false);

  // Sync gold from profile on load
  useEffect(() => {
    setLocalGold(profile.goldEarned);
  }, [profile.goldEarned]);

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
        navigate('/exams/9AF');
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
        // Cast through unknown for JSON data from Supabase
        setReferenceTexts(refTexts as unknown as ReferenceText[]);
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

      // Query permanent completion records to prevent cross-session gold re-earning
      const { data: globalCompletions } = await supabase
        .from('exam_exercise_completions')
        .select('exercise_number')
        .eq('user_id', user.user.id)
        .eq('exam_id', examData.id);

      if (globalCompletions) {
        setGloballyCompletedExercises(globalCompletions.map(c => c.exercise_number));
      }
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
    
    // Guard: skip gold if already completed in this session OR any prior session
    if (isCorrect && !completedExercises.includes(currentExercise) && !globallyCompletedExercises.includes(currentExercise)) {
      const newScore = score + points;
      const newCompleted = [...completedExercises, currentExercise];

      setScore(newScore);
      setCompletedExercises(newCompleted);

      // Update session with error handling
      const { data: userData } = await supabase.auth.getUser();
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

      // Record permanent completion to prevent cross-session re-earning
      if (userData.user) {
        await supabase
          .from('exam_exercise_completions')
          .upsert({
            user_id: userData.user.id,
            exam_id: exam.id,
            exercise_number: currentExercise,
          }, { onConflict: 'user_id,exam_id,exercise_number', ignoreDuplicates: true });

        // Update local state so re-earning is blocked immediately
        setGloballyCompletedExercises(prev => [...prev, currentExercise]);
      }

      // Award gold to profile atomically via server-side RPC
      try {
        if (userData.user) {
          const { error: goldError } = await supabase.rpc('increment_gold', {
            p_user_id: userData.user.id,
            amount: Math.min(points, 100),
          });
          if (goldError) console.error('Failed to award gold:', goldError);
          else {
            // Update gold display immediately + refresh profile cache
            setLocalGold(prev => prev + Math.min(points, 100));
            setIsGoldAnimated(true);
            setTimeout(() => setIsGoldAnimated(false), 1500);
            invalidateUserProfile();
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
          <Button onClick={() => navigate('/exams/9AF')} className="mt-4">
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
                onClick={() => navigate("/exams/9AF")}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Retour aux examens</span>
                <span className="sm:hidden">Retour</span>
              </Button>
              <ThemeToggle />
            </div>

            {/* Jude Welcome Banner */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 border-2 border-primary/30 ring-2 ring-primary/10">
                <AvatarImage src={judeProfile} alt="Jude" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">J</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm sm:text-base font-semibold text-foreground">
                    Salut! Je suis Jude, ton tuteur pour cet examen 👋
                  </p>
                  {/* Gold balance — updates reactively after correct answers */}
                  <GoldBadge goldAmount={localGold} animated={isGoldAnimated} />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
                  Voici <strong>quelques questions</strong> de <span className="font-medium">{exam?.title || "cet examen"}</span> — pas toutes! Si tu bloques, demande-moi de l'aide.
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar - desktop only */}
          <div className="hidden lg:block">
            {exam && exercises.length > 0 && (
              <ExamProgressBar
                currentExercise={currentExercise}
                totalExercises={exercises.length}
                completedExercises={completedExercises}
                onExerciseClick={handleExerciseClick}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="mt-4">
            {/* Mobile: Tabs Layout */}
            <div className="lg:hidden">
              <Tabs defaultValue="tutor" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-12">
                  <TabsTrigger value="pdf" className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <FileText className="h-4 w-4 mr-2" />
                    Examen PDF
                  </TabsTrigger>
                  <TabsTrigger value="tutor" className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Pratique avec Jude
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
                      <ExamTutorPanel
                        exercise={currentExerciseData as ExerciseForRunner}
                        session={{
                          id: session.id,
                          exam_id: exam.id,
                          current_exercise: currentExercise,
                          score,
                          totalExercises: exercises.length,
                          completedExercises,
                        } as SessionForRunner}
                        referenceTexts={referenceTexts}
                        onNext={handleNextExercise}
                        onPrevious={handlePreviousExercise}
                        onAnswerValidated={handleAnswerValidated}
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

              {/* Right: Question Runner */}
              <div className="h-[calc(100vh-140px)] min-h-[550px]">
                {session && currentExerciseData ? (
                  <ExamTutorPanel
                    exercise={currentExerciseData as ExerciseForRunner}
                    session={{
                      id: session.id,
                      exam_id: exam.id,
                      current_exercise: currentExercise,
                      score,
                      totalExercises: exercises.length,
                      completedExercises,
                    } as SessionForRunner}
                    referenceTexts={referenceTexts}
                    onNext={handleNextExercise}
                    onPrevious={handlePreviousExercise}
                    onAnswerValidated={handleAnswerValidated}
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
