import { X, Download, Share2, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import ericPointingUp from '@/assets/eric-pointing-up.png';

interface PWAInstallPromptProps {
  isIOS: boolean;
  onInstall: () => Promise<void>;
  onDismiss: () => void;
}

export const PWAInstallPrompt = ({ isIOS, onInstall, onDismiss }: PWAInstallPromptProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-in-up">
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-4 p-4">
          {/* Eric mascot */}
          <div className="flex-shrink-0">
            <img 
              src={ericPointingUp} 
              alt="Eric" 
              className="h-20 w-20 object-contain animate-bounce"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2">
              Ajouter Edupreneurs sur votre écran d'accueil
            </h3>
            
            <p className="text-sm text-muted-foreground mb-3">
              Accédez rapidement à l'application
            </p>

            <div className="flex gap-2">
              {isIOS ? (
                // iOS Instructions - simplified
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2">
                    Appuyez sur <Share2 className="inline h-3 w-3 mx-1" /> puis "<Plus className="inline h-3 w-3 mx-1" />Sur l'écran d'accueil"
                  </p>
                </div>
              ) : (
                // Android/Chrome - Direct install button
                <Button 
                  onClick={onInstall}
                  className="flex-1"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Oui, ajouter
                </Button>
              )}
              <Button 
                onClick={onDismiss}
                variant="outline"
                size="sm"
              >
                Plus tard
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      </Card>
    </div>
  );
};
