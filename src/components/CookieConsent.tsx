import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useCookieConsent, emitConsentChange, onConsentChange } from "@/hooks/useCookieConsent";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const { hasDecided, acceptAll, acceptEssential, decline } = useCookieConsent();

  useEffect(() => {
    // Delay showing the banner for better UX
    if (!hasDecided) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [hasDecided]);

  // Listen for consent reset events to show banner again
  useEffect(() => {
    const unsubscribe = onConsentChange((accepted) => {
      if (!accepted) {
        // Consent was reset, show the banner again
        setShowBanner(true);
      }
    });
    return () => { unsubscribe(); };
  }, []);

  const handleAcceptAll = () => {
    acceptAll();
    setShowBanner(false);
    emitConsentChange(true);
  };

  const handleAcceptEssential = () => {
    acceptEssential();
    setShowBanner(false);
    emitConsentChange(true);
  };

  const handleDecline = () => {
    decline();
    setShowBanner(false);
    emitConsentChange(false);
  };

  if (!showBanner || hasDecided) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1002] bg-background/95 backdrop-blur-sm border-t border-border shadow-lg animate-in slide-in-from-bottom-5 duration-300">
      <div className="container mx-auto px-4 py-4 md:py-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1 text-sm text-foreground">
            <p className="font-medium mb-1 flex items-center gap-2">
              🍪 Ce site utilise des cookies
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Nous utilisons des cookies essentiels pour le fonctionnement du site, 
              et des cookies optionnels pour améliorer votre expérience et analyser notre trafic.{" "}
              <Link to="/privacy-policy" className="underline hover:text-primary">
                Politique de confidentialité
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDecline}
              className="text-muted-foreground hover:text-foreground"
            >
              Refuser tout
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAcceptEssential}
              className="flex-1 sm:flex-none"
            >
              Essentiels uniquement
            </Button>
            <Button
              size="sm"
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-none"
            >
              Accepter tout
            </Button>
            <Link to="/cookie-settings">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                title="Paramètres des cookies"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDecline}
              className="shrink-0"
              title="Fermer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
