import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, WifiOff, Bell, Download, Share, PlusSquare, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import ericPointingUp from '@/assets/eric-pointing-up.png';

interface PWAInstallPromptProps {
  isIOS: boolean;
  isPromptAvailable?: boolean;
  showCelebration?: boolean;
  onInstall: () => Promise<void>;
  onDismiss: () => void;
  onCloseCelebration?: () => void;
}

/** iOS step-by-step Safari instructions with numbered cards */
const IOSInstructions = () => (
  <div className="space-y-3">
    <p className="text-sm font-medium text-center mb-4">Suis ces étapes sur Safari :</p>
    {[
      { step: 1, icon: Share, text: "Appuie sur le bouton Partager", sub: "En bas de ton navigateur Safari" },
      { step: 2, icon: PlusSquare, text: "Sélectionne \"Sur l'écran d'accueil\"", sub: "Fais défiler vers le bas dans le menu" },
      { step: 3, icon: CheckCircle, text: "Appuie sur \"Ajouter\"", sub: "L'app apparaîtra sur ton écran d'accueil" },
    ].map(({ step, icon: Icon, text, sub }) => (
      <div key={step} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-bold text-sm">
          {step}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{text}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        </div>
      </div>
    ))}
  </div>
);

export const PWAInstallPrompt = ({
  isIOS,
  isPromptAvailable,
  showCelebration,
  onInstall,
  onDismiss,
  onCloseCelebration,
}: PWAInstallPromptProps) => {

  // Fix 4 — Auto-dismiss celebration after 4 seconds
  useEffect(() => {
    if (!showCelebration) return;
    const timer = setTimeout(() => onCloseCelebration?.(), 4000);
    return () => clearTimeout(timer);
  }, [showCelebration, onCloseCelebration]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop — dismiss on tap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Bottom sheet with spring slide-up */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-card rounded-t-3xl p-6 pb-8 shadow-2xl border-t border-border/50"
      >
        {/* Handle bar */}
        <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-6" />

        {showCelebration ? (
          /* Fix 4 — Post-install celebration view */
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-4"
          >
            <img src={ericPointingUp} alt="Eric" className="w-24 h-24 mx-auto mb-4 object-contain" loading="lazy" />
            <h3 className="text-xl font-bold mb-2">🎉 Super!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Edupreneurs est maintenant sur ton écran d'accueil. Tu peux y accéder en un tap!
            </p>
            <Button onClick={onCloseCelebration} className="w-full">
              Continuer
            </Button>
          </motion.div>
        ) : (
          /* Main install prompt content */
          <>
            {/* App info row — icon, name, stars */}
            <div className="flex items-center gap-4 mb-5">
              <img
                src="/pwa-icon.jpeg"
                alt="Edupreneurs"
                className="w-16 h-16 rounded-2xl border border-border/50"
                loading="lazy"
                decoding="async"
              />
              <div>
                <h3 className="font-bold text-lg">Edupreneurs</h3>
                <p className="text-sm text-muted-foreground">Plateforme éducative IA</p>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1">Application gratuite</span>
                </div>
              </div>
            </div>

            {/* 3 benefit items */}
            <div className="space-y-2 mb-6">
              {[
                { icon: Zap, text: "Accès instantané depuis ton écran d'accueil" },
                { icon: WifiOff, text: "Fonctionne même avec une connexion lente" },
                { icon: Bell, text: "Reçois tes notifications en temps réel" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* CTA — iOS instructions or install button */}
            {isIOS ? (
              <IOSInstructions />
            ) : (
              <Button className="w-full h-12 text-base font-semibold" onClick={onInstall}>
                <Download className="w-5 h-5 mr-2" />
                Ajouter à l'écran d'accueil
              </Button>
            )}

            {/* Soft dismiss link */}
            <button
              onClick={onDismiss}
              className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Plus tard
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};
