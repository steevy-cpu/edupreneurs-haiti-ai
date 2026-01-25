import { useState, useEffect } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Swords, Trophy, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';

const QuizBattle = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const { isVisitor } = useVisitor();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { stats, badges, isLoading: statsLoading } = useBattleStats(userId);

  useEffect(() => {
    const checkAuth = async () => {
      if (isVisitor) {
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth/login');
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

  const handleJoinWithCode = () => {
    const code = joinCode.trim().toUpperCase();
    
    if (!code || code.length !== 6) {
      toast.error('Le code doit contenir 6 caractères');
      return;
    }

    if (isVisitor) {
      toast.info('Créez un compte pour rejoindre une partie!');
      return;
    }

    // Navigate directly - let lobby handle validation (3G optimization)
    navigate(`/quiz-battle/lobby?mode=friend&joinCode=${code}`);
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
          icon={<Swords className="w-8 h-8 text-primary" />}
        />

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

        {/* Join with Code Section */}
        <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="py-6">
            <h2 className="text-xl font-bold text-foreground mb-1">Rejoindre une partie</h2>
            <p className="text-sm text-muted-foreground mb-4">Entre le code d'invitation</p>
            
            <div className="space-y-3">
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="XXXXXX"
                className="text-center text-xl font-mono tracking-widest h-14 uppercase"
                maxLength={6}
              />
              <Button
                onClick={handleJoinWithCode}
                disabled={!joinCode.trim()}
                className="w-full h-12 text-base"
              >
                Rejoindre
              </Button>
            </div>
          </CardContent>
        </Card>

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
