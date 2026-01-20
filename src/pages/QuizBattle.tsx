import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useVisitor } from '@/contexts/VisitorContext';
import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/shared/PageHeader';
import { BattleModeSelector } from '@/components/quiz-battle/BattleModeSelector';
import { BattleStatsCard } from '@/components/quiz-battle/BattleStatsCard';
import { BattleBadgesDisplay } from '@/components/quiz-battle/BattleBadgesDisplay';
import { BattleLeaderboardPreview } from '@/components/quiz-battle/BattleLeaderboardPreview';
import { VisitorBattleOverlay } from '@/components/quiz-battle/VisitorBattleOverlay';
import { useBattleStats } from '@/hooks/useBattleStats';
import { Swords, Trophy, Target, Zap, Volume2, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { generateAllQuizBattleSounds, GenerationResult, SOUND_PROMPTS } from '@/utils/generateQuizBattleSounds';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const QuizBattle = () => {
  const navigate = useNavigate();
  const { isVisitor } = useVisitor();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Admin sound generator state
  const [showSoundAdmin, setShowSoundAdmin] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0, currentSound: '' });
  const [generationResults, setGenerationResults] = useState<GenerationResult[]>([]);
  const tapCountRef = useRef(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { stats, badges, isLoading: statsLoading } = useBattleStats(userId);
  
  // Secret triple-tap handler to reveal admin panel
  const handleIconTap = () => {
    tapCountRef.current += 1;
    
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    
    if (tapCountRef.current >= 3) {
      setShowSoundAdmin(prev => !prev);
      tapCountRef.current = 0;
      return;
    }
    
    tapTimeoutRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 1000);
  };
  
  // Generate sounds handler with protection against double-clicks
  const handleGenerateSounds = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setGenerationResults([]);
    
    try {
      const results = await generateAllQuizBattleSounds(
        (current, total, currentSound) => {
          setGenerationProgress({ current, total, currentSound });
        }
      );
      
      setGenerationResults(results);
      
      const successCount = results.filter(r => r.success).length;
      if (successCount === results.length) {
        toast.success(`${successCount} sons générés avec succès!`);
      } else {
        toast.warning(`${successCount}/${results.length} sons générés`);
      }
    } catch (error) {
      console.error('Sound generation error:', error);
      toast.error('Erreur lors de la génération des sons');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (isVisitor) {
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate, isVisitor]);

  const handleStartSolo = () => {
    if (isVisitor) {
      toast.info('Créez un compte pour jouer au Quiz Battle!');
      return;
    }
    navigate('/quiz-battle/solo');
  };

  const handleInviteFriend = () => {
    if (isVisitor) {
      toast.info('Créez un compte pour défier vos amis!');
      return;
    }
    navigate('/quiz-battle/lobby?mode=friend');
  };

  const handleRandomMatch = () => {
    if (isVisitor) {
      toast.info('Créez un compte pour jouer en ligne!');
      return;
    }
    navigate('/quiz-battle/lobby?mode=random');
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {isVisitor && <VisitorBattleOverlay />}
        
        <PageHeader
          title="Quiz Battle"
          subtitle="Teste tes connaissances et défie tes amis!"
          icon={<Swords className="w-8 h-8 text-primary cursor-pointer" onClick={handleIconTap} />}
        />
        
        {/* Admin: Sound Generator Panel - Hidden by default */}
        {showSoundAdmin && (
          <Card className="border-orange-500/50 bg-orange-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-orange-600 text-base">
                <Volume2 className="w-5 h-5" />
                Admin: Générateur de Sons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Génère {SOUND_PROMPTS.length} effets sonores avec ElevenLabs. 
                Cette action ne doit être exécutée qu'une seule fois.
              </p>
              
              <Button 
                onClick={handleGenerateSounds}
                disabled={isGenerating}
                className="w-full"
                variant="outline"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération {generationProgress.current}/{generationProgress.total}: {generationProgress.currentSound}
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Générer tous les sons
                  </>
                )}
              </Button>
              
              {generationResults.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground">Résultats:</p>
                  {generationResults.map((result) => (
                    <div key={result.type} className="flex items-center gap-2 text-sm">
                      {result.success ? (
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <span className="font-mono text-xs">{result.type}</span>
                      {result.cached && <span className="text-xs text-muted-foreground">(déjà en cache)</span>}
                      {result.size && <span className="text-xs text-muted-foreground">({Math.round(result.size / 1024)}KB)</span>}
                      {result.error && <span className="text-xs text-red-500 truncate">{result.error}</span>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 text-center">
            <Trophy className="w-6 h-6 text-primary mx-auto mb-1" />
            <div className="text-2xl font-bold text-foreground">{stats?.battles_won || 0}</div>
            <div className="text-xs text-muted-foreground">Victoires</div>
          </div>
          <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-4 text-center">
            <Zap className="w-6 h-6 text-secondary mx-auto mb-1" />
            <div className="text-2xl font-bold text-foreground">{stats?.current_streak || 0}</div>
            <div className="text-xs text-muted-foreground">Série</div>
          </div>
          <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-4 text-center">
            <Target className="w-6 h-6 text-accent mx-auto mb-1" />
            <div className="text-2xl font-bold text-foreground">{stats?.total_xp || 0}</div>
            <div className="text-xs text-muted-foreground">XP Total</div>
          </div>
          <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-xl p-4 text-center">
            <Swords className="w-6 h-6 text-success mx-auto mb-1" />
            <div className="text-2xl font-bold text-foreground">{stats?.level || 1}</div>
            <div className="text-xs text-muted-foreground">Niveau</div>
          </div>
        </div>

        {/* Mode Selector */}
        <BattleModeSelector
          onStartSolo={handleStartSolo}
          onInviteFriend={handleInviteFriend}
          onRandomMatch={handleRandomMatch}
        />

        {/* Stats & Progress */}
        <div className="grid md:grid-cols-2 gap-6">
          <BattleStatsCard stats={stats} isLoading={statsLoading} />
          <BattleBadgesDisplay badges={badges} isLoading={statsLoading} />
        </div>

        {/* Leaderboard Preview */}
        <BattleLeaderboardPreview />
      </div>
    </Layout>
  );
};

export default QuizBattle;
