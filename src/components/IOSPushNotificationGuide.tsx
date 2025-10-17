import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const IOSPushNotificationGuide = () => {
  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>📱 Notifications sur iPhone</AlertTitle>
      <AlertDescription className="text-sm space-y-2">
        <p>Pour recevoir les notifications sur iPhone, vous devez:</p>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Ajouter l'application à votre écran d'accueil</li>
          <li>Ouvrir l'app depuis l'écran d'accueil (pas Safari)</li>
          <li>Accepter les notifications quand demandé</li>
        </ol>
        <p className="text-muted-foreground text-xs mt-2">
          ⚠️ Les notifications ne fonctionnent pas dans Safari sur iPhone
        </p>
      </AlertDescription>
    </Alert>
  );
};
