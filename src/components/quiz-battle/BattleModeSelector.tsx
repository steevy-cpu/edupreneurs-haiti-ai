import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Users, Globe, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BattleModeSelectorProps {
  onStartSolo: () => void;
  onInviteFriend: () => void;
  onRandomMatch: () => void;
}

export const BattleModeSelector = ({
  onStartSolo,
  onInviteFriend,
  onRandomMatch,
}: BattleModeSelectorProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Solo Mode Card */}
      <Card className="overflow-hidden border-2 border-transparent hover:border-primary/30 transition-all duration-300 group">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">Mode Solo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Entraîne-toi seul sur tes cours et améliore tes connaissances à ton rythme.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Choisis ta matière et difficulté
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    10 questions chronométrées
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Feedback pédagogique détaillé
                  </li>
                </ul>
                <Button 
                  onClick={onStartSolo}
                  className="w-full bg-primary hover:bg-primary/90 group-hover:shadow-lg transition-all"
                >
                  Jouer Solo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multiplayer Mode Card */}
      <Card className="overflow-hidden border-2 border-transparent hover:border-secondary/30 transition-all duration-300 group">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">Multijoueur</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Défie tes amis ou affronte des joueurs du monde entier en temps réel!
                </p>
                <div className="space-y-2 mb-4">
                  <Button 
                    onClick={onInviteFriend}
                    variant="outline"
                    className="w-full border-secondary/30 hover:bg-secondary/10 hover:border-secondary/50"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Inviter un ami
                  </Button>
                  <Button 
                    onClick={onRandomMatch}
                    className="w-full bg-secondary hover:bg-secondary/90 group-hover:shadow-lg transition-all"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Joueur aléatoire
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
