import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const IOSPushNotificationGuide = () => {
  return (
    <Alert className="mb-4 border-orange-500/50 bg-orange-500/10">
      <AlertCircle className="h-4 w-4 text-orange-500" />
      <AlertTitle className="text-orange-500">📱 Instructions spéciales pour iPhone</AlertTitle>
      <AlertDescription className="text-sm space-y-3">
        <p className="font-medium">Les notifications sur iPhone nécessitent iOS 16.4 ou supérieur et ces étapes:</p>
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li className="font-medium">
            Ajouter l'app à l'écran d'accueil:
            <ul className="list-disc list-inside ml-4 mt-1 text-xs text-muted-foreground">
              <li>Appuyez sur le bouton "Partager" en bas de Safari</li>
              <li>Sélectionnez "Sur l'écran d'accueil"</li>
              <li>Confirmez l'ajout</li>
            </ul>
          </li>
          <li className="font-medium">
            Ouvrir l'app depuis l'écran d'accueil (PAS Safari)
          </li>
          <li className="font-medium">
            Accepter les notifications dans l'app installée
          </li>
        </ol>
        <div className="bg-background/50 p-2 rounded text-xs mt-2 space-y-1">
          <p className="font-medium text-orange-500">⚠️ Important:</p>
          <p>• Les notifications ne fonctionnent PAS dans Safari</p>
          <p>• Vous devez utiliser l'app installée sur l'écran d'accueil</p>
          <p>• iOS 16.4+ est obligatoire</p>
        </div>
      </AlertDescription>
    </Alert>
  );
};
