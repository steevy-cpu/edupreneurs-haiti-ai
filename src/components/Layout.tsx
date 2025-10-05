import { useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  MessageSquare,
  Search,
} from "lucide-react";
import dashboardImage from "@/assets/dashboard00.png";
import { EricChatbot } from "@/components/EricChatbot";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);

  useEffect(() => {
    checkAuth();
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("message-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUnreadCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: unreadMessages } = await supabase
      .from("messages")
      .select("id, conversation_id")
      .eq("read", false)
      .neq("sender_id", user.id);

    if (unreadMessages) {
      setTotalUnreadMessages(unreadMessages.length);
    }
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && location.pathname !== "/auth") {
      navigate("/auth");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/auth");
  };

  const isActive = (path: string) => location.pathname === path;

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
          <a 
            href="/dashboard" 
            className={`flex items-center gap-3 px-5 py-3.5 mx-3 rounded-xl font-medium transition-all duration-300 ${
              isActive("/dashboard") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <Home size={18} />
            Dashboard
          </a>
          <a 
            href="/matieres" 
            className={`flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl font-medium transition-all duration-300 ${
              isActive("/matieres") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <BookOpen size={18} />
            Matières
          </a>
          <a 
            href="#" 
            className="flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl text-foreground font-medium hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1 transition-all duration-300"
          >
            <FolderOpen size={18} />
            Ressources
          </a>
          <a 
            href="/feed" 
            className={`flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl font-medium transition-all duration-300 ${
              isActive("/feed") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <Users size={18} />
            Fil d'actualité
          </a>
          <a 
            href="/community" 
            className={`flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl font-medium transition-all duration-300 ${
              isActive("/community") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <MessageSquare size={18} />
            Messages
            {totalUnreadMessages > 0 && (
              <span className="ml-auto flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">
                {totalUnreadMessages}
              </span>
            )}
          </a>
          <a 
            href="/user-search" 
            className={`flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl font-medium transition-all duration-300 ${
              isActive("/user-search") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <Search size={18} />
            Rechercher
          </a>
          <a 
            href="/affiliations" 
            className={`flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl font-medium transition-all duration-300 ${
              isActive("/affiliations") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
            <LinkIcon size={18} />
            Affiliations
          </a>
          <a 
            href="/settings" 
            className={`flex items-center gap-3 px-5 py-3.5 mx-3 my-1 rounded-xl font-medium transition-all duration-300 ${
              isActive("/settings") 
                ? "bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--success))] text-white" 
                : "text-foreground hover:bg-gradient-to-br hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--success))] hover:text-white hover:translate-x-1"
            }`}
          >
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
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-[280px]" : ""}`}>
        {children}
      </div>

      {/* Eric Chatbot */}
      <EricChatbot />
    </div>
  );
};
