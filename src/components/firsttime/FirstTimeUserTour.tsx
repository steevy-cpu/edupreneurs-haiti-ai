import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, X, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useFirstTimeUser } from "@/contexts/FirstTimeUserContext";
import ericStudentDesk from "@/assets/eric-student-desk.png";
import ericCelebrating from "@/assets/eric-celebrating.png";
import SimpleTypewriter from "@/components/visitor/SimpleTypewriter";
import { useNetworkAwareAnimations } from "@/hooks/useNetworkAwareAnimations";
import { useRoutePreloader } from "@/shell/hooks/useRoutePreloader";
import { preloadImage } from "@/utils/performanceOptimization";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useJudeAudio } from '@/contexts/JudeAudioContext';
import { supabase } from '@/integrations/supabase/client';

interface TourStep {
  path: string;
  title: string;
  description: string;
  target?: string;
}

const tourSteps: TourStep[] = [
  {
    path: "/dashboard",
    title: "Votre tableau de bord 📊",
    description: "Suivez votre progression, vos pièces d'or gagnées et vos statistiques d'apprentissage. Tout est centralisé ici!",
    target: "[data-tour='kpi-cards']",
  },
  {
    path: "/dashboard",
    title: "Musique d'étude 🎵",
    description: "Tu peux écouter de la musique pendant que tu étudies! 🎵 Clique sur ce bouton pour ouvrir le lecteur et choisir ta playlist préférée.",
    target: "[data-tour='music-fab']",
  },
  {
    path: "/matieres",
    title: "Vos matières 📚",
    description: "Accédez aux cours de votre niveau. Chaque leçon a des résumés clairs, des exercices et des quiz interactifs!",
    target: "[data-tour='subject-grid']",
  },
  {
    path: "/feed",
    title: "Fil d'actualité 📱",
    description: "Partagez vos succès, posez des questions et connectez-vous avec d'autres étudiants de la communauté!",
    target: "[data-tour='feed-content']",
  },
  {
    path: "/leaderboard",
    title: "Classement 🏆",
    description: "Voyez les meilleurs apprenants et leur progression. Gagnez des pièces d'or en étudiant et montez dans le classement!",
    target: "[data-tour='leaderboard-list']",
  },
  {
    path: "/passion-discovery",
    title: "Découverte des passions 🎨",
    description: "Explorez la musique, les arts, les échecs et le développement personnel avec des modules interactifs!",
    target: "[data-tour='passion-categories']",
  },
  {
    path: "/community",
    title: "Messages 💬",
    description: "Discutez en privé avec d'autres étudiants et formez des groupes d'étude pour réviser ensemble!",
    target: "[data-tour='community-list']",
  },
  {
    path: "/settings",
    title: "Votre profil ⚙️",
    description: "Personnalisez votre compte, changez votre avatar et gérez vos préférences. C'est votre espace!",
    target: "[data-tour='settings-content']",
  },
];

/** Clean text versions of each tour step for TTS — no emojis, natural speech */
const TOUR_VOICE_TEXTS: string[] = [
  "Votre tableau de bord. Suivez votre progression, vos pièces d'or gagnées et vos statistiques d'apprentissage.",
  "Musique d'étude. Tu peux écouter de la musique pendant que tu étudies.",
  "Vos matières. Accédez aux cours de votre niveau. Chaque leçon a des résumés clairs, des exercices et des quiz interactifs!",
  "Fil d'actualité. Partagez vos succès, posez des questions et connectez-vous avec d'autres étudiants.",
  "Classement. Voyez les meilleurs apprenants et leur progression. Gagnez des pièces d'or en étudiant!",
  "Découverte des passions. Explorez la musique, les arts, les échecs et le développement personnel.",
  "Messages. Discutez en privé avec d'autres étudiants et formez des groupes d'étude.",
  "Votre profil. Personnalisez votre compte, changez votre avatar et gérez vos préférences.",
];

