import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bot, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import aiAssistant from "@/assets/ai-assistant.png";

const avatarOptions = [
  { id: "default", name: "Assistant Bleu", emoji: "🤖" },
  { id: "friendly", name: "Mentor Amical", emoji: "😊" },
  { id: "professor", name: "Professeur", emoji: "👨‍🏫" },
  { id: "genius", name: "Génie", emoji: "🧠" },
  { id: "robot", name: "Robot Futuriste", emoji: "🦾" },
  { id: "star", name: "Étoile Brillante", emoji: "⭐" },
];

const CustomizeAI = () => {
  const navigate = useNavigate();
  const [aiName, setAiName] = useState("Assistant");
  const [selectedAvatar, setSelectedAvatar] = useState("default");
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (!aiName.trim()) {
      toast.error("Veuillez donner un nom à votre assistant");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      toast.success(`${aiName} est prêt à vous aider! 🎉`);
      navigate("/onboarding");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm text-secondary font-medium">Étape 1 sur 2</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Personnalisez votre <span className="gradient-text">Assistant IA</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Créez votre compagnon d'apprentissage personnel qui vous guidera tout au long de votre parcours
          </p>
        </div>

        <Card className="p-8 lg:p-12 bg-card border-border shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Preview Section */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl" />
                <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                  <img 
                    src={aiAssistant} 
                    alt="AI Assistant" 
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <div className="text-6xl mb-4">
                  {avatarOptions.find(a => a.id === selectedAvatar)?.emoji}
                </div>
                <h3 className="text-2xl font-bold">{aiName || "Assistant"}</h3>
                <p className="text-muted-foreground mt-2">Votre assistant personnel</p>
              </div>
            </div>

            {/* Configuration Section */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Label htmlFor="ai-name" className="text-lg">Nom de votre assistant</Label>
                <div className="relative">
                  <Bot className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="ai-name"
                    type="text"
                    placeholder="Ex: Einstein, Mentor, Guide..."
                    value={aiName}
                    onChange={(e) => setAiName(e.target.value)}
                    maxLength={20}
                    className="pl-12 text-lg h-12 bg-background"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Choisissez un nom qui vous inspire et vous motive
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-lg">Avatar de votre assistant</Label>
                <RadioGroup value={selectedAvatar} onValueChange={setSelectedAvatar}>
                  <div className="grid grid-cols-2 gap-4">
                    {avatarOptions.map((avatar) => (
                      <div key={avatar.id}>
                        <RadioGroupItem
                          value={avatar.id}
                          id={avatar.id}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={avatar.id}
                          className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-border bg-card hover:bg-card/80 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                        >
                          <span className="text-4xl mb-2">{avatar.emoji}</span>
                          <span className="text-sm font-medium text-center">{avatar.name}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <Button 
                onClick={handleContinue}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-lg"
              >
                {loading ? "Configuration..." : (
                  <>
                    Continuer
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Vous pourrez modifier ces paramètres à tout moment dans votre profil
              </p>
            </div>
          </div>
        </Card>

        {/* Skip option */}
        <div className="text-center mt-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/onboarding")}
            className="text-muted-foreground hover:text-foreground"
          >
            Utiliser la configuration par défaut →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomizeAI;
