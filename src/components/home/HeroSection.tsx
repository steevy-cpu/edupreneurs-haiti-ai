import { memo, useRef, useEffect } from "react";
import ericCelebrating from "@/assets/eric-celebrating.png";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Heart, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";

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

/** Staggered entrance for left column children */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

/** Fade-up for each child element */
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

/** Slide-in from right for hero image */
const imageVariants = {
  hidden: { opacity: 0, x: 60, scale: 0.95 },
  visible: {
    opacity: 1, x: 0, scale: 1,
    transition: { duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

/**
 * Animated counter for numeric stat values.
 * Uses framer-motion's useMotionValue for smooth count-up on scroll.
 */
function AnimatedStatNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => `${Math.round(v)}${suffix}`);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      // Animate from 0 to target value over 1.5s
      animate(motionVal, value, { duration: 1.5, ease: "easeOut" });
    }
  }, [isInView, value, motionVal]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

/**
 * Critical above-the-fold hero section.
 * Desktop (lg+): staggered entrance + image float + count-up stats.
 * Mobile/tablet: static render, no motion wrappers.
 */
export const HeroSection = memo(function HeroSection({
  stats,
  statsLoaded,
  onVisitorClick
}: HeroSectionProps) {
  const { shouldAnimate } = useAnimationConfig();

  const heroStats = [
    { number: `${stats.lessons}+`, label: "Leçons", raw: stats.lessons, isNumeric: true },
    { number: `${stats.exams}+`, label: "Examens", raw: stats.exams, isNumeric: true },
    { number: `${stats.users}+`, label: "Étudiants", raw: stats.users, isNumeric: true },
    { number: "24/7", label: "Assistant IA", raw: 0, isNumeric: false },
    { number: "7AF-NS4", label: "Niveaux", raw: 0, isNumeric: false }
  ];

  /* Motion wrappers — plain divs on mobile/tablet */
  const MotionDiv = shouldAnimate ? motion.div : "div" as any;

  return (
    <section
      id="accueil"
      className="relative pt-2 pb-6 xs:pt-2 xs:pb-8 sm:pt-3 sm:pb-12 md:pt-4 md:pb-16 lg:pt-4 lg:pb-20 px-2 xs:px-3 sm:px-4 bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden"
    >
      {/* Decorative background elements - CSS only, no JS */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto grid md:grid-cols-2 gap-4 xs:gap-6 sm:gap-8 lg:gap-10 items-center">
        {/* Left Content — staggered entrance on desktop */}
        <MotionDiv
          className="space-y-2 xs:space-y-3 sm:space-y-4 lg:space-y-6 z-10 px-2 xs:px-0"
          {...(shouldAnimate ? { variants: containerVariants, initial: "hidden", animate: "visible" } : {})}
        >
          {/* Badges Row */}
          <MotionDiv className="flex flex-wrap items-center gap-2" {...(shouldAnimate ? { variants: itemVariants } : {})}>
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary">
              <GraduationCap className="w-4 h-4" />
              <span>Pour les élèves de 7AF à NS4</span>
            </div>
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold text-accent hover:bg-accent/20 transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>Fait un don avec nous</span>
            </Link>
          </MotionDiv>

          {/* Title */}
          <MotionDiv {...(shouldAnimate ? { variants: itemVariants } : {})}>
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
          </MotionDiv>

          {/* Accent Subtitle */}
          <MotionDiv {...(shouldAnimate ? { variants: itemVariants } : {})}>
            <p className="text-sm sm:text-base md:text-lg text-accent font-semibold max-w-lg leading-relaxed">
              Plateforme d'éducation interactive en Haïti avec IA pour apprendre et réussir
            </p>
          </MotionDiv>

          {/* Description */}
          <MotionDiv {...(shouldAnimate ? { variants: itemVariants } : {})}>
            <p className="text-xs xs:text-sm sm:text-base text-muted-foreground max-w-lg font-medium leading-relaxed">
              Programme complet du MENFP avec assistant IA personnalisé. Apprenez à votre rythme,
              gagnez des récompenses, et préparez-vous aux examens officiels.
            </p>
          </MotionDiv>

          {/* Step Indicators */}
          <MotionDiv className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium" {...(shouldAnimate ? { variants: itemVariants } : {})}>
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
          </MotionDiv>

          {/* CTAs */}
          <MotionDiv className="flex flex-wrap gap-2 sm:gap-4 pt-1" {...(shouldAnimate ? { variants: itemVariants } : {})}>
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
          </MotionDiv>

          {/* Explorer Link */}
          <MotionDiv {...(shouldAnimate ? { variants: itemVariants } : {})}>
            <button
              onClick={onVisitorClick}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full border-2 border-primary/60 text-primary font-semibold text-sm hover:bg-primary/10 hover:border-primary transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
              Explorer sans inscription
            </button>
          </MotionDiv>
        </MotionDiv>

        {/* Right - Hero Image with slide-in + continuous float on desktop */}
        <MotionDiv
          className="relative flex justify-center items-center order-first md:order-last"
          {...(shouldAnimate ? { variants: imageVariants, initial: "hidden", animate: "visible" } : {})}
        >
          <motion.div
            className="relative z-10 w-[220px] h-[220px] xs:w-[280px] xs:h-[280px] sm:w-[340px] sm:h-[340px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]"
            /* Continuous gentle float — desktop only */
            animate={shouldAnimate ? { y: [0, -12, 0] } : {}}
            transition={shouldAnimate ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : {}}
          >
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
          </motion.div>
        </MotionDiv>
      </div>

      {/* Stats Row — count-up on desktop, static on mobile */}
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
                    {/* Numeric stats get animated count-up on desktop */}
                    {shouldAnimate && stat.isNumeric ? (
                      <><AnimatedStatNumber value={stat.raw} suffix="+" /></>
                    ) : (
                      stat.number
                    )}
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
