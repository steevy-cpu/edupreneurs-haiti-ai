/**
 * AuthLayout - Visual wrapper for auth routes with conditional animations
 * 
 * Effects 1-3: Morphing blobs, particle canvas, form card spring entrance
 * All gated by shouldAnimate (lg+, no reduced motion, no 3G)
 */

import { Outlet, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { lazy, Suspense, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AuthRouteGuard } from "../guards/AuthRouteGuard";
import AuthHeader from "./AuthHeader";
import AuthSidebar from "./AuthSidebar";
import { VisitorBanner, VisitorTypeSelector } from "@/components/visitor";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";

// Lazy load the visitor selector (portal)
const VisitorSelectorPortal = lazy(() => 
  import("@/components/visitor").then(m => ({ default: m.VisitorTypeSelector }))
);

// ─── Morphing blob SVG paths — reused from HeroSection for visual consistency ───
const BLOB_PATHS = [
  "M60,-67.8C75.1,-55.1,82.7,-34.1,83.2,-13.4C83.7,7.3,77.2,27.7,65.1,43.2C53,58.7,35.4,69.3,15.2,75.8C-5,82.3,-27.8,84.7,-47.1,77C-66.4,69.3,-82.2,51.5,-87.4,31.3C-92.6,11.1,-87.2,-11.5,-76.8,-30.8C-66.4,-50.1,-51,-66.1,-33.8,-77.2C-16.6,-88.3,2.4,-94.5,20.8,-90.2C39.2,-85.9,44.9,-80.5,60,-67.8Z",
  "M54.2,-60.3C68.1,-47.4,75.5,-28.2,76.8,-8.5C78.1,11.2,73.3,31.4,62.1,47.2C50.9,63,33.3,74.4,13.5,79.4C-6.3,84.4,-28.3,83,-46.8,73C-65.3,63,-80.3,44.4,-83.8,24C-87.3,3.6,-79.3,-18.6,-67.2,-36.8C-55.1,-55,-38.9,-69.2,-21.1,-75.8C-3.3,-82.4,16.1,-81.4,33.2,-75.5C50.3,-69.6,40.3,-73.2,54.2,-60.3Z",
  "M47.6,-55.6C60.2,-43.8,68,-27.4,71.2,-9.4C74.4,8.6,73,28.2,63.6,43.2C54.2,58.2,36.8,68.6,17.5,74.8C-1.8,81,-23,83,-40.8,75.8C-58.6,68.6,-73,52.2,-79.2,33.2C-85.4,14.2,-83.4,-7.4,-74.8,-25.2C-66.2,-43,-51,-57,-34.8,-67.8C-18.6,-78.6,0.4,-86.2,18.2,-83.4C36,-80.6,35,-67.4,47.6,-55.6Z"
];

/** Effect 1 — Morphing SVG blob with theme-aware gradient */
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

/** Effect 2 — Particle constellation canvas (20 particles, half of hero density) */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number; radius: number; color: string;
  }>>([]);

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Theme-aware color palettes — same as HeroSection
    const isDark = document.documentElement.classList.contains("dark");
    const colors = isDark
      ? ["#3b82f6", "#60a5fa", "#f97316", "#fb923c"]
      : ["#0d9488", "#f59e0b", "#7c3aed", "#0ea5e9"];

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // 20 particles — less dense than hero for cleaner form focus
    particlesRef.current = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

      // Constellation lines between nearby particles
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
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-20 w-full h-full"
      aria-hidden="true"
    />
  );
}

/** Effect 3 — Form card spring entrance variants */
const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 20,
      delay: 0.2
    }
  }
};

// Auth form skeleton for loading state
function AuthFormSkeleton() {
  return (
    <div className="space-y-4 p-2">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full mt-6" />
    </div>
  );
}

interface AuthLayoutProps {
  showVisitorSelector?: boolean;
  onVisitorSelectorChange?: (open: boolean) => void;
}

export function AuthLayout({ showVisitorSelector = false, onVisitorSelectorChange }: AuthLayoutProps) {
  const location = useLocation();
  const { shouldAnimate } = useAnimationConfig();
  
  // Conditional tag — motion.section for animated entrance, plain section otherwise
  const CardWrapper = shouldAnimate ? motion.section : "section";

  return (
    <>
      <Helmet>
        <title>Connexion & Inscription - EDUPRENEURS | Plateforme éducative haïtienne</title>
        <meta name="description" content="Connectez-vous ou créez un compte sur EDUPRENEURS. Plateforme d'apprentissage personnalisé alignée au programme MENFP avec assistance IA." />
        <meta name="keywords" content="connexion, inscription, EDUPRENEURS, éducation Haïti, MENFP, apprentissage en ligne" />
        <meta property="og:title" content="Connexion & Inscription - EDUPRENEURS" />
        <meta property="og:description" content="Rejoignez la plateforme éducative haïtienne avec assistance IA personnalisée." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`${window.location.origin}${location.pathname}`} />
      </Helmet>
      
      <AuthRouteGuard>
        <VisitorBanner />
        <div className="auth-page min-h-screen bg-background relative">
          {/* Effect 1 — Morphing blobs (desktop only) */}
          {shouldAnimate && (
            <>
              <MorphingBlob
                className="fixed top-[-10%] right-[-5%] w-[500px] pointer-events-none z-0 opacity-[0.08]"
                duration={14}
                gradientId="auth-blob-1"
                fromColor="hsl(var(--primary))"
                toColor="hsl(var(--accent))"
              />
              <MorphingBlob
                className="fixed bottom-[-10%] left-[-5%] w-[350px] pointer-events-none z-0 opacity-[0.10]"
                duration={10}
                gradientId="auth-blob-2"
                fromColor="hsl(var(--accent))"
                toColor="hsl(var(--primary))"
              />
            </>
          )}

          {/* Effect 2 — Particle constellation canvas (desktop only) */}
          {shouldAnimate && <ParticleCanvas />}

          <AuthHeader />

          {/* Main Content — z-10 to sit above blobs/particles */}
          <div className="auth-wrap min-h-[calc(100vh-65px)] grid place-items-center p-4 md:p-8 relative z-10">
            <div className="auth-container flex flex-col items-center gap-8 w-full max-w-[1000px]">
              <div className="auth-grid grid md:grid-cols-[1fr_1.2fr] gap-6 md:gap-8 w-full">
                <AuthSidebar />

                {/* Effect 3 — Auth card with spring entrance on desktop */}
                <CardWrapper
                  className="auth-panel auth-card bg-card border border-border rounded-2xl shadow-lg overflow-hidden order-1 md:order-2"
                  {...(shouldAnimate ? {
                    variants: cardVariants,
                    initial: "hidden",
                    animate: "visible",
                  } : {})}
                >
                  <Suspense fallback={<AuthFormSkeleton />}>
                    <Outlet />
                  </Suspense>
                </CardWrapper>
              </div>
            </div>
          </div>

          {/* Visitor Type Selector Modal */}
          <Suspense fallback={null}>
            <VisitorTypeSelector 
              open={showVisitorSelector} 
              onOpenChange={onVisitorSelectorChange || (() => {})} 
            />
          </Suspense>
        </div>
      </AuthRouteGuard>
    </>
  );
}

export default AuthLayout;
export { AuthFormSkeleton };
