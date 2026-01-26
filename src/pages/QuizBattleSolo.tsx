import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SubjectDifficultySelector } from '@/components/quiz-battle/SubjectDifficultySelector';
import { BattleGameplay } from '@/components/quiz-battle/BattleGameplay';
import { BattleResults } from '@/components/quiz-battle/BattleResults';
import { QuizLoadingState } from '@/components/quiz-battle/QuizLoadingState';
import { toast } from 'sonner';
import { 
  calculateLevel, 
  getWeekStart,
  MATH_SUBJECTS, 
  SCIENCE_SUBJECTS, 
  LANGUAGE_SUBJECTS,
  SUBJECT_BADGE_THRESHOLDS 
} from '@/lib/quizBattleUtils';

type GamePhase = 'setup' | 'loading' | 'playing' | 'results';

export interface BattleQuestion {
  question: string;
  type: 'qcm' | 'true_false';
  options: string[];
  correct_answer: number;
  explanation: string;
  concept: string;
}

export interface BattleResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  timeBonus: number;
  answers: {
    questionIndex: number;
    selectedAnswer: number;
    correct: boolean;
    timeMs: number;
  }[];
  questions: BattleQuestion[];
  isPerfect: boolean;
  wasAbandoned?: boolean;
  roundsWon?: number; // For multiplayer: number of rounds won
  opponentRoundsWon?: number; // For multiplayer: opponent's rounds won
  opponentAbandoned?: boolean; // For multiplayer: opponent quit the game
}

