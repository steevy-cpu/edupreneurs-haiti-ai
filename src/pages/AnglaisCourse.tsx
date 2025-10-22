import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  Languages,
  BookOpen,
  MessageCircle,
  Headphones,
  Lock,
  CheckCircle2
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import ericTeaching from "@/assets/eric-teaching.png";
import { MusicSelector } from "@/components/MusicSelector";
import { toast } from "sonner";

interface Lesson {
  id: string;
  title: string;
  slug: string;
  objective: string;
  month: string;
}

export default function AnglaisCourse() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        // First, get the Anglais subject for AF7
        const { data: subject, error: subjectError } = await supabase
          .from('subjects')
          .select('id')
          .eq('slug', 'anglais')
          .eq('grade_level', 'AF7')
          .single();

        if (subjectError) throw subjectError;

        if (subject) {
          // Fetch lessons for this subject
          const { data: lessonsData, error: lessonsError } = await supabase
            .from('lessons')
            .select('id, slug, titre, objectif, mois')
            .eq('subject_id', subject.id)
            .order('order_index', { ascending: true });

          if (lessonsError) throw lessonsError;

          // Map DB columns to interface
          const mapped = (lessonsData || []).map(l => ({
            id: l.id,
            slug: l.slug,
            title: l.titre,
            objective: l.objectif,
            month: l.mois
          }));
          setLessons(mapped);
        }
      } catch (error) {
        console.error('Error fetching lessons:', error);
        toast.error('Erreur lors du chargement des leçons');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const totalLessons = lessons.length;
  const completedLessons = 0; // Will be dynamic with user progress
  const progress = (completedLessons / totalLessons) * 100;

  const getMonthColor = (month: string) => {
    const monthMap: Record<string, string> = {
      'Décembre': 'from-blue-500 to-blue-600',
      'Janvier': 'from-cyan-500 to-cyan-600',
      'Février': 'from-purple-500 to-purple-600',
      'Mars': 'from-pink-500 to-pink-600',
      'Avril': 'from-green-500 to-green-600',
      'Mai': 'from-emerald-500 to-emerald-600',
      'Juin': 'from-amber-500 to-amber-600'
    };
    return monthMap[month] || 'from-cyan-500 to-cyan-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/matieres")}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="font-semibold">Retour aux Matières</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 text-primary-foreground pt-20 sm:pt-24 md:pt-32 pb-8 sm:pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Languages className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                  Anglais
                </h1>
              </div>
              <p className="text-base sm:text-lg md:text-xl opacity-90 mb-4 sm:mb-6">
                Vocabulaire, grammaire et conversation en anglais - Programme AF7
              </p>
              <div className="flex gap-2 sm:gap-3 justify-center md:justify-start flex-wrap">
                <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
                  <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  {totalLessons} leçons
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
                  <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Conversation
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
                  <Headphones className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Écoute active
                </Badge>
              </div>
            </div>
            <div className="flex-shrink-0">
              <img 
                src={ericTeaching} 
                alt="Eric - Professeur d'Anglais" 
                className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain drop-shadow-2xl"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
        {/* Music Selector */}
        <div className="mb-6 sm:mb-8">
          <MusicSelector />
        </div>

        {/* Progress Card */}
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between mb-3 sm:mb-4 gap-4">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold mb-1">Votre Progression</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {completedLessons} sur {totalLessons} leçons complétées
              </p>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-primary shrink-0">
              {Math.round(progress)}%
            </div>
          </div>
          <Progress value={progress} className="h-2 sm:h-3" />
        </Card>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {lessons.map((lesson, index) => {
            const isLocked = false; // Will be dynamic with user progress
            const isCompleted = false; // Will be dynamic with user progress
            
            return (
              <Card
                key={lesson.id}
                className={`group hover:shadow-xl transition-all duration-300 ${!isLocked ? 'hover:-translate-y-2 cursor-pointer' : 'opacity-60'}`}
                onClick={() => !isLocked && navigate(`/anglais-lesson/${lesson.slug}`)}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getMonthColor(lesson.month)} flex items-center justify-center`}>
                      {isLocked ? (
                        <Lock className="w-7 h-7 text-white" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-7 h-7 text-white" />
                      ) : (
                        <Languages className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {lesson.month}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {lesson.title}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {lesson.objective}
                  </p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      Leçon {index + 1}
                    </span>
                    {isCompleted && (
                      <span className="text-green-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Terminé
                      </span>
                    )}
                  </div>

                  {!isLocked && (
                    <Button
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/anglais-lesson/${lesson.slug}`);
                      }}
                    >
                      {isCompleted ? "Revoir" : "Commencer"}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Eric Help Section */}
        <Card className="p-4 sm:p-6 md:p-8 bg-gradient-to-r from-primary/10 to-secondary/10 mb-20 sm:mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <img 
                src={ericTeaching} 
                alt="Eric - Assistant IA" 
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">
                Need help with English?
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                Eric est là pour t'aider à améliorer ton anglais, pratiquer la conversation 
                et répondre à toutes tes questions sur la grammaire et le vocabulaire !
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge variant="outline" className="text-xs sm:text-sm">Practice conversation</Badge>
                <Badge variant="outline" className="text-xs sm:text-sm">Grammar help</Badge>
                <Badge variant="outline" className="text-xs sm:text-sm">Support 24/7</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
