import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Swords, Crown, Target, Users, Zap, ArrowRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserGrade } from '@/hooks/useUserGrade';

const GamesHub = () => {
  const navigate = useNavigate();
  const { isSuperUser, isLoading } = useUserGrade();

  const games = [
    {
      id: 'quiz-battle',
      title: 'Quiz Battle',
      description: 'Teste tes connaissances et défie tes amis dans des quiz éducatifs!',
      icon: Swords,
      color: 'from-primary to-secondary',
      features: ['Mode Solo', 'Multijoueur', 'Badges & XP'],
      path: '/quiz-battle',
      isNew: true,
      isLocked: !isLoading && !isSuperUser,
    },
    {
      id: 'chess',
      title: 'Échecs',
      description: 'Joue aux échecs contre l\'IA et améliore tes compétences stratégiques.',
      icon: Crown,
      color: 'from-secondary to-accent',
      features: ['Contre l\'IA', 'Puzzles', 'Classement ELO'],
      path: '/chess-game',
      isNew: false,
      isLocked: false,
    },
  ];

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <PageHeader
          title="Jeux Éducatifs"
          subtitle="Apprends en t'amusant avec nos jeux interactifs!"
          icon={<Gamepad2 className="w-8 h-8 text-primary" />}
        />

        <div className="grid gap-4 md:gap-6">
          {games.map((game) => (
            <Card 
              key={game.id}
              className={cn(
                "overflow-hidden border-2 transition-all duration-300 group relative",
                game.isLocked 
                  ? "border-muted cursor-not-allowed" 
                  : "border-transparent hover:border-primary/20 cursor-pointer"
              )}
              onClick={() => !game.isLocked && navigate(game.path)}
            >
              <CardContent className="p-0">
                <div className={cn(
                  "bg-gradient-to-br p-6",
                  game.color.includes('primary') 
                    ? 'from-primary/10 via-primary/5 to-transparent' 
                    : 'from-secondary/10 via-secondary/5 to-transparent'
                )}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className={cn(
                      "p-4 rounded-2xl self-start",
                      `bg-gradient-to-br ${game.color} shadow-lg`
                    )}>
                      <game.icon className="w-10 h-10 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-foreground">{game.title}</h3>
                        {game.isNew && !game.isLocked && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-accent text-accent-foreground rounded-full animate-pulse">
                            NOUVEAU
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">
                        {game.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {game.features.map((feature, i) => (
                          <span 
                            key={i}
                            className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      <Button 
                        className={cn(
                          "shadow-md transition-all",
                          game.isLocked 
                            ? "bg-muted text-muted-foreground" 
                            : cn("bg-gradient-to-r group-hover:shadow-lg", game.color)
                        )}
                        disabled={game.isLocked}
                      >
                        {game.isLocked ? (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Verrouillé
                          </>
                        ) : (
                          <>
                            Jouer
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              {/* Lock Overlay */}
              {game.isLocked && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-lg">
                  <div className="flex flex-col items-center gap-3 text-center p-4">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                      <Lock className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Bientôt disponible</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cette fonctionnalité arrive très prochainement!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Target className="w-6 h-6 text-primary mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">2</div>
                <div className="text-xs text-muted-foreground">Jeux disponibles</div>
              </div>
              <div>
                <Zap className="w-6 h-6 text-accent mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">XP</div>
                <div className="text-xs text-muted-foreground">À gagner</div>
              </div>
              <div>
                <Users className="w-6 h-6 text-secondary mx-auto mb-1" />
                <div className="text-lg font-bold text-foreground">Multi</div>
                <div className="text-xs text-muted-foreground">Joueurs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default GamesHub;
