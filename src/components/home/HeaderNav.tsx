import { memo, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, Rss, Heart } from "lucide-react";
import { navLinks } from "@/data/homePageData";
import { motion, useMotionValue, animate as fmAnimate } from "framer-motion";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";

/**
 * Effect 5: Magnetic button wrapper.
 * On mousemove, translates button slightly toward cursor.
 * On mouseleave, springs back to center.
 * Desktop only — children rendered as-is on mobile.
 */
function MagneticButton({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Offset toward cursor at 30% strength
    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.3;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.3;
    fmAnimate(x, dx, { duration: 0.2, ease: "easeOut" });
    fmAnimate(y, dy, { duration: 0.2, ease: "easeOut" });
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    // Spring back to origin
    fmAnimate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
    fmAnimate(y, 0, { type: "spring", stiffness: 300, damping: 20 });
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}

/**
 * Sticky header with navigation.
 * Memoized to prevent re-renders on scroll.
 * Effect 5: Magnetic CTA buttons on desktop.
 */
export const HeaderNav = memo(function HeaderNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { shouldAnimate } = useAnimationConfig();

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  /** Wraps element in MagneticButton on desktop, renders plain on mobile */
  const MagneticWrap = shouldAnimate ? MagneticButton : ({ children }: { children: React.ReactNode }) => <>{children}</>;

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border/50 shadow-sm transition-all duration-300 relative">
      <div className="container mx-auto px-4 sm:px-6 py-2 sm:py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 sm:gap-3">
          {/* PNG logo — WebP lost transparent background */}
          <img
            src="/images/edupreneurs-new-logo-128w.webp"
            srcSet="/images/edupreneurs-new-logo-64w.webp 64w, /images/edupreneurs-new-logo-128w.webp 128w, /images/edupreneurs-new-logo-256w.webp 256w"
            sizes="(max-width: 640px) 32px, 48px"
            alt="EDUPRENEURS Logo"
            width={45}
            height={56}
            className="h-8 sm:h-12 w-auto object-contain"
            loading="eager"
            fetchPriority="high"
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-5">
          {navLinks.map((link) => (
            <a 
              key={link.href}
              href={link.href} 
              className="text-foreground hover:text-primary transition-all duration-300 font-semibold hover:scale-105 relative group text-sm whitespace-nowrap"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <Link 
            to="/blog" 
            className="text-foreground hover:text-primary transition-all duration-300 font-semibold hover:scale-105 relative group text-sm flex items-center gap-1 whitespace-nowrap"
          >
            <Rss className="h-3.5 w-3.5 shrink-0" />
            Blog
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link 
            to="/donate" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all duration-300 font-semibold text-sm whitespace-nowrap"
          >
            <Heart className="h-3.5 w-3.5 shrink-0" />
            Faire un don
          </Link>
        </nav>

        {/* Actions — Effect 5: magnetic CTA buttons on desktop */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
          <ThemeToggle />
          <MagneticWrap>
            <Link to="/auth/login" className="hidden lg:inline-block">
              <Button 
                size="sm" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105"
              >
                Se connecter
              </Button>
            </Link>
          </MagneticWrap>
          <MagneticWrap>
            <Link to="/auth/signup/step-1" className="hidden lg:inline-block">
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-accent to-yellow-500 hover:from-accent/90 hover:to-yellow-400 text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Créer un compte
              </Button>
            </Link>
          </MagneticWrap>
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

      {/* Mobile/Tablet Menu - Absolute overlay to prevent content bleed-through */}
      <div 
        className={`lg:hidden absolute left-0 right-0 top-full bg-card border-t border-border shadow-lg overflow-hidden transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
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
          <Link 
            to="/donate" 
            className="py-2.5 px-3 bg-accent/10 border border-accent/30 text-accent rounded-lg transition-colors text-sm flex items-center gap-2 font-semibold" 
            onClick={closeMobileMenu}
          >
            <Heart className="h-4 w-4 shrink-0" />
            Faire un don
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
