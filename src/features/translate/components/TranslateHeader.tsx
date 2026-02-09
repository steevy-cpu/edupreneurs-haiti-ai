/**
 * TranslateHeader Component
 * 
 * Simple header with back navigation, logo, and auth-aware CTA buttons.
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSessionAuth } from "@/contexts/SessionAuthContext";

export function TranslateHeader() {
  const { isAuthenticated, isLoading } = useSessionAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left side - back + logo */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/" aria-label="Retour à l'accueil">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg hidden sm:inline">Traducteur</span>
          </div>
        </div>
        
        {/* Right side - auth buttons + theme toggle */}
        <div className="flex items-center gap-2">
          {!isLoading && !isAuthenticated && (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/auth/login">Connexion</Link>
              </Button>
              <Button 
                size="sm" 
                asChild 
                className="hover:scale-[1.02] transition-transform ease-out"
              >
                <Link to="/auth/signup/step-1">
                  <span className="hidden sm:inline">S'inscrire</span>
                  <span className="sm:hidden">Rejoindre</span>
                </Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
