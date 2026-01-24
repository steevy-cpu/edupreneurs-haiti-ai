import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Gamepad2, Target, Lock, Loader2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useChessSounds } from '@/hooks/useChessSounds';
import { useChessStats } from '@/hooks/useChessStats';
import { useToast } from '@/hooks/use-toast';
import { Chess } from 'chess.js';
import ChessBoardEnhanced from '@/components/chess/ChessBoardEnhanced';
import ChessEloWidget from '@/components/chess/ChessEloWidget';
import VisitorChessOverlay from '@/components/chess/VisitorChessOverlay';
import { Helmet } from 'react-helmet';
import { useVisitor } from '@/contexts/VisitorContext';
import { useNetworkAwareLoading } from '@/hooks/useNetworkAwareLoading';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Lazy load heavy components that aren't immediately visible
const ChessPlayerStats = lazy(() => import('@/components/chess/ChessPlayerStats'));
const ChessPuzzleTrainer = lazy(() => import('@/components/chess/ChessPuzzleTrainer'));
const ChessPostGameAnalysis = lazy(() => import('@/components/chess/ChessPostGameAnalysis'));

// Skeleton for lazy-loaded components
const ChessComponentSkeleton = () => (
  <div className="flex flex-col items-center justify-center py-12 gap-4">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
    <Skeleton className="h-4 w-48" />
  </div>
);

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type TimeControl = 'bullet' | 'blitz' | 'rapid' | 'classic' | 'untimed';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const getTimeForControl = (control: TimeControl): number => {
  switch (control) {
    case 'bullet': return 60;
    case 'blitz': return 180;
    case 'rapid': return 600;
    case 'classic': return 1800;
    case 'untimed': return Infinity;
  }
};

