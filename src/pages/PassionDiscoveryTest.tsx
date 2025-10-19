import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Music, Palette, Brain, BookOpen, Play, CheckCircle2, Lock, Loader2, ArrowLeft, Send, Youtube, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ericTeaching from "@/assets/eric-teaching.png";
import ericThinking from "@/assets/eric-thinking-pose.png";
import ericWelcome from "@/assets/eric-welcome.png";
import ericThumbUp from "@/assets/eric-thumb-up.png";
import ericPointing from "@/assets/eric-pointing-up.png";

interface QuizQuestion {
  id: number;
  question: string;
  options: Array<{ text: string; passion: string; ericImage: string }>;
  ericImage: string;
}

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

interface PassionScores {
  music: number;
  arts: number;
  chess: number;
  literature: number;
}

const PassionDiscoveryTest = () => {
  const navigate = useNavigate();
  const [quizStep, setQuizStep] = useState<"intro" | "quiz" | "results" | "categories">("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [passionScores, setPassionScores] = useState<PassionScores>({
    music: 0,
    arts: 0,
    chess: 0,
    literature: 0
  });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [userInput, setUserInput] = useState("");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Check if user has already completed the quiz
        const { data: prefs } = await supabase
          .from('user_passion_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (prefs?.quiz_completed) {
          setQuizStep("categories");
          setPassionScores({
            music: prefs.music_score,
            arts: prefs.arts_score,
            chess: prefs.chess_score,
            literature: prefs.literature_score
          });
        }
      }
    };
    getUser();
  }, []);

  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "Quand tu as du temps libre, qu'est-ce que tu préfères faire?",
      ericImage: ericWelcome,
      options: [
        { text: "Écouter de la musique ou jouer d'un instrument 🎵", passion: "music", ericImage: ericThumbUp },
        { text: "Dessiner, peindre ou créer quelque chose 🎨", passion: "arts", ericImage: ericThumbUp },
        { text: "Jouer aux échecs ou résoudre des énigmes 🧠", passion: "chess", ericImage: ericThumbUp },
        { text: "Lire un livre ou écrire des histoires 📚", passion: "literature", ericImage: ericThumbUp }
      ]
    },
    {
      id: 2,
      question: "Si tu devais choisir un projet à l'école, lequel t'intéresserait le plus?",
      ericImage: ericThinking,
      options: [
        { text: "Composer une chanson ou faire un concert 🎼", passion: "music", ericImage: ericPointing },
        { text: "Créer une œuvre d'art visuelle 🖼️", passion: "arts", ericImage: ericPointing },
        { text: "Organiser un tournoi de stratégie ♟️", passion: "chess", ericImage: ericPointing },
        { text: "Écrire un poème ou une pièce de théâtre 📝", passion: "literature", ericImage: ericPointing }
      ]
    },
    {
      id: 3,
      question: "Qu'est-ce qui te fait le plus vibrer?",
      ericImage: ericTeaching,
      options: [
        { text: "Les rythmes et les mélodies 🎶", passion: "music", ericImage: ericThumbUp },
        { text: "Les couleurs et les formes 🌈", passion: "arts", ericImage: ericThumbUp },
        { text: "Les défis intellectuels 🤔", passion: "chess", ericImage: ericThumbUp },
        { text: "Les belles histoires et les mots 💭", passion: "literature", ericImage: ericThumbUp }
      ]
    },
    {
      id: 4,
      question: "Comment aimes-tu t'exprimer?",
      ericImage: ericPointing,
      options: [
        { text: "À travers la musique et les sons 🎤", passion: "music", ericImage: ericTeaching },
        { text: "Par l'art visuel et la création 🎭", passion: "arts", ericImage: ericTeaching },
        { text: "En résolvant des problèmes complexes 🧩", passion: "chess", ericImage: ericTeaching },
        { text: "Avec des mots et des récits ✍️", passion: "literature", ericImage: ericTeaching }
      ]
    },
    {
      id: 5,
      question: "Quel type d'activité te détend le plus?",
      ericImage: ericThumbUp,
      options: [
        { text: "Jouer ou écouter de la musique 🎧", passion: "music", ericImage: ericWelcome },
        { text: "Dessiner ou créer des designs 🖌️", passion: "arts", ericImage: ericWelcome },
        { text: "Jouer à des jeux de réflexion 🎲", passion: "chess", ericImage: ericWelcome },
        { text: "Lire ou écrire tranquillement 📖", passion: "literature", ericImage: ericWelcome }
      ]
    }
  ];

  const categories: Category[] = [
    {
      id: "music",
      title: "La Musique 🎵",
      icon: Music,
      description: "Découvre le rythme, les instruments et la création musicale",
      fullDescription: "Les jeunes pourront s'initier aux bases du rythme, à la découverte des instruments, à la création musicale numérique et à la culture sonore.",
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
      fullDescription: "Des contenus autour du dessin, du design graphique, et de la création numérique pour libérer ton imagination.",
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
      fullDescription: "Des activités pour stimuler la logique, la patience, la concentration et la prise de décision réfléchie.",
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
      fullDescription: "Un espace de rencontre avec les mots pour écrire, lire, réciter et ressentir à travers la littérature et la poésie.",
      color: "from-green-500 to-teal-500",
      modules: [
        { id: "writing", title: "Écriture Créative", description: "Libère ton imagination par l'écriture", duration: "20 min", completed: false, locked: false },
        { id: "poetry", title: "Poésie", description: "Exprime tes émotions en vers", duration: "20 min", completed: false, locked: false },
        { id: "reading", title: "Lecture Analytique", description: "Comprends et analyse les textes", duration: "25 min", completed: false, locked: false },
        { id: "expression", title: "Expression Artistique", description: "Valorise la culture haïtienne par les mots", duration: "20 min", completed: false, locked: false }
      ]
    }
  ];

  const handleAnswerSelect = (passion: string) => {
    setPassionScores(prev => ({
      ...prev,
      [passion]: prev[passion as keyof PassionScores] + 1
    }));

    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 800);
    } else {
      setTimeout(() => {
        saveQuizResults();
      }, 800);
    }
  };

  const saveQuizResults = async () => {
    if (!userId) {
      toast.error("Tu dois être connecté pour sauvegarder tes résultats");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_passion_preferences')
        .upsert({
          user_id: userId,
          music_score: passionScores.music,
          arts_score: passionScores.arts,
          chess_score: passionScores.chess,
          literature_score: passionScores.literature,
          quiz_completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      setQuizStep("results");
      toast.success("Tes préférences ont été sauvegardées!");
    } catch (error) {
      console.error("Error saving quiz results:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  const getTopPassions = () => {
    const scores = Object.entries(passionScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2);
    return scores.map(([passion]) => passion);
  };

  const searchYouTubeVideos = async (query: string) => {
    setLoadingVideos(true);
    try {
      // Mock videos for testing (replace with real YouTube API)
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
    } catch (error) {
      console.error("Error fetching videos:", error);
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

    const searchQuery = `${category.title} ${module.title} tutoriel français`;
    await searchYouTubeVideos(searchQuery);

    const welcomeMessage = {
      role: "assistant",
      content: `Bonjour! Je suis Eric, ton guide pour découvrir "${module.title}". 🎓\n\n${module.description}\n\nJe vais t'accompagner dans ce module d'environ ${module.duration}. Nous allons apprendre ensemble de manière interactive!\n\nPour commencer, dis-moi: Qu'est-ce qui t'intéresse le plus dans ${category.title}? As-tu déjà une expérience avec ce sujet?`
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

  const currentCategory = categories.find(cat => cat.id === selectedCategory);
  const currentModule = currentCategory?.modules.find(mod => mod.id === selectedModule);

  // Intro Screen
  if (quizStep === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <img src={ericWelcome} alt="Eric" className="w-40 h-40 animate-scale-in" />
            </div>
            <CardTitle className="text-4xl mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              Bienvenue dans Découvre ta Passion!
            </CardTitle>
            <CardDescription className="text-lg">
              Salut! Je suis Eric, ton guide personnel. Je vais t'aider à découvrir tes passions à travers un petit quiz amusant! 🎉
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-6 rounded-lg space-y-3">
              <p className="font-semibold text-lg">📋 Ce quiz va t'aider à découvrir:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-purple-500" />
                  <span>Si tu aimes la musique 🎵</span>
                </li>
                <li className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-500" />
                  <span>Si tu es plutôt artistique 🎨</span>
                </li>
                <li className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-orange-500" />
                  <span>Si tu aimes les défis intellectuels ♟️</span>
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-500" />
                  <span>Si tu es passionné(e) par les mots 📚</span>
                </li>
              </ul>
            </div>
            <p className="text-center text-muted-foreground">
              Cela ne prendra que 2 minutes. Prêt(e) à découvrir tes talents cachés? 🌟
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">
                Plus tard
              </Button>
              <Button 
                onClick={() => setQuizStep("quiz")}
                className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white font-semibold"
              >
                Commencer le quiz! 🚀
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz Screen
  if (quizStep === "quiz") {
    const question = quizQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary">Question {currentQuestion + 1}/{quizQuestions.length}</Badge>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 mb-6" />
            <div className="flex justify-center mb-6">
              <img src={question.ericImage} alt="Eric" className="w-32 h-32 animate-fade-in" />
            </div>
            <CardTitle className="text-2xl text-center">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswerSelect(option.passion)}
                variant="outline"
                className="w-full h-auto py-4 text-left justify-start hover:bg-primary/10 hover:border-primary transition-all text-base"
              >
                <span className="flex-1">{option.text}</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results Screen
  if (quizStep === "results") {
    const topPassions = getTopPassions();
    const topCategories = categories.filter(cat => topPassions.includes(cat.id));

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-6">
              <img src={ericThumbUp} alt="Eric" className="w-40 h-40 animate-scale-in" />
            </div>
            <CardTitle className="text-4xl mb-4">
              Résultats Découverts! 🎉
            </CardTitle>
            <CardDescription className="text-lg">
              Voici ce que j'ai découvert sur tes passions:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-6 rounded-lg space-y-4">
              <h3 className="font-bold text-xl mb-4">Tes passions principales:</h3>
              {topCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <div key={category.id} className="flex items-center gap-4 p-4 bg-background rounded-lg">
                    <div className={`p-3 rounded-full bg-gradient-to-br ${category.color} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold">{index === 0 ? "🥇 " : "🥈 "}{category.title}</h4>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-primary/10 p-6 rounded-lg border-2 border-primary/20">
              <p className="text-center font-medium mb-2">
                💡 Excellent! Tu as des talents variés!
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Explore tous les domaines qui t'intéressent et développe tes compétences avec moi!
              </p>
            </div>

            <Button 
              onClick={() => setQuizStep("categories")}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white font-semibold py-6 text-lg"
            >
              Explorer mes passions! 🚀
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Category & Module Selection (same as before)
  if (!selectedModule) {
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

          {!selectedCategory && (
            <>
              <div className="text-center mb-12 animate-fade-in">
                <div className="inline-block mb-4">
                  <img src={ericTeaching} alt="Eric" className="w-32 h-32 mx-auto animate-scale-in" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                  Découvre ta Passion
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                  Explore les domaines qui t'inspirent et développe tes talents
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
            </>
          )}

          {selectedCategory && currentCategory && (
            <>
              <Button
                variant="ghost"
                onClick={() => setSelectedCategory(null)}
                className="mb-6 group"
              >
                <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Retour aux catégories
              </Button>

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

  // Learning Module View
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-pink-50/30 dark:from-background dark:via-purple-950/10 dark:to-pink-950/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => setSelectedModule(null)} className="group">
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
          <div className="lg:col-span-2 space-y-6">
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
          </div>

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