/**
 * TranslateHeader Component
 * 
 * Simple header with back navigation and logo.
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

export function TranslateHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
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
        <ThemeToggle />
      </div>
    </header>
  );
}
