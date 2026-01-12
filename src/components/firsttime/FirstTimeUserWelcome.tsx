import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ericStudentDesk from '@/assets/eric-student-desk.png';
import SimpleTypewriter from '@/components/visitor/SimpleTypewriter';
import { useFirstTimeUser } from '@/contexts/FirstTimeUserContext';
import { Progress } from '@/components/ui/progress';
import { useNetworkAwareAnimations } from '@/hooks/useNetworkAwareAnimations';
import { preloadImage } from '@/utils/performanceOptimization';

const FirstTimeUserWelcome = () => {
  const { showWelcome, userNickname, completeWelcome, isLoading } = useFirstTimeUser();
  const { shouldAnimate, shouldShowGlow } = useNetworkAwareAnimations();
  
  const [phase, setPhase] = useState<'greeting' | 'intro' | 'walkthrough' | 'progress' | 'done'>('greeting');
  const [showGreeting, setShowGreeting] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  // Preload Eric image on mount for better UX
  useEffect(() => {
    preloadImage(ericStudentDesk).catch(() => {});
  }, []);

  useEffect(() => {
    if (!showWelcome || isLoading) {
      // Reset state when not showing
      setPhase('greeting');
      setShowGreeting(false);
      setShowIntro(false);
      setShowWalkthrough(false);
      setProgressValue(0);
      return;
    }

    // Start animation sequence
    const greetingTimer = setTimeout(() => {
      setShowGreeting(true);
    }, 500);

    return () => clearTimeout(greetingTimer);
  }, [showWelcome, isLoading]);

  // Progress bar animation after walkthrough text
  useEffect(() => {
    if (phase !== 'progress') return;
    
    const interval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4; // ~2.5 seconds total
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [phase]);

  // Complete when progress hits 100%
  useEffect(() => {
    if (progressValue === 100 && phase === 'progress') {
      setTimeout(() => {
        setPhase('done');
        setTimeout(completeWelcome, 300);
      }, 500);
    }
  }, [progressValue, phase, completeWelcome]);

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
      setPhase('progress');
    }, 400);
  };

  if (!showWelcome || isLoading) return null;

  const displayName = userNickname || 'ami(e)';

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
        {/* Dark overlay - disable blur on slow connections */}
        <motion.div 
          initial={shouldAnimate ? { opacity: 0 } : undefined}
          animate={{ opacity: 0.5 }}
          exit={shouldAnimate ? { opacity: 0 } : undefined}
          className={`absolute inset-0 bg-black/50 ${shouldShowGlow ? 'backdrop-blur-sm' : ''}`}
        />
        
        {/* Floating container */}
        <motion.div
          {...containerAnimation}
          transition={shouldAnimate ? { type: "spring", damping: 20, stiffness: 300 } : { duration: 0.1 }}
          className="relative flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-8"
        >
          {/* Jude Image */}
          <motion.div
            {...imageAnimation}
            transition={shouldAnimate ? { type: "spring", damping: 15, stiffness: 200, delay: 0.2 } : { duration: 0.1 }}
            className="relative"
          >
            <img
              src={ericStudentDesk}
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
              {/* Greeting */}
              {showGreeting && (
                <p className="text-xl sm:text-2xl font-bold text-foreground">
                  <SimpleTypewriter
                    text={`Bienvenue sur Edupreneurs, ${displayName}! 👋`}
                    speed={100}
                    onComplete={handleGreetingComplete}
                    enableSound
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
                    speed={90}
                    onComplete={handleIntroComplete}
                    enableSound
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
                    speed={80}
                    onComplete={handleWalkthroughComplete}
                    enableSound
                    soundVolume={0.06}
                  />
                </motion.p>
              )}
              
              {/* Progress bar */}
              {phase === 'progress' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-2"
                >
                  <p className="text-xs text-muted-foreground">
                    Préparation de la visite...
                  </p>
                  <Progress value={progressValue} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {progressValue}%
                  </p>
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
