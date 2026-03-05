import { memo, useRef, useEffect, useCallback, useState } from "react";
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

// ─── Effect 2: Letter-by-letter reveal variants ───
const letterContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.025 } }
};

const letterVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
};

/** Splits text into motion.span per character for staggered reveal */
function AnimatedLetters({ text, className }: { text: string; className?: string }) {
  return (
    <motion.span className={className} variants={letterContainerVariants} initial="hidden" animate="visible">
      {text.split("").map((char, i) => (
        <motion.span key={i} variants={letterVariants} style={{ display: "inline-block" }}>
          {/* Preserve spaces as non-breaking to maintain word spacing */}
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

/**
 * Effect 3: Animated counter with refined exponential easing.
 * Uses framer-motion's useMotionValue for smooth count-up on scroll.
 */
function AnimatedStatNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => `${Math.round(v)}${suffix}`);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      // Exponential ease for snappier acceleration, smooth deceleration
      animate(motionVal, value, { duration: 2, ease: [0.16, 1, 0.3, 1] });
    }
  }, [isInView, value, motionVal]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

// ─── Effect 1: Particle constellation canvas ───

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  color: string;
}

/** Creates particle array with random positions and velocities */
function createParticles(w: number, h: number, count: number): Particle[] {
  const colors = [
    "rgba(var(--particle-primary), 0.5)",
    "rgba(var(--particle-accent), 0.4)"
  ];
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    radius: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));
}

/**
 * Effect 1: Particle constellation background.
 * Renders 40 floating dots with lines between nearby particles.
 * Uses requestAnimationFrame for smooth 60fps loop.
 * Only mounts on desktop when shouldAnimate is true.
 */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /** Reads theme and builds particle array with theme-appropriate colors */
    const initParticles = () => {
      const isDark = document.documentElement.classList.contains("dark");
      // Hardcoded palettes — bright for dark bg, rich for light bg
      const colors = isDark
        ? ["#60a5fa", "#93c5fd", "#fb923c", "#fbbf24"]
        : ["#0d9488", "#f59e0b", "#7c3aed", "#0ea5e9"];

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      particlesRef.current = Array.from({ length: 40 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
    };

    initParticles();
    window.addEventListener("resize", initParticles);

    // Re-init particles when theme toggles so colors match new mode
    const observer = new MutationObserver(() => initParticles());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const draw = () => {
      const isDark = document.documentElement.classList.contains("dark");
      // Per-draw opacity lookup — lightweight boolean check each frame
      const particleAlpha = isDark ? 0.8 : 0.5;
      const lineAlpha = isDark ? 0.4 : 0.15;

      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      const particles = particlesRef.current;

      // Update positions with edge wrapping
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }

      // Draw constellation lines between nearby particles
      const maxDist = 100;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * lineAlpha;
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = particles[i].color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles as filled circles
      for (const p of particles) {
        ctx.globalAlpha = particleAlpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1; // Reset for next frame
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", initParticles);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}

/**
 * Critical above-the-fold hero section.
 * Desktop (lg+): particles + letter reveal + staggered entrance + image float + count-up stats.
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
      {/* Effect 1: Particle constellation — desktop only */}
      {shouldAnimate && <ParticleCanvas />}

      {/* Decorative background elements - CSS only, no JS */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto grid md:grid-cols-2 gap-4 xs:gap-6 sm:gap-8 lg:gap-10 items-center relative z-10">
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

          {/* Effect 2: Title — letter-by-letter on desktop, plain on mobile */}
          <MotionDiv {...(shouldAnimate ? { variants: itemVariants } : {})}>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
              {shouldAnimate ? (
                <>
                  <AnimatedLetters text="L'Éducation Haïtienne" className="text-foreground" />
                  <br />
                  <AnimatedLetters text="révolutionnée" className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent" />
                  <span className="text-foreground"> </span>
                  <AnimatedLetters text="par" className="text-foreground" />
                  <br />
                  <AnimatedLetters text="l'Intelligence Artificielle" className="text-foreground" />
                </>
              ) : (
                <>
                  <span className="text-foreground">L'Éducation Haïtienne</span>
                  <br />
                  <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                    révolutionnée
                  </span>
                  <span className="text-foreground"> par</span>
                  <br />
                  <span className="text-foreground">l'Intelligence Artificielle</span>
                </>
              )}
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

      {/* Stats Row — Effect 3: refined count-up easing on desktop, static on mobile */}
      <div className="container mx-auto mt-6 sm:mt-8 lg:mt-12 relative z-10">
        <div className="grid grid-cols-5 gap-2 sm:gap-4 max-w-3xl mx-auto">
          {heroStats.map((stat, idx) => (
            <div
              key={idx}
              className="text-center p-2 sm:p-3 lg:p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-sm"
            >
              {statsLoaded ? (
                <>
                  <div className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-black text-primary">
                    {/* Numeric stats get animated count-up with exponential ease on desktop */}
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
