import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ericWaving from '@/assets/eric-waving.png';
import SimpleTypewriter from '@/components/visitor/SimpleTypewriter';
import { useFirstTimeUser } from '@/contexts/FirstTimeUserContext';
import { Button } from '@/components/ui/button';
import { ChevronRight, X } from 'lucide-react';
import { useNetworkAwareAnimations } from '@/hooks/useNetworkAwareAnimations';
import { preloadImage } from '@/utils/performanceOptimization';
import { useJudeAudio } from '@/contexts/JudeAudioContext';
import { supabase } from '@/integrations/supabase/client';

/** Default typing speeds (ms per char) for each message */
const FIRSTTIME_DEFAULT_SPEEDS = [100, 90, 80];

const FirstTimeUserWelcome = () => {
  // STABILITY GUARD: Use safe context access pattern to prevent null dispatcher errors
  const firstTimeUser = useFirstTimeUser();
  const { shouldAnimate, shouldShowGlow } = useNetworkAwareAnimations();
  
  // Track mount stability to prevent errors during navigation transitions
  const [isStable, setIsStable] = useState(false);
  const [phase, setPhase] = useState<'greeting' | 'intro' | 'walkthrough' | 'cta'>('greeting');
  const [showGreeting, setShowGreeting] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // Voice auto-play for authenticated first-time users
  const { speak, stop } = useJudeAudio();
  // State-based URL tracking so React re-renders when URLs resolve (fixes race condition)
  const [audioUrls, setAudioUrls] = useState<(string | null)[]>([null, null, null]);
  const audioDurationsRef = useRef<number[]>([0, 0, 0]);
  // Track mute state at render time for enableSound decisions
  const isMuted = typeof window !== 'undefined' && localStorage.getItem('jude-voice-muted') === 'true';
  
  // Wait one render cycle for React dispatcher to stabilize after lazy load
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsStable(true);
      });
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Preload Eric image on mount for better UX
  useEffect(() => {
    preloadImage(ericWaving).catch(() => {});
  }, []);

  const displayName = firstTimeUser.userNickname || 'ami(e)';

  // Pre-fetch all 3 audio clips when welcome screen shows
  useEffect(() => {
    if (!firstTimeUser.showWelcome || firstTimeUser.isLoading || isMuted) return;

    // All messages use static keys — audio is pre-generated and CDN-cached
    const messages = [
      { text: 'Bienvenue sur Edupreneurs!', storageKey: 'onboarding/firsttime-0' },
      { text: "Moi c'est Jude, ton assistant d'apprentissage!", storageKey: 'onboarding/firsttime-1' },
      { text: "Je vais te faire découvrir la plateforme...", storageKey: 'onboarding/firsttime-2' },
    ];

    messages.forEach(({ text, storageKey }, i) => {
      supabase.functions.invoke('generate-jude-voice', {
        body: { text, storageKey, context: 'onboarding' }
      }).then(({ data }) => {
        if (data?.url) {
          // Update state so React re-renders and enableSound recalculates
          setAudioUrls(prev => {
            const next = [...prev];
            next[i] = data.url;
            return next;
          });
          // Pre-measure duration for typing speed sync (ref is fine — no re-render needed)
          const audio = new Audio(data.url);
          audio.addEventListener('loadedmetadata', () => {
            audioDurationsRef.current[i] = audio.duration;
          });
          audio.load();
        }
      }).catch(() => { /* silent fail — typewriter uses default speed */ });
    });
  }, [firstTimeUser.showWelcome, firstTimeUser.isLoading, isMuted]);

  // Stop audio on unmount or when welcome closes
  useEffect(() => {
    if (!firstTimeUser.showWelcome) {
      stop();
    }
    return () => { stop(); };
  }, [firstTimeUser.showWelcome, stop]);

  /** Calculate ms-per-char so typing finishes ~90% through audio duration */
  const getTypingSpeed = useCallback((messageIndex: number, messageLength: number): number => {
    const duration = audioDurationsRef.current[messageIndex];
    if (!duration || duration <= 0) return FIRSTTIME_DEFAULT_SPEEDS[messageIndex];
    const durationMs = duration * 1000;
    return Math.max(30, Math.floor((durationMs * 0.9) / messageLength));
  }, []);

  /** Trigger Jude's voice when a message starts typing — reads from state */
  const handleMessageStart = useCallback((index: number) => {
    const muted = localStorage.getItem('jude-voice-muted') === 'true';
    if (muted || !audioUrls[index]) return;
    speak(audioUrls[index]!);
  }, [speak, audioUrls]);

  /** Whether voice is available for a given message — reads from state so re-render updates enableSound */
  const hasVoice = useCallback((i: number) => {
    return !!audioUrls[i] && !isMuted;
  }, [audioUrls, isMuted]);

  useEffect(() => {
    if (!firstTimeUser.showWelcome || firstTimeUser.isLoading) {
      // Reset state when not showing
      setPhase('greeting');
      setShowGreeting(false);
      setShowIntro(false);
      setShowWalkthrough(false);
      return;
    }

    // Smart delay: wait for audio URL 0 to resolve, cap at 3s for slow connections
    if (audioUrls[0]) {
      // Audio already ready (cached or fast fetch) — short delay for visual polish
      const timer = setTimeout(() => setShowGreeting(true), 300);
      return () => clearTimeout(timer);
    }

    // Audio not ready yet — wait up to 3s then start with typing sounds as fallback
    const maxWait = setTimeout(() => setShowGreeting(true), 3000);
    return () => clearTimeout(maxWait);
  }, [firstTimeUser.showWelcome, firstTimeUser.isLoading, audioUrls[0]]);

  const handleGreetingComplete = () => {
    setTimeout(() => {
      setPhase('intro');
      setShowIntro(true);
    }, 500);
  };

  const handleIntroComplete = () => {
    setTimeout(() => {
      setPhase('walkthrough');
      setShowWalkthrough(true);
    }, 400);
  };

  const handleWalkthroughComplete = () => {
    setTimeout(() => {
      setPhase('cta');
    }, 400);
  };

  // Early return AFTER all hooks are called (prevents hook count mismatch)
  if (!isStable) return null;
  if (!firstTimeUser.showWelcome || firstTimeUser.isLoading) return null;

  // Build message 0 text for typing speed calculation
  const greetingText = `Bienvenue sur Edupreneurs, ${displayName}! 👋`;

  // Network-aware animation config - reduce animations on slow connections
  const overlayAnimation = shouldAnimate 
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {};
  const containerAnimation = shouldAnimate
    ? { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 } }
    : {};
  const imageAnimation = shouldAnimate
    ? { initial: { scale: 0, rotate: -10 }, animate: { scale: 1, rotate: 0 } }
    : {};

  return (
    <AnimatePresence>
      <motion.div
        {...overlayAnimation}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
      >
        {/* Branded gradient overlay */}
        <motion.div 
          initial={shouldAnimate ? { opacity: 0 } : undefined}
          animate={{ opacity: 1 }}
          exit={shouldAnimate ? { opacity: 0 } : undefined}
          className={`absolute inset-0 bg-gradient-to-br from-black/70 via-primary/10 to-black/70 ${shouldShowGlow ? 'backdrop-blur-sm' : ''}`}
        />

        {/* Skip button — top right, visible immediately */}
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: -10 } : undefined}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-4 right-4 z-10"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={firstTimeUser.completeWelcome}
            className="text-white/70 hover:text-white hover:bg-white/10 gap-1"
          >
            <X className="h-4 w-4" />
            Passer
          </Button>
        </motion.div>
        
        {/* Floating container */}
        <motion.div
          {...containerAnimation}
          transition={shouldAnimate ? { type: "spring", damping: 20, stiffness: 300 } : { duration: 0.1 }}
          className="relative flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-8"
        >
          {/* Jude Image — waving for welcome */}
          <motion.div
            {...imageAnimation}
            transition={shouldAnimate ? { type: "spring", damping: 15, stiffness: 200, delay: 0.2 } : { duration: 0.1 }}
            className="relative"
          >
            <img
              src={ericWaving}
              alt="Jude"
              className={`w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 object-contain ${shouldShowGlow ? 'drop-shadow-2xl' : 'drop-shadow-md'}`}
            />
          </motion.div>

          {/* Speech Bubble */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0, y: 20 } : undefined}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`relative bg-card/95 ${shouldShowGlow ? 'backdrop-blur-md' : ''} rounded-2xl px-6 py-4 sm:px-8 sm:py-5 max-w-xs sm:max-w-sm lg:max-w-md shadow-xl border border-border/50`}
          >
            {/* Speech bubble tail */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-card/95" />
            
            <div className="text-center space-y-3">
              {/* Greeting — dynamic text with nickname */}
              {showGreeting && (
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  <SimpleTypewriter
                    text={greetingText}
                    speed={getTypingSpeed(0, greetingText.length)}
                    onComplete={handleGreetingComplete}
                    onStart={() => handleMessageStart(0)}
                    enableSound={!hasVoice(0)}
                    soundVolume={0.06}
                  />
                </p>
              )}
              
              {/* Introduction */}
              {showIntro && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-base sm:text-lg text-foreground font-medium"
                >
                  <SimpleTypewriter
                    text="Moi c'est Jude, ton assistant d'apprentissage!"
                    speed={getTypingSpeed(1, "Moi c'est Jude, ton assistant d'apprentissage!".length)}
                    onComplete={handleIntroComplete}
                    onStart={() => handleMessageStart(1)}
                    enableSound={!hasVoice(1)}
                    soundVolume={0.06}
                  />
                </motion.p>
              )}
              
              {/* Walkthrough explanation */}
              {showWalkthrough && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm sm:text-base text-muted-foreground"
                >
                  <SimpleTypewriter
                    text="Je vais te faire découvrir la plateforme..."
                    speed={getTypingSpeed(2, "Je vais te faire découvrir la plateforme...".length)}
                    onComplete={handleWalkthroughComplete}
                    onStart={() => handleMessageStart(2)}
                    enableSound={!hasVoice(2)}
                    soundVolume={0.06}
                  />
                </motion.p>
              )}
              
              {/* CTA button — replaces fake progress bar */}
              {phase === 'cta' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pt-2"
                >
                  <Button
                    onClick={firstTimeUser.completeWelcome}
                    className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90"
                  >
                    Commencer la visite
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FirstTimeUserWelcome;
