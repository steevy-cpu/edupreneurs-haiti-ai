import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Music, Palette, Brain, BookOpen, Award, Heart, Users, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PassionDiscovery = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [userInput, setUserInput] = useState("");

  const passionCategories = [
    {
      id: "music",
      title: "Musique",
      icon: Music,
      description: "Découvre le rythme, les instruments et la création musicale",
      color: "from-purple-500 to-pink-500",
      modules: ["Bases du rythme", "Instruments", "Production sonore", "Culture musicale"]
    },
    {
      id: "arts",
      title: "Arts Plastiques",
      icon: Palette,
      description: "Dessin, design et création numérique",
      color: "from-blue-500 to-cyan-500",
      modules: ["Dessin de base", "Design graphique", "Création numérique", "Art digital"]
    },
    {
      id: "chess",
      title: "Échecs & Logique",
      icon: Brain,
      description: "Développe ta logique et ta concentration",
      color: "from-orange-500 to-red-500",
      modules: ["Bases des échecs", "Stratégies", "Résolution de problèmes", "Jeux d'esprit"]
    },
    {
      id: "literature",
      title: "Littérature & Poésie",
      icon: BookOpen,
      description: "Stimule ta créativité et ta sensibilité artistique",
      color: "from-green-500 to-teal-500",
      modules: ["Écriture créative", "Poésie", "Lecture analytique", "Expression artistique"]
    }
  ];

  const civicModules = [
    {
      id: "rights",
      title: "Droits Fondamentaux",
      icon: Award,
      description: "Comprends tes droits et devoirs",
      color: "from-indigo-500 to-purple-500"
    },
    {
      id: "citizenship",
      title: "Citoyenneté Active",
      icon: Users,
      description: "Deviens un citoyen conscient et engagé",
      color: "from-blue-500 to-indigo-500"
    },
    {
      id: "peace",
      title: "Culture de la Paix",
      icon: Heart,
      description: "Tolérance, solidarité et justice sociale",
      color: "from-pink-500 to-rose-500"
    }
  ];

  const developmentModules = [
    {
      id: "personal",
      title: "Croissance Personnelle",
      icon: Lightbulb,
      description: "Gestion du temps, confiance en soi, intelligence émotionnelle",
      color: "from-yellow-500 to-orange-500"
    },
    {
      id: "leadership",
      title: "Leadership",
      icon: Users,
      description: "Développe ton leadership et ton impact social",
      color: "from-green-500 to-emerald-500"
    }
  ];

  const startInteractiveModule = async (categoryId: string, categoryTitle: string) => {
    setSelectedCategory(categoryId);
    setIsLoading(true);
    
    const systemMessage = {
      role: "assistant",
      content: `Bonjour! Je suis Eric, ton guide pour découvrir ${categoryTitle}. Je vais t'aider à explorer ce domaine passionnant de manière interactive. Dis-moi, qu'est-ce qui t'intéresse le plus dans ${categoryTitle}?`
    };
    
    setChatMessages([systemMessage]);
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !selectedCategory) return;

    const userMessage = { role: "user", content: userInput };
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('passion-ai-tutor', {
        body: {
          message: userInput,
          category: selectedCategory,
          chatHistory: chatMessages
        }
      });

      if (error) throw error;

      const assistantMessage = { role: "assistant", content: data.response };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur s'est produite. Réessaye plus tard.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            ← Retour à l'accueil
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Découverte & Épanouissement
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore tes passions, développe ta citoyenneté et deviens la meilleure version de toi-même
          </p>
        </div>

        <Tabs defaultValue="passion" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="passion">Découvre ta passion</TabsTrigger>
            <TabsTrigger value="civic">Éducation Civique</TabsTrigger>
            <TabsTrigger value="development">Développement Personnel</TabsTrigger>
          </TabsList>

          {/* Passion Discovery Tab */}
          <TabsContent value="passion" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {passionCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card key={category.id} className="hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    <div className={`h-2 bg-gradient-to-r ${category.color}`} />
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color} text-white`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {category.title}
                            <Badge variant="secondary" className="ml-auto">Nouveau</Badge>
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {category.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progression</span>
                            <span className="font-medium">0%</span>
                          </div>
                          <Progress value={0} className="h-2" />
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {category.modules.map((module, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {module}
                            </Badge>
                          ))}
                        </div>

                        <Button 
                          className={`w-full bg-gradient-to-r ${category.color} hover:opacity-90 text-white`}
                          onClick={() => startInteractiveModule(category.id, category.title)}
                        >
                          Commencer l'exploration
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Civic Education Tab */}
          <TabsContent value="civic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {civicModules.map((module) => {
                const Icon = module.icon;
                return (
                  <Card key={module.id} className="hover:shadow-lg transition-all duration-300">
                    <div className={`h-2 bg-gradient-to-r ${module.color}`} />
                    <CardHeader>
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className={`p-4 rounded-full bg-gradient-to-br ${module.color} text-white`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <CardTitle>{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full"
                        onClick={() => startInteractiveModule(module.id, module.title)}
                      >
                        Explorer
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Personal Development Tab */}
          <TabsContent value="development" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {developmentModules.map((module) => {
                const Icon = module.icon;
                return (
                  <Card key={module.id} className="hover:shadow-lg transition-all duration-300">
                    <div className={`h-2 bg-gradient-to-r ${module.color}`} />
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${module.color} text-white`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle>{module.title}</CardTitle>
                          <CardDescription className="mt-2">{module.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full"
                        onClick={() => startInteractiveModule(module.id, module.title)}
                      >
                        Commencer
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Interactive Chat Modal */}
        {selectedCategory && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Session Interactive avec Eric</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedCategory(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg">
                        Eric est en train d'écrire...
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Écris ton message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                  />
                  <Button onClick={sendMessage} disabled={isLoading || !userInput.trim()}>
                    Envoyer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassionDiscovery;
