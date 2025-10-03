import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft,
  Save,
  Trash2,
  Video,
  Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MathLesson = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [lessonContent, setLessonContent] = useState("");
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(true);

  const topicInfo: { [key: string]: { title: string; icon: string; goldReward: number } } = {
    "nombres-entiers": { 
      title: "Les Nombres Entiers", 
      icon: "🔢",
      goldReward: 100
    },
    "equations-second-degre": { 
      title: "Équations du Second Degré", 
      icon: "📈",
      goldReward: 150
    }
  };

  const currentTopic = topicInfo[topicId || ""] || topicInfo["nombres-entiers"];

  const loadLesson = async () => {
    setIsLoadingLesson(true);
    try {
      const { data, error } = await supabase.functions.invoke('math-ai-tutor', {
        body: {
          message: `Explique-moi de manière simple et amusante le chapitre "${currentTopic.title}" pour un élève de Terminale. Utilise des exemples concrets et du créole haïtien quand c'est nécessaire pour mieux faire comprendre.`,
          lessonType: 'lesson',
          chatHistory: []
        }
      });

      if (error) throw error;
      setLessonContent(data.response);
    } catch (error) {
      console.error('Error loading lesson:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la leçon",
        variant: "destructive"
      });
    } finally {
      setIsLoadingLesson(false);
    }
  };

  const saveNotes = () => {
    localStorage.setItem(`notes:math:${topicId}`, notes);
    setNotesSaved(true);
    toast({
      title: "Notes sauvegardées",
      description: "Tes notes ont été enregistrées localement",
    });
  };

  const clearNotes = () => {
    setNotes("");
    localStorage.removeItem(`notes:math:${topicId}`);
    setNotesSaved(true);
    toast({
      title: "Notes effacées",
      description: "Tes notes ont été supprimées",
    });
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setNotesSaved(false);
  };

  if (!lessonContent && !isLoadingLesson) {
    loadLesson();
  }

  return (
    <div className="min-h-screen lesson-bg">
      {/* Gradient Header */}
      <header className="lesson-topbar sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={() => navigate('/math-course')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour — Cours
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-white/30 text-white hover:bg-white/20"
            onClick={() => navigate('/dashboard')}
          >
            Tableau de bord
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <span className="text-3xl">{currentTopic.icon}</span>
              Mathématiques — {currentTopic.title}
            </h1>
            <p className="text-sm text-muted-foreground">AF7 — Aligné MENFP</p>
          </div>
          <Badge className="lesson-pill">Hors-ligne</Badge>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6">
          {/* Main Content */}
          <div className="space-y-4">
            {isLoadingLesson ? (
              <Card className="lesson-card p-8">
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Chargement de la leçon...</p>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                {/* Objectifs */}
                <Card className="lesson-card">
                  <div className="p-6 lesson-markdown">
                    <h2>Objectifs</h2>
                    <p>Comprendre, lire, comparer, ordonner et utiliser les nombres entiers naturels dans des situations variées; maîtriser la valeur de position et les critères de divisibilité principaux afin de renforcer le calcul mental et la justification écrite.</p>
                  </div>
                </Card>

                {/* Introduction */}
                <Card className="lesson-card">
                  <div className="p-6 lesson-markdown">
                    <h2>Introduction</h2>
                    <p>Les <strong>nombres entiers naturels</strong> (0,1,2,3,...) sont la base de presque toute activité mathématique au cycle fondamental. Savoir les manipuler structure le raisonnement : compter, mesurer, coder, ordonner, estimer. Cette leçon consolide la compréhension de la structure décimale (valeur de position), des écritures, des comparaisons et amorce les critères de divisibilité utilisés plus tard pour les fractions et le calcul algébrique élémentaire.</p>
                  </div>
                </Card>

                {/* AI Generated Content */}
                <Card className="lesson-card">
                  <div className="p-6 lesson-markdown">
                    <h2>Contenu de la Leçon</h2>
                    <div className="whitespace-pre-wrap text-base leading-relaxed">
                      {lessonContent}
                    </div>
                  </div>
                </Card>

                {/* Video Placeholder */}
                <Card className="lesson-card">
                  <div className="p-6">
                    <h5 className="lesson-markdown-title mb-3">Vidéo de cours</h5>
                    <div className="video-placeholder">
                      <Video className="w-6 h-6 mr-2" />
                      Vidéo à venir — {currentTopic.title.toLowerCase()}
                    </div>
                  </div>
                </Card>

                {/* Quiz Section */}
                <Card className="lesson-card">
                  <div className="p-6">
                    <h5 className="lesson-markdown-title mb-3">Quiz (bêta)</h5>
                    <p className="text-muted-foreground text-sm mb-4">
                      Génération locale (hors-ligne) à partir du contenu.
                    </p>
                    <Button size="sm" className="gap-2">
                      <Brain className="w-4 h-4" />
                      Générer le quiz
                    </Button>
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* Personal Notes */}
            <Card className="lesson-card">
              <div className="p-6">
                <h5 className="lesson-markdown-title mb-3">Notes personnelles</h5>
                <Textarea
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Idées, stratégies, critères…"
                  className="min-h-[200px] resize-y mb-3"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {notesSaved ? "Sauvegardé" : "Non sauvegardé"}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveNotes}>
                      <Save className="w-4 h-4 mr-1" />
                      Sauvegarder
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearNotes}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tip Card */}
            <Card className="lesson-card bg-success/5 border-success/20">
              <div className="p-4">
                <h6 className="font-semibold mb-2 text-sm">Conseil</h6>
                <p className="text-sm text-muted-foreground">
                  Avant de vérifier 9 ou 3, additionne les chiffres une seule fois.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathLesson;
