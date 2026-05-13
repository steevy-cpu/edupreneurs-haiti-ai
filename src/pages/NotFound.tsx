import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, MessageCircle, Trophy, Gamepad2, ArrowLeft, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";
const ericSad = '/images/eric-404-200w.webp';

const quickLinks = [
  { to: "/matieres", label: "Matières", icon: BookOpen, description: "Explorez les cours" },
  { to: "/community", label: "Communauté", icon: MessageCircle, description: "Discutez avec d'autres" },
  { to: "/leaderboard", label: "Classement", icon: Trophy, description: "Voir le classement" },
  { to: "/chess", label: "Échecs", icon: Gamepad2, description: "Jouez aux échecs" },
];

const NotFound = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/matieres?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="text-center px-4 py-8 max-w-3xl w-full">
        {/* Eric mascot with animation */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-75 animate-pulse" />
          <img
            src={ericSad}
            srcSet="/images/eric-404-200w.webp 200w, /images/eric-404-400w.webp 400w"
            sizes="192px"
            alt="Eric looking sad - 404 error"
            className="w-48 h-48 mx-auto object-contain relative z-10 drop-shadow-lg"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Error code with gradient */}
        <h1 className="mb-2 text-8xl font-black bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          404
        </h1>
        
        <h2 className="mb-3 text-2xl md:text-3xl font-bold text-foreground">
          Oups! Cette page s'est perdue 🔍
        </h2>
        
        <p className="mb-6 text-muted-foreground max-w-md mx-auto">
          La page <code className="px-2 py-0.5 bg-muted rounded text-sm font-mono">{location.pathname}</code> n'existe pas ou a été déplacée.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher une leçon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-12 text-base"
            />
          </div>
        </form>

        {/* Primary actions */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <Button asChild size="lg" className="gap-2">
            <Link to="/">
              <Home className="h-5 w-5" />
              Accueil
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2">
            <Link to="#" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5" />
              Page précédente
            </Link>
          </Button>
        </div>

        {/* Quick links grid */}
        <div className="border-t border-border pt-8">
          <p className="text-sm text-muted-foreground mb-4">Ou explorez ces pages populaires :</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all duration-200"
              >
                <link.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">{link.label}</span>
                <span className="text-xs text-muted-foreground hidden md:block">{link.description}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Fun tip */}
        <p className="mt-8 text-xs text-muted-foreground/60">
          💡 Astuce: Vérifiez l'URL ou utilisez la barre de recherche ci-dessus
        </p>
      </div>
    </div>
  );
};

export default NotFound;
