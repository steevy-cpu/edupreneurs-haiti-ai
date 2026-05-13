/**
 * AuthHeader - Static header for auth pages
 * Reused from existing implementation
 */

import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const edupreneursLogo = "/images/edupreneurs-new-logo-128w.webp";

export default function AuthHeader() {
  const navigate = useNavigate();
  
  return (
    <header className="auth-header sticky top-0 z-10 flex items-center justify-between px-2 sm:px-4 md:px-8 py-2 sm:py-4 bg-card border-b border-border">
      <Link to="/" className="auth-brand flex items-center gap-1.5 sm:gap-2.5">
        <img
          src={edupreneursLogo}
          srcSet="/images/edupreneurs-new-logo-64w.webp 64w, /images/edupreneurs-new-logo-128w.webp 128w"
          sizes="(max-width: 640px) 32px, 40px"
          alt="EDUPRENEURS"
          className="h-8 sm:h-10 w-auto object-contain"
          loading="eager"
          decoding="async"
        />
      </Link>
      <nav className="flex items-center gap-1.5 sm:gap-3">
        <Link to="/" className="auth-btn-outline text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2">
          Accueil
        </Link>
        <Button 
          onClick={() => navigate('/auth/login')}
          className="auth-btn-primary text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-auto"
        >
          Se connecter
        </Button>
        <ThemeToggle />
      </nav>
    </header>
  );
}
