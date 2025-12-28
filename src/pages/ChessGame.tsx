import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useChessSounds } from '@/hooks/useChessSounds';
import { useToast } from '@/hooks/use-toast';
import { Chess } from 'chess.js';
import ChessBoardEnhanced from '@/components/chess/ChessBoardEnhanced';
import FloatingChessMessages from '@/components/chess/FloatingChessMessages';
import ChessPlayerStats from '@/components/chess/ChessPlayerStats';
import { Helmet } from 'react-helmet';

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
  const { playSound } = useChessSounds();
  
  const [game, setGame] = useState(new Chess());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [userNickname, setUserNickname] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [gameStatus, setGameStatus] = useState("C'est ton tour!");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [timeControl, setTimeControl] = useState<TimeControl>('untimed');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [capturedByWhite, setCapturedByWhite] = useState<string[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [whiteTime, setWhiteTime] = useState(Infinity);
  const [blackTime, setBlackTime] = useState(Infinity);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);

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
      const winner = game.turn() === 'w' ? 'Eric' : 'Toi';
      setGameStatus(`🏆 Échec et mat! ${winner} a gagné!`);
      setIsGameOver(true);
      playSound('checkmate');
    } else if (game.isDraw() || game.isStalemate()) {
      setGameStatus('🤝 Match nul!');
      setIsGameOver(true);
      playSound('gameEnd');
    } else if (game.isCheck()) {
      setGameStatus('⚠️ Échec!');
      playSound('check');
    } else if (game.turn() === 'w') {
      setGameStatus("C'est ton tour!");
    } else {
      setGameStatus("Tour d'Eric...");
    }
  }, [game, playSound]);

  // Timer effect
  useEffect(() => {
    if (timeControl === 'untimed' || isGameOver || !gameStartTime) return;
    
    const interval = setInterval(() => {
      if (game.turn() === 'w') {
        setWhiteTime(prev => {
          if (prev <= 1) {
            setIsGameOver(true);
            setGameStatus("⏱️ Temps écoulé! Eric gagne!");
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
    setIsChatOpen(true);
    handleSendMessage("Apprends-moi les règles de base des échecs!");
  }, [handleSendMessage]);

  useEffect(() => {
    if (messages.length === 0 && userNickname) {
      setMessages([{ role: 'assistant', content: `👋 Salut ${userNickname}! Je suis Eric, ton coach d'échecs. Tu joues les blancs! ♟️`, timestamp: new Date() }]);
    }
  }, [userNickname, messages.length]);

  return (
    <>
      <Helmet>
        <title>Jouer aux Échecs avec Eric | Edupreneurs</title>
        <meta name="description" content="Apprends les échecs en jouant contre Eric, ton coach IA personnel!" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => navigate('/passion-discovery')} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
              <h1 className="text-lg font-bold flex items-center gap-2">♟️ Échecs avec Eric</h1>
              <div className="w-20" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 pb-24 md:pb-4">
          <div className="flex justify-center">
            <div className="relative w-full max-w-2xl">
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
                />
              </Card>
              
              <FloatingChessMessages
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isThinking}
                isOpen={isChatOpen}
                onToggle={() => setIsChatOpen(!isChatOpen)}
              />
            </div>
          </div>
        </div>
      </div>

      <ChessPlayerStats isOpen={showStats} onClose={() => setShowStats(false)} />
    </>
  );
};

export default ChessGame;
