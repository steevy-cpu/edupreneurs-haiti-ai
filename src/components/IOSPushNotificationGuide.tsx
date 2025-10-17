import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const IOSPushNotificationGuide = () => {
  return (
    <Alert className="mb-4 border-orange-500/50 bg-orange-500/10">
      <AlertCircle className="h-4 w-4 text-orange-500" />
      <AlertTitle className="text-orange-500 text-base">📱 Installation requise pour les notifications iPhone</AlertTitle>
      <AlertDescription className="text-sm space-y-3 mt-3">
        <div className="font-medium text-foreground">
          Sur iPhone, les notifications fonctionnent <strong>uniquement</strong> si l'app est installée sur l'écran d'accueil:
        </div>
        
        <ol className="list-decimal list-inside space-y-3 ml-2">
          <li className="font-medium">
            <strong>Dans Safari</strong>, appuyez sur le bouton Partager 
            <svg className="inline w-5 h-5 mx-1 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
            (en bas de l'écran)
          </li>
          <li className="font-medium">
            Sélectionnez <strong>"Sur l'écran d'accueil"</strong>
          </li>
          <li className="font-medium">
            Appuyez sur <strong>"Ajouter"</strong>
          </li>
          <li className="font-medium text-primary">
            Ouvrez l'app depuis votre <strong>écran d'accueil</strong> (icône EDUPRENEURS)
          </li>
          <li className="font-medium text-green-600 dark:text-green-400">
            Autorisez les notifications ✅
          </li>
        </ol>
        
        <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg text-xs mt-3 space-y-2 border border-orange-300 dark:border-orange-700">
          <p className="font-bold text-orange-700 dark:text-orange-300 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span>Très Important:</span>
          </p>
          <ul className="space-y-1 ml-6 text-orange-800 dark:text-orange-200">
            <li>❌ Les notifications <strong>ne fonctionnent PAS</strong> dans Safari</li>
            <li>✅ Elles fonctionnent <strong>uniquement dans l'app installée</strong></li>
            <li>📱 Nécessite <strong>iOS 16.4 ou supérieur</strong></li>
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
};
