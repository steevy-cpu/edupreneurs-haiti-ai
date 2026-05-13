import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, SkipForward } from 'lucide-react';
const ericStudentDesk = '/images/eric-student-desk-200w.webp';
const ericThumbUp = '/images/eric-thumb-up-200w.webp';
import SimpleTypewriter from '@/components/visitor/SimpleTypewriter';
import { useFirstTimeUser } from '@/contexts/FirstTimeUserContext';
import { AIAvatarGenerator } from '@/components/AIAvatarGenerator';
import { useNetworkAwareAnimations } from '@/hooks/useNetworkAwareAnimations';
import { preloadImage } from '@/utils/performanceOptimization';
import { useJudeAudio } from '@/contexts/JudeAudioContext';
import { supabase } from '@/integrations/supabase/client';

const AvatarGenerationStep = () => {
  // STABILITY GUARD: Use safe context access pattern to prevent null dispatcher errors
  const firstTimeUser = useFirstTimeUser();
  const { shouldAnimate, shouldShowGlow } = useNetworkAwareAnimations();
  // Voice — fire-and-forget TTS for avatar prompt and celebration
  const { speak, stop } = useJudeAudio();
  // Ref-stable speak/stop to avoid stale closures in voice useEffects
  const speakRef = useRef(speak);
  const stopRef = useRef(stop);
  useEffect(() => { speakRef.current = speak; }, [speak]);
  useEffect(() => { stopRef.current = stop; }, [stop]);
  
  // Track mount stability to prevent errors during navigation transitions
  const [isStable, setIsStable] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [textComplete, setTextComplete] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  /** FIX 7: dynamic typing speed — syncs typewriter with voice clip duration */
  const [typingSpeed, setTypingSpeed] = useState(60);
  const [isSpeedReady, setIsSpeedReady] = useState(false);
  const speedTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const fetchGenRef = useRef(0);
  
  // Wait one render cycle for React dispatcher to stabilize after lazy load
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsStable(true);
      });
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Preload Eric images on mount
  useEffect(() => {
    preloadImage(ericStudentDesk).catch(() => {});
    preloadImage(ericThumbUp).catch(() => {});
  }, []);

  // Voice the avatar prompt — FIX 7: probes duration for dynamic typing speed
  const AVATAR_DISPLAY_TEXT = "Maintenant, créons ton avatar personnalisé avec l'IA! 🎨✨";
  useEffect(() => {
    if (!firstTimeUser.showAvatarGeneration) return;
    setIsSpeedReady(false);
    setTypingSpeed(60);
    if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
    const isMutedNow = localStorage.getItem('jude-voice-muted') === 'true';
    if (isMutedNow) {
      setIsSpeedReady(true); // no audio → default speed
      return;
    }
    const gen = ++fetchGenRef.current;
    supabase.functions.invoke('generate-jude-voice', {
      body: {
        text: "Maintenant, créons ton avatar personnalisé avec l'IA!",
        storageKey: 'onboarding/avatar-prompt',
        context: 'onboarding'
      }
    }).then(({ data }) => {
      if (gen !== fetchGenRef.current) return;
      if (data?.url) {
        // FIX 7: probe duration before speaking
        const probe = new Audio(data.url);
        const probeTimeout = setTimeout(() => {
          if (gen === fetchGenRef.current) setIsSpeedReady(true);
        }, 800);
        speedTimeoutRef.current = probeTimeout;
        probe.addEventListener('loadedmetadata', () => {
          clearTimeout(probeTimeout);
          if (gen !== fetchGenRef.current) return;
          const computed = Math.max(30, Math.floor((probe.duration * 1000 * 0.9) / AVATAR_DISPLAY_TEXT.length));
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
    return () => {
      stopRef.current();
      if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
    };
  }, [firstTimeUser.showAvatarGeneration]);

  // Voice the celebration when avatar is generated — guarded by phase
  useEffect(() => {
    if (!firstTimeUser.showAvatarGeneration) return;
    if (!celebrating) return;
    const isMutedNow = localStorage.getItem('jude-voice-muted') === 'true';
    if (isMutedNow) return;
    supabase.functions.invoke('generate-jude-voice', {
      body: {
        text: 'Superbe avatar! Bienvenue dans la famille Edupreneurs!',
        storageKey: 'onboarding/avatar-celebration',
        context: 'onboarding'
      }
    }).then(({ data }) => {
      if (data?.url) speakRef.current(data.url);
    }).catch(() => {});
  }, [celebrating, firstTimeUser.showAvatarGeneration]);

  const handleAvatarGenerated = (avatarUrl: string) => {
    setShowAvatarDialog(false);
    // 2D: brief Jude celebration before advancing
    setCelebrating(true);
    setTimeout(() => {
      firstTimeUser.completeAvatarGeneration();
    }, 1200);
  };

  // Early return AFTER all hooks are called (prevents hook count mismatch)
  if (!isStable) return null;
  if (!firstTimeUser.showAvatarGeneration || firstTimeUser.isLoading || !firstTimeUser.userId) return null;

  // Network-aware animation config
  const overlayAnimation = shouldAnimate 
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {};
  const containerAnimation = shouldAnimate
    ? { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.9, opacity: 0 } }
    : {};

  const judeImg = celebrating ? ericThumbUp : ericStudentDesk;

  return (
    <>
      <AnimatePresence mode="wait">
        {!showAvatarDialog && (
          <motion.div
            key="avatar-step-overlay"
            {...overlayAnimation}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] flex items-center justify-center"
          >
            {/* Branded gradient overlay */}
            <motion.div 
              initial={shouldAnimate ? { opacity: 0 } : undefined}
              animate={{ opacity: 1 }}
              exit={shouldAnimate ? { opacity: 0 } : undefined}
              className={`absolute inset-0 bg-gradient-to-br from-black/70 via-primary/10 to-black/70 ${shouldShowGlow ? 'backdrop-blur-sm' : ''}`}
            />
            
            {/* Content */}
            <motion.div
              {...containerAnimation}
              transition={shouldAnimate ? { type: "spring", damping: 20, stiffness: 300 } : { duration: 0.1 }}
              className="relative flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-8 max-w-md"
            >
              {/* Jude Image — swaps to thumb-up on celebration */}
              <motion.div
                key={celebrating ? 'thumb-up' : 'normal'}
                initial={shouldAnimate ? { scale: celebrating ? 0.5 : 0, rotate: celebrating ? 0 : -10 } : undefined}
                animate={{ scale: 1, rotate: 0 }}
                transition={shouldAnimate ? { type: "spring", damping: 15, stiffness: 200 } : { duration: 0.1 }}
              >
                <img
                  src={judeImg}
                  alt="Jude"
                  className={`w-28 h-28 sm:w-36 sm:h-36 object-contain ${shouldShowGlow ? 'drop-shadow-2xl' : 'drop-shadow-md'}`}
                />
              </motion.div>

              {/* Speech Bubble */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative bg-card/95 backdrop-blur-md rounded-2xl px-6 py-4 sm:px-8 sm:py-5 shadow-xl border border-border/50"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-card/95" />
                
                <div className="text-center space-y-4">
                  {celebrating ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <p className="text-base sm:text-lg text-foreground font-bold">
                        Superbe avatar! 🎉 Bienvenue dans la famille!
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <p className="text-base sm:text-lg text-foreground font-medium min-h-[3rem]">
                        {/* FIX 7: gate typewriter on speed readiness */}
                        {isSpeedReady ? (
                          <SimpleTypewriter
                            text={AVATAR_DISPLAY_TEXT}
                            speed={typingSpeed}
                            onComplete={() => setTextComplete(true)}
                            enableSound={true}
                            soundVolume={0.06}
                          />
                        ) : (
                          <span className="animate-pulse text-muted-foreground">|</span>
                        )}
                      </p>
                      
                      {textComplete && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col gap-2 pt-2"
                        >
                          <Button
                            onClick={() => setShowAvatarDialog(true)}
                            className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90"
                          >
                            <Sparkles className="h-4 w-4" />
                            Créer mon avatar
                          </Button>
                          <div className="flex flex-col items-center gap-0.5">
                            <Button
                              variant="outline"
                              onClick={firstTimeUser.skipAvatarGeneration}
                              className="gap-2 w-full"
                            >
                              <SkipForward className="h-4 w-4" />
                              Plus tard
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              Tu pourras en créer un depuis tes paramètres.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Generator Dialog — with onboarding context */}
      <AIAvatarGenerator
        open={showAvatarDialog}
        onOpenChange={setShowAvatarDialog}
        onAvatarGenerated={handleAvatarGenerated}
        userId={firstTimeUser.userId}
        isSuperUser={firstTimeUser.isSuperUser}
        isOnboarding
      />
    </>
  );
};

export default AvatarGenerationStep;
