import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  ArrowLeft, 
  Trophy, 
  Gamepad2, 
  Star,
  CheckCircle,
  BookA,
  Feather
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { francaisLessons7AF } from "@/data/francaisLessons";
import { supabase } from "@/integrations/supabase/client";
import ericTeaching from "@/assets/eric-teaching.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MusicSelector } from "@/components/MusicSelector";

const FrancaisCourse = () => {
  const navigate = useNavigate();
  const [userGold, setUserGold] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch user gold
        const { data: profile } = await supabase
          .from('profiles')
          .select('gold_earned')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setUserGold(profile.gold_earned || 0);
        }

        // Fetch completed lessons
        const { data: completions } = await supabase
          .from('lesson_completions')
          .select('lesson_slug')
          .eq('user_id', user.id)
          .eq('subject', 'francais');

        if (completions) {
          setCompletedLessons(new Set(completions.map(c => c.lesson_slug)));
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/matieres')}
                className="shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                  <Feather className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl font-bold truncate">Français 📚</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">Niveau AF7</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-accent/10 border border-accent/20">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                <span className="font-bold gold-text text-sm sm:text-base">{userGold}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl">
        {/* Course Overview */}
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-3xl p-6 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <BookA className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Programme MENFP - AF7
              </h2>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground mb-2">
              Maîtrise la langue française avec des leçons interactives et captivantes! ✨
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {francaisLessons7AF.length} leçons couvrant grammaire, conjugaison, orthographe et expression 📝
            </p>
          </div>
          <div className="flex-shrink-0">
            <img 
              src={ericTeaching} 
              alt="Eric - Professeur de Français" 
              className="w-40 h-40 sm:w-48 sm:h-48 object-contain animate-[float_4s_ease-in-out_infinite]"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        {/* Music Selector */}
        <div className="mb-6 sm:mb-8">
          <MusicSelector />
        </div>

        {/* Lessons Grid */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {francaisLessons7AF.map((lesson, index) => {
            const isCompleted = completedLessons.has(lesson.id);
            const goldReward = 100 + (index * 10); // Progressive rewards
            
            return (
              <Card 
                key={lesson.id}
                className={`p-4 sm:p-6 transition-all hover:shadow-xl cursor-pointer hover:-translate-y-1 bg-gradient-to-br from-card to-purple-50/20 dark:to-purple-950/10 border-2 ${
                  isCompleted 
                    ? 'border-success/40 bg-success/5 shadow-success/20' 
                    : 'border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600'
                }`}
                onClick={() => navigate(`/francais-lesson/${lesson.id}`)}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                      {index + 1}
                    </div>
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg sm:text-xl font-bold">{lesson.title}</h3>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">
                      📅 {lesson.mois}
                    </p>
                    
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-2">
                      {lesson.objectif}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary" className="gap-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                        <BookOpen className="w-3 h-3" />
                        Leçon
                      </Badge>
                      <Badge variant="secondary" className="gap-1 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300">
                        <Gamepad2 className="w-3 h-3" />
                        Activités
                      </Badge>
                      <Badge variant="secondary" className="gap-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                        <Star className="w-3 h-3" />
                        Quiz
                      </Badge>
                    </div>

                    {/* Gold Reward */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-accent" />
                        <span className="text-sm font-bold gold-text">
                          {isCompleted ? '✓ Complété' : `+${goldReward} gold`}
                        </span>
                      </div>
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        {isCompleted ? 'Revoir' : 'Commencer'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Progress Summary */}
        <Card className="mt-8 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                Ton Progrès en Français
              </h3>
              <p className="text-muted-foreground">Continue à apprendre pour maîtriser la langue française!</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                {Math.round((completedLessons.size / francaisLessons7AF.length) * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">
                {completedLessons.size}/{francaisLessons7AF.length} leçons complétées
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress 
              value={(completedLessons.size / francaisLessons7AF.length) * 100} 
              className="h-3"
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FrancaisCourse;
