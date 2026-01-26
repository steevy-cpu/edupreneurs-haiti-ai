import { memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Rss } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ericCelebrating from "@/assets/eric-celebrating.png";

interface HeroStats {
  lessons: number;
  exams: number;
  users: number;
}

interface HeroSectionProps {
  stats: HeroStats;
  statsLoaded: boolean;
  onVisitorClick: () => void;
}

/**
 * Critical above-the-fold hero section.
 * Optimized for immediate render with skeleton-first stats.
 * 
 * Performance rules:
 * - Hero image: eager loaded with high priority
 * - Stats show skeleton immediately, real values when ready
 * - No JS-driven animations on initial render
 * - CTA buttons prefetch signup route
 */
export const HeroSection = memo(function HeroSection({
  stats,
  statsLoaded,
  onVisitorClick
}: HeroSectionProps) {
  const heroStats = [
    { number: `${stats.lessons}+`, label: "Leçons" },
    { number: `${stats.exams}+`, label: "Examens" },
    { number: `${stats.users}+`, label: "Étudiants" },
    { number: "24/7", label: "Assistant IA" },
    { number: "7AF-NS4", label: "Niveaux" }
  ];

  return (
    <section 
      id="accueil" 
      className="relative pt-2 pb-6 xs:pt-2 xs:pb-8 sm:pt-3 sm:pb-12 md:pt-4 md:pb-16 lg:pt-4 lg:pb-20 px-2 xs:px-3 sm:px-4 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden"
    >
      {/* Decorative background elements - CSS only, no JS */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
      
      <div className="container mx-auto grid md:grid-cols-2 gap-4 xs:gap-6 sm:gap-8 lg:gap-10 items-center">
        {/* Left Content */}
        <div className="space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6 z-10 px-2 xs:px-0 animate-fade-in">
          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Target Audience Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary">
              <GraduationCap className="w-4 h-4" />
              <span>Pour les élèves de 7AF à NS4</span>
            </div>
            {/* Blog Badge */}
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-accent hover:bg-accent/20 transition-colors"
            >
              <Rss className="w-4 h-4" />
              <span>Nouveau: Blog</span>
            </Link>
          </div>
          
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
            <span className="text-foreground">L'Éducation Haïtienne</span>
            <br />
            <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
              révolutionnée
            </span>
            <span className="text-foreground"> par</span>
            <br />
            <span className="text-foreground">l'Intelligence Artificielle</span>
          </h1>
          
          {/* Accent Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-accent font-semibold max-w-lg leading-relaxed">
            Plateforme d'éducation interactive en Haïti avec IA pour apprendre et réussir
          </p>
          
          {/* Description */}
          <p className="text-xs xs:text-sm sm:text-base text-muted-foreground max-w-lg font-medium leading-relaxed">
            Programme complet du MENFP avec assistant IA personnalisé. Apprenez à votre rythme, 
            gagnez des récompenses, et préparez-vous aux examens officiels.
          </p>
          
          {/* Step Indicators */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">1</span>
              <span className="text-foreground">Inscrivez-vous</span>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">2</span>
              <span className="text-foreground">Choisissez votre niveau</span>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">3</span>
              <span className="text-foreground">Apprenez avec Jude</span>
            </div>
          </div>
          
          {/* CTAs */}
          <div className="flex flex-wrap gap-2 sm:gap-4 pt-1">
            <Link to="/auth/signup/step-1">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:to-primary/90 shadow-lg hover:shadow-xl font-bold transition-all duration-300 ease-out hover:scale-[1.02] text-xs sm:text-sm px-4 sm:px-6 md:px-8"
              >
                Créer un compte
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-xs sm:text-sm px-4 sm:px-6 md:px-8 transition-all duration-300 ease-out hover:scale-[1.02]"
              >
                Se connecter
              </Button>
            </Link>
          </div>
          
          {/* Explorer Link */}
          <button 
            onClick={onVisitorClick}
            className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4 transition-colors font-medium"
          >
            Explorer sans inscription
          </button>
        </div>

        {/* Right - Hero Image */}
        <div className="relative flex justify-center items-center order-first md:order-last">
          <div className="relative z-10 w-[220px] h-[220px] xs:w-[280px] xs:h-[280px] sm:w-[340px] sm:h-[340px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-2xl opacity-40" />
            <img
              src={ericCelebrating}
              alt="Eric célébrant - Mascotte EDUPRENEURS"
              width={500}
              height={500}
              className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
              loading="eager"
              fetchPriority="high"
              decoding="sync"
            />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="container mx-auto mt-6 sm:mt-8 lg:mt-12">
        <div className="grid grid-cols-5 gap-2 sm:gap-4 max-w-3xl mx-auto">
          {heroStats.map((stat, idx) => (
            <div 
              key={idx}
              className="text-center p-2 sm:p-3 lg:p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-sm"
            >
              {statsLoaded ? (
                <>
                  <div className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-black text-primary">
                    {stat.number}
                  </div>
                  <div className="text-[9px] xs:text-[10px] sm:text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </>
              ) : (
                <>
                  <Skeleton className="h-5 sm:h-6 lg:h-7 w-12 sm:w-16 mx-auto mb-1" />
                  <Skeleton className="h-3 sm:h-4 w-10 sm:w-12 mx-auto" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default HeroSection;