/** Spotlight rect state */
interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const FirstTimeUserTour = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // STABILITY GUARD: Use safe context access pattern to prevent null dispatcher errors
  const firstTimeUser = useFirstTimeUser();
  const { shouldShowGlow, shouldAnimate } = useNetworkAwareAnimations();
  const { preloadChunk } = useRoutePreloader();
  
  // Track mount stability to prevent errors during navigation transitions
  const [isStable, setIsStable] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [typewriterKey, setTypewriterKey] = useState(0);
  // 3C: typewriter skip signal
  const [skipTyping, setSkipTyping] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  // 3B: spotlight
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  // 3D: celebration overlay
  const [showCelebration, setShowCelebration] = useState(false);
  /** FIX 7: dynamic typing speed — syncs typewriter with voice clip duration */
  const [typingSpeed, setTypingSpeed] = useState(50);
  const [isSpeedReady, setIsSpeedReady] = useState(false);
  const speedTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const fetchGenRef = useRef(0);

  // Voice — fire-and-forget TTS per tour step
  const { speak, stop } = useJudeAudio();
  // Ref-stable speak/stop to avoid stale closures in the voice useEffect
  const speakRef = useRef(speak);
  const stopRef = useRef(stop);
  useEffect(() => { speakRef.current = speak; }, [speak]);
  useEffect(() => { stopRef.current = stop; }, [stop]);
  const [isMuted, setIsMuted] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('jude-voice-muted') === 'true'
  );
  
  // Wait one render cycle for React dispatcher to stabilize after lazy load
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsStable(true);
      });
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Preload all lazy chunks for tour routes on mount (idle, non-blocking safety net)
  useEffect(() => {
    const uniquePaths = [...new Set(tourSteps.map(s => s.path))];
    const timer = setTimeout(() => {
      uniquePaths.forEach(path => preloadChunk(path));
    }, 1500); // defer 1.5s so page initial render completes first
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Preload Eric images on mount
  useEffect(() => {
    preloadImage(ericStudentDesk).catch(() => {});
    preloadImage(ericCelebrating).catch(() => {});
  }, []);

  // EAGER_PRELOAD: Direct dynamic imports that fire immediately (bypass requestIdleCallback).
  // During the tour, the browser is never idle (animations + typewriter running), so
  // preloadChunk()'s requestIdleCallback would delay until AFTER navigate() fires.
  // These imports start the network request synchronously the moment a step change occurs.
  const EAGER_PRELOAD: Record<string, () => Promise<unknown>> = {
    '/matieres':          () => import('@/pages/Matieres'),
    '/feed':              () => import('@/pages/Feed'),
    '/leaderboard':       () => import('@/pages/Leaderboard'),
    '/passion-discovery': () => import('@/pages/PassionDiscovery'),
    '/community':         () => import('@/pages/Community'),
    '/settings':          () => import('@/pages/Settings'),
  };

  const currentStep = tourSteps[firstTimeUser.tourStep];
  const isLastStep = firstTimeUser.tourStep === tourSteps.length - 1;
  const progress = ((firstTimeUser.tourStep + 1) / tourSteps.length) * 100;

  // Navigate to the correct page for current step
  useEffect(() => {
    if (!firstTimeUser.tourActive || firstTimeUser.tourCompleted || !currentStep) return;

    if (!isNavigating && location.pathname !== currentStep.path) {
      setIsNavigating(true);
      
      // Fire eager import immediately — no idle callback delay.
      // This starts the chunk fetch NOW, giving 500ms of network head-start
      // before React tries to mount and call hooks in the new page component.
      EAGER_PRELOAD[currentStep.path]?.().catch(() => {});
      
      setTimeout(() => {
        navigate(currentStep.path);
        setTimeout(() => setIsNavigating(false), 800);
      }, 500); // 500ms head-start — enough for chunk to resolve on fast connections
    }
  }, [firstTimeUser.tourStep, firstTimeUser.tourActive, firstTimeUser.tourCompleted, currentStep, location.pathname, navigate, isNavigating]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset typewriter + skip state + speed readiness when step changes
  useEffect(() => {
    setTypewriterKey(prev => prev + 1);
    setSkipTyping(false);
    setIsTypingComplete(false);
    setSpotlightRect(null);
    // FIX 7: reset speed for new step
    setIsSpeedReady(false);
    setTypingSpeed(50);
  }, [firstTimeUser.tourStep]);

  // 3B: Spotlight — compute target element bounding rect
  const computeSpotlight = useCallback(() => {
    if (!currentStep?.target) {
      setSpotlightRect(null);
      return;
    }
    const el = document.querySelector(currentStep.target);
    if (!el) {
      setSpotlightRect(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setSpotlightRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, [currentStep]);

  // Recompute spotlight after navigation settles + on resize
  useEffect(() => {
    if (!firstTimeUser.tourActive || firstTimeUser.tourCompleted) return;
    const timeout = setTimeout(computeSpotlight, 900); // after nav+render settles
    const observer = new ResizeObserver(computeSpotlight);
    observer.observe(document.documentElement);
    window.addEventListener('scroll', computeSpotlight, { passive: true });
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
      window.removeEventListener('scroll', computeSpotlight);
    };
  }, [computeSpotlight, firstTimeUser.tourStep, firstTimeUser.tourActive, firstTimeUser.tourCompleted]);

  // Voice: fetch and play TTS for each tour step with 600ms navigation settle delay.
  // FIX 7: probes audio duration to compute dynamic typing speed
  useEffect(() => {
    if (!firstTimeUser.tourActive || firstTimeUser.tourCompleted) return;

    stopRef.current();
    if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);

    // Read mute state directly from localStorage — avoids stale closure on isMuted
    const isMutedNow = localStorage.getItem('jude-voice-muted') === 'true';
    if (isMutedNow) {
      setIsSpeedReady(true); // no audio → use default speed
      return;
    }

    const text = TOUR_VOICE_TEXTS[firstTimeUser.tourStep];
    if (!text) {
      setIsSpeedReady(true);
      return;
    }

    const gen = ++fetchGenRef.current;
    // Display text (with emojis) for speed calc
    const displayText = tourSteps[firstTimeUser.tourStep]?.description || text;

    const timer = setTimeout(() => {
      supabase.functions.invoke('generate-jude-voice', {
        body: {
          text,
          storageKey: `onboarding/tour-step-${firstTimeUser.tourStep}`,
          context: 'onboarding'
        }
      }).then(({ data }) => {
        if (gen !== fetchGenRef.current) return; // stale
        if (data?.url) {
          // FIX 7: probe audio duration before speaking
          const probe = new Audio(data.url);
          const probeTimeout = setTimeout(() => {
            if (gen === fetchGenRef.current) setIsSpeedReady(true); // 800ms safety cap
          }, 800);
          speedTimeoutRef.current = probeTimeout;
          probe.addEventListener('loadedmetadata', () => {
            clearTimeout(probeTimeout);
            if (gen !== fetchGenRef.current) return;
            const computed = Math.max(30, Math.floor((probe.duration * 1000 * 0.9) / displayText.length));
            setTypingSpeed(computed);
            setIsSpeedReady(true);
          });
          probe.addEventListener('error', () => {
            clearTimeout(probeTimeout);
            if (gen === fetchGenRef.current) setIsSpeedReady(true);
          });
          probe.load();
          speakRef.current(data.url);
        } else {
          setIsSpeedReady(true);
        }
      }).catch(() => {
        if (gen === fetchGenRef.current) setIsSpeedReady(true);
      });
    }, 600); // wait for navigation animation to settle

    return () => {
      clearTimeout(timer);
      if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
    };
  }, [firstTimeUser.tourStep, firstTimeUser.tourActive, firstTimeUser.tourCompleted]);

  // Voice the celebration overlay
  useEffect(() => {
    if (!showCelebration || isMuted) return;
    supabase.functions.invoke('generate-jude-voice', {
      body: {
        text: "Tu es prêt! Bienvenue dans la famille Edupreneurs!",
        storageKey: 'onboarding/tour-celebration',
        context: 'onboarding'
      }
    }).then(({ data }) => {
      if (data?.url) speak(data.url);
    }).catch(() => {});
  }, [showCelebration]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop voice on unmount
  useEffect(() => () => stop(), [stop]);

  // Mute toggle handler — persists to localStorage
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('jude-voice-muted', String(next));
      if (next) stop(); // stop current audio when muting
      return next;
    });
  }, [stop]);

  // Early return AFTER all hooks are called (prevents hook count mismatch)
  if (!isStable) return null;
  if (!firstTimeUser.tourActive || firstTimeUser.tourCompleted || !currentStep) return null;

  const handleNext = () => {
    // 3C: if typewriter is still running, skip it to end first
    if (!isTypingComplete) {
      setSkipTyping(true);
      stop(); /* FIX 5: stop voice immediately when user skips typewriter */
      return;
    }

    if (isLastStep) {
      // 3D: celebration before completing
      setShowCelebration(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#7c3aed', '#a78bfa', '#f59e0b', '#10b981', '#ec4899'],
      });
      setTimeout(() => {
        setShowCelebration(false);
        firstTimeUser.completeTour();
      }, 2500);
    } else {
      firstTimeUser.nextTourStep();
    }
  };

  const handleSkip = () => {
    firstTimeUser.skipTour();
  };

  // Custom description for matieres page
  const getDescription = () => {
    if (currentStep.path === '/matieres' && firstTimeUser.userGrade) {
      return `Voici les cours disponibles pour ton niveau (${firstTimeUser.userGrade}). Chaque leçon a des résumés clairs, des exercices et des quiz interactifs!`;
    }
    return currentStep.description;
  };

  return (
    <>
      {/* 3B: Spotlight highlight on target element */}
      {spotlightRect && !showCelebration && (
        <div
          className="fixed z-[1002] rounded-lg pointer-events-none animate-pulse"
          style={{
            top: spotlightRect.top - 6,
            left: spotlightRect.left - 6,
            width: spotlightRect.width + 12,
            height: spotlightRect.height + 12,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
            border: '2px solid hsl(var(--primary) / 0.7)',
          }}
        />
      )}

      {/* Mobile overlay - dims content area while keeping bottom nav visible */}
      {!showCelebration && (
        <div 
          className="fixed inset-0 bg-black/20 z-[1003] pointer-events-none lg:hidden"
          style={{ bottom: '72px' }}
        />
      )}

      {/* 3D: Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1010] flex flex-col items-center justify-center bg-gradient-to-br from-black/80 via-primary/20 to-black/80"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="flex flex-col items-center gap-6 text-center px-8"
            >
              <img
                src={ericCelebrating}
                alt="Jude celebrating"
                className="w-40 h-40 object-contain drop-shadow-2xl"
              />
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  🎉 Tu es prêt(e)!
                </h2>
                <p className="text-lg text-white/90 font-medium">
                  Bienvenue dans la famille Edupreneurs!
                </p>
                <p className="text-sm text-white/60">
                  Ta progression commence maintenant.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Tour dialog - repositions to top when spotlighting bottom-right elements (e.g. music FAB) */}
      {!showCelebration && (
        <div className={[
          "fixed left-4 right-4 sm:left-auto sm:w-96 z-[1004] animate-slide-up",
          // Step 1 = music FAB (bottom-right) → anchor to top so card doesn't cover the FAB
          firstTimeUser.tourStep === 1
            ? "top-4 sm:right-4"
            : "bottom-20 sm:right-4 sm:bottom-4",
        ].join(' ')}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Progress bar */}
            <div className="px-4 pt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Étape {firstTimeUser.tourStep + 1} sur {tourSteps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />

              {/* 3A: Step dot indicators */}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                {tourSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={[
                      "rounded-full transition-all duration-300",
                      idx === firstTimeUser.tourStep
                        ? "w-4 h-2 bg-primary"
                        : idx < firstTimeUser.tourStep
                        ? "w-2 h-2 bg-muted-foreground/50"
                        : "w-2 h-2 border border-muted-foreground/30 bg-transparent",
                    ].join(' ')}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex gap-4">
              {/* Jude avatar */}
              <div className="flex-shrink-0">
                <img
                  src={ericStudentDesk}
                  alt="Jude"
                  className={`w-20 h-20 object-contain ${shouldShowGlow ? 'drop-shadow-lg' : 'drop-shadow'}`}
                />
              </div>

              {/* Text content with typewriter */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => {
                  if (!isTypingComplete) setSkipTyping(true);
                }}
                title={!isTypingComplete ? "Cliquer pour passer l'animation" : undefined}
              >
                <h3 className="font-bold text-foreground mb-1">{currentStep.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed min-h-[3rem]">
                  {/* FIX 7: gate typewriter on speed readiness for voice sync */}
                  {shouldAnimate ? (
                    isSpeedReady ? (
                      <SimpleTypewriter
                        key={typewriterKey}
                        text={getDescription()}
                        speed={typingSpeed}
                        enableSound={true}
                        soundVolume={0.04}
                        skipToEnd={skipTyping}
                        onComplete={() => setIsTypingComplete(true)}
                      />
                    ) : (
                      /* Blinking cursor placeholder while waiting for duration probe */
                      <span className="animate-pulse text-muted-foreground">|</span>
                    )
                  ) : (
                    // On slow connections: render instantly
                    <span>{getDescription()}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex items-center justify-between gap-2">
              {/* 3E: outline skip button for visibility */}
              <Button variant="outline" size="sm" onClick={handleSkip} className="text-muted-foreground">
                <X className="w-4 h-4 mr-1" />
                Passer
              </Button>

              <div className="flex items-center gap-2">
                {/* Mute toggle — consistent with visitor tour */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-muted-foreground h-8 w-8 p-0"
                  title={isMuted ? 'Activer la voix' : 'Couper la voix'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                {firstTimeUser.tourStep > 0 && (
                  <Button variant="outline" size="sm" onClick={firstTimeUser.previousTourStep}>
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
      )}
    </>
  );
};

export default FirstTimeUserTour;
