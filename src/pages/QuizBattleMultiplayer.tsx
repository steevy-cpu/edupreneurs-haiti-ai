import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { BattleGameplay } from '@/components/quiz-battle/BattleGameplay';
import { MultiplayerBattleGameplay } from '@/components/quiz-battle/MultiplayerBattleGameplay';
import { MultiplayerResults } from '@/components/quiz-battle/MultiplayerResults';
import { QuizLoadingState } from '@/components/quiz-battle/QuizLoadingState';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2, Swords, Trophy } from 'lucide-react';
import { calculateLevel, getWeekStart } from '@/lib/quizBattleUtils';
import type { BattleQuestion, BattleResult } from './QuizBattleSolo';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';

type GamePhase = 'loading' | 'generating' | 'playing' | 'waiting-opponent' | 'results';

interface OpponentProgress {
  score: number;
  correctAnswers: number;
  finished: boolean;
}

const QuizBattleMultiplayer = () => {
  const navigate = useNavigate();
  const { battleId } = useParams<{ battleId: string }>();
  
  const [userId, setUserId] = useState<string | null>(null);
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [questions, setQuestions] = useState<BattleQuestion[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [myResult, setMyResult] = useState<BattleResult | null>(null);
  const [opponentResult, setOpponentResult] = useState<OpponentProgress | null>(null);
  const [opponent, setOpponent] = useState<{ id: string; nickname: string; avatar_url: string | null } | null>(null);
  const [myProfile, setMyProfile] = useState<{ nickname: string; avatar_url: string | null } | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [battleMode, setBattleMode] = useState<'friend' | 'random' | 'solo'>('random');

  // Helper to safely cancel a battle that's still in 'waiting' status
  const cancelBattleSafely = useCallback(async (id: string) => {
    try {
      await supabase
        .from('quiz_battles')
        .update({ status: 'cancelled', ended_at: new Date().toISOString() })
        .eq('id', id)
        .eq('status', 'waiting'); // Only cancel if still waiting
      console.log('[QuizBattleMultiplayer] Cancelled waiting battle:', id);
    } catch (err) {
      console.error('[QuizBattleMultiplayer] Error cancelling battle:', err);
    }
  }, []);

  // Subscribe to opponent's progress
  useRealtimeSubscription({
    table: 'quiz_battle_players',
    event: 'UPDATE',
    filter: battleId ? `battle_id=eq.${battleId}` : undefined,
    callback: (payload) => {
      const player = payload.new as any;
      if (player.user_id !== userId) {
        setOpponentResult({
          score: player.score || 0,
          correctAnswers: player.correct_answers || 0,
          finished: !!player.finished_at,
        });
      }
    },
    enabled: !!battleId && !!userId && phase === 'playing',
  });

  // Check auth and load battle
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);

      if (!battleId) {
        navigate('/quiz-battle');
        return;
      }

      // Load battle info
      const { data: battle, error } = await supabase
        .from('quiz_battles')
        .select('*, quiz_battle_players(*)')
        .eq('id', battleId)
        .single();

      if (error || !battle) {
        toast.error('Bataille introuvable');
        navigate('/quiz-battle');
        return;
      }

      // CRITICAL: Check if battle is already finished - prevent restart on refresh
      if (battle.status === 'completed' || battle.status === 'cancelled') {
        console.log('[Multiplayer] Battle already finished, redirecting to lobby');
        toast.info('Cette bataille est terminée');
        navigate('/quiz-battle/lobby');
        return;
      }

      setDifficulty(battle.difficulty as any);
      setBattleMode(battle.mode as any);
      
      // CRITICAL: Compute host status synchronously BEFORE using it for branching
      // React state updates (setIsHost) are async and won't be available in same render
      const host = battle.created_by === user.id;
      setIsHost(host);
      console.log('[Multiplayer] Battle loaded, host=', host, 'battleId=', battleId, 'mode=', battle.mode);

      // Fetch my profile
      const { data: myProfileData } = await supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (myProfileData) {
        setMyProfile({
          nickname: myProfileData.nickname,
          avatar_url: myProfileData.avatar_url,
        });
      }

      // Find opponent
      const opponentPlayer = battle.quiz_battle_players?.find(
        (p: any) => p.user_id !== user.id
      );

      if (opponentPlayer) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id, nickname, avatar_url')
          .eq('user_id', opponentPlayer.user_id)
          .single();

        if (profile) {
          setOpponent({
            id: profile.user_id,
            nickname: profile.nickname,
            avatar_url: profile.avatar_url,
          });
        }
      }

      // Check if questions already generated
      if (battle.questions && Array.isArray(battle.questions) && battle.questions.length > 0) {
        console.log('[Multiplayer] Questions already exist, starting gameplay');
        setQuestions(battle.questions as unknown as BattleQuestion[]);
        setPhase('playing');
      } else if (host) {
        // Host generates questions - use local 'host' variable, NOT state
        console.log('[Multiplayer] Host generating questions...');
        setPhase('generating');
        setGenerationStartTime(Date.now());
        await generateQuestions(battle);
      } else {
        // Guest waits for questions
        console.log('[Multiplayer] Guest polling for questions...');
        setPhase('loading');
        setGenerationStartTime(Date.now());
        pollForQuestions(battleId);
      }
    };

    init();
  }, [battleId, navigate]);

  const generateQuestions = async (battle: any) => {
    try {
      // Fetch subject info
      const { data: subject } = await supabase
        .from('subjects')
        .select('name, slug')
        .eq('id', battle.subject_id)
        .single();

      // Fetch lessons for context
      const { data: lessons } = await supabase
        .from('lessons')
        .select('title, contenu, objectif')
        .eq('subject_id', battle.subject_id)
        .eq('grade_level', battle.grade_level)
        .eq('is_published', true)
        .limit(3);

      // Generate questions
      const { data: generatedQuestions, error } = await supabase.functions.invoke(
        'generate-battle-questions',
        {
          body: {
            subject: subject?.name || 'Général',
            gradeLevel: battle.grade_level,
            difficulty: battle.difficulty,
            lessonContext: lessons?.map(l => ({
              title: l.title,
              content: l.contenu?.substring(0, 500),
              objective: l.objectif,
            })) || [],
            questionCount: 10,
          },
        }
      );

      if (error) throw error;

      const parsedQuestions = generatedQuestions?.questions || [];
      
      // Save questions to battle with sync fields initialized
      await supabase
        .from('quiz_battles')
        .update({ 
          questions: parsedQuestions,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          current_question_index: 0,
          round_started_at: new Date().toISOString(),
          round_answers: [],
        })
        .eq('id', battle.id);

      setQuestions(parsedQuestions);
      setPhase('playing');
    } catch (error) {
      console.error('Error generating questions:', error);
      toast.error('Erreur lors de la génération des questions');
      // Cancel the stuck waiting battle before navigating away
      if (battleId) await cancelBattleSafely(battleId);
      navigate('/quiz-battle');
    }
  };

  const pollForQuestions = useCallback((bId: string) => {
    let resolved = false;
    console.log('[Multiplayer] Guest starting poll for battleId:', bId);
    
    const interval = setInterval(async () => {
      if (resolved) return;
      const { data: battle } = await supabase
        .from('quiz_battles')
        .select('questions, status')
        .eq('id', bId)
        .single();

      // Exit early if battle was cancelled
      if (battle?.status === 'cancelled') {
        resolved = true;
        clearInterval(interval);
        console.log('[Multiplayer] Battle was cancelled, exiting poll');
        toast.error('La partie a été annulée');
        navigate('/quiz-battle');
        return;
      }

      if (battle?.questions && Array.isArray(battle.questions) && battle.questions.length > 0) {
        resolved = true;
        clearInterval(interval);
        console.log('[Multiplayer] Questions received:', battle.questions.length);
        setQuestions(battle.questions as unknown as BattleQuestion[]);
        setPhase('playing');
      }
    }, 1000);

    // Timeout after 45 seconds (increased for 3G + cold starts)
    setTimeout(async () => {
      clearInterval(interval);
      if (!resolved) {
        console.log('[Multiplayer] Guest poll timeout after 45s');
        toast.error('Timeout: questions non générées');
        // Cancel the stuck waiting battle before navigating away
        await cancelBattleSafely(bId);
        navigate('/quiz-battle');
      }
    }, 45000);
  }, [cancelBattleSafely, navigate]);

  const handleGameComplete = async (result: BattleResult) => {
    setMyResult(result);
    
    if (!userId || !battleId) return;

    try {
      // Handle case where I abandoned - mark battle as cancelled and exit
      if (result.wasAbandoned) {
        console.log('[Multiplayer] User abandoned, cancelling battle');
        
        await supabase
          .from('quiz_battles')
          .update({
            status: 'cancelled',
            ended_at: new Date().toISOString(),
          })
          .eq('id', battleId);
        
        // Save my progress (but with 0 XP)
        await supabase
          .from('quiz_battle_players')
          .update({
            score: result.score,
            correct_answers: result.correctAnswers,
            answers: result.answers,
            finished_at: new Date().toISOString(),
          })
          .eq('battle_id', battleId)
          .eq('user_id', userId);
        
        toast.info('Bataille annulée');
        navigate('/quiz-battle/lobby');
        return;
      }

      // Handle case where opponent abandoned - go straight to results with victory
      if (result.opponentAbandoned) {
        console.log('[Multiplayer] Opponent abandoned, showing victory results');
        setOpponentResult({
          score: 0,
          correctAnswers: 0,
          finished: true,
        });
        
        // Mark battle as completed with me as winner
        await supabase
          .from('quiz_battles')
          .update({
            status: 'completed',
            ended_at: new Date().toISOString(),
            winner_id: userId,
          })
          .eq('id', battleId);
        
        // Update my player record
        await supabase
          .from('quiz_battle_players')
          .update({
            score: result.score,
            correct_answers: result.correctAnswers,
            answers: result.answers,
            finished_at: new Date().toISOString(),
          })
          .eq('battle_id', battleId)
          .eq('user_id', userId);
        
        // Award XP and stats with win
        await finishBattle(result, { user_id: opponent?.id, score: 0, correct_answers: 0 });
        setPhase('results');
        return;
      }

      // Normal completion flow
      // Update player record
      await supabase
        .from('quiz_battle_players')
        .update({
          score: result.score,
          correct_answers: result.correctAnswers,
          answers: result.answers,
          finished_at: new Date().toISOString(),
        })
        .eq('battle_id', battleId)
        .eq('user_id', userId);

      // Check if opponent finished
      const { data: opponentPlayer } = await supabase
        .from('quiz_battle_players')
        .select('*')
        .eq('battle_id', battleId)
        .neq('user_id', userId)
        .single();

      if (opponentPlayer?.finished_at) {
        setOpponentResult({
          score: opponentPlayer.score,
          correctAnswers: opponentPlayer.correct_answers,
          finished: true,
        });
        await finishBattle(result, opponentPlayer);
        setPhase('results');
      } else {
        setPhase('waiting-opponent');
        // Poll for opponent completion
        pollForOpponentCompletion(result);
      }
    } catch (error) {
      console.error('Error saving result:', error);
    }
  };

  const pollForOpponentCompletion = (myResult: BattleResult) => {
    const interval = setInterval(async () => {
      const { data: opponentPlayer } = await supabase
        .from('quiz_battle_players')
        .select('*')
        .eq('battle_id', battleId)
        .neq('user_id', userId)
        .single();

      if (opponentPlayer?.finished_at) {
        clearInterval(interval);
        setOpponentResult({
          score: opponentPlayer.score,
          correctAnswers: opponentPlayer.correct_answers,
          finished: true,
        });
        await finishBattle(myResult, opponentPlayer);
        setPhase('results');
      }
    }, 2000);

    // Timeout after 2 minutes
    setTimeout(() => {
      clearInterval(interval);
      if (phase === 'waiting-opponent') {
        toast.info('Adversaire déconnecté - tu as gagné!');
        setOpponentResult({ score: 0, correctAnswers: 0, finished: true });
        setPhase('results');
      }
    }, 120000);
  };

  const finishBattle = async (myResult: BattleResult, opponentData: any) => {
    if (!userId || !battleId) return;

    const isWinner = myResult.score > opponentData.score;
    const isDraw = myResult.score === opponentData.score;

    try {
      // Update battle status
      await supabase
        .from('quiz_battles')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
          winner_id: isDraw ? null : (isWinner ? userId : opponentData.user_id),
        })
        .eq('id', battleId);

      // Update stats for current user
      const { data: currentStats } = await supabase
        .from('quiz_battle_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (currentStats) {
        const multiplierBonus = isWinner ? 1.5 : (isDraw ? 1.2 : 1);
        const adjustedXp = Math.round(myResult.xpEarned * multiplierBonus);
        const newTotalXp = currentStats.total_xp + adjustedXp;
        const newLevel = calculateLevel(newTotalXp);
        const newStreak = isWinner ? currentStats.current_streak + 1 : 0;
        const newMultiBattles = currentStats.multi_battles + 1;

        await supabase
          .from('quiz_battle_stats')
          .update({
            total_battles: currentStats.total_battles + 1,
            multi_battles: newMultiBattles,
            battles_won: isWinner ? currentStats.battles_won + 1 : currentStats.battles_won,
            current_streak: newStreak,
            longest_streak: Math.max(currentStats.longest_streak, newStreak),
            total_xp: newTotalXp,
            level: newLevel,
            total_correct_answers: currentStats.total_correct_answers + myResult.correctAnswers,
            total_questions_answered: currentStats.total_questions_answered + myResult.totalQuestions,
            perfect_games: myResult.isPerfect ? currentStats.perfect_games + 1 : currentStats.perfect_games,
          })
          .eq('user_id', userId);

        // Track weekly XP for weekly_champion badge
        const weekStart = getWeekStart();
        const { data: weeklyEntry } = await supabase
          .from('quiz_battle_weekly_xp')
          .select('*')
          .eq('user_id', userId)
          .eq('week_start', weekStart)
          .maybeSingle();

        if (weeklyEntry) {
          await supabase
            .from('quiz_battle_weekly_xp')
            .update({
              xp_earned: weeklyEntry.xp_earned + adjustedXp,
              battles_played: weeklyEntry.battles_played + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', weeklyEntry.id);
        } else {
          await supabase.from('quiz_battle_weekly_xp').insert({
            user_id: userId,
            week_start: weekStart,
            xp_earned: adjustedXp,
            battles_played: 1,
          });
        }

        // Check for social_butterfly badge (10 multiplayer games)
        if (newMultiBattles >= 10) {
          const { data: existingBadge } = await supabase
            .from('quiz_battle_badges')
            .select('id')
            .eq('user_id', userId)
            .eq('badge_key', 'social_butterfly')
            .maybeSingle();

          if (!existingBadge) {
            await supabase.from('quiz_battle_badges').insert({
              user_id: userId,
              badge_key: 'social_butterfly',
              badge_name: 'Social',
              description: '10 parties multijoueur complétées!',
              icon: '🤝',
            });
            toast.success('🏆 Nouveau badge: Social!');
          }
        }
      }
    } catch (error) {
      console.error('Error finishing battle:', error);
    }
  };

  const generateInviteCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handlePlayAgain = async () => {
    if (!opponent || !userId) {
      // Fallback if no opponent data
      navigate('/quiz-battle/lobby?mode=random');
      return;
    }

    try {
      // Get battle info to reuse same settings
      const { data: currentBattle } = await supabase
        .from('quiz_battles')
        .select('subject_id, grade_level, difficulty')
        .eq('id', battleId)
        .single();

      if (!currentBattle) {
        navigate('/quiz-battle/lobby?mode=random');
        return;
      }

      // Create an invitation in quiz_battle_invitations table
      // This will trigger the popup dialog on the opponent's side via QuizInvitationHandler
      const { data: invitation, error: invitationError } = await supabase
        .from('quiz_battle_invitations')
        .insert({
          sender_id: userId,
          recipient_id: opponent.id,
          subject_id: currentBattle.subject_id,
          grade_level: currentBattle.grade_level,
          difficulty: currentBattle.difficulty,
        })
        .select('id')
        .single();

      if (invitationError || !invitation) throw invitationError;

      // Also send a notification for users not currently on the app
      await supabase.from('notifications').insert({
        user_id: opponent.id,
        actor_id: userId,
        type: 'quiz_invite',
        content: invitation.id,
        read: false,
      });

      toast.info(`Invitation de revanche envoyée à ${opponent.nickname}!`);
      
      // Navigate to lobby with friend mode to show waiting state
      navigate(`/quiz-battle/lobby?mode=friend&invitation=${invitation.id}`);
      
    } catch (error) {
      console.error('Error creating rematch:', error);
      toast.error('Erreur lors de la création de la revanche');
      navigate('/quiz-battle/lobby?mode=random');
    }
  };

  const handleBackToMenu = () => {
    navigate('/quiz-battle');
  };

  // Loading state
  if (phase === 'loading' || phase === 'generating') {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <QuizLoadingState startTime={generationStartTime || Date.now()} />
        </div>
      </Layout>
    );
  }

  // Waiting for opponent
  if (phase === 'waiting-opponent') {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Card className="w-full max-w-md">
              <CardContent className="py-8 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">En attente de l'adversaire</h2>
                <p className="text-muted-foreground">
                  {opponent?.nickname || 'Adversaire'} termine son quiz...
                </p>
                {myResult && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Ton score</p>
                    <p className="text-2xl font-bold text-primary">{myResult.score}%</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Playing
  if (phase === 'playing' && questions.length > 0) {
    // Use synchronized MultiplayerBattleGameplay for random/friend battles
    const useMultiplayerMode = (battleMode === 'random' || battleMode === 'friend') && opponent && userId;
    
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          {useMultiplayerMode ? (
            // Real-time synchronized multiplayer gameplay
            <MultiplayerBattleGameplay
              battleId={battleId!}
              questions={questions}
              difficulty={difficulty}
              userId={userId}
              opponent={opponent}
              onComplete={handleGameComplete}
            />
          ) : (
            // Fallback to independent play (shouldn't happen in multiplayer)
            <>
              {opponent && (
                <Card className="mb-4">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Swords className="w-5 h-5 text-accent" />
                        <span className="text-sm text-muted-foreground">VS</span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={opponent.avatar_url || undefined} />
                          <AvatarFallback>{opponent.nickname?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{opponent.nickname}</span>
                      </div>
                      {opponentResult && (
                        <div className="text-sm text-muted-foreground">
                          {opponentResult.finished ? (
                            <span className="text-success">Terminé!</span>
                          ) : (
                            <span>{opponentResult.correctAnswers} bonnes réponses</span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              <BattleGameplay
                questions={questions}
                difficulty={difficulty}
                onComplete={handleGameComplete}
              />
            </>
          )}
        </div>
      </Layout>
    );
  }

  // Results
  if (phase === 'results' && myResult) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <MultiplayerResults
            myResult={myResult}
            opponentResult={opponentResult}
            opponent={opponent}
            myProfile={myProfile}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={handleBackToMenu}
          />
        </div>
      </Layout>
    );
  }

  return null;
};

export default QuizBattleMultiplayer;
