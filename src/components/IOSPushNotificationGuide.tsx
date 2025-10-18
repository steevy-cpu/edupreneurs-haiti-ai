import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const IOSPushNotificationGuide = () => {
  return (
    <Alert className="border-orange-500/50 bg-orange-500/10">
      <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 shrink-0" />
      <AlertTitle className="text-orange-500 text-sm sm:text-base leading-tight">📱 Installation requise pour iPhone</AlertTitle>
      <AlertDescription className="text-xs sm:text-sm space-y-2 sm:space-y-3 mt-2">
        <div className="font-medium text-foreground text-xs sm:text-sm">
          Les notifications fonctionnent <strong>uniquement</strong> si l'app est installée:
        </div>
        
        <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm">
          <li className="font-medium pl-1">
            <strong>Dans Safari</strong>, appuyez sur Partager 
            <svg className="inline w-4 h-4 mx-0.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
            </svg>
          </li>
          <li className="font-medium pl-1">
            <strong>"Sur l'écran d'accueil"</strong> → <strong>"Ajouter"</strong>
          </li>
          <li className="font-medium text-primary pl-1">
            Ouvrez depuis l'<strong>écran d'accueil</strong>
          </li>
          <li className="font-medium text-green-600 dark:text-green-400 pl-1">
            Autorisez les notifications ✅
          </li>
        </ol>
        
        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 sm:p-3 rounded-lg text-xs space-y-1.5 border border-orange-300 dark:border-orange-700">
          <p className="font-bold text-orange-700 dark:text-orange-300 flex items-center gap-1.5">
            <span className="text-base sm:text-xl">⚠️</span>
            <span>Important:</span>
          </p>
          <ul className="space-y-0.5 ml-4 sm:ml-6 text-orange-800 dark:text-orange-200">
            <li className="text-[10px] sm:text-xs">❌ Ne fonctionne PAS dans Safari</li>
            <li className="text-[10px] sm:text-xs">✅ Uniquement dans l'app installée</li>
            <li className="text-[10px] sm:text-xs">📱 iOS 16.4+ requis</li>
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
};
