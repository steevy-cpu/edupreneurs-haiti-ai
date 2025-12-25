import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Music, Palette, Brain, BookOpen, Play, CheckCircle2, Lock, Loader2, ArrowLeft, Send, Youtube, ArrowRight, Award, Users, Heart, Lightbulb, RotateCcw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePassionProgress, usePassionPreferences, useSaveQuizResults, useResetQuiz } from "@/hooks/usePassionData";
import { ModuleActivity } from "@/components/passion/ModuleActivity";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getActivitiesForModule, getCategoriesWithActivities, type ActivityContent } from "@/data/passionActivities";
import ericTeaching from "@/assets/eric-teaching.png";
import ericThinking from "@/assets/eric-thinking-pose.png";
import ericWelcome from "@/assets/eric-welcome.png";
import ericThumbUp from "@/assets/eric-thumb-up.png";
import ericPointing from "@/assets/eric-pointing-up.png";
import ericChairDesk from "@/assets/eric-chair-desk.png";
import ericRightPointing from "@/assets/eric-right-pointing-2.png";

interface QuizQuestion {
  id: number;
  question: string;
  options: Array<{ text: string; passion: string; ericImage: string }>;
  ericImage: string;
}

interface Activity {
  id: string;
  type: "video" | "quiz" | "reading" | "game";
  title: string;
  description: string;
  duration: string;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  locked: boolean;
  activities: Activity[];
}

