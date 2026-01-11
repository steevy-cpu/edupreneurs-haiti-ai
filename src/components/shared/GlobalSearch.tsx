import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  BookOpen,
  Home,
  Settings,
  Users,
  Bell,
  Trophy,
  MessageSquare,
  GraduationCap,
  Gamepad2,
  Palette,
  Search,
  Clock,
} from "lucide-react";

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  path: string;
  category: "pages" | "subjects" | "recent";
}

const PAGES: SearchItem[] = [
  { id: "dashboard", title: "Dashboard", subtitle: "Tableau de bord", icon: <Home className="w-4 h-4" />, path: "/dashboard", category: "pages" },
  { id: "matieres", title: "Matières", subtitle: "Cours et leçons", icon: <BookOpen className="w-4 h-4" />, path: "/matieres", category: "pages" },
  { id: "community", title: "Messages", subtitle: "Communauté", icon: <MessageSquare className="w-4 h-4" />, path: "/community", category: "pages" },
  { id: "leaderboard", title: "Classement", subtitle: "Top étudiants", icon: <Trophy className="w-4 h-4" />, path: "/leaderboard", category: "pages" },
  { id: "notifications", title: "Notifications", subtitle: "Alertes et mises à jour", icon: <Bell className="w-4 h-4" />, path: "/notifications", category: "pages" },
  { id: "settings", title: "Paramètres", subtitle: "Profil et préférences", icon: <Settings className="w-4 h-4" />, path: "/settings", category: "pages" },
  { id: "passion", title: "Découvrir mes passions", subtitle: "Arts, musique, échecs", icon: <Palette className="w-4 h-4" />, path: "/passion-discovery", category: "pages" },
  { id: "chess", title: "Jouer aux échecs", subtitle: "Contre l'IA", icon: <Gamepad2 className="w-4 h-4" />, path: "/chess-game", category: "pages" },
  { id: "user-search", title: "Rechercher des utilisateurs", subtitle: "Trouver des amis", icon: <Users className="w-4 h-4" />, path: "/user-search", category: "pages" },
];

const SUBJECTS: SearchItem[] = [
  { id: "math", title: "Mathématiques", subtitle: "Algèbre, géométrie, calcul", icon: <GraduationCap className="w-4 h-4" />, path: "/matieres?subject=math", category: "subjects" },
  { id: "francais", title: "Français", subtitle: "Grammaire, littérature", icon: <GraduationCap className="w-4 h-4" />, path: "/matieres?subject=francais", category: "subjects" },
  { id: "sciences", title: "Sciences", subtitle: "Physique, chimie, biologie", icon: <GraduationCap className="w-4 h-4" />, path: "/matieres?subject=sciences", category: "subjects" },
  { id: "sciences-sociales", title: "Sciences Sociales", subtitle: "Histoire, géographie", icon: <GraduationCap className="w-4 h-4" />, path: "/matieres?subject=sciences-sociales", category: "subjects" },
  { id: "espagnol", title: "Espagnol", subtitle: "Langue espagnole", icon: <GraduationCap className="w-4 h-4" />, path: "/matieres?subject=espagnol", category: "subjects" },
  { id: "anglais", title: "Anglais", subtitle: "Langue anglaise", icon: <GraduationCap className="w-4 h-4" />, path: "/matieres?subject=anglais", category: "subjects" },
  { id: "creole", title: "Créole", subtitle: "Langue créole", icon: <GraduationCap className="w-4 h-4" />, path: "/matieres?subject=creole", category: "subjects" },
];

const RECENT_SEARCHES_KEY = "global-search-recent";
const MAX_RECENT = 5;

export const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const addToRecentSearches = useCallback((itemId: string) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((id) => id !== itemId);
      const updated = [itemId, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleSelect = useCallback((item: SearchItem) => {
    addToRecentSearches(item.id);
    setOpen(false);
    navigate(item.path);
  }, [navigate, addToRecentSearches]);

  const allItems = [...PAGES, ...SUBJECTS];
  const recentItems = recentSearches
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean) as SearchItem[];

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-lg transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Rechercher...</span>
        <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher une page, matière..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

          {/* Recent Searches */}
          {recentItems.length > 0 && (
            <>
              <CommandGroup heading="Recherches récentes">
                {recentItems.map((item) => (
                  <CommandItem
                    key={`recent-${item.id}`}
                    value={`${item.title} ${item.subtitle}`}
                    onSelect={() => handleSelect(item)}
                    className="flex items-center gap-3"
                  >
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      {item.subtitle && (
                        <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Pages */}
          <CommandGroup heading="Pages">
            {PAGES.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.title} ${item.subtitle}`}
                onSelect={() => handleSelect(item)}
                className="flex items-center gap-3"
              >
                {item.icon}
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  {item.subtitle && (
                    <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Subjects */}
          <CommandGroup heading="Matières">
            {SUBJECTS.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.title} ${item.subtitle}`}
                onSelect={() => handleSelect(item)}
                className="flex items-center gap-3"
              >
                {item.icon}
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  {item.subtitle && (
                    <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default GlobalSearch;
