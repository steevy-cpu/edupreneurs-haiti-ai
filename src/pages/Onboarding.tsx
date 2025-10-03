import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, ArrowRight, BookOpen, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const subjects = [
  { id: "math", name: "Mathématiques", icon: "📐" },
  { id: "physics", name: "Physique", icon: "⚛️" },
  { id: "chemistry", name: "Chimie", icon: "🧪" },
  { id: "biology", name: "Biologie", icon: "🧬" },
  { id: "history", name: "Histoire", icon: "📚" },
  { id: "geography", name: "Géographie", icon: "🌍" },
  { id: "french", name: "Français", icon: "🇫🇷" },
  { id: "english", name: "Anglais", icon: "🇬🇧" },
  { id: "spanish", name: "Espagnol", icon: "🇪🇸" },
  { id: "philosophy", name: "Philosophie", icon: "💭" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [learningMode, setLearningMode] = useState("full");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleContinue = () => {
    if (learningMode === "selective" && selectedSubjects.length === 0) {
      toast.error("Veuillez sélectionner au moins une matière");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      toast.success("Configuration terminée! Bienvenue dans EDUPRENEURS 🎉");
      navigate("/dashboard");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-accent font-medium">Étape 2 sur 2</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Optimisons votre <span className="gradient-text">expérience d'apprentissage</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Quelques questions pour personnaliser votre parcours éducatif
          </p>
        </div>

        <Card className="p-8 lg:p-12 bg-card border-border shadow-2xl space-y-10">
          {/* Learning Mode Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Mode d'apprentissage</h3>
                <p className="text-muted-foreground">Comment souhaitez-vous utiliser EDUPRENEURS?</p>
              </div>
            </div>

            <RadioGroup value={learningMode} onValueChange={setLearningMode}>
              <div className="grid gap-4">
                <div>
                  <RadioGroupItem value="full" id="full" className="peer sr-only" />
                  <Label
                    htmlFor="full"
                    className="flex items-start gap-4 p-6 rounded-xl border-2 border-border bg-card hover:bg-card/80 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    <div className="text-3xl">📚</div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">Programme complet</div>
                      <p className="text-sm text-muted-foreground">
                        Suivre tout le programme de mon niveau académique, chapitre par chapitre
                      </p>
                    </div>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value="selective" id="selective" className="peer sr-only" />
                  <Label
                    htmlFor="selective"
                    className="flex items-start gap-4 p-6 rounded-xl border-2 border-border bg-card hover:bg-card/80 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    <div className="text-3xl">🎯</div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">Apprentissage sélectif</div>
                      <p className="text-sm text-muted-foreground">
                        Choisir des matières spécifiques et travailler à mon propre rythme
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Subject Selection */}
          {learningMode === "selective" && (
            <div className="space-y-6 animate-in slide-in-from-top">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Matières sélectionnées</h3>
                  <p className="text-muted-foreground">Choisissez les matières que vous souhaitez étudier</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                  <div key={subject.id}>
                    <Checkbox
                      id={subject.id}
                      checked={selectedSubjects.includes(subject.id)}
                      onCheckedChange={() => handleSubjectToggle(subject.id)}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={subject.id}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-border bg-card hover:bg-card/80 cursor-pointer transition-all peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5"
                    >
                      <span className="text-4xl mb-2">{subject.icon}</span>
                      <span className="text-sm font-medium text-center">{subject.name}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
              onClick={handleContinue}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-lg"
            >
              {loading ? "Configuration..." : (
                <>
                  Commencer à apprendre
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate("/customize-ai")}
              disabled={loading}
              className="sm:w-auto h-12"
            >
              Retour
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