interface Category {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
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

const PassionDiscoveryContent = () => {
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
  const [showActivities, setShowActivities] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [activityStates, setActivityStates] = useState<Record<string, boolean>>({});
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // React Query hooks
  const { data: preferences, isLoading: preferencesLoading } = usePassionPreferences(userId);
  const { getModuleProgress, getCategoryProgress, updateProgress, isLoading: progressLoading } = usePassionProgress(userId);
  const saveQuizMutation = useSaveQuizResults();
  const resetQuizMutation = useResetQuiz();

  // Check if there's unsaved progress
  const hasUnsavedProgress = Object.keys(activityStates).length > 0;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  // Set quiz step based on preferences
  useEffect(() => {
    if (preferences?.quiz_completed) {
      setQuizStep("categories");
      setPassionScores({
        music: preferences.music_score ?? 0,
        arts: preferences.arts_score ?? 0,
        chess: preferences.chess_score ?? 0,
        literature: preferences.literature_score ?? 0
      });
    }
  }, [preferences]);

  const handleLeaveModule = useCallback((onConfirm: () => void) => {
    if (hasUnsavedProgress) {
      setPendingNavigation(() => onConfirm);
      setShowLeaveDialog(true);
    } else {
      onConfirm();
    }
  }, [hasUnsavedProgress]);

  const confirmLeave = () => {
    setShowLeaveDialog(false);
    setActivityStates({});
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const handleRetakeQuiz = () => {
    if (userId) {
      resetQuizMutation.mutate(userId, {
        onSuccess: () => {
          setQuizStep("intro");
          setCurrentQuestion(0);
          setPassionScores({ music: 0, arts: 0, chess: 0, literature: 0 });
        }
      });
    }
  };

  const quizQuestions: QuizQuestion[] = [
    {
      id: 1,
      question: "Quand tu as du temps libre, qu'est-ce que tu préfères faire?",
      ericImage: ericWelcome,
      options: [
        { text: "Écouter de la musique ou jouer d'un instrument 🎵", passion: "music", ericImage: ericRightPointing },
        { text: "Dessiner, peindre ou créer quelque chose 🎨", passion: "arts", ericImage: ericRightPointing },
        { text: "Jouer aux échecs ou résoudre des énigmes 🧠", passion: "chess", ericImage: ericRightPointing },
        { text: "Lire un livre ou écrire des histoires 📚", passion: "literature", ericImage: ericRightPointing }
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

  const getModuleActivities = (categoryId: string, moduleId: string, moduleTitle: string): Activity[] => {
    // Try to get real activities first
    const realActivities = getActivitiesForModule(categoryId, moduleId);
    
    if (realActivities) {
      return realActivities.map((activity: ActivityContent) => ({
        ...activity,
        completed: activityStates[activity.id] || false
      }));
    }
    
    // Fallback to generated activities for categories without real content
    return [
      {
        id: `${moduleId}-video`,
        type: "video" as const,
        title: `Introduction à ${moduleTitle}`,
        description: "Vidéo explicative pour découvrir les concepts de base",
        duration: "5 min",
        completed: activityStates[`${moduleId}-video`] || false
      },
      {
        id: `${moduleId}-reading`,
        type: "reading" as const,
        title: `Contenu pédagogique`,
        description: "Texte détaillé avec explications et exemples",
        duration: "10 min",
        completed: activityStates[`${moduleId}-reading`] || false
      },
      {
        id: `${moduleId}-quiz`,
        type: "quiz" as const,
        title: `Quiz d'évaluation`,
        description: "Teste tes connaissances sur ce module",
        duration: "5 min",
        completed: activityStates[`${moduleId}-quiz`] || false
      },
      {
        id: `${moduleId}-game`,
        type: "game" as const,
        title: `Activité pratique`,
        description: "Mets en pratique ce que tu as appris",
        duration: "10 min",
        completed: activityStates[`${moduleId}-game`] || false
      }
    ];
  };

  // Build categories with module locking based on progress
  const buildModulesWithLocking = (baseModules: Omit<Module, 'locked' | 'activities'>[], categoryId: string): Module[] => {
    return baseModules.map((module, index) => {
      const moduleProgress = getModuleProgress(categoryId, module.id);
      const previousModuleCompleted = index === 0 ? true : 
        getModuleProgress(categoryId, baseModules[index - 1].id).completed;
      
      return {
        ...module,
        completed: moduleProgress.completed,
        locked: !previousModuleCompleted && index > 0,
        activities: getModuleActivities(categoryId, module.id, module.title)
      };
    });
  };

  const baseCategories = [
    {
      id: "music",
      title: "La Musique 🎵",
      icon: Music,
      description: "Découvre le rythme, les instruments et la création musicale",
      fullDescription: "Les jeunes pourront s'initier aux bases du rythme, à la découverte des instruments, à la création musicale numérique et à la culture sonore.",
      color: "from-purple-500 to-pink-500",
      modules: [
        { id: "rhythm", title: "Bases du Rythme", description: "Apprends à compter les temps et sentir le rythme", duration: "15 min", completed: false },
        { id: "instruments", title: "Découverte des Instruments", description: "Explore les instruments traditionnels et modernes", duration: "20 min", completed: false },
        { id: "production", title: "Production Sonore", description: "Crée ta propre musique avec des outils numériques", duration: "25 min", completed: false },
        { id: "culture", title: "Culture Musicale", description: "Découvre la richesse de la musique haïtienne et mondiale", duration: "20 min", completed: false }
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
        { id: "drawing", title: "Dessin de Base", description: "Maîtrise les techniques fondamentales du dessin", duration: "20 min", completed: false },
        { id: "design", title: "Design Graphique", description: "Crée des visuels impactants", duration: "25 min", completed: false },
        { id: "digital", title: "Création Numérique", description: "Utilise les outils digitaux pour créer", duration: "30 min", completed: false },
        { id: "illustration", title: "Art Digital", description: "Deviens un artiste numérique", duration: "25 min", completed: false }
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
        { id: "basics", title: "Bases des Échecs", description: "Apprends les règles et mouvements", duration: "15 min", completed: false },
        { id: "strategy", title: "Stratégies", description: "Développe ton jeu tactique", duration: "20 min", completed: false },
        { id: "problems", title: "Résolution de Problèmes", description: "Entraîne ton esprit logique", duration: "20 min", completed: false },
        { id: "mindgames", title: "Jeux d'Esprit", description: "Stimule ta concentration", duration: "15 min", completed: false }
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
        { id: "writing", title: "Écriture Créative", description: "Libère ton imagination par l'écriture", duration: "20 min", completed: false },
        { id: "poetry", title: "Poésie", description: "Exprime tes émotions en vers", duration: "20 min", completed: false },
        { id: "reading", title: "Lecture Analytique", description: "Comprends et analyse les textes", duration: "25 min", completed: false },
        { id: "expression", title: "Expression Artistique", description: "Valorise la culture haïtienne par les mots", duration: "20 min", completed: false }
      ]
    }
  ];

  const baseCivicCategories = [
    {
      id: "rights",
      title: "Droits Fondamentaux 🏛️",
      icon: Award,
      description: "Comprends tes droits et devoirs de citoyen",
      fullDescription: "Découvre les droits humains fondamentaux : éducation, santé, liberté d'expression, dignité et leur application dans la vie quotidienne en Haïti.",
      color: "from-indigo-500 to-purple-500",
      modules: [
        { id: "education", title: "Droit à l'Éducation", description: "Comprends ton droit fondamental à l'éducation", duration: "15 min", completed: false },
        { id: "health", title: "Droit à la Santé", description: "Découvre les droits liés à la santé et au bien-être", duration: "15 min", completed: false },
        { id: "expression-civic", title: "Liberté d'Expression", description: "Apprends à t'exprimer dans le respect", duration: "15 min", completed: false },
        { id: "duties", title: "Devoirs du Citoyen", description: "Comprends tes responsabilités envers la société", duration: "15 min", completed: false }
      ]
    },
    {
      id: "citizenship",
      title: "Citoyenneté Active 🗳️",
      icon: Users,
      description: "Deviens un citoyen conscient et engagé",
      fullDescription: "Explore les principes de la démocratie, la participation civique et ton rôle dans la société haïtienne.",
      color: "from-blue-500 to-indigo-500",
      modules: [
        { id: "democracy", title: "Principes de la Démocratie", description: "Comprends comment fonctionne la démocratie", duration: "20 min", completed: false },
        { id: "participation", title: "Participation Civique", description: "Apprends à participer à la vie citoyenne", duration: "20 min", completed: false },
        { id: "laws", title: "Respect des Lois", description: "Comprends l'importance des lois et du vivre-ensemble", duration: "15 min", completed: false },
        { id: "civic-role", title: "Rôle du Citoyen", description: "Découvre ton rôle dans la société", duration: "15 min", completed: false }
      ]
    },
    {
      id: "peace",
      title: "Culture de la Paix ☮️",
      icon: Heart,
      description: "Tolérance, solidarité et justice sociale",
      fullDescription: "Développe les valeurs de tolérance, respect de la diversité, solidarité et résolution pacifique des conflits.",
      color: "from-pink-500 to-rose-500",
      modules: [
        { id: "tolerance", title: "Tolérance & Diversité", description: "Respecte et célèbre les différences", duration: "15 min", completed: false },
        { id: "solidarity", title: "Solidarité & Entraide", description: "Apprends l'importance de l'entraide", duration: "15 min", completed: false },
        { id: "justice", title: "Justice Sociale", description: "Comprends les principes d'égalité et de justice", duration: "20 min", completed: false },
        { id: "conflict", title: "Résolution de Conflits", description: "Apprends à résoudre les conflits pacifiquement", duration: "20 min", completed: false }
      ]
    }
  ];

  const baseDevelopmentCategories = [
    {
      id: "personal",
      title: "Croissance Personnelle 🌱",
      icon: Lightbulb,
      description: "Développe tes compétences personnelles",
      fullDescription: "Maîtrise la gestion du temps, développe ta confiance en soi, ton intelligence émotionnelle et ta communication.",
      color: "from-emerald-500 to-green-500",
      modules: [
        { id: "time-management", title: "Gestion du Temps", description: "Apprends à organiser ton temps efficacement", duration: "15 min", completed: false },
        { id: "confidence", title: "Confiance en Soi", description: "Développe ta confiance et ton estime", duration: "20 min", completed: false },
        { id: "emotions", title: "Intelligence Émotionnelle", description: "Comprends et gère tes émotions", duration: "20 min", completed: false },
        { id: "communication", title: "Communication", description: "Améliore ta façon de communiquer", duration: "15 min", completed: false }
      ]
    }
  ];

  // Build categories with proper locking
  const categories: Category[] = baseCategories.map(cat => ({
    ...cat,
    modules: buildModulesWithLocking(cat.modules, cat.id)
  }));

  const civicCategories: Category[] = baseCivicCategories.map(cat => ({
    ...cat,
    modules: buildModulesWithLocking(cat.modules, cat.id)
  }));

  const developmentCategories: Category[] = baseDevelopmentCategories.map(cat => ({
    ...cat,
    modules: buildModulesWithLocking(cat.modules, cat.id)
  }));

  const handleAnswerSelect = (passion: keyof PassionScores) => {
    setPassionScores(prev => ({
      ...prev,
      [passion]: prev[passion] + 1
    }));

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      saveQuizResults();
    }
  };

  const saveQuizResults = async () => {
    if (!userId) {
      toast.error("Tu dois être connecté pour sauvegarder tes résultats");
      return;
    }

    setIsLoading(true);
    saveQuizMutation.mutate(
      { userId, scores: passionScores },
      {
        onSuccess: () => {
          setQuizStep("results");
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        }
      }
    );
  };

  const getTopPassions = () => {
    const scores = Object.entries(passionScores)
      .sort(([, a], [, b]) => b - a);
    
    const topScore = scores[0]?.[1] || 0;
    const topPassions = scores.filter(([, score]) => score >= topScore - 1).slice(0, 3);
    
    return topPassions.map(([passion]) => passion);
  };

  const searchYouTubeVideos = async (query: string) => {
    setLoadingVideos(true);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-search', {
        body: { query, maxResults: 6 }
      });

      if (error) throw error;

      setVideos(data.videos || []);
    } catch (error) {
      console.error("Error fetching YouTube videos:", error);
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  const startModule = async (categoryId: string, moduleId: string) => {
    setSelectedCategory(categoryId);
    setSelectedModule(moduleId);
    setIsLoading(true);
    setActivityStates({});

    const allCats = [...categories, ...civicCategories, ...developmentCategories];
    const category = allCats.find(c => c.id === categoryId);
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
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    setUserInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('passion-ai-tutor', {
        body: {
          message: userInput,
          category: selectedCategory,
          chatHistory: newMessages.slice(-10)
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleActivityComplete = (activityId: string) => {
    setActivityStates(prev => ({ ...prev, [activityId]: true }));
    
    if (selectedCategory && selectedModule) {
      const allCats = [...categories, ...civicCategories, ...developmentCategories];
      const category = allCats.find(c => c.id === selectedCategory);
      const module = category?.modules.find(m => m.id === selectedModule);
      
      if (module) {
        const activities = getModuleActivities(selectedCategory, selectedModule, module.title);
        const newActivityStates = { ...activityStates, [activityId]: true };
        const completedCount = activities.filter(a => newActivityStates[a.id]).length;
        const progressPercentage = (completedCount / activities.length) * 100;
        
        updateProgress({
          categoryId: selectedCategory,
          moduleId: selectedModule,
          progressPercentage,
          completed: progressPercentage === 100
        });
      }
    }
  };

  const allCategories = [...categories, ...civicCategories, ...developmentCategories];
  const currentCategory = allCategories.find(cat => cat.id === selectedCategory);
  const currentModule = currentCategory?.modules.find(mod => mod.id === selectedModule);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(cat => 
      cat.title.toLowerCase().includes(query) ||
      cat.description.toLowerCase().includes(query) ||
      cat.modules.some(m => m.title.toLowerCase().includes(query))
    );
  }, [categories, searchQuery]);

  const filteredCivicCategories = useMemo(() => {
    if (!searchQuery.trim()) return civicCategories;
    const query = searchQuery.toLowerCase();
    return civicCategories.filter(cat => 
      cat.title.toLowerCase().includes(query) ||
      cat.description.toLowerCase().includes(query)
    );
  }, [civicCategories, searchQuery]);

  const filteredDevelopmentCategories = useMemo(() => {
    if (!searchQuery.trim()) return developmentCategories;
    const query = searchQuery.toLowerCase();
    return developmentCategories.filter(cat => 
      cat.title.toLowerCase().includes(query) ||
      cat.description.toLowerCase().includes(query)
    );
  }, [developmentCategories, searchQuery]);

  // Loading state
  if (preferencesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-pink-50/30 dark:from-background dark:via-purple-950/10 dark:to-pink-950/10 p-4">
        <div className="container mx-auto">
          <Skeleton className="h-12 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-2 w-full" />
                <CardHeader>
                  <div className="flex gap-4">
                    <Skeleton className="w-16 h-16 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-3 w-full" />
                  <div className="flex gap-2">
                    {[1, 2, 3].map(j => <Skeleton key={j} className="h-6 w-20" />)}
                  </div>
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Intro Screen
  if (quizStep === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <img src={ericWelcome} alt="Eric" className="w-32 h-32 md:w-40 md:h-40 animate-scale-in" loading="lazy" decoding="async" />
            </div>
            <CardTitle className="text-3xl md:text-4xl mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              Bienvenue dans Découvre ta Passion!
            </CardTitle>
            <CardDescription className="text-base md:text-lg">
              Salut! Je suis Eric, ton guide personnel. Je vais t'aider à découvrir tes passions à travers un petit quiz amusant! 🎉
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 md:p-6 rounded-lg space-y-3">
              <p className="font-semibold text-lg">📋 Ce quiz va t'aider à découvrir:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-purple-500 flex-shrink-0" />
                  <span>Si tu aimes la musique 🎵</span>
                </li>
                <li className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span>Si tu es plutôt artistique 🎨</span>
                </li>
                <li className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span>Si tu aimes les défis intellectuels ♟️</span>
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Si tu es passionné(e) par les mots 📚</span>
                </li>
              </ul>
            </div>
            <p className="text-center text-muted-foreground">
              Cela ne prendra que 2 minutes. Prêt(e) à découvrir tes talents cachés? 🌟
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
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
              <img src={question.ericImage} alt="Eric" className="w-24 h-24 md:w-32 md:h-32 animate-fade-in" loading="lazy" decoding="async" />
            </div>
            <CardTitle className="text-xl md:text-2xl text-center">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswerSelect(option.passion as keyof PassionScores)}
                variant="outline"
                className="w-full h-auto py-4 text-left justify-start hover:bg-primary/10 hover:border-primary transition-all text-sm md:text-base"
                disabled={isLoading}
              >
                <span className="flex-1">{option.text}</span>
                <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
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
              <img src={ericThumbUp} alt="Eric" className="w-32 h-32 md:w-40 md:h-40 animate-scale-in" loading="lazy" decoding="async" />
            </div>
            <CardTitle className="text-3xl md:text-4xl mb-4">
              Résultats Découverts! 🎉
            </CardTitle>
            <CardDescription className="text-base md:text-lg">
              Voici ce que j'ai découvert sur tes passions:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted p-4 md:p-6 rounded-lg space-y-4">
              <h3 className="font-bold text-xl mb-4">Tes passions principales:</h3>
              {topCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <div key={category.id} className="flex items-center gap-4 p-4 bg-background rounded-lg">
                    <div className={`p-3 rounded-full bg-gradient-to-br ${category.color} text-white flex-shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold">{index === 0 ? "🥇 " : index === 1 ? "🥈 " : "🥉 "}{category.title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{category.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-primary/10 p-4 md:p-6 rounded-lg border-2 border-primary/20">
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

  // Category & Module Selection
  if (!selectedModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-pink-50/30 dark:from-background dark:via-purple-950/10 dark:to-pink-950/10">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Retour au tableau de bord
            </Button>
            
            {preferences?.quiz_completed && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetakeQuiz}
                disabled={resetQuizMutation.isPending}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Refaire le quiz
              </Button>
            )}
          </div>

          {!selectedCategory && (
            <>
              <div className="text-center mb-8 md:mb-12 animate-fade-in">
                <div className="inline-block mb-4">
                  <img src={ericChairDesk} alt="Eric" className="w-32 h-32 md:w-48 md:h-48 mx-auto animate-scale-in" loading="lazy" decoding="async" />
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                  Découverte & Épanouissement
                </h1>
                <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
                  Explore tes passions, développe ta citoyenneté et deviens la meilleure version de toi-même
                </p>
              </div>

              <Tabs defaultValue="passion" className="w-full max-w-6xl mx-auto">
                <TabsList className="grid w-full grid-cols-3 mb-6 md:mb-8">
                  <TabsTrigger value="passion" className="text-xs md:text-sm">Passion</TabsTrigger>
                  <TabsTrigger value="civic" className="text-xs md:text-sm">Civique</TabsTrigger>
                  <TabsTrigger value="development" className="text-xs md:text-sm">Personnel</TabsTrigger>
                </TabsList>

                <TabsContent value="passion" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {categories.map((category, index) => {
                      const Icon = category.icon;
                      const categoryProgress = getCategoryProgress(category.id, category.modules.length);

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
                              <div className={`p-3 md:p-4 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                                <Icon className="w-6 h-6 md:w-8 md:h-8" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-xl md:text-2xl mb-2">{category.title}</CardTitle>
                                <CardDescription className="text-sm md:text-base">
                                  {category.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                              {category.fullDescription}
                            </p>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium">Progression</span>
                                <span className="text-muted-foreground">{categoryProgress.completed}/{categoryProgress.total} modules</span>
                              </div>
                              <Progress value={categoryProgress.percentage} className="h-3" />
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {category.modules.slice(0, 3).map((module) => {
                                return (
                                  <Badge 
                                    key={module.id} 
                                    variant={module.completed ? "default" : "outline"}
                                    className="text-xs"
                                  >
                                    {module.completed && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                    {module.locked && <Lock className="w-3 h-3 mr-1" />}
                                    {module.title}
                                  </Badge>
                                );
                              })}
                              {category.modules.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{category.modules.length - 3}</Badge>
                              )}
                            </div>

                            <Button 
                              className={`w-full bg-gradient-to-r ${category.color} hover:opacity-90 text-white font-semibold py-5 md:py-6 text-base md:text-lg group-hover:scale-105 transition-transform`}
                            >
                              Commencer l'exploration
                              <Play className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="civic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {civicCategories.map((category, index) => {
                      const Icon = category.icon;
                      const categoryProgress = getCategoryProgress(category.id, category.modules.length);

                      return (
                        <Card 
                          key={category.id}
                          className="hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-pointer transform hover:-translate-y-2 animate-fade-in"
                          style={{ animationDelay: `${index * 150}ms` }}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <div className={`h-2 bg-gradient-to-r ${category.color} group-hover:h-3 transition-all duration-300`} />
                          <CardHeader>
                            <div className="flex flex-col items-center text-center gap-3">
                              <div className={`p-4 rounded-full bg-gradient-to-br ${category.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className="w-6 h-6 md:w-8 md:h-8" />
                              </div>
                              <CardTitle className="text-lg md:text-xl">{category.title}</CardTitle>
                              <CardDescription className="text-sm">{category.description}</CardDescription>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium">Progression</span>
                                <span className="text-muted-foreground">{categoryProgress.completed}/{categoryProgress.total}</span>
                              </div>
                              <Progress value={categoryProgress.percentage} className="h-2" />
                            </div>

                            <Button 
                              className={`w-full bg-gradient-to-r ${category.color} hover:opacity-90 text-white font-semibold`}
                            >
                              Explorer
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="development" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {developmentCategories.map((category, index) => {
                      const Icon = category.icon;
                      const categoryProgress = getCategoryProgress(category.id, category.modules.length);

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
                              <div className={`p-3 md:p-4 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                                <Icon className="w-6 h-6 md:w-8 md:h-8" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-xl md:text-2xl mb-2">{category.title}</CardTitle>
                                <CardDescription className="text-sm md:text-base">
                                  {category.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium">Progression</span>
                                <span className="text-muted-foreground">{categoryProgress.completed}/{categoryProgress.total} modules</span>
                              </div>
                              <Progress value={categoryProgress.percentage} className="h-3" />
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {category.modules.slice(0, 3).map((module) => {
                                return (
                                  <Badge 
                                    key={module.id} 
                                    variant={module.completed ? "default" : "outline"}
                                    className="text-xs"
                                  >
                                    {module.completed && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                    {module.locked && <Lock className="w-3 h-3 mr-1" />}
                                    {module.title}
                                  </Badge>
                                );
                              })}
                            </div>

                            <Button 
                              className={`w-full bg-gradient-to-r ${category.color} hover:opacity-90 text-white font-semibold py-5 md:py-6 text-base md:text-lg group-hover:scale-105 transition-transform`}
                            >
                              Commencer
                              <Play className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
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

              <div className="text-center mb-8 md:mb-12">
                <div className={`inline-flex p-4 md:p-6 rounded-2xl bg-gradient-to-br ${currentCategory.color} text-white shadow-2xl mb-6`}>
                  <currentCategory.icon className="w-12 h-12 md:w-16 md:h-16" />
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4">{currentCategory.title}</h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                  {currentCategory.fullDescription}
                </p>
              </div>

              <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Modules disponibles</h2>
                {currentCategory.modules.map((module, index) => {
                  const moduleProgress = getModuleProgress(currentCategory.id, module.id);
                  
                  return (
                    <Card 
                      key={module.id}
                      className={`hover:shadow-xl transition-all duration-300 ${
                        module.locked ? 'opacity-60' : 'cursor-pointer hover:-translate-y-1'
                      }`}
                      onClick={() => !module.locked && startModule(currentCategory.id, module.id)}
                    >
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start gap-3 md:gap-4">
                          <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${currentCategory.color} text-white flex items-center justify-center font-bold text-lg md:text-xl`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                              <h3 className="text-lg md:text-xl font-bold flex items-center gap-2 flex-wrap">
                                {module.title}
                                {moduleProgress.completed && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
                                {module.locked && <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
                              </h3>
                              <Badge variant="secondary" className="self-start">{module.duration}</Badge>
                            </div>
                            <p className="text-muted-foreground mb-3 text-sm md:text-base">{module.description}</p>
                            
                            {module.locked && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                                🔒 Termine le module précédent pour débloquer celui-ci
                              </p>
                            )}
                            
                            {moduleProgress.progress_percentage > 0 && !moduleProgress.completed && (
                              <div className="mb-3">
                                <Progress value={moduleProgress.progress_percentage} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-1">{Math.round(moduleProgress.progress_percentage)}% complété</p>
                              </div>
                            )}
                            
                            {!module.locked && (
                              <Button 
                                className={`bg-gradient-to-r ${currentCategory.color} hover:opacity-90 text-white`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startModule(currentCategory.id, module.id);
                                }}
                              >
                                <Play className="mr-2 h-4 w-4" />
                                {moduleProgress.progress_percentage > 0 ? "Continuer" : "Commencer ce module"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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
      {/* Leave confirmation dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter le module?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu as des activités en cours. Si tu quittes maintenant, ta progression sera perdue. Es-tu sûr de vouloir quitter?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Rester</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave}>Quitter</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <Button 
            variant="ghost" 
            onClick={() => handleLeaveModule(() => { 
              setSelectedModule(null); 
              setShowActivities(false); 
              setSelectedVideo(null); 
            })} 
            className="group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Retour aux modules</span>
            <span className="sm:hidden">Retour</span>
          </Button>
          {currentModule && (
            <Badge variant="secondary" className="text-sm">
              {currentModule.duration}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {currentCategory && currentModule && !showActivities && (
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2">
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl flex items-center gap-3">
                    <div className={`p-2 md:p-3 rounded-xl bg-gradient-to-br ${currentCategory.color} text-white flex-shrink-0`}>
                      <currentCategory.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <span className="truncate">{currentModule.title}</span>
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    {currentModule.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowActivities(true)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                  >
                    <Play className="mr-2" />
                    Commencer les activités
                  </Button>
                </CardContent>
              </Card>
            )}

            {showActivities && currentCategory && currentModule && (
              <ModuleActivity
                categoryId={currentCategory.id}
                moduleId={currentModule.id}
                moduleTitle={currentModule.title}
                moduleDescription={currentModule.description}
                activities={generateDefaultActivities(currentModule.id, currentModule.title)}
                onActivityComplete={handleActivityComplete}
                onModuleComplete={() => {
                  if (currentCategory && currentModule) {
                    updateProgress({
                      categoryId: currentCategory.id,
                      moduleId: currentModule.id,
                      progressPercentage: 100,
                      completed: true
                    });
                    setActivityStates({});
                    toast.success("🎉 Module terminé! Excellent travail!");
                  }
                }}
              />
            )}

            {loadingVideos ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="aspect-video w-full rounded-lg" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : videos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-500" />
                    Vidéos recommandées
                  </CardTitle>
                  {selectedVideo && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedVideo(null)}
                      className="mt-2"
                    >
                      ← Retour aux vidéos
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {selectedVideo ? (
                    <div className="space-y-4">
                      <div className="relative aspect-video overflow-hidden bg-muted rounded-lg">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${selectedVideo.id}?rel=0&modestbranding=1`}
                          title={selectedVideo.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading="lazy"
                          className="w-full h-full border-0"
                        />
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2 line-clamp-2">{selectedVideo.title}</h4>
                        <p className="text-sm text-muted-foreground">{selectedVideo.channelTitle}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {videos.map((video) => (
                        <div
                          key={video.id}
                          className="group cursor-pointer rounded-lg overflow-hidden border hover:shadow-lg transition-all"
                          onClick={() => setSelectedVideo(video)}
                        >
                          <div className="relative">
                            <img 
                              src={video.thumbnail} 
                              alt={video.title}
                              className="w-full aspect-video object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <Play className="w-10 h-10 md:w-12 md:h-12 text-white" />
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="font-semibold text-sm line-clamp-2 mb-1">{video.title}</h4>
                            <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1 order-first lg:order-last">
            <Card className="lg:sticky lg:top-6 h-[50vh] lg:h-[calc(100vh-8rem)] flex flex-col">
              <CardHeader className="border-b py-3 md:py-4">
                <div className="flex items-center gap-3">
                  <img src={ericRightPointing} alt="Eric" className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover" loading="lazy" decoding="async" />
                  <div className="min-w-0">
                    <CardTitle className="text-base md:text-lg">Discute avec Eric</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Ton tuteur IA personnel</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-3 md:p-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4 mb-3 md:mb-4 pr-2">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[90%] md:max-w-[85%] p-2.5 md:p-3 rounded-2xl ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-xs md:text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-2.5 md:p-3 rounded-2xl flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs md:text-sm">Eric réfléchit...</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-2 border-t">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Pose une question à Eric..."
                    className="flex-1 px-3 md:px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs md:text-sm bg-background"
                    disabled={isLoading}
                    aria-label="Message pour Eric"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={isLoading || !userInput.trim()}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 rounded-full px-3 md:px-4"
                    size="icon"
                    aria-label="Envoyer le message"
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

const PassionDiscovery = () => {
  return (
    <Layout>
      <PassionDiscoveryContent />
    </Layout>
  );
};

export default PassionDiscovery;
