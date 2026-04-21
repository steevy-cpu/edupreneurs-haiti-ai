/**
 * ExamResultsModal — Full-screen celebration + score summary after exam completion.
 * Pattern mirrors StreakMilestoneModal: framer-motion entrance, canvas-confetti, auto-dismiss.
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNetworkAwareAnimations } from '@/hooks/useNetworkAwareAnimations';
import confetti from 'canvas-confetti';
import judeProfile from '@/assets/jude-profile.jpeg';

/** Score tier config — determines color, label, and confetti behavior */
const TIERS = [
  { min: 90, label: 'Excellent', color: 'text-green-400', confettiCount: 200 },
  { min: 75, label: 'Bien', color: 'text-blue-400', confettiCount: 120 },
  { min: 50, label: 'Passable', color: 'text-yellow-400', confettiCount: 60 },
  { min: 0, label: 'Insuffisant', color: 'text-red-400', confettiCount: 0 },
] as const;

function getTier(scorePercent: number) {
  return TIERS.find(t => scorePercent >= t.min) ?? TIERS[TIERS.length - 1];
}

interface ExamResultsModalProps {
  scorePercent: number;
  bonusGold: number;
  finalScore: number;
  totalPoints: number;
  examTitle: string;
  onReview: () => void;
  onExit: () => void;
}

export function ExamResultsModal({
  scorePercent,
  bonusGold,
  finalScore,
  totalPoints,
  examTitle,
  onReview,
  onExit,
}: ExamResultsModalProps) {
  const { shouldAnimate } = useNetworkAwareAnimations();
  const autoDismissRef = useRef<ReturnType<typeof setTimeout>>();
  const tier = getTier(scorePercent);

  // Fire confetti on mount — network-aware
  useEffect(() => {
    if (shouldAnimate && tier.confettiCount > 0) {
      const burst = () =>
        confetti({
          particleCount: tier.confettiCount,
          spread: 80,
          origin: { y: 0.6 },
          zIndex: 9999,
        });
      burst();
      // Second burst for high scores
      if (scorePercent >= 75) {
        const t = setTimeout(burst, 400);
        return () => clearTimeout(t);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss after 15s (longer than streak modal — more info to read)
  useEffect(() => {
    autoDismissRef.current = setTimeout(onExit, 15_000);
    return () => clearTimeout(autoDismissRef.current);
  }, [onExit]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onExit}
      >
        <motion.div
          className="relative w-full max-w-md rounded-2xl bg-card border-2 border-primary/30 shadow-2xl overflow-hidden"
          initial={shouldAnimate ? { scale: 0.8, opacity: 0 } : {}}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gradient header strip */}
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />

          <div className="p-6 text-center space-y-5">
            {/* Jude avatar */}
            <div className="flex justify-center">
              <img
          loading="lazy"
          decoding="async"
                src={judeProfile}
                alt="Jude"
                className="w-20 h-20 rounded-full border-4 border-primary/30 shadow-lg"
              />
            </div>

            {/* Exam title */}
            <p className="text-sm text-muted-foreground font-medium line-clamp-1">
              {examTitle}
            </p>

            {/* Big score percent */}
            <div>
              <p className={`text-6xl font-black ${tier.color}`}>
                {scorePercent}%
              </p>
              <p className={`text-lg font-semibold mt-1 ${tier.color}`}>
                {tier.label}
              </p>
            </div>

            {/* Score detail */}
            <p className="text-muted-foreground text-sm">
              {finalScore} / {totalPoints} pts
            </p>

            {/* Gold bonus badge */}
            {bonusGold > 0 && (
              <motion.div
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-yellow-500/15 border border-yellow-500/30"
                initial={shouldAnimate ? { scale: 0 } : {}}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <span className="text-lg">🪙</span>
                <span className="font-bold text-yellow-500">+{bonusGold} bonus</span>
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={onReview} variant="outline" className="w-full">
                Revoir l'examen
              </Button>
              <Button onClick={onExit} className="w-full">
                Retour aux examens
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
