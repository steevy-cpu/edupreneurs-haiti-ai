import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EricChatbot } from "@/components/EricChatbot";
import {
  Menu,
  X,
  Home,
  BookOpen,
  FolderOpen,
  Users,
  Link as LinkIcon,
  Settings,
  LogOut,
  Coins,
  ChartLine,
  CreditCard,
  UserCheck,
} from "lucide-react";
import dashboardImage from "@/assets/dashboard00.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: "Utilisateur",
    gold: 0,
    level: 1,
    progress: 0,
    affiliations: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    
    const userName = session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Utilisateur";
    setUserData(prev => ({ ...prev, name: userName }));
  };

  const handleLogout = async () => {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      await supabase.auth.signOut();
      toast.success("Déconnexion réussie");
      navigate("/auth");
    }
  };

  const subjects = [
    { id: "math", name: "Mathématiques", icon: "🔢", progress: 45, description: "Algèbre, géométrie et calcul" },
    { id: "french", name: "Français", icon: "🇫🇷", progress: 60, description: "Grammaire, conjugaison et littérature" },
    { id: "science", name: "Sciences", icon: "🔬", progress: 30, description: "Physique, chimie et biologie" },
    { id: "history", name: "Histoire", icon: "📜", progress: 20, description: "Histoire d'Haïti et mondiale" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Menu Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-5 left-5 z-[1001] bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 ${sidebarOpen ? "lg:left-[300px]" : ""}`}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[999] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen w-[280px] bg-card border-r border-border shadow-lg z-[1000] transition-transform duration-300 overflow-y-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Sidebar Header */}
        <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-5 border-b border-white/10 flex items-center justify-between">
          <div className="text-lg font-bold">EDUPRENEURS</div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Eric Agent Section */}
        <div className="p-6 text-center border-b border-border bg-gradient-to-br from-muted/30 to-muted/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] shadow-md animate-[gentle-bob_8s_ease-in-out_infinite]">
            <img src={dashboardImage} alt="Eric Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="font-bold text-lg text-foreground mb-1">Eric</div>
          <div className="text-sm text-muted-foreground">Votre assistant IA</div>
        </div>

        {/* Navigation */}
        <nav className="py-5">
          <a href="/dashboard" className="flex items-center gap-3 px-5 py-3.5 mx-3 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white font-medium transition-all duration-300">
            <Home size={18} />
            Dashboard
          </a>
          <a href="/matieres" className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300">
            <BookOpen size={18} />
            Matières
          </a>
          <a href="#" className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300">
            <FolderOpen size={18} />
            Ressources
          </a>
          <a href="#" className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300">
            <Users size={18} />
            Communauté
          </a>
          <a href="#" className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300">
            <LinkIcon size={18} />
            Affiliations
          </a>
          <a href="#" className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300">
            <Settings size={18} />
            Paramètres
          </a>
          <hr className="border-border my-4 mx-3" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-3.5 mx-3 rounded-xl text-destructive font-medium hover:bg-destructive hover:text-white hover:translate-x-1 transition-all duration-300 w-[calc(100%-1.5rem)]"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-[280px]" : ""} pt-20 px-4 lg:px-8 pb-8`}>
        {/* Welcome Header */}
        <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white p-8 rounded-[20px] mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <div className="w-full h-full bg-gradient-radial from-white/20 to-transparent animate-[float_20s_ease-in-out_infinite]" />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">
              Bienvenue, <span>{userData.name}</span>!
            </h2>
            <p className="opacity-75">
              Continuez votre apprentissage personnalisé avec Eric, votre assistant IA
            </p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card className="border-none rounded-[20px] shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-7 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(25_100%_50%)] flex items-center justify-center text-white text-2xl mx-auto mb-4">
                <Coins />
              </div>
              <div className="text-3xl font-extrabold bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] bg-clip-text text-transparent mb-2">
                {userData.gold}
              </div>
              <div className="text-sm font-semibold text-muted-foreground">Golds gagnés</div>
            </CardContent>
          </Card>

          <Card className="border-none rounded-[20px] shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-7 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] flex items-center justify-center text-white text-2xl mx-auto mb-4">
                <UserCheck />
              </div>
              <div className="text-3xl font-extrabold bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] bg-clip-text text-transparent mb-2">
                {userData.affiliations}
              </div>
              <div className="text-sm font-semibold text-muted-foreground">Affiliations</div>
            </CardContent>
          </Card>

          <Card className="border-none rounded-[20px] shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-7 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--success))] to-[hsl(160_84%_32%)] flex items-center justify-center text-white text-2xl mx-auto mb-4">
                <ChartLine />
              </div>
              <div className="text-3xl font-extrabold bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] bg-clip-text text-transparent mb-2">
                {userData.progress}%
              </div>
              <div className="text-sm font-semibold text-muted-foreground">Progression</div>
            </CardContent>
          </Card>

          <Card className="border-none rounded-[20px] shadow-md hover:shadow-lg hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-7 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(262_83%_58%)] to-[hsl(262_83%_50%)] flex items-center justify-center text-white text-2xl mx-auto mb-4">
                <CreditCard />
              </div>
              <div className="text-3xl font-extrabold bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] bg-clip-text text-transparent mb-2">
                200 HTG
              </div>
              <div className="text-sm font-semibold text-muted-foreground">Abonnement / mois</div>
            </CardContent>
          </Card>
        </div>

        {/* Parcours */}
        <Card className="border-none rounded-[20px] shadow-md mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Choisissez votre parcours</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Programme complet par chapitres ou rattrapage ciblé. Votre agent IA vous guidera, expliquera simplement, puis vous proposera des quiz.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border border-border rounded-2xl hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <strong className="block mb-2">Programme complet</strong>
                  <p className="text-muted-foreground text-sm mb-4">
                    Chapitres du MENFP pour votre niveau.
                  </p>
                  <Button 
                    className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] hover:opacity-90"
                    onClick={() => navigate("/math-course")}
                  >
                    Suivre le programme
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-border rounded-2xl hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <strong className="block mb-2">Rattrapage</strong>
                  <p className="text-muted-foreground text-sm mb-4">
                    Révisez des matières précises.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white"
                    onClick={() => navigate("/math-course")}
                  >
                    Je veux réviser
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Subjects and Featured */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subjects */}
          <Card className="border-none rounded-[20px] shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Matières (MENFP)</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/matieres")}
                className="text-primary hover:text-primary"
              >
                Voir tout →
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="border border-border rounded-2xl p-5 bg-gradient-to-br from-muted/30 to-card hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer"
                  onClick={() => navigate("/math-course")}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{subject.icon}</span>
                    <h5 className="text-lg font-bold">{subject.name}</h5>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{subject.description}</p>
                  <Progress value={subject.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">{subject.progress}% complété</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Featured */}
          <Card className="border-none rounded-[20px] shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">À la une pour votre niveau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4 text-sm text-amber-800 dark:text-amber-200">
                <strong>Astuce:</strong> commencez par « Nombres entiers » en Mathématiques (7e). Cliquez sur « Lire la leçon ».
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border border-border rounded-2xl hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <strong className="block mb-2">Nombres entiers — Lecture</strong>
                    <p className="text-muted-foreground text-sm mb-4">
                      Explications simples avec schémas.
                    </p>
                    <Button 
                      className="w-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] hover:opacity-90"
                      onClick={() => navigate("/math-lesson/integers")}
                    >
                      Lire la leçon
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-border rounded-2xl hover:shadow-md transition-all">
                  <CardContent className="p-5">
                    <strong className="block mb-2">Nombres entiers — Quiz</strong>
                    <p className="text-muted-foreground text-sm mb-4">
                      Vérifiez votre compréhension et gagnez des golds.
                    </p>
                    <Button 
                      variant="outline"
                      className="w-full border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-white"
                      onClick={() => navigate("/math-lesson/integers")}
                    >
                      Passer le quiz
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Eric Chatbot */}
      <EricChatbot />
    </div>
  );
};

export default Dashboard;
