import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Palette, Brain, BookOpen, Play, CheckCircle2, Lock, Loader2, ArrowLeft, Send, Youtube } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ericTeaching from "@/assets/eric-teaching.png";

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  locked: boolean;
}

interface Category {
  id: string;
  title: string;
  icon: any;
  description: string;
  fullDescription: string;
  color: string;
  modules: Module[];
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

const PassionDiscoveryTest = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [userInput, setUserInput] = useState("");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);

  const categories: Category[] = [
    {
      id: "music",
      title: "La Musique 🎵",
      icon: Music,
      description: "Découvre le rythme, les instruments et la création musicale",
      fullDescription: "Les jeunes pourront s'initier aux bases du rythme, à la découverte des instruments, à la création musicale numérique et à la culture sonore. Cette rubrique vise à valoriser la musique non seulement comme art, mais aussi comme outil de discipline, de créativité et d'expression culturelle.",
      color: "from-purple-500 to-pink-500",
      modules: [
        { id: "rhythm", title: "Bases du Rythme", description: "Apprends à compter les temps et sentir le rythme", duration: "15 min", completed: false, locked: false },
        { id: "instruments", title: "Découverte des Instruments", description: "Explore les instruments traditionnels et modernes", duration: "20 min", completed: false, locked: false },
        { id: "production", title: "Production Sonore", description: "Crée ta propre musique avec des outils numériques", duration: "25 min", completed: false, locked: false },
        { id: "culture", title: "Culture Musicale", description: "Découvre la richesse de la musique haïtienne et mondiale", duration: "20 min", completed: false, locked: false }
      ]
    },
    {
      id: "arts",
      title: "Les Arts Plastiques 🎨",
      icon: Palette,
      description: "Dessin, design et création numérique",
      fullDescription: "Edupreneur offrira des contenus autour du dessin, du design graphique, et de la création numérique. Ces ateliers encourageront les participants à libérer leur imagination, à développer leur sens esthétique et à comprendre le potentiel artistique des nouvelles technologies.",
      color: "from-blue-500 to-cyan-500",
      modules: [
        { id: "drawing", title: "Dessin de Base", description: "Maîtrise les techniques fondamentales du dessin", duration: "20 min", completed: false, locked: false },
        { id: "design", title: "Design Graphique", description: "Crée des visuels impactants", duration: "25 min", completed: false, locked: false },
        { id: "digital", title: "Création Numérique", description: "Utilise les outils digitaux pour créer", duration: "30 min", completed: false, locked: false },
        { id: "illustration", title: "Art Digital", description: "Deviens un artiste numérique", duration: "25 min", completed: false, locked: false }
      ]
    },
    {
      id: "chess",
      title: "Les Échecs & Jeux d'Esprit ♟️",
      icon: Brain,
      description: "Développe ta logique et ta concentration",
      fullDescription: "Parce que l'intelligence se cultive aussi par le jeu, une série d'activités sera consacrée aux échecs et autres jeux stratégiques. Ces outils stimuleront la logique, la patience, la concentration et la prise de décision réfléchie, des compétences essentielles à la réussite personnelle et académique.",
      color: "from-orange-500 to-red-500",
      modules: [
        { id: "basics", title: "Bases des Échecs", description: "Apprends les règles et mouvements", duration: "15 min", completed: false, locked: false },
        { id: "strategy", title: "Stratégies", description: "Développe ton jeu tactique", duration: "20 min", completed: false, locked: false },
        { id: "problems", title: "Résolution de Problèmes", description: "Entraîne ton esprit logique", duration: "20 min", completed: false, locked: false },
        { id: "mindgames", title: "Jeux d'Esprit", description: "Stimule ta concentration", duration: "15 min", completed: false, locked: false }
      ]
    },
    {
      id: "literature",
      title: "La Littérature & Poésie 📖",
      icon: BookOpen,
      description: "Stimule ta créativité et ta sensibilité artistique",
      fullDescription: "La section offrira un espace de rencontre avec les mots. Les jeunes y apprendront à écrire, lire, réciter et ressentir à travers la littérature et la poésie. Cette dimension permettra de renforcer la maîtrise de la langue, l'expression des émotions et la création artistique, tout en valorisant la culture et la richesse linguistique haïtienne.",
      color: "from-green-500 to-teal-500",
      modules: [
        { id: "writing", title: "Écriture Créative", description: "Libère ton imagination par l'écriture", duration: "20 min", completed: false, locked: false },
        { id: "poetry", title: "Poésie", description: "Exprime tes émotions en vers", duration: "20 min", completed: false, locked: false },
        { id: "reading", title: "Lecture Analytique", description: "Comprends et analyse les textes", duration: "25 min", completed: false, locked: false },
        { id: "expression", title: "Expression Artistique", description: "Valorise la culture haïtienne par les mots", duration: "20 min", completed: false, locked: false }
      ]
    }
  ];

  const currentCategory = categories.find(cat => cat.id === selectedCategory);
  const currentModule = currentCategory?.modules.find(mod => mod.id === selectedModule);

  const searchYouTubeVideos = async (query: string) => {
    setLoadingVideos(true);
    try {
      const YOUTUBE_API_KEY = "AIzaSyBhAZ7KqOlGiVfNX0F4bD5CQJqVT5K1234"; // You'll need to get a real API key
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=4&key=${YOUTUBE_API_KEY}&relevanceLanguage=fr`
      );
      
      if (!response.ok) {
        console.log("Using mock videos instead of API");
        // Mock videos for testing
        setVideos([
          {
            id: "mock1",
            title: `Tutoriel: ${query}`,
            thumbnail: "https://via.placeholder.com/320x180/9333ea/ffffff?text=Video+1",
            channelTitle: "Edupreneurs Learning"
          },
          {
            id: "mock2",
            title: `Guide pratique: ${query}`,
            thumbnail: "https://via.placeholder.com/320x180/3b82f6/ffffff?text=Video+2",
            channelTitle: "Culture & Passion"
          }
        ]);
        return;
      }

      const data = await response.json();
      const videoResults = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle
      }));
      
      setVideos(videoResults);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Erreur lors du chargement des vidéos");
    } finally {
      setLoadingVideos(false);
    }
  };

  const startModule = async (categoryId: string, moduleId: string) => {
    setSelectedCategory(categoryId);
    setSelectedModule(moduleId);
    setIsLoading(true);

    const category = categories.find(c => c.id === categoryId);
    const module = category?.modules.find(m => m.id === moduleId);
    
    if (!category || !module) return;

    // Search for relevant YouTube videos
    const searchQuery = `${category.title} ${module.title} tutoriel français`;
    await searchYouTubeVideos(searchQuery);

    // Initialize chat with Eric
    const welcomeMessage = {
      role: "assistant",
      content: `Bonjour! Je suis Eric, ton guide pour découvrir "${module.title}". 🎓

${module.description}

Je vais t'accompagner dans ce module d'environ ${module.duration}. Nous allons apprendre ensemble de manière interactive!

Pour commencer, dis-moi: Qu'est-ce qui t'intéresse le plus dans ${category.title}? As-tu déjà une expérience avec ce sujet?`
    };
    
    setChatMessages([welcomeMessage]);
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

  const closeModule = () => {
    setSelectedModule(null);
    setSelectedCategory(null);
    setChatMessages([]);
    setVideos([]);
  };

  // Category selection view
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-pink-50/30 dark:from-background dark:via-purple-950/10 dark:to-pink-950/10">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-6 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Retour au tableau de bord
          </Button>

          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block mb-4">
              <img src={ericTeaching} alt="Eric" className="w-32 h-32 mx-auto animate-scale-in" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              Découvre ta Passion
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore les domaines qui t'inspirent et développe tes talents avec Eric, ton guide personnel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const completedModules = category.modules.filter(m => m.completed).length;
              const progress = (completedModules / category.modules.length) * 100;

              return (
                <Card 
                  key={category.id} 
                  className="hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer transform hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className={`h-2 bg-gradient-to-r ${category.color} group-hover:h-3 transition-all duration-300`} />
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl mb-2">{category.title}</CardTitle>
                        <CardDescription className="text-base">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {category.fullDescription}
                    </p>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Progression</span>
                        <span className="text-muted-foreground">{completedModules}/{category.modules.length} modules</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {category.modules.map((module) => (
                        <Badge 
                          key={module.id} 
                          variant={module.completed ? "default" : "outline"}
                          className="text-xs"
                        >
                          {module.completed && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {module.title}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      className={`w-full bg-gradient-to-r ${category.color} hover:opacity-90 text-white font-semibold py-6 text-lg group-hover:scale-105 transition-transform`}
                    >
                      Commencer l'exploration
                      <Play className="ml-2 h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Module selection view
  if (selectedCategory && !selectedModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-pink-50/30 dark:from-background dark:via-purple-950/10 dark:to-pink-950/10">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => setSelectedCategory(null)}
            className="mb-6 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Retour aux catégories
          </Button>

          {currentCategory && (
            <>
              <div className="text-center mb-12">
                <div className={`inline-flex p-6 rounded-2xl bg-gradient-to-br ${currentCategory.color} text-white shadow-2xl mb-6`}>
                  <currentCategory.icon className="w-16 h-16" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{currentCategory.title}</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {currentCategory.fullDescription}
                </p>
              </div>

              <div className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-2xl font-bold mb-6">Modules disponibles</h2>
                {currentCategory.modules.map((module, index) => (
                  <Card 
                    key={module.id}
                    className={`hover:shadow-xl transition-all duration-300 ${
                      module.locked ? 'opacity-60' : 'cursor-pointer hover:-translate-y-1'
                    }`}
                    onClick={() => !module.locked && startModule(currentCategory.id, module.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${currentCategory.color} text-white flex items-center justify-center font-bold text-xl`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                              {module.title}
                              {module.completed && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                              {module.locked && <Lock className="w-5 h-5 text-muted-foreground" />}
                            </h3>
                            <Badge variant="secondary">{module.duration}</Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{module.description}</p>
                          {!module.locked && (
                            <Button 
                              className={`bg-gradient-to-r ${currentCategory.color} hover:opacity-90 text-white`}
                              onClick={(e) => {
                                e.stopPropagation();
                                startModule(currentCategory.id, module.id);
                              }}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Commencer ce module
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Learning module view
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-pink-50/30 dark:from-background dark:via-purple-950/10 dark:to-pink-950/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={closeModule} className="group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Retour aux modules
          </Button>
          {currentModule && (
            <Badge variant="secondary" className="text-sm">
              {currentModule.duration}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Learning Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Module Header */}
            {currentCategory && currentModule && (
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${currentCategory.color} text-white`}>
                      <currentCategory.icon className="w-6 h-6" />
                    </div>
                    {currentModule.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {currentModule.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* YouTube Videos Section */}
            {videos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-500" />
                    Vidéos recommandées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className="group cursor-pointer rounded-lg overflow-hidden border hover:shadow-lg transition-all"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
                      >
                        <div className="relative">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-full aspect-video object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-semibold text-sm line-clamp-2 mb-1">{video.title}</h4>
                          <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {loadingVideos && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Chargement des vidéos...</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Chat with Eric */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 h-[calc(100vh-8rem)] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <img src={ericTeaching} alt="Eric" className="w-12 h-12 rounded-full" />
                  <div>
                    <CardTitle className="text-lg">Discute avec Eric</CardTitle>
                    <CardDescription className="text-sm">Ton tuteur IA personnel</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-2xl flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Eric réfléchit...</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-2 border-t">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                    placeholder="Pose une question à Eric..."
                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={isLoading || !userInput.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 rounded-full px-4"
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassionDiscoveryTest;