import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, X, Sparkles, UserPlus, LogIn, Volume2, VolumeX } from "lucide-react";
import { useVisitor } from "@/contexts/VisitorContext";
import { useVisitorAnalytics } from "@/hooks/useVisitorAnalytics";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type CardPosition = "bottom-right" | "bottom-left" | "top-left" | "top-right";

interface TourStep {
  path: string;
  title: string;
  description: string;
  /** Optional CSS selector for smart card auto-positioning */
  target?: string;
  /** Override auto-detection and force a specific card position */
  forcePosition?: CardPosition;
}

// ─────────────────────────────────────────────
// Tour steps — 12 steps total
// ─────────────────────────────────────────────

const tourSteps: TourStep[] = [
  {
    path: "/dashboard",
    title: "Votre tableau de bord 📊",
    description: "Suivez votre progression, vos séries de jours d'étude et vos objectifs hebdomadaires. Tout est centralisé ici !",
  },
  {
    path: "/dashboard",
    title: "Musique d'étude 🎵",
    description: "Étudiez avec de la musique ! Cliquez sur ce bouton flottant pour ouvrir le lecteur et choisir votre playlist préférée. Gratuit pour tous les membres.",
    target: '[data-tour="music-fab"]',
    forcePosition: "top-left",
  },
  {
    path: "/dashboard",
    title: "Votre progression 📈",
    description: "Points Gold, leçons complétées, score et heures d'étude en temps réel. Chaque action sur la plateforme fait avancer votre progression.",
  },
  {
    path: "/matieres",
    title: "Toutes les matières 📚",
    description: "Accédez aux cours de maths, français, sciences et plus. Chaque leçon a des résumés clairs et des quiz interactifs !",
  },
  {
    path: "/feed",
    title: "Fil d'actualité 📱",
    description: "Connectez-vous avec d'autres étudiants, partagez vos succès et posez des questions à la communauté.",
  },
  {
    path: "/leaderboard",
    title: "Classement en temps réel 🏆",
    description: "Voyez les meilleurs apprenants et leur progression. Gagnez des pièces d'or en étudiant !",
  },
  {
    path: "/leaderboard",
    title: "Défis et récompenses 🥇",
    description: "Débloquez des badges en complétant des leçons et quiz. Les meilleurs élèves gagnent des récompenses exclusives chaque semaine.",
  },
  {
    path: "/passion-discovery",
    title: "Découverte des passions 🎨",
    description: "Explorez la musique, les arts, les échecs et la littérature avec des modules interactifs !",
  },
  {
    path: "/passion-discovery",
    title: "Apprentissage par la passion 🎯",
    description: "Choisissez ce qui vous passionne — musique, art, échecs, entrepreneuriat — et Jude créera un parcours d'apprentissage personnalisé autour de votre passion.",
  },
  {
    path: "/chess-game",
    title: "Jeux éducatifs ♟️",
    description: "Jouez aux échecs contre Jude, notre coach IA ! Améliorez votre logique et stratégie.",
  },
  {
    path: "/community",
    title: "Messages et communauté 💬",
    description: "Discutez en privé avec d'autres étudiants et formez des groupes d'étude pour réviser ensemble.",
  },
  {
    path: "/community",
    title: "Rejoignez la famille 🎓",
    description: "Rejoignez une communauté d'élèves haïtiens passionnés. Créez votre compte gratuit maintenant et commencez votre parcours d'apprentissage aujourd'hui !",
  },
];

// Pre-generated audio URLs for each tour step.
// Populated via admin operation — null entries mean no audio for that step.
const TOUR_STEP_AUDIO_URLS: (string | null)[] = [
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-0.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-1.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-2.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-3.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-4.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-5.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-6.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-7.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-8.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-9.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-10.mp3',
  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/lesson-audio/jude-voice/visitor-tour/step-11.mp3',
];

// ─────────────────────────────────────────────
// Eager preload map — fires immediately before navigate()
// Bypasses requestIdleCallback (never fires during active animations).
// Same pattern as FirstTimeUserTour to prevent React dispatcher null crash.
// ─────────────────────────────────────────────

const EAGER_PRELOAD: Record<string, () => Promise<unknown>> = {
  "/matieres":          () => import("@/pages/Matieres"),
  "/feed":              () => import("@/pages/Feed"),
  "/leaderboard":       () => import("@/pages/Leaderboard"),
  "/passion-discovery": () => import("@/pages/PassionDiscovery"),
  "/chess-game":        () => import("@/pages/ChessGame"),
  "/community":         () => import("@/pages/Community"),
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Resolve card position for a step: forced > target-detected > default bottom-right */
function resolveCardPosition(step: TourStep): CardPosition {
  if (step.forcePosition) return step.forcePosition;

  if (step.target) {
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const inBottomHalf = cy > window.innerHeight / 2;
      const inRightHalf  = cx > window.innerWidth  / 2;

      if (inBottomHalf && inRightHalf)  return "top-left";
      if (inBottomHalf && !inRightHalf) return "bottom-right";
    }
  }

  return "bottom-right";
}

/** Map a card position enum to its Tailwind positioning classes */
function cardPositionClass(pos: CardPosition): string {
  switch (pos) {
    case "bottom-right": return "fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:w-96";
    case "bottom-left":  return "fixed bottom-4 left-4 sm:left-4 sm:right-auto sm:bottom-4 sm:w-96";
    case "top-left":     return "fixed top-4 left-4 sm:left-4 sm:right-auto sm:top-4 sm:w-96";
    case "top-right":    return "fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:top-4 sm:w-96";
  }
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export const VisitorTour = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // STABILITY GUARD: Prevent null dispatcher errors during lazy load transitions
  const [isStable, setIsStable] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [ericImage, setEricImage] = useState<string | null>(null);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);
  const [cardPosition, setCardPosition] = useState<CardPosition>("bottom-right");
  // Voice narration — mute state synced with authenticated voice system
  const [isMuted, setIsMuted] = useState(() =>
    localStorage.getItem('jude-voice-muted') === 'true'
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    isVisitor,
    tourStep,
    tourActive,
    tourCompleted,
    nextTourStep,
    previousTourStep,
    skipTour,
    completeTour,
    exitVisitorMode,
  } = useVisitor();
  const { trackTourStep, trackTourSkip, trackTourComplete } = useVisitorAnalytics();
  const { setVolume, volume } = useMusicPlayer();
  const preDuckVolumeRef = useRef(100); // Stores music volume before ducking

  // Wait for React dispatcher to stabilize after lazy load
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsStable(true);
      });
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Lazy load the Eric image for 3G optimization
  useEffect(() => {
    import("@/assets/eric-student-desk.png").then((m) => setEricImage(m.default));
  }, []);

  // On-mount: deferred safety-net preload of all unique tour paths
  useEffect(() => {
    if (!isStable) return;
    const timer = setTimeout(() => {
      Object.values(EAGER_PRELOAD).forEach((fn) => fn().catch(() => {}));
    }, 1500);
    return () => clearTimeout(timer);
  }, [isStable]);

  const currentStep = tourSteps[tourStep];
  const isLastStep  = tourStep === tourSteps.length - 1;
  const progress    = ((tourStep + 1) / tourSteps.length) * 100;

  // Recompute card position whenever the step changes (after DOM settles)
  useEffect(() => {
    if (!isStable || !currentStep) return;
    const timer = setTimeout(() => {
      setCardPosition(resolveCardPosition(currentStep));
    }, 150);
    return () => clearTimeout(timer);
  }, [tourStep, isStable, currentStep]);

  // Navigate to the correct page for current step
  useEffect(() => {
    if (!isStable || !isVisitor || !tourActive || tourCompleted || !currentStep) return;
    if (isNavigating || location.pathname === currentStep.path) return;

    setIsNavigating(true);
    // Eager preload — fires immediately, no idle-callback delay
    EAGER_PRELOAD[currentStep.path]?.().catch(() => {});
    setTimeout(() => {
      navigate(currentStep.path);
      setTimeout(() => setIsNavigating(false), 800);
    }, 500);
  }, [tourStep, isVisitor, tourActive, tourCompleted, currentStep, location.pathname, navigate, isStable, isNavigating]);

  // Track tour step changes
  useEffect(() => {
    if (isStable && tourActive && currentStep) {
      trackTourStep(tourStep, currentStep.title);
    }
  }, [tourStep, tourActive, currentStep, trackTourStep, isStable]);

  // Play pre-generated audio when tour step changes
  useEffect(() => {
    if (!isStable || !tourActive || tourCompleted) return;

    // Stop previous step audio before anything else
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (isMuted) return;

    const url = TOUR_STEP_AUDIO_URLS[tourStep];
    if (!url) return;

    // Small delay to let page navigation settle before playing
    const timer = setTimeout(() => {
      const audio = new Audio(url);
      audio.volume = 0.90; // Match JudeAudioContext voice level
      audioRef.current = audio;
      // Duck background music while Jude speaks
      preDuckVolumeRef.current = volume;
      setVolume(10);
      audio.onended = () => {
        setVolume(preDuckVolumeRef.current); // Restore after clip ends
      };
      audio.play().catch(() => {
        setVolume(preDuckVolumeRef.current); // Restore on autoplay block
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [tourStep, isStable, tourActive, tourCompleted, isMuted]);

  // Stop audio and restore music volume on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setVolume(preDuckVolumeRef.current); // Ensure music restored on unmount
      }
    };
  }, [setVolume]);

  // Mute toggle — persists to localStorage, shared with authenticated voice system
  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('jude-voice-muted', String(next));
      // Stop audio immediately when muting and restore music volume
      if (next && audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setVolume(preDuckVolumeRef.current);
      }
      return next;
    });
  };

  // ── Early returns — ALL hooks must appear before this block ──
  if (!isStable) return null;

  // Completion screen is shown AFTER completeTour() sets tourCompleted=true,
  // so it must be checked before the tourCompleted guard below.
  if (showCompletionScreen) {
    const handleSignUp = () => {
      exitVisitorMode();
      navigate("/auth/signup/step-1");
    };
    const handleLogin = () => {
      exitVisitorMode();
      navigate("/auth/login");
    };

    return (
      <div className="fixed inset-0 z-[1005] flex items-center justify-center bg-gradient-to-br from-primary/20 to-background p-6">
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-5xl">🎉</div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Vous avez découvert Edupreneurs !
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Créez votre compte gratuit et commencez à apprendre dès aujourd'hui.
            </p>
          </div>
          <div className="space-y-3">
            <Button onClick={handleSignUp} className="w-full gap-2" size="lg">
              <UserPlus className="w-4 h-4" />
              Créer un compte
            </Button>
            <Button onClick={handleLogin} variant="outline" className="w-full gap-2" size="lg">
              <LogIn className="w-4 h-4" />
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isVisitor || !tourActive || tourCompleted || !currentStep) return null;

  const handleNext = () => {
    if (isLastStep) {
      trackTourComplete();
      completeTour();
      setShowCompletionScreen(true);
    } else {
      nextTourStep();
    }
  };

  const handleSkip = () => {
    trackTourSkip(tourStep);
    skipTour();
  };

  return (
    <div className={`${cardPositionClass(cardPosition)} z-[1004] animate-slide-up`}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">

        {/* Progress bar */}
        <div className="px-4 pt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Étape {tourStep + 1} sur {tourSteps.length}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-1 rounded hover:bg-muted transition-colors"
                aria-label={isMuted ? "Activer le son" : "Couper le son"}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Content */}
        <div className="p-4 flex gap-4">
          {/* Eric avatar — lazy loaded */}
          <div className="flex-shrink-0">
            {ericImage ? (
              <img
                src={ericImage}
                alt="Jude"
                className="w-20 h-20 object-contain drop-shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
            )}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground mb-1">{currentStep.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentStep.description}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex items-center justify-between gap-2">
          {/* Outline variant — clearly interactive (not ghost which looks disabled) */}
          <Button variant="outline" size="sm" onClick={handleSkip} className="text-muted-foreground">
            <X className="w-4 h-4 mr-1" />
            Passer
          </Button>

          <div className="flex items-center gap-2">
            {tourStep > 0 && (
              <Button variant="outline" size="sm" onClick={previousTourStep}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" onClick={handleNext} className="gap-1">
              {isLastStep ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Terminer
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
