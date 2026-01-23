import { useNavigate } from 'react-router-dom';
import { useMemo, useCallback } from 'react';
import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Target, Users, Zap, ArrowRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserGrade } from '@/hooks/useUserGrade';
import { GAMES_CONFIG, computeGamesStats, canAccessGame, Game } from '@/lib/gamesConfig';
import { GamesHubSkeleton } from '@/components/shared/SkeletonLoaders';

const GamesHub = () => {
  const navigate = useNavigate();
  const { isSuperUser, isLoading } = useUserGrade();

  // Stable user object for memoization
  const user = useMemo(() => ({ isSuperUser }), [isSuperUser]);

  // Derived stats (memoized)
  const stats = useMemo(
    () => computeGamesStats(GAMES_CONFIG, user),
    [user]
  );

  // Centralized navigation handler
  const handlePlay = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <Layout>
      {/* Scroll container inside Layout */}
      <main className="h-[calc(100dvh-3.5rem)] lg:h-dvh flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <header className="shrink-0 px-4 py-6 bg-background">
          <div className="max-w-4xl mx-auto">
            <PageHeader
              title="Jeux Éducatifs"
              subtitle="Apprends en t'amusant avec nos jeux interactifs!"
              icon={<Gamepad2 className="w-8 h-8 text-primary" />}
            />
          </div>
        </header>

        {/* Scrollable Content */}
        <section className="flex-1 overflow-y-auto overscroll-contain px-4 pb-24 lg:pb-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {isLoading ? (
              <GamesHubSkeleton />
            ) : (
              <>
                {/* Games Grid */}
                <div className="grid gap-4 md:gap-6">
                  {GAMES_CONFIG.map((game) => {
                    const isLocked = !canAccessGame(game, user);
                    return (
                      <Card
                        key={game.id}
                        className={cn(
                          "overflow-hidden border-2 transition-all duration-300 group relative",
                          isLocked
                            ? "border-muted cursor-not-allowed"
                            : "border-transparent hover:border-primary/20 cursor-pointer"
                        )}
                        onClick={() => !isLocked && handlePlay(game.path)}
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
                                  {game.isNew && !isLocked && (
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
                                    isLocked
                                      ? "bg-muted text-muted-foreground"
                                      : cn("bg-gradient-to-r group-hover:shadow-lg", game.color)
                                  )}
                                  disabled={isLocked}
                                >
                                  {isLocked ? (
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
                        {isLocked && (
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
                    );
                  })}
                </div>

                {/* Dynamic Stats */}
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <Target className="w-6 h-6 text-primary mx-auto mb-1" />
                        <div className="text-lg font-bold text-foreground">
                          {stats.playableGames}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Jeux disponibles
                        </div>
                      </div>
                      <div>
                        <Zap className="w-6 h-6 text-accent mx-auto mb-1" />
                        <div className="text-lg font-bold text-foreground">
                          {stats.totalXP}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          XP à gagner
                        </div>
                      </div>
                      <div>
                        <Users className="w-6 h-6 text-secondary mx-auto mb-1" />
                        <div className="text-lg font-bold text-foreground">
                          {stats.hasMultiplayer ? 'Oui' : 'Non'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Multijoueur
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default GamesHub;
