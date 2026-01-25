import { memo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, Rss } from "lucide-react";
import { navLinks } from "@/data/homePageData";
import edupreneursLogo from "@/assets/edupreneurs-new-logo.png";

/**
 * Sticky header with navigation.
 * Memoized to prevent re-renders on scroll.
 * 
 * Rules applied:
 * - No data fetching
 * - No scroll event listeners
 * - Only local state for menu toggle
 * - Mobile menu uses transform for GPU acceleration
 */
export const HeaderNav = memo(function HeaderNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border/50 shadow-sm transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 sm:gap-3">
          <img 
            src={edupreneursLogo} 
            alt="EDUPRENEURS Logo" 
            width={45}
            height={56}
            className="h-8 sm:h-12 w-auto object-contain" 
            loading="eager"
            fetchPriority="high"
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-5">
          {navLinks.map((link) => (
            <a 
              key={link.href}
              href={link.href} 
              className="text-foreground hover:text-primary transition-all duration-300 font-semibold hover:scale-105 relative group text-sm"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <Link 
            to="/blog" 
            className="text-foreground hover:text-primary transition-all duration-300 font-semibold hover:scale-105 relative group text-sm flex items-center gap-1"
          >
            <Rss className="h-3.5 w-3.5" />
            Blog
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
          <ThemeToggle />
          <Link to="/auth/login" className="hidden lg:inline-block">
            <Button 
              size="sm" 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105"
            >
              Se connecter
            </Button>
          </Link>
          <Link to="/auth/signup/step-1" className="hidden lg:inline-block">
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-accent to-yellow-500 hover:from-accent/90 hover:to-yellow-400 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Créer un compte
            </Button>
          </Link>
          <button 
            className="lg:hidden p-1.5 sm:p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Menu - Uses transform for GPU acceleration */}
      <div 
        className={`lg:hidden bg-card border-t border-border overflow-hidden transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col p-3 gap-2">
          {navLinks.map((link) => (
            <a 
              key={link.href}
              href={link.href} 
              className="py-2 px-3 hover:bg-muted rounded-md transition-colors text-sm" 
              onClick={closeMobileMenu}
            >
              {link.label}
            </a>
          ))}
          <Link 
            to="/blog" 
            className="py-2 px-3 hover:bg-muted rounded-md transition-colors text-sm flex items-center gap-2" 
            onClick={closeMobileMenu}
          >
            <Rss className="h-4 w-4" />
            Blog
          </Link>
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border">
            <Link to="/auth/login" onClick={closeMobileMenu}>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground text-sm"
              >
                Se connecter
              </Button>
            </Link>
            <Link to="/auth/signup/step-1" onClick={closeMobileMenu}>
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-accent to-yellow-500 hover:opacity-90 text-sm"
              >
                Créer un compte
              </Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
});

export default HeaderNav;
