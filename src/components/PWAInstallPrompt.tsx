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
    <div className="mb-6">
      <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-4 p-4 pr-12">
          {/* Eric mascot */}
          <div className="flex-shrink-0">
            <img 
              src={ericPointingUp} 
              alt="Eric" 
              className="h-16 w-16 object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base mb-2">
              📱 Ajoutez Edupreneurs à votre écran d'accueil
            </h3>

            {isIOS ? (
              // iOS Instructions
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Pour un accès rapide, suivez ces étapes :
                </p>
                <div className="flex items-center gap-2 text-sm bg-background/50 rounded-lg p-3 border border-primary/10">
                  <div className="flex items-center gap-1.5 text-primary font-medium">
                    <Share2 className="h-4 w-4" />
                    <span>Partager</span>
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="flex items-center gap-1.5 text-primary font-medium">
                    <Plus className="h-4 w-4" />
                    <span>Sur l'écran d'accueil</span>
                  </div>
                </div>
              </div>
            ) : (
              // Android/Chrome
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground flex-1">
                  Accédez rapidement à l'application depuis votre écran d'accueil
                </p>
                <Button 
                  onClick={onInstall}
                  size="sm"
                  className="shrink-0"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
