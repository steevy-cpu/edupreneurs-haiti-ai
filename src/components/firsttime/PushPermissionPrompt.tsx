/**
 * PushPermissionPrompt — Non-blocking floating card asking users to enable push notifications.
 * Shown on second login after onboarding tour is complete.
 * Plan C — smart push permission prompt.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { initializePushNotifications } from '@/utils/pushNotifications';
import ericPointingUp from '@/assets/eric-pointing-up.png';

interface PushPermissionPromptProps {
  userId: string;
  onDismiss: () => void;
}

/** Auto-dismiss timeout in milliseconds */
const AUTO_DISMISS_MS = 15_000;

/** Guard check — must be called before component renders */
const hasSWSupport = typeof window !== 'undefined' && 'serviceWorker' in navigator;

export default function PushPermissionPrompt({ userId, onDismiss }: PushPermissionPromptProps) {
  const [visible, setVisible] = useState(true);
  const [activating, setActivating] = useState(false);
  const dismissedRef = useRef(false);
  const navigate = useNavigate();

  /** Persist dismissal timestamp (re-prompts after 7 days) and notify parent */
  const handleDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    // Store timestamp so we can re-show after 7 days
    localStorage.setItem('push_prompt_dismissed', Date.now().toString());
    setVisible(false);
    // Let exit animation play before unmounting
    setTimeout(onDismiss, 400);
  }, [onDismiss]);

  // Auto-dismiss after 15 seconds of no action
  useEffect(() => {
    const timer = setTimeout(handleDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [handleDismiss]);

  /** Request push permission via existing infrastructure */
  const handleActivate = useCallback(async () => {
    setActivating(true);
    try {
      await initializePushNotifications(userId);
      if ('Notification' in window && Notification.permission === 'granted') {
        toast.success('Notifications activées! 🎉');
      } else {
        // Denied — actionable toast pointing to Settings
        toast.info('Notifications désactivées', {
          description: 'Tu peux les activer à tout moment dans Paramètres → Notifications.',
          action: {
            label: 'Paramètres',
            onClick: () => navigate('/settings'),
          },
        });
      }
    } catch (err) {
      console.error('Push activation error:', err);
      toast.error("Erreur lors de l'activation des notifications");
    } finally {
      setActivating(false);
      // Permanent dismissal after browser prompt interaction
      localStorage.setItem('push_prompt_dismissed', 'permanent');
      setVisible(false);
      setTimeout(onDismiss, 400);
    }
  }, [userId, onDismiss, navigate]);

  // Skip rendering on non-PWA iOS (no SW support)
  if (!hasSWSupport) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[999] rounded-xl border border-border bg-card shadow-xl p-4"
        >
          <div className="flex items-start gap-3">
            {/* Jude/Eric mascot image */}
            <img
              src={ericPointingUp}
              alt="Jude"
              className="h-16 w-auto flex-shrink-0 object-contain"
              loading="eager"
            />

            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                Ne rate rien! <Bell className="w-4 h-4 text-primary" />
              </h3>

              {/* Description */}
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Active les notifications pour être informé des nouveaux messages, likes et activités de tes amis.
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={handleActivate}
                  disabled={activating}
                  className="text-xs h-8"
                >
                  {activating ? 'Activation...' : 'Activer les notifications'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-xs h-8 text-muted-foreground"
                >
                  Plus tard
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
