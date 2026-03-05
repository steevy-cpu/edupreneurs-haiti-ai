import { memo, useRef, useEffect, useCallback, useState } from "react";
import ericCelebrating from "@/assets/eric-celebrating.png";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Heart, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, useInView, useMotionValue, useTransform, useSpring, animate } from "framer-motion";
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

// ─── Effect 2: Word-by-word reveal variants ───
/** Each word fades up with a staggered delay based on index */
const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.08,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    }
  })
};

/** Splits text into motion.span per word — preserves natural line wrapping */
function AnimatedWords({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={wordVariants}
          initial="hidden"
          animate="visible"
          style={{ display: "inline-block", marginRight: "0.25em" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

// ─── Text scramble hook — hacker/decode effect, runs once on mount ───
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";

/** Progressively resolves text from random chars left-to-right */
function useTextScramble(finalText: string, shouldAnimate: boolean, delayMs = 500) {
  const [displayText, setDisplayText] = useState(shouldAnimate ? "" : finalText);

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayText(finalText);
      return;
    }

    let iteration = 0;
    const totalIterations = finalText.length * 3;
    let intervalId: ReturnType<typeof setInterval>;

    // Delay start so word-reveal plays first
    const timeout = setTimeout(() => {
      intervalId = setInterval(() => {
        setDisplayText(
          finalText
            .split("")
            .map((char, idx) => {
              if (char === " ") return " ";
              // Characters resolve left-to-right as iteration progresses
              if (idx < iteration / 3) return char;
              return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            })
            .join("")
        );

        iteration++;
        if (iteration >= totalIterations) {
          clearInterval(intervalId);
          setDisplayText(finalText);
        }
      }, 30);
    }, delayMs);

    return () => {
      clearTimeout(timeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [finalText, shouldAnimate, delayMs]);

  return displayText;
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
      animate(motionVal, value, { duration: 2, ease: [0.16, 1, 0.3, 1] });
    }
  }, [isInView, value, motionVal]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

// ─── Morphing blob SVG paths — 3 organic shapes for infinite morph loop ───
const BLOB_PATHS = [
  "M60,-67.8C75.1,-55.1,82.7,-34.1,83.2,-13.4C83.7,7.3,77.2,27.7,65.1,43.2C53,58.7,35.4,69.3,15.2,75.8C-5,82.3,-27.8,84.7,-47.1,77C-66.4,69.3,-82.2,51.5,-87.4,31.3C-92.6,11.1,-87.2,-11.5,-76.8,-30.8C-66.4,-50.1,-51,-66.1,-33.8,-77.2C-16.6,-88.3,2.4,-94.5,20.8,-90.2C39.2,-85.9,44.9,-80.5,60,-67.8Z",
  "M54.2,-60.3C68.1,-47.4,75.5,-28.2,76.8,-8.5C78.1,11.2,73.3,31.4,62.1,47.2C50.9,63,33.3,74.4,13.5,79.4C-6.3,84.4,-28.3,83,-46.8,73C-65.3,63,-80.3,44.4,-83.8,24C-87.3,3.6,-79.3,-18.6,-67.2,-36.8C-55.1,-55,-38.9,-69.2,-21.1,-75.8C-3.3,-82.4,16.1,-81.4,33.2,-75.5C50.3,-69.6,40.3,-73.2,54.2,-60.3Z",
  "M47.6,-55.6C60.2,-43.8,68,-27.4,71.2,-9.4C74.4,8.6,73,28.2,63.6,43.2C54.2,58.2,36.8,68.6,17.5,74.8C-1.8,81,-23,83,-40.8,75.8C-58.6,68.6,-73,52.2,-79.2,33.2C-85.4,14.2,-83.4,-7.4,-74.8,-25.2C-66.2,-43,-51,-57,-34.8,-67.8C-18.6,-78.6,0.4,-86.2,18.2,-83.4C36,-80.6,35,-67.4,47.6,-55.6Z"
];

/** Morphing SVG blob — animates d path infinitely with theme-aware gradient */
function MorphingBlob({
  className,
  duration,
  gradientId,
  fromColor,
  toColor,
}: {
  className: string;
  duration: number;
  gradientId: string;
  fromColor: string;
  toColor: string;
}) {
  return (
    <motion.svg
      viewBox="-100 -100 200 200"
      className={className}
      aria-hidden="true"
    >
      <motion.path
        fill={`url(#${gradientId})`}
        animate={{
          d: [BLOB_PATHS[0], BLOB_PATHS[1], BLOB_PATHS[2], BLOB_PATHS[0]]
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={fromColor} />
          <stop offset="100%" stopColor={toColor} />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

// ─── Particle constellation canvas ───

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  color: string;
}

/**
 * Particle constellation background.
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
      const particleAlpha = isDark ? 0.8 : 0.5;
      const lineAlpha = isDark ? 0.4 : 0.15;

      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      const particles = particlesRef.current;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }

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

      for (const p of particles) {
        ctx.globalAlpha = particleAlpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
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
 * Desktop (lg+): particles + word reveal + text scramble + mouse parallax + morphing blobs + count-up stats.
 * Mobile/tablet: static render, no motion wrappers.
 */
export const HeroSection = memo(function HeroSection({
  stats,
  statsLoaded,
  onVisitorClick
}: HeroSectionProps) {
  const { shouldAnimate } = useAnimationConfig();

  // ─── Effect 1: Mouse parallax on Eric image ───
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 50, damping: 20, mass: 0.5 };
  // Transform normalized [-1,1] mouse position to pixel offset, smoothed by spring
  const ericX = useSpring(useTransform(mouseX, [-1, 1], [-20, 20]), springConfig);
  const ericY = useSpring(useTransform(mouseY, [-1, 1], [-15, 15]), springConfig);

  /** Normalizes cursor position relative to hero section center */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!shouldAnimate) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) / (rect.width / 2));
    mouseY.set((e.clientY - centerY) / (rect.height / 2));
  }, [shouldAnimate, mouseX, mouseY]);

  /** Resets parallax to center on mouse leave */
  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  // ─── Effect 2: Text scramble — runs once with 500ms delay ───
  const scrambleLine1 = useTextScramble("L'Éducation Haïtienne", shouldAnimate, 500);
  const scrambleLine2 = useTextScramble("par", shouldAnimate, 500);
  const scrambleLine3 = useTextScramble("l'Intelligence Artificielle", shouldAnimate, 500);

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
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Particle constellation — desktop only */}
      {shouldAnimate && <ParticleCanvas />}

      {/* Effect 3: Morphing blob backgrounds — desktop only; static fallback for mobile */}
      {shouldAnimate ? (
        <>
          <MorphingBlob
            className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 pointer-events-none z-0"
            duration={12}
            gradientId="blobGradientPrimary"
            fromColor="hsl(var(--primary))"
            toColor="hsl(var(--accent))"
          />
          <MorphingBlob
            className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-[0.15] pointer-events-none z-0"
            duration={16}
            gradientId="blobGradientAccent"
            fromColor="hsl(var(--accent))"
            toColor="hsl(var(--primary))"
          />
        </>
      ) : (
        <>
          {/* Static blur circles for mobile/tablet fallback */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />
        </>
      )}

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

          {/* Title — word-by-word reveal + text scramble overlay on desktop, plain on mobile */}
          <MotionDiv {...(shouldAnimate ? { variants: itemVariants } : {})}>
            <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
              {shouldAnimate ? (
                <>
                  {/* Scramble text shown as aria-hidden overlay; AnimatedWords handles visual reveal */}
                  <span className="text-foreground" aria-hidden="true">{scrambleLine1}</span>
                  <br />
                  <AnimatedWords text="révolutionnée" className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent" />
                  <span className="text-foreground"> </span>
                  <span className="text-foreground" aria-hidden="true">{scrambleLine2}</span>
                  <br />
                  <span className="text-foreground" aria-hidden="true">{scrambleLine3}</span>
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

        {/* Right - Hero Image: slide-in + float + mouse parallax on desktop */}
        <MotionDiv
          className="relative flex justify-center items-center order-first md:order-last"
          {...(shouldAnimate ? { variants: imageVariants, initial: "hidden", animate: "visible" } : {})}
        >
          <motion.div
            className="relative z-10 w-[220px] h-[220px] xs:w-[280px] xs:h-[280px] sm:w-[340px] sm:h-[340px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]"
            /* Continuous gentle float — desktop only */
            animate={shouldAnimate ? { y: [0, -12, 0] } : {}}
            transition={shouldAnimate ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : {}}
            /* Effect 1: Parallax offset — additive with float via style.x/y */
            style={shouldAnimate ? { x: ericX, y: ericY } : {}}
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

      {/* Stats Row — count-up easing on desktop, static on mobile */}
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