const QuizBattleSolo = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [battleId, setBattleId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<BattleQuestion[]>([]);
  const [result, setResult] = useState<BattleResult | null>(null);
  
  // Setup state
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth/login');
        return;
      }
      setUserId(user.id);

      // Get user's grade level
      const { data: profile } = await supabase
        .from('profiles')
        .select('academic_grade')
        .eq('user_id', user.id)
        .single();

      if (profile?.academic_grade) {
        setSelectedGrade(profile.academic_grade);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleStartBattle = async (subjectId: string, gradeLevel: string, difficulty: 'easy' | 'medium' | 'hard') => {
    if (!userId) return;

    setPhase('loading');
    setLoadingStartTime(Date.now());
    setSelectedSubject(subjectId);
    setSelectedGrade(gradeLevel);
    setSelectedDifficulty(difficulty);

    try {
      // Create battle record
      const { data: battle, error: battleError } = await supabase
        .from('quiz_battles')
        .insert({
          mode: 'solo',
          status: 'in_progress',
          subject_id: subjectId,
          grade_level: gradeLevel,
          difficulty: difficulty,
          created_by: userId,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (battleError) throw battleError;
      setBattleId(battle.id);

      // Add player record
      await supabase
        .from('quiz_battle_players')
        .insert({
          battle_id: battle.id,
          user_id: userId,
          is_ready: true,
        });

      // Fetch subject info for question generation
      const { data: subject } = await supabase
        .from('subjects')
        .select('name, slug')
        .eq('id', subjectId)
        .single();

      // Fetch a lesson from this subject for context
      const { data: lessons } = await supabase
        .from('lessons')
        .select('title, contenu, objectif')
        .eq('subject_id', subjectId)
        .eq('grade_level', gradeLevel)
        .eq('is_published', true)
        .limit(3);

      // Generate questions using edge function
      const { data: generatedQuestions, error: genError } = await supabase.functions.invoke(
        'generate-battle-questions',
        {
          body: {
            subject: subject?.name || 'Général',
            gradeLevel,
            difficulty,
            lessonContext: lessons?.map(l => ({
              title: l.title,
              content: l.contenu?.substring(0, 500),
              objective: l.objectif,
            })) || [],
            questionCount: 10,
          },
        }
      );

      if (genError) throw genError;

      const parsedQuestions = generatedQuestions?.questions || [];
      setQuestions(parsedQuestions);

      // Update battle with questions
      await supabase
        .from('quiz_battles')
        .update({ questions: parsedQuestions })
        .eq('id', battle.id);

      setPhase('playing');
    } catch (error) {
      console.error('Error starting battle:', error);
      toast.error('Erreur lors du démarrage du quiz');
      setPhase('setup');
    }
  };

  const handleGameComplete = async (gameResult: BattleResult) => {
    setResult(gameResult);
    setPhase('results');

    if (!userId || !battleId) return;

    // Handle abandoned quizzes - NO XP/CREDITS awarded
    if (gameResult.wasAbandoned || gameResult.xpEarned === 0) {
      try {
        await supabase
          .from('quiz_battles')
          .update({
            status: 'cancelled',
            ended_at: new Date().toISOString(),
          })
          .eq('id', battleId);

        // Update player record without XP
        await supabase
          .from('quiz_battle_players')
          .update({
            score: 0,
            correct_answers: gameResult.correctAnswers,
            answers: gameResult.answers,
            finished_at: new Date().toISOString(),
          })
          .eq('battle_id', battleId)
          .eq('user_id', userId);

        toast.info('Quiz interrompu - Aucun XP gagné');
      } catch (error) {
        console.error('Error updating abandoned battle:', error);
      }
      return; // Skip all XP/badge logic
    }

    try {
      // Update battle status
      await supabase
        .from('quiz_battles')
        .update({
          status: 'completed',
          ended_at: new Date().toISOString(),
        })
        .eq('id', battleId);

      // Update player record
      await supabase
        .from('quiz_battle_players')
        .update({
          score: gameResult.score,
          correct_answers: gameResult.correctAnswers,
          answers: gameResult.answers,
          finished_at: new Date().toISOString(),
        })
        .eq('battle_id', battleId)
        .eq('user_id', userId);

      // Update stats
      const { data: currentStats } = await supabase
        .from('quiz_battle_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (currentStats) {
        const isWin = gameResult.correctAnswers >= gameResult.totalQuestions * 0.7;
        const newStreak = isWin ? currentStats.current_streak + 1 : 0;
        const newTotalXp = currentStats.total_xp + gameResult.xpEarned;
        const newLevel = calculateLevel(newTotalXp);

        // Calculate average response time
        const totalTimeMs = gameResult.answers.reduce((sum, a) => sum + a.timeMs, 0);
        const avgGameResponseMs = Math.round(totalTimeMs / gameResult.answers.length);
        const oldAvg = currentStats.avg_response_time_ms || avgGameResponseMs;
        const previousAnswers = currentStats.total_questions_answered;
        const newAnswers = gameResult.totalQuestions;
        const newAvgResponseTime = Math.round(
          (oldAvg * previousAnswers + avgGameResponseMs * newAnswers) / 
          (previousAnswers + newAnswers)
        );

        await supabase
          .from('quiz_battle_stats')
          .update({
            total_battles: currentStats.total_battles + 1,
            solo_battles: currentStats.solo_battles + 1,
            battles_won: isWin ? currentStats.battles_won + 1 : currentStats.battles_won,
            current_streak: newStreak,
            longest_streak: Math.max(currentStats.longest_streak, newStreak),
            total_xp: newTotalXp,
            level: newLevel,
            total_correct_answers: currentStats.total_correct_answers + gameResult.correctAnswers,
            total_questions_answered: currentStats.total_questions_answered + gameResult.totalQuestions,
            perfect_games: gameResult.isPerfect 
              ? currentStats.perfect_games + 1 
              : currentStats.perfect_games,
            avg_response_time_ms: newAvgResponseTime,
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
              xp_earned: weeklyEntry.xp_earned + gameResult.xpEarned,
              battles_played: weeklyEntry.battles_played + 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', weeklyEntry.id);
        } else {
          await supabase.from('quiz_battle_weekly_xp').insert({
            user_id: userId,
            week_start: weekStart,
            xp_earned: gameResult.xpEarned,
            battles_played: 1,
          });
        }
      }

      // Track subject stats for subject-specific badges
      await updateSubjectStats(userId, selectedSubject!, gameResult);

      // Check for badges
      await checkAndAwardBadges(userId, gameResult, currentStats, selectedSubject!);

    } catch (error) {
      console.error('Error saving game result:', error);
    }
  };

  const updateSubjectStats = async (
    userId: string,
    subjectId: string,
    result: BattleResult
  ) => {
    try {
      const { data: existingStat } = await supabase
        .from('quiz_battle_subject_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('subject_id', subjectId)
        .maybeSingle();

      if (existingStat) {
        await supabase
          .from('quiz_battle_subject_stats')
          .update({
            correct_answers: existingStat.correct_answers + result.correctAnswers,
            total_answers: existingStat.total_answers + result.totalQuestions,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingStat.id);
      } else {
        await supabase
          .from('quiz_battle_subject_stats')
          .insert({
            user_id: userId,
            subject_id: subjectId,
            correct_answers: result.correctAnswers,
            total_answers: result.totalQuestions,
          });
      }
    } catch (error) {
      console.error('Error updating subject stats:', error);
    }
  };

  const checkAndAwardBadges = async (
    userId: string, 
    result: BattleResult, 
    stats: any,
    subjectId: string
  ) => {
    const badgesToAward: { key: string; name: string; description: string; icon: string }[] = [];

    // First battle badge
    if ((stats?.total_battles || 0) === 0) {
      badgesToAward.push({
        key: 'first_battle',
        name: 'Première Bataille',
        description: 'Tu as complété ton premier quiz!',
        icon: '⚔️',
      });
    }

    // Perfect game badge
    if (result.isPerfect) {
      badgesToAward.push({
        key: 'perfect_game',
        name: 'Perfectionniste',
        description: '100% sur un quiz!',
        icon: '🎯',
      });
    }

    // Streak badges
    const newStreak = result.correctAnswers >= result.totalQuestions * 0.7 
      ? (stats?.current_streak || 0) + 1 
      : 0;

    if (newStreak === 3) {
      badgesToAward.push({
        key: 'streak_3',
        name: 'En Forme',
        description: '3 victoires consécutives!',
        icon: '🔥',
      });
    }

    if (newStreak === 5) {
      badgesToAward.push({
        key: 'streak_5',
        name: 'Imbattable',
        description: '5 victoires consécutives!',
        icon: '💪',
      });
    }

    if (newStreak === 10) {
      badgesToAward.push({
        key: 'streak_10',
        name: 'Légende',
        description: '10 victoires consécutives!',
        icon: '👑',
      });
    }

    // Speed demon badge - correct answer in less than 3 seconds
    const hasSpeedAnswer = result.answers.some(a => a.correct && a.timeMs < 3000);
    if (hasSpeedAnswer) {
      const { data: existingBadge } = await supabase
        .from('quiz_battle_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_key', 'speed_demon')
        .maybeSingle();
      
      if (!existingBadge) {
        badgesToAward.push({
          key: 'speed_demon',
          name: 'Éclair',
          description: 'Réponse correcte en moins de 3 secondes!',
          icon: '⚡',
        });
      }
    }

    // Dedication badge - 50 games played
    const newTotalBattles = (stats?.total_battles || 0) + 1;
    if (newTotalBattles === 50) {
      badgesToAward.push({
        key: 'dedication',
        name: 'Dévoué',
        description: '50 parties jouées!',
        icon: '📚',
      });
    }

    // Subject-specific badges - check after updating subject stats
    await checkSubjectBadges(userId, subjectId, badgesToAward);

    // Award badges
    for (const badge of badgesToAward) {
      try {
        await supabase
          .from('quiz_battle_badges')
          .insert({
            user_id: userId,
            badge_key: badge.key,
            badge_name: badge.name,
            description: badge.description,
            icon: badge.icon,
          });
        
        toast.success(`🏆 Nouveau badge: ${badge.name}!`);
      } catch (error) {
        // Badge might already exist
        console.log('Badge already earned or error:', badge.key);
      }
    }
  };

  const checkSubjectBadges = async (
    userId: string,
    currentSubjectId: string,
    badgesToAward: { key: string; name: string; description: string; icon: string }[]
  ) => {
    try {
      // Get all subject stats with subject names
      const { data: subjectStats } = await supabase
        .from('quiz_battle_subject_stats')
        .select(`
          subject_id,
          correct_answers,
          subjects!inner(name)
        `)
        .eq('user_id', userId);

      if (!subjectStats) return;

      // Check for existing badges
      const { data: existingBadges } = await supabase
        .from('quiz_battle_badges')
        .select('badge_key')
        .eq('user_id', userId)
        .in('badge_key', ['math_expert', 'science_master', 'language_pro']);

      const earnedBadgeKeys = new Set(existingBadges?.map(b => b.badge_key) || []);

      // Math Expert badge
      if (!earnedBadgeKeys.has('math_expert')) {
        const mathCorrect = subjectStats
          .filter(s => MATH_SUBJECTS.includes((s.subjects as any)?.name))
          .reduce((sum, s) => sum + s.correct_answers, 0);

        if (mathCorrect >= SUBJECT_BADGE_THRESHOLDS.math_expert) {
          badgesToAward.push({
            key: 'math_expert',
            name: 'Expert Maths',
            description: '50 bonnes réponses en Maths!',
            icon: '🧮',
          });
        }
      }

      // Science Master badge
      if (!earnedBadgeKeys.has('science_master')) {
        const scienceCorrect = subjectStats
          .filter(s => SCIENCE_SUBJECTS.includes((s.subjects as any)?.name))
          .reduce((sum, s) => sum + s.correct_answers, 0);

        if (scienceCorrect >= SUBJECT_BADGE_THRESHOLDS.science_master) {
          badgesToAward.push({
            key: 'science_master',
            name: 'Maître Sciences',
            description: '50 bonnes réponses en Sciences!',
            icon: '🔬',
          });
        }
      }

      // Language Pro badge (3 different languages with 10+ correct each)
      if (!earnedBadgeKeys.has('language_pro')) {
        const languageStats = subjectStats
          .filter(s => LANGUAGE_SUBJECTS.includes((s.subjects as any)?.name) && s.correct_answers >= SUBJECT_BADGE_THRESHOLDS.language_pro);

        // Get unique language names
        const uniqueLanguages = new Set(languageStats.map(s => (s.subjects as any)?.name));
        
        if (uniqueLanguages.size >= 3) {
          badgesToAward.push({
            key: 'language_pro',
            name: 'Polyglotte',
            description: 'Quiz réussi en 3 langues différentes!',
            icon: '🌍',
          });
        }
      }
    } catch (error) {
      console.error('Error checking subject badges:', error);
    }
  };

  const handlePlayAgain = () => {
    setPhase('setup');
    setQuestions([]);
    setResult(null);
    setBattleId(null);
  };

  const handleBackToMenu = () => {
    navigate('/quiz-battle');
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-4 sm:py-6">
      {phase === 'setup' && (
        <SubjectDifficultySelector
          defaultGrade={selectedGrade}
          onStart={handleStartBattle}
          onBack={handleBackToMenu}
        />
      )}

      {phase === 'loading' && <QuizLoadingState startTime={loadingStartTime || Date.now()} />}

      {phase === 'playing' && questions.length > 0 && (
        <BattleGameplay
          questions={questions}
          difficulty={selectedDifficulty}
          onComplete={handleGameComplete}
        />
      )}

      {phase === 'results' && result && (
        <BattleResults
          result={result}
          onPlayAgain={handlePlayAgain}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </div>
  );
};

export default QuizBattleSolo;