const ChessGame: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isVisitor } = useVisitor();
  const { playSound } = useChessSounds();
  const { isSlowConnection, shouldShowAnimations } = useNetworkAwareLoading();
  
  const [game, setGame] = useState(new Chess());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [userNickname, setUserNickname] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState("C'est ton tour!");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [timeControl, setTimeControl] = useState<TimeControl>('untimed');
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState<'play' | 'puzzles'>('play');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [gameResult, setGameResult] = useState<'win' | 'loss' | 'draw' | null>(null);
  
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [capturedByWhite, setCapturedByWhite] = useState<string[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [whiteTime, setWhiteTime] = useState(Infinity);
  const [blackTime, setBlackTime] = useState(Infinity);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);

  // Chess stats hook
  const { 
    stats, 
    achievements, 
    recentGames, 
    isLoading: statsLoading, 
    recentEloChange,
    fetchStats,
    initializeStats,
    checkAchievements 
  } = useChessStats(userId);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('user_id', user.id)
          .single();
        if (profile) setUserNickname(profile.nickname);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'Jude' : 'Toi';
      const result = game.turn() === 'w' ? 'loss' : 'win';
      setGameStatus(`🏆 Échec et mat! ${winner} a gagné!`);
      setIsGameOver(true);
      setGameResult(result);
      playSound('checkmate');
      // Save game and show analysis after a short delay
      setTimeout(() => {
        saveGameToDatabase(result);
        setShowAnalysis(true);
      }, 1500);
    } else if (game.isDraw() || game.isStalemate()) {
      setGameStatus('🤝 Match nul!');
      setIsGameOver(true);
      setGameResult('draw');
      playSound('gameEnd');
      setTimeout(() => {
        saveGameToDatabase('draw');
        setShowAnalysis(true);
      }, 1500);
    } else if (game.isCheck()) {
      setGameStatus('⚠️ Échec!');
      playSound('check');
    } else if (game.turn() === 'w') {
      setGameStatus("C'est ton tour!");
    } else {
      setGameStatus("Tour de Jude...");
    }
  }, [game, playSound]);

  const saveGameToDatabase = async (result: 'win' | 'loss' | 'draw') => {
    // For visitors, show signup prompt instead of saving
    if (isVisitor) {
      toast({
        title: result === 'win' ? "🎉 Bravo!" : result === 'draw' ? "🤝 Match nul!" : "Bien joué!",
        description: "Créez un compte gratuit pour sauvegarder vos parties et suivre votre progression!",
        duration: 5000
      });
      return;
    }
    
    if (!userId || !gameStartTime) return;
    
    try {
      const totalTime = Math.floor((new Date().getTime() - gameStartTime.getTime()) / 1000);
      const eloChange = result === 'win' ? 15 : result === 'loss' ? -10 : 0;
      
      await supabase.from('chess_games').insert({
        user_id: userId,
        opponent_type: 'ai',
        difficulty,
        time_control: timeControl,
        result,
        moves_count: moveHistory.length,
        total_time_seconds: totalTime,
        move_history: moveHistory,
        final_fen: game.fen(),
        elo_change: eloChange
      });

      // Update player stats
      const { data: existingStats } = await supabase
        .from('chess_player_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      let updatedStats;
      if (existingStats) {
        const newStats = {
          games_played: existingStats.games_played + 1,
          games_won: result === 'win' ? existingStats.games_won + 1 : existingStats.games_won,
          games_lost: result === 'loss' ? existingStats.games_lost + 1 : existingStats.games_lost,
          games_drawn: result === 'draw' ? existingStats.games_drawn + 1 : existingStats.games_drawn,
          elo_rating: Math.max(100, existingStats.elo_rating + eloChange),
          total_moves: existingStats.total_moves + moveHistory.length,
          current_winning_streak: result === 'win' ? existingStats.current_winning_streak + 1 : 0,
          longest_winning_streak: result === 'win' 
            ? Math.max(existingStats.longest_winning_streak, existingStats.current_winning_streak + 1)
            : existingStats.longest_winning_streak
        };
        await supabase.from('chess_player_stats').update(newStats).eq('user_id', userId);
        updatedStats = { ...existingStats, ...newStats };
      } else {
        const newStats = {
          user_id: userId,
          games_played: 1,
          games_won: result === 'win' ? 1 : 0,
          games_lost: result === 'loss' ? 1 : 0,
          games_drawn: result === 'draw' ? 1 : 0,
          elo_rating: 1000 + eloChange,
          total_moves: moveHistory.length,
          current_winning_streak: result === 'win' ? 1 : 0,
          longest_winning_streak: result === 'win' ? 1 : 0
        };
        await supabase.from('chess_player_stats').insert(newStats);
        updatedStats = newStats;
      }

      // Check for new achievements and refresh stats
      if (updatedStats) {
        await checkAchievements(updatedStats as any);
      }
      fetchStats();
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeControl === 'untimed' || isGameOver || !gameStartTime) return;
    
    const interval = setInterval(() => {
      if (game.turn() === 'w') {
        setWhiteTime(prev => {
          if (prev <= 1) {
            setIsGameOver(true);
            setGameStatus("⏱️ Temps écoulé! Jude gagne!");
            playSound('gameEnd');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime(prev => Math.max(0, prev - 1));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeControl, isGameOver, gameStartTime, game.turn()]);

  const callChessAI = async (isEricTurn: boolean, userMessage?: string, fen?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('chess-ai-tutor', {
        body: { fen: fen || game.fen(), chatHistory: messages.slice(-10), userMessage, userNickname, isEricTurn, difficulty }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calling chess AI:', error);
      throw error;
    }
  };

  const generateFallbackExplanation = (move: any): string => {
    if (move.captured) return `Je capture avec ${move.san}! 🎯`;
    if (move.flags.includes('k') || move.flags.includes('q')) return `Je fais le roque! 🏰`;
    return `Je joue ${move.san}! 🎯`;
  };

  const makeEricMove = useCallback(async (currentGame: Chess) => {
    if (currentGame.turn() !== 'b' || currentGame.isGameOver() || isGameOver) return;
    
    setIsThinking(true);
    try {
      const response = await callChessAI(true, undefined, currentGame.fen());
      const gameCopy = new Chess(currentGame.fen());

      if (response.type === 'move' && response.move) {
        const from = response.move.substring(0, 2);
        const to = response.move.substring(2, 4);
        const promotion = response.move.length > 4 ? response.move[4] : undefined;

        try {
          const moveResult = gameCopy.move({ from, to, promotion });
          if (moveResult) {
            if (moveResult.captured) {
              playSound('capture');
              setCapturedByBlack(prev => [...prev, moveResult.captured!]);
            } else {
              playSound('move');
            }
            
            setGame(gameCopy);
            setLastMove({ from: moveResult.from, to: moveResult.to });
            setMoveHistory(prev => [...prev, moveResult.san]);
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: response.explanation || generateFallbackExplanation(moveResult),
              timestamp: new Date()
            }]);
            setIsThinking(false);
            return;
          }
        } catch (e) {
          console.log('Move failed');
        }
      }

      // Fallback
      const validMoves = gameCopy.moves({ verbose: true });
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        gameCopy.move(randomMove);
        playSound('move');
        setGame(gameCopy);
        setLastMove({ from: randomMove.from, to: randomMove.to });
        setMoveHistory(prev => [...prev, randomMove.san]);
        setMessages(prev => [...prev, { role: 'assistant', content: generateFallbackExplanation(randomMove), timestamp: new Date() }]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsThinking(false);
    }
  }, [messages, userNickname, playSound, difficulty, isGameOver]);

  const handlePlayerMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (isGameOver) return false;
    const currentFen = game.fen();
    const gameCopy = new Chess(currentFen);
    
    try {
      const move = gameCopy.move({ from, to, promotion: promotion || 'q' });
      if (move) {
        if (!gameStartTime) setGameStartTime(new Date());
        setGameHistory(prev => [...prev, currentFen]);
        
        if (move.captured) {
          playSound('capture');
          setCapturedByWhite(prev => [...prev, move.captured!]);
        } else {
          playSound('move');
        }
        
        setGame(gameCopy);
        setLastMove({ from, to });
        setMoveHistory(prev => [...prev, move.san]);
        setMessages(prev => [...prev, { role: 'user', content: `J'ai joué ${move.san}`, timestamp: new Date() }]);

        if (!gameCopy.isGameOver()) {
          setTimeout(() => makeEricMove(gameCopy), 500);
        }
        return true;
      }
    } catch (e) {
      console.error('Invalid move:', e);
    }
    return false;
  }, [game, gameStartTime, isGameOver, makeEricMove, playSound]);

  const handleNewGame = useCallback(() => {
    playSound('gameStart');
    const initialTime = getTimeForControl(timeControl);
    setGame(new Chess());
    setLastMove(null);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setMoveHistory([]);
    setGameHistory([]);
    setWhiteTime(initialTime);
    setBlackTime(initialTime);
    setIsGameOver(false);
    setGameStartTime(null);
    setGameResult(null);
    setShowAnalysis(false);
    setMessages([{ role: 'assistant', content: `🎮 Nouvelle partie! Niveau ${difficulty}. Bonne chance ${userNickname || 'mon ami'}! ♟️`, timestamp: new Date() }]);
  }, [userNickname, playSound, difficulty, timeControl]);

  const handleUndo = useCallback(() => {
    if (gameHistory.length === 0 || isThinking || isGameOver) return;
    const previousFen = gameHistory[gameHistory.length - 1];
    setGame(new Chess(previousFen));
    setGameHistory(prev => prev.slice(0, -1));
    setMoveHistory(prev => prev.slice(0, -2));
    setLastMove(null);
    playSound('move');
  }, [gameHistory, isThinking, isGameOver, playSound]);

  const handleDifficultyChange = useCallback((newDifficulty: DifficultyLevel) => {
    setDifficulty(newDifficulty);
    toast({ title: "Niveau changé", description: `Mode ${newDifficulty}` });
  }, [toast]);

  const handleTimeControlChange = useCallback((newTimeControl: TimeControl) => {
    setTimeControl(newTimeControl);
    const newTime = getTimeForControl(newTimeControl);
    setWhiteTime(newTime);
    setBlackTime(newTime);
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    setMessages(prev => [...prev, { role: 'user', content: message, timestamp: new Date() }]);
    setIsThinking(true);
    try {
      const response = await callChessAI(false, message);
      if (response.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.message, timestamp: new Date() }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, réessaie! 😅", timestamp: new Date() }]);
    } finally {
      setIsThinking(false);
    }
  }, []);

  const handleRequestTutorial = useCallback(() => {
    handleSendMessage("Apprends-moi les règles de base des échecs!");
  }, [handleSendMessage]);

  useEffect(() => {
    if (messages.length === 0 && userNickname) {
      setMessages([{ role: 'assistant', content: `👋 Salut ${userNickname}! Je suis Jude, ton coach d'échecs. Tu joues les blancs! ♟️`, timestamp: new Date() }]);
    }
  }, [userNickname, messages.length]);

  return (
    <>
      <Helmet>
        <title>Jouer aux Échecs avec Jude | Edupreneurs</title>
        <meta name="description" content="Apprends les échecs en jouant contre Jude, ton coach IA personnel!" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className={cn(
          "border-b sticky top-0 z-50",
          isSlowConnection ? "bg-card" : "bg-card/50 backdrop-blur-sm"
        )}>
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/passion-discovery')} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Retour</span>
              </Button>
              
              {/* ELO Widget - shown when stats exist or as demo for visitors */}
              {isVisitor ? (
                <div className="relative group cursor-pointer" onClick={() => setShowStats(true)}>
                  <ChessEloWidget
                    elo={1000}
                    streak={0}
                    recentChange={0}
                    onClick={() => setShowStats(true)}
                  />
                  <VisitorChessOverlay variant="widget" />
                </div>
              ) : stats && (
                <ChessEloWidget
                  elo={stats.elo_rating}
                  streak={stats.current_winning_streak}
                  recentChange={recentEloChange}
                  onClick={() => setShowStats(true)}
                />
              )}
              
              <h1 className="text-base sm:text-lg font-bold flex items-center gap-2">
                ♟️ <span className="hidden sm:inline">Échecs avec Jude</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 pb-24 md:pb-4">
          {/* Mode Tabs */}
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => {
              if (v === 'puzzles' && isVisitor) {
                toast({ 
                  title: "Puzzles réservés aux membres", 
                  description: "Créez un compte gratuit pour accéder aux puzzles tactiques!" 
                });
                return;
              }
              if (v === 'multiplayer') {
                if (isVisitor) {
                  toast({ 
                    title: "Multijoueur réservé aux membres", 
                    description: "Créez un compte gratuit pour défier vos amis!" 
                  });
                  return;
                }
                navigate('/chess-multiplayer');
                return;
              }
              setActiveTab(v as 'play' | 'puzzles');
            }} 
            className="mb-4"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="play" className="gap-2">
                <Gamepad2 className="w-4 h-4" />
                <span className="hidden sm:inline">Jouer</span>
              </TabsTrigger>
              <TabsTrigger 
                value="multiplayer" 
                className="gap-2"
                disabled={isVisitor}
                title={isVisitor ? "Créez un compte pour jouer en multijoueur" : undefined}
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Multi</span>
                {isVisitor && <Lock className="w-3 h-3 ml-1 text-muted-foreground" />}
              </TabsTrigger>
              <TabsTrigger 
                value="puzzles" 
                className="gap-2"
                disabled={isVisitor}
                title={isVisitor ? "Créez un compte pour accéder aux puzzles" : undefined}
              >
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Puzzles</span>
                {isVisitor && <Lock className="w-3 h-3 ml-1 text-muted-foreground" />}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl">
              {activeTab === 'play' && !showAnalysis && (
                <Card className="p-2 sm:p-4">
                  <ChessBoardEnhanced
                    game={game}
                    onMove={handlePlayerMove}
                    onNewGame={handleNewGame}
                    onRequestTutorial={handleRequestTutorial}
                    onUndo={handleUndo}
                    onShowStats={() => setShowStats(true)}
                    isThinking={isThinking}
                    gameStatus={gameStatus}
                    difficulty={difficulty}
                    timeControl={timeControl}
                    onDifficultyChange={handleDifficultyChange}
                    onTimeControlChange={handleTimeControlChange}
                    lastMove={lastMove}
                    capturedByWhite={capturedByWhite}
                    capturedByBlack={capturedByBlack}
                    moveHistory={moveHistory}
                    canUndo={gameHistory.length > 0 && !isThinking && !isGameOver}
                    whiteTime={whiteTime}
                    blackTime={blackTime}
                    isGameOver={isGameOver}
                    chatMessages={messages}
                    onSendMessage={handleSendMessage}
                  />
                </Card>
              )}

              {activeTab === 'play' && showAnalysis && gameResult && (
                <Suspense fallback={<ChessComponentSkeleton />}>
                  <ChessPostGameAnalysis
                    gameResult={gameResult}
                    moveHistory={moveHistory}
                    fen={game.fen()}
                    difficulty={difficulty}
                    onClose={() => setShowAnalysis(false)}
                    onNewGame={handleNewGame}
                  />
                </Suspense>
              )}

              {/* Defer puzzles tab on slow connections - only render when active */}
              {(activeTab === 'puzzles' || !isSlowConnection) && activeTab === 'puzzles' && (
                <Card className="p-2 sm:p-4">
                  <Suspense fallback={<ChessComponentSkeleton />}>
                    <ChessPuzzleTrainer
                      userId={userId}
                      onBack={() => setActiveTab('play')}
                    />
                  </Suspense>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <ChessPlayerStats 
          isOpen={showStats} 
          onClose={() => setShowStats(false)} 
          stats={stats}
          achievements={achievements}
          recentGames={recentGames}
          isLoading={statsLoading}
          isVisitor={isVisitor}
        />
      </Suspense>
    </>
  );
};

export default ChessGame;
