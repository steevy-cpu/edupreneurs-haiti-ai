import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ericStudentDesk from '@/assets/eric-student-desk.png';
import SimpleTypewriter from './SimpleTypewriter';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

interface JudeWelcomePopupProps {
  isOpen: boolean;
  onComplete: () => void;
}

const JudeWelcomePopup = ({ isOpen, onComplete }: JudeWelcomePopupProps) => {
  const [phase, setPhase] = useState<'greeting' | 'intro' | 'walkthrough' | 'searching' | 'playing' | 'done'>('greeting');
  const [showGreeting, setShowGreeting] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [showSearching, setShowSearching] = useState(false);
  const [searchingTextComplete, setSearchingTextComplete] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const { tracks, playTrack } = useMusicPlayer();

  const startMusic = useCallback(() => {
    // Find "Meilleure Musique Classique Étude" track
    const trackIndex = tracks.findIndex(t => 
      t.title.includes("Meilleure Musique Classique Étude")
    );
    
    if (trackIndex !== -1) {
      console.log('🎵 Starting study music for visitor tour');
      playTrack(trackIndex);
    } else if (tracks.length > 0) {
      // Fallback to first track if not found
      console.log('🎵 Study music not found, playing first track');
      playTrack(0);
    }
  }, [tracks, playTrack]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setPhase('greeting');
      setShowGreeting(false);
      setShowIntro(false);
      setShowWalkthrough(false);
      setShowSearching(false);
      setSearchingTextComplete(false);
      setSearchProgress(0);
      return;
    }

    // Start animation sequence
    const greetingTimer = setTimeout(() => {
      setShowGreeting(true);
    }, 500);

    return () => clearTimeout(greetingTimer);
  }, [isOpen]);

  // Progress bar animation - only starts AFTER searching text is complete
  useEffect(() => {
    if (!searchingTextComplete) return;
    
    const interval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2; // Increment by 2 every 40ms = ~2 seconds total
      });
    }, 40);
    
    return () => clearInterval(interval);
  }, [searchingTextComplete]);

  // When progress hits 100%, transition to playing
  useEffect(() => {
    if (searchProgress === 100 && phase === 'searching') {
      setTimeout(() => {
        setPhase('playing');
        startMusic();
        
        // After music starts, wait and then complete
        setTimeout(() => {
          setPhase('done');
          setTimeout(onComplete, 500);
        }, 1500);
      }, 300);
    }
  }, [searchProgress, phase, startMusic, onComplete]);

  const handleGreetingComplete = () => {
    setTimeout(() => {
      setPhase('intro');
      setShowIntro(true);
    }, 600);
  };

  const handleIntroComplete = () => {
    setTimeout(() => {
      setPhase('walkthrough');
      setShowWalkthrough(true);
    }, 500);
  };

  const handleWalkthroughComplete = () => {
    setTimeout(() => {
      setPhase('searching');
      setShowSearching(true);
    }, 500);
  };

  const handleSearchingComplete = () => {
    // Now trigger the progress bar
    setSearchingTextComplete(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
        >
          {/* Subtle dark overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          
          {/* Floating container - transparent, no border, no shadow */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative flex flex-col items-center gap-4 sm:gap-6 p-4 sm:p-8"
          >
            {/* Jude Image */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                damping: 15, 
                stiffness: 200,
                delay: 0.2 
              }}
              className="relative"
            >
              <img
                src={ericStudentDesk}
                alt="Jude"
                className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 object-contain drop-shadow-2xl"
              />
              
              {/* Music note animation when playing */}
              {phase === 'playing' && (
                <motion.div
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0],
                    y: [-10, -30, -50, -70],
                    x: [0, 10, -5, 15]
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 0.3
                  }}
                  className="absolute -top-2 -right-2 text-2xl"
                >
                  🎵
                </motion.div>
              )}
            </motion.div>

            {/* Speech Bubble */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative bg-card/95 backdrop-blur-md rounded-2xl px-6 py-4 sm:px-8 sm:py-5 max-w-xs sm:max-w-sm lg:max-w-md shadow-xl border border-border/50"
            >
              {/* Speech bubble tail */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-card/95" />
              
              <div className="text-center space-y-3">
                {/* Greeting */}
                {showGreeting && (
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    <SimpleTypewriter
                      text="Salut visiteur! 👋"
                      speed={100}
                      onComplete={handleGreetingComplete}
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
                      text="Moi c'est Jude, ton assistant virtuel!"
                      speed={90}
                      onComplete={handleIntroComplete}
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
                    />
                  </motion.p>
                )}
                
                {/* Searching for music message */}
                {showSearching && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-sm sm:text-base text-muted-foreground">
                      <SimpleTypewriter
                        text="Mais d'abord, laisse-moi trouver une bonne musique 🎵"
                        speed={70}
                        onComplete={handleSearchingComplete}
                      />
                    </p>
                    
                    {/* Progress bar - shows after the searching text is typed */}
                    {searchProgress > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4"
                      >
                        <p className="text-xs text-muted-foreground mb-2">
                          Recherche en cours...
                        </p>
                        
                        {/* Progress bar container */}
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: `${searchProgress}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                        
                        {/* Percentage */}
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                          {searchProgress}%
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
                
                {/* Music playing indicator */}
                {phase === 'playing' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-2 text-primary mt-2"
                  >
                    <div className="flex gap-1">
                      <span className="w-1 h-4 bg-primary rounded-full animate-[music-bar_0.5s_ease-in-out_infinite]" />
                      <span className="w-1 h-4 bg-primary rounded-full animate-[music-bar_0.7s_ease-in-out_infinite_0.1s]" />
                      <span className="w-1 h-4 bg-primary rounded-full animate-[music-bar_0.6s_ease-in-out_infinite_0.2s]" />
                    </div>
                    <span className="text-sm font-medium">Musique trouvée!</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JudeWelcomePopup;
