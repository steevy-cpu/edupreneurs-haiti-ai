import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, SkipForward } from 'lucide-react';
import ericStudentDesk from '@/assets/eric-student-desk.png';
import SimpleTypewriter from '@/components/visitor/SimpleTypewriter';
import { useFirstTimeUser } from '@/contexts/FirstTimeUserContext';
import { AIAvatarGenerator } from '@/components/AIAvatarGenerator';
import { useNetworkAwareAnimations } from '@/hooks/useNetworkAwareAnimations';
import { preloadImage } from '@/utils/performanceOptimization';

const AvatarGenerationStep = () => {
  // STABILITY GUARD: Use safe context access pattern to prevent null dispatcher errors
  const firstTimeUser = useFirstTimeUser();
  const { shouldAnimate, shouldShowGlow } = useNetworkAwareAnimations();
  
  // Track mount stability to prevent errors during navigation transitions
  const [isStable, setIsStable] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [textComplete, setTextComplete] = useState(false);
  
  // Wait one render cycle for React dispatcher to stabilize after lazy load
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsStable(true);
      });
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Preload Eric image on mount
  useEffect(() => {
    preloadImage(ericStudentDesk).catch(() => {});
  }, []);

  const handleAvatarGenerated = (avatarUrl: string) => {
    setShowAvatarDialog(false);
    firstTimeUser.completeAvatarGeneration();
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
  const imageAnimation = shouldAnimate
    ? { initial: { scale: 0, rotate: -10 }, animate: { scale: 1, rotate: 0 } }
    : {};

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
            {/* Dark overlay - disable blur on slow connections */}
            <motion.div 
              initial={shouldAnimate ? { opacity: 0 } : undefined}
              animate={{ opacity: 0.5 }}
              exit={shouldAnimate ? { opacity: 0 } : undefined}
              className={`absolute inset-0 bg-black/50 ${shouldShowGlow ? 'backdrop-blur-sm' : ''}`}
            />
            
            {/* Content */}
            <motion.div
              {...containerAnimation}
              transition={shouldAnimate ? { type: "spring", damping: 20, stiffness: 300 } : { duration: 0.1 }}
              className="relative flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-8 max-w-md"
            >
              {/* Jude Image */}
              <motion.div
                {...imageAnimation}
                transition={shouldAnimate ? { type: "spring", damping: 15, stiffness: 200, delay: 0.2 } : { duration: 0.1 }}
              >
                <img
                  src={ericStudentDesk}
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
                  <p className="text-base sm:text-lg text-foreground font-medium min-h-[3rem]">
                    <SimpleTypewriter
                      text="Maintenant, créons ton avatar personnalisé avec l'IA! 🎨✨"
                      speed={60}
                      onComplete={() => setTextComplete(true)}
                      enableSound
                      soundVolume={0.06}
                    />
                  </p>
                  
                  {textComplete && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col sm:flex-row gap-2 pt-2"
                    >
                      <Button
                        variant="outline"
                        onClick={firstTimeUser.skipAvatarGeneration}
                        className="gap-2"
                      >
                        <SkipForward className="h-4 w-4" />
                        Plus tard
                      </Button>
                      <Button
                        onClick={() => setShowAvatarDialog(true)}
                        className="gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90"
                      >
                        <Sparkles className="h-4 w-4" />
                        Créer mon avatar
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Generator Dialog */}
      <AIAvatarGenerator
        open={showAvatarDialog}
        onOpenChange={setShowAvatarDialog}
        onAvatarGenerated={handleAvatarGenerated}
        userId={firstTimeUser.userId}
        isSuperUser={firstTimeUser.isSuperUser}
      />
    </>
  );
};

export default AvatarGenerationStep;
