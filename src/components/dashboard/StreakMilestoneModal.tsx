/**
 * StreakMilestoneModal — Celebration overlay when a streak milestone is reached.
 *
 * Triggered by pendingMilestone from StreakContext.
 * Features: confetti burst, milestone GIF, Jude voice, framer-motion entrance.
 * Auto-dismisses after 8 seconds.
 */

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useStreak, MilestoneData } from '@/contexts/StreakContext';
import { useJudeVoice } from '@/hooks/useJudeVoice';
import { Button } from '@/components/ui/button';
import { STREAK_MILESTONES } from '@/lib/streakConstants';

export function StreakMilestoneModal() {
  const { pendingMilestone, clearPendingMilestone } = useStreak();

  if (!pendingMilestone) return null;

  return (
    <AnimatePresence>
      <ModalContent milestone={pendingMilestone} onDismiss={clearPendingMilestone} />
    </AnimatePresence>
  );
}

function ModalContent({ milestone, onDismiss }: { milestone: MilestoneData; onDismiss: () => void }) {
  const autoDismissRef = useRef<ReturnType<typeof setTimeout>>();
  const confettiFired = useRef(false);

  // Milestone config for freeze reward display
  const milestoneConfig = STREAK_MILESTONES.find(m => m.days === milestone.days);
  const freezeReward = milestoneConfig?.freezeReward ?? milestone.freezeReward ?? 0;

  // Jude voice — pre-generate congratulation message
  const voiceText = `Félicitations! Tu as atteint ${milestone.days} jours de série! Tu es un vrai ${milestone.title}!`;
  const { play, isReady } = useJudeVoice({
    text: voiceText,
    storageKey: `streak/milestone-${milestone.days}`,
    context: 'feedback',
    autoPreload: true,
  });

  // Play voice when audio is ready
  useEffect(() => {
    if (isReady) {
      play();
    }
  }, [isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // Confetti burst on mount
  useEffect(() => {
    if (confettiFired.current) return;
    confettiFired.current = true;

    // Multi-burst confetti for 3 seconds
    const end = Date.now() + 3000;
    const colors = ['#f97316', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4'];
    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60 + Math.random() * 60,
        spread: 55,
        origin: { x: Math.random(), y: Math.random() * 0.4 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    autoDismissRef.current = setTimeout(onDismiss, 8000);
    return () => clearTimeout(autoDismissRef.current);
  }, [onDismiss]);

  const handleDismiss = useCallback(() => {
    clearTimeout(autoDismissRef.current);
    onDismiss();
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="bg-card rounded-2xl shadow-2xl max-w-sm w-full p-6 flex flex-col items-center text-center gap-4"
      >
        {/* Milestone icon GIF */}
        <img
          src={milestone.iconUrl}
          alt={milestone.title}
          className="w-20 h-20 object-contain"
        />

        {/* Badge title */}
        <h2 className="text-2xl font-bold text-foreground">{milestone.title}</h2>

        {/* Streak count */}
        <p className="text-lg text-orange-500 font-semibold">
          🔥 {milestone.days} jours de série !
        </p>

        {/* Freeze reward */}
        {freezeReward > 0 && (
          <p className="text-sm text-blue-500 font-medium">
            ❄️ +{freezeReward} Freeze débloqué !
          </p>
        )}

        {/* Dismiss */}
        <Button onClick={handleDismiss} className="mt-2 w-full">
          Continuer
        </Button>
      </motion.div>
    </div>
  );
}

export default StreakMilestoneModal;
