import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";
import { useAuth } from "./AuthContext";

export default function AuthHeader() {
  const { setActiveTab } = useAuth();
  
  return (
    <header className="auth-header sticky top-0 z-10 flex items-center justify-between px-2 sm:px-4 md:px-8 py-2 sm:py-4 bg-card border-b border-border">
      <Link to="/" className="auth-brand flex items-center gap-1.5 sm:gap-2.5">
        <img src={edupreneursLogo} alt="EDUPRENEURS" className="h-8 sm:h-10 w-auto object-contain" loading="eager" decoding="async" />
      </Link>
      <nav className="flex items-center gap-1.5 sm:gap-3">
        <Link to="/" className="auth-btn-outline text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
          Accueil
        </Link>
        <Button 
          onClick={() => setActiveTab("login")}
          className="auth-btn-primary text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-auto"
        >
          Se connecter
        </Button>
        <ThemeToggle />
      </nav>
    </header>
  );
}
