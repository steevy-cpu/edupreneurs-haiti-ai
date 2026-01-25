import { memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Rss, Bot } from "lucide-react";
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
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[size:200%_100%]">
              L'Éducation Haïtienne
            </span>
            <br />
            <span className="text-foreground">
              Révolutionnée par l'IA
            </span>
          </h1>
          
          <p className="text-xs xs:text-sm sm:text-base text-muted-foreground max-w-lg font-medium leading-relaxed">
            Programme MENFP complet de la 7AF à NS4. Assistant IA personnel 24h/7j. 
            Seulement 200 gourdes par mois avec 1 semaine d'essai gratuite.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-wrap gap-2 sm:gap-4 pt-1">
            <Link to="/auth?tab=signup">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:to-primary/90 shadow-lg hover:shadow-xl font-bold transition-all duration-300 ease-out hover:scale-[1.02] text-xs sm:text-sm px-3 sm:px-4 md:px-6"
              >
                <span className="hidden sm:inline">Essai gratuit 7 jours</span>
                <span className="sm:hidden">Essai gratuit</span>
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary/5 font-semibold text-xs sm:text-sm px-3 sm:px-4 md:px-6 transition-all duration-300 ease-out hover:scale-[1.02]"
              onClick={onVisitorClick}
            >
              <span className="hidden sm:inline">Explorer sans inscription</span>
              <span className="sm:hidden">Explorer</span>
            </Button>
          </div>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 pt-2 text-xs">
            <span className="px-3 py-1 bg-muted rounded-full font-medium flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-primary" />
              Assistant IA Jude
            </span>
            <span className="px-3 py-1 bg-muted rounded-full font-medium">
              Programme MENFP
            </span>
            <span className="px-3 py-1 bg-muted rounded-full font-medium">
              Quiz interactifs
            </span>
          </div>
        </div>

        {/* Right - Hero Image */}
        <div className="relative flex justify-center items-center order-first md:order-last">
          <div className="relative z-10 w-[180px] h-[180px] xs:w-[220px] xs:h-[220px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] lg:w-[400px] lg:h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-2xl opacity-40" />
            <img
              src={ericCelebrating}
              alt="Eric célébrant - Mascotte EDUPRENEURS"
              width={400}
              height={400}
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
