import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 text-sm text-foreground">
            <p className="font-medium mb-1">🍪 Ce site utilise des cookies</p>
            <p className="text-muted-foreground">
              Nous utilisons des cookies pour améliorer votre expérience, personnaliser le contenu et analyser notre trafic. 
              En acceptant, vous consentez à l'utilisation de ces technologies.{" "}
              <Link to="/privacy-policy" className="underline hover:text-primary">
                Politique de confidentialité
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={declineCookies}
              className="flex-1 md:flex-none"
            >
              Refuser
            </Button>
            <Button
              size="sm"
              onClick={acceptCookies}
              className="flex-1 md:flex-none"
            >
              Accepter
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={declineCookies}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
