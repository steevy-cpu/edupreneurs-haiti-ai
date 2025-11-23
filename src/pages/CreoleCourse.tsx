import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Users, 
  ArrowLeft, 
  CheckCircle2,
  Coins,
  MessageCircle,
  PenTool,
  FileText
} from "lucide-react";
import { creoleLessons7AF } from "@/data/creoleLessons";
import ericEdupreneurs from "@/assets/eric-edupreneurs.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MusicSelector } from "@/components/MusicSelector";
import { supabase } from "@/integrations/supabase/client";

const categoryIcons = {
  "Lekti": BookOpen,
  "Kominikasyon Oral": MessageCircle,
  "Gramè": FileText,
  "Vokabilè": Users,
  "Òtograf": PenTool,
  "Pwodiksyon Ekri": FileText
};

export default function CreoleCourse() {
  const navigate = useNavigate();
  const [userGold, setUserGold] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  
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
          .eq('subject', 'creole');

        if (completions) {
          setCompletedLessons(completions.map(c => c.lesson_slug));
        }
      }
    };

    fetchUserData();
  }, []);

  const completedCount = completedLessons.length;
  const totalLessons = creoleLessons7AF.length;
  const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-to-r from-emerald-600 to-teal-700 text-primary-foreground shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/matieres')}
                className="shrink-0 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Kreyòl Ayisyen</h1>
                  <p className="text-sm text-primary-foreground/80">7ème Année Fondamentale</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20">
                <Coins className="w-5 h-5 text-primary-foreground" />
                <span className="font-bold text-primary-foreground">{userGold}</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Course Overview */}
        <Card className="mb-8 overflow-hidden border border-border bg-card">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-emerald-600 to-teal-700 p-8 flex items-center justify-center">
              <img src={ericEdupreneurs} alt="Eric enseignant" className="w-full h-auto object-contain rounded-lg" />
            </div>
            <CardContent className="md:w-2/3 p-6">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Aperçu du Cours</h2>
              <p className="text-muted-foreground mb-4">
                Byenveni nan kou Kreyòl Ayisyen pou 7èm ane fondamantal ! 
                Devlope konpetans ou nan lang manman nou an ak aprann gramè, vokabilè, 
                kominikasyon oral ak pwodiksyon ekri an kreyòl.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">{totalLessons} leson konplè</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Aktivite entèaktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">{completedCount} leson konplete</span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        <MusicSelector />

        {/* Lessons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {creoleLessons7AF.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id.toString());
            const Icon = categoryIcons[lesson.category];
            const goldReward = 100 + (index * 10);

            return (
              <Card
                key={lesson.id}
                className={`transition-all duration-300 hover:shadow-xl border border-border bg-card cursor-pointer ${
                  isCompleted ? 'border-2 border-green-500' : 'hover:scale-105'
                }`}
                onClick={() => navigate(`/creole-lesson/${lesson.id}`)}
              >
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-primary-foreground">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-foreground">{lesson.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{lesson.category}</p>
                      </div>
                    </div>
                    {isCompleted && (
                      <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {lesson.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {lesson.difficulty}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {lesson.duration}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-1 text-accent">
                        <Coins className="w-4 h-4" />
                        <span className="font-bold">{goldReward}</span>
                      </div>
                      <Button>
                        {isCompleted ? 'Revize' : 'Kòmanse'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Progress Summary */}
        <Card className="bg-gradient-to-r from-emerald-600 to-teal-700 text-primary-foreground border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Pwogrè Ou</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Leson konplete</span>
                  <span className="font-bold">{completedCount}/{totalLessons}</span>
                </div>
                <Progress value={progressPercentage} className="h-3 bg-primary-foreground/30" />
              </div>
              <p className="text-sm opacity-90">
                Kontinye konsa ! Chak leson konplete ap ede w mètrize kreyòl ayisyen.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
