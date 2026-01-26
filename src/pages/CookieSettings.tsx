import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Cookie, Shield, BarChart3, Megaphone } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { toast } from "sonner";

export default function CookieSettings() {
  const navigate = useNavigate();
  const { preferences, updatePreferences, acceptAll, acceptEssential, resetConsent } = useCookieConsent();

  const handleSave = () => {
    toast.success("Préférences de cookies enregistrées");
    navigate("/");
  };

  const handleAcceptAll = () => {
    acceptAll();
    toast.success("Tous les cookies acceptés");
    navigate("/");
  };

  const handleAcceptEssential = () => {
    acceptEssential();
    toast.success("Cookies essentiels uniquement");
    navigate("/");
  };

  const handleReset = () => {
    resetConsent();
    toast.success("Préférences réinitialisées");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 lg:pb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Cookie className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Paramètres des Cookies</h1>
              <p className="text-muted-foreground">Gérez vos préférences de confidentialité</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <CardTitle className="text-lg">Cookies Essentiels</CardTitle>
              </div>
              <CardDescription>
                Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés.
                Ils permettent l'authentification, la sécurité et les fonctionnalités de base.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="essential" className="text-muted-foreground">
                  Toujours actif
                </Label>
                <Switch id="essential" checked disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Cookies Analytiques</CardTitle>
              </div>
              <CardDescription>
                Ces cookies nous aident à comprendre comment vous utilisez le site, 
                quelles pages sont les plus populaires, et comment améliorer votre expérience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics">
                  Autoriser les cookies analytiques
                </Label>
                <Switch 
                  id="analytics" 
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => updatePreferences({ analytics: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-lg">Cookies Marketing</CardTitle>
              </div>
              <CardDescription>
                Ces cookies sont utilisés pour vous montrer des contenus pertinents 
                et personnaliser votre expérience sur le site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="marketing">
                  Autoriser les cookies marketing
                </Label>
                <Switch 
                  id="marketing" 
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => updatePreferences({ marketing: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleAcceptAll} className="flex-1">
              Accepter tout
            </Button>
            <Button onClick={handleAcceptEssential} variant="outline" className="flex-1">
              Essentiels uniquement
            </Button>
          </div>

          <Button onClick={handleSave} className="w-full" size="lg">
            Enregistrer mes préférences
          </Button>

          <div className="text-center">
            <Button 
              variant="link" 
              onClick={handleReset}
              className="text-muted-foreground text-sm"
            >
              Réinitialiser mes choix
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Pour plus d'informations, consultez notre{" "}
            <a href="/privacy-policy" className="underline hover:text-primary">
              Politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
