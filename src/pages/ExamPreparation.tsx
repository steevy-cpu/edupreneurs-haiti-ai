import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { ExamExerciseCard } from "@/components/exam/ExamExerciseCard";
import { ExamTutorChat } from "@/components/exam/ExamTutorChat";
import { ExamProgressBar } from "@/components/exam/ExamProgressBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageCircle, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExamPreparation() {
  const { examSlug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [exam, setExam] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [currentExercise, setCurrentExercise] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string>();
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
      setSelectedAnswer(undefined);

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
      setSelectedAnswer(undefined);

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
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">
            {exam.title} - {exam.year}
          </h1>
          <p className="text-muted-foreground">
            Prépare-toi avec Eric pour l'examen officiel de {exam.grade_level}
          </p>
        </div>

        {/* Progress Bar */}
        <ExamProgressBar
          currentExercise={currentExercise}
          totalExercises={exercises.length}
          completedExercises={completedExercises}
        />

        {/* Mobile Tabs */}
        <div className="block md:hidden">
          <Tabs defaultValue="exercise" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="exercise">
                <BookOpen className="h-4 w-4 mr-2" />
                Exercice
              </TabsTrigger>
              <TabsTrigger value="tutor">
                <MessageCircle className="h-4 w-4 mr-2" />
                Eric
              </TabsTrigger>
            </TabsList>
            <TabsContent value="exercise" className="mt-6">
              <ExamExerciseCard
                exercise={currentExerciseData}
                currentExercise={currentExercise}
                totalExercises={exercises.length}
                completedExercises={completedExercises}
                score={score}
                onPrevious={handlePreviousExercise}
                onNext={handleNextExercise}
                onSelectAnswer={setSelectedAnswer}
                selectedAnswer={selectedAnswer}
                isAnswered={completedExercises.includes(currentExercise)}
              />
            </TabsContent>
            <TabsContent value="tutor" className="mt-6">
              <Card className="h-[600px]">
                <ExamTutorChat
                  sessionId={session.id}
                  exerciseId={currentExerciseData.id}
                  exercise={currentExerciseData}
                  onAnswerValidated={handleAnswerValidated}
                />
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Split View */}
        <div className="hidden md:grid md:grid-cols-2 gap-8">
          <ExamExerciseCard
            exercise={currentExerciseData}
            currentExercise={currentExercise}
            totalExercises={exercises.length}
            completedExercises={completedExercises}
            score={score}
            onPrevious={handlePreviousExercise}
            onNext={handleNextExercise}
            onSelectAnswer={setSelectedAnswer}
            selectedAnswer={selectedAnswer}
            isAnswered={completedExercises.includes(currentExercise)}
          />
          
          <Card className="h-[700px]">
            <ExamTutorChat
              sessionId={session.id}
              exerciseId={currentExerciseData.id}
              exercise={currentExerciseData}
              onAnswerValidated={handleAnswerValidated}
            />
          </Card>
        </div>
      </div>
    </Layout>
  );
}
