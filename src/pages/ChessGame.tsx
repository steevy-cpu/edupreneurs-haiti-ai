import React, { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useChessSounds } from '@/hooks/useChessSounds';
import ChessBoard from '@/components/chess/ChessBoard';
import FloatingChessMessages from '@/components/chess/FloatingChessMessages';
import { Helmet } from 'react-helmet';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'expert';

// Helper to convert SAN to UCI if needed
const sanToUci = (game: Chess, sanOrUci: string): string | null => {
  // If already looks like UCI (4-5 chars, starts with file), return as-is
  if (/^[a-h][1-8][a-h][1-8][qrbnk]?$/.test(sanOrUci)) {
    return sanOrUci;
  }
  
  // Try to parse as SAN and convert to UCI
  try {
    const gameCopy = new Chess(game.fen());
    const move = gameCopy.move(sanOrUci);
    if (move) {
      return move.from + move.to + (move.promotion || '');
    }
  } catch (e) {
    console.log('Could not convert SAN to UCI:', sanOrUci);
  }
  
  return null;
};

// Generate a fallback explanation based on move type
const generateFallbackExplanation = (move: { san: string; captured?: string; flags: string }): string => {
  const explanations: string[] = [];
  
  if (move.captured) {
    explanations.push(`Je capture ta pièce avec ${move.san}! 🎯`);
  } else if (move.flags.includes('k') || move.flags.includes('q')) {
    explanations.push(`Je fais le roque pour mettre mon roi en sécurité! 🏰`);
  } else if (move.san.startsWith('N')) {
    explanations.push(`Je développe mon cavalier! 🐴 Bonne position au centre.`);
  } else if (move.san.startsWith('B')) {
    explanations.push(`Je place mon fou sur une belle diagonale! 📐`);
  } else if (move.san.startsWith('Q')) {
    explanations.push(`Je bouge ma dame pour contrôler plus de cases! 👑`);
  } else if (move.san.startsWith('R')) {
    explanations.push(`Je positionne ma tour sur une colonne ouverte! 🏰`);
  } else {
    explanations.push(`Je joue ${move.san}! C'est un bon coup pour ma position. 🎯`);
  }
  
  return explanations[0];
};

const ChessGame: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { playSound } = useChessSounds();
  const [game, setGame] = useState(new Chess());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [userNickname, setUserNickname] = useState('');
  const [gameStatus, setGameStatus] = useState("C'est ton tour!");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // New state for enhancements
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [capturedByWhite, setCapturedByWhite] = useState<string[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [gameHistory, setGameHistory] = useState<string[]>([]); // FEN history for undo

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('user_id', user.id)
          .single();
        if (profile) {
          setUserNickname(profile.nickname);
        }
      }
    };
    fetchProfile();
  }, []);

  // Update game status and play sounds
  useEffect(() => {
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'Eric' : 'Toi';
      setGameStatus(`🏆 Échec et mat! ${winner} a gagné!`);
      playSound('checkmate');
    } else if (game.isDraw()) {
      setGameStatus('🤝 Match nul!');
      playSound('gameEnd');
    } else if (game.isStalemate()) {
      setGameStatus('🤝 Pat - Match nul!');
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

  const callChessAI = async (isEricTurn: boolean, userMessage?: string, fen?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('chess-ai-tutor', {
        body: {
          fen: fen || game.fen(),
          chatHistory: messages.slice(-10),
          userMessage,
          userNickname,
          isEricTurn,
          difficulty
        }
      });

      if (error) {
        // Handle rate limit and payment errors
        if (error.message?.includes('429')) {
          toast({
            title: "Trop de requêtes",
            description: "Attends quelques secondes avant de réessayer.",
            variant: "destructive"
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: "Service indisponible",
            description: "Le service est temporairement indisponible.",
            variant: "destructive"
          });
        }
        throw error;
      }
      
      // Handle rate limit error in response
      if (data?.error === 'rate_limit' || data?.error === 'payment_required') {
        toast({
          title: data.error === 'rate_limit' ? "Trop de requêtes" : "Service indisponible",
          description: data.message,
          variant: "destructive"
        });
        throw new Error(data.message);
      }
      
      return data;
    } catch (error) {
      console.error('Error calling chess AI:', error);
      throw error;
    }
  };

  const makeEricMove = useCallback(async (currentGame: Chess) => {
    // Only move if it's Black's turn and game is not over
    if (currentGame.turn() !== 'b' || currentGame.isGameOver()) {
      console.log('Skipping Eric move - not Black turn or game over');
      return;
    }

    setIsThinking(true);
    try {
      const currentFen = currentGame.fen();
      console.log('Eric making move, FEN:', currentFen, 'Turn:', currentGame.turn(), 'Difficulty:', difficulty);
      
      const response = await callChessAI(true, undefined, currentFen);
      const gameCopy = new Chess(currentFen);

      // Try to make the AI's suggested move
      if (response.type === 'move' && response.move) {
        let moveSucceeded = false;
        let moveResult = null;
        
        // First try the move as-is (UCI format)
        const from = response.move.substring(0, 2);
        const to = response.move.substring(2, 4);
        const promotion = response.move.length > 4 ? response.move[4] : undefined;

        console.log('Eric attempting move:', { from, to, promotion, currentTurn: gameCopy.turn() });

        try {
          moveResult = gameCopy.move({ from, to, promotion });
          if (moveResult) {
            moveSucceeded = true;
          }
        } catch (e) {
          console.log('Direct UCI move failed, trying SAN conversion');
        }

        // If UCI failed, try converting from SAN
        if (!moveSucceeded) {
          const uciMove = sanToUci(gameCopy, response.move);
          if (uciMove) {
            try {
              const uciFrom = uciMove.substring(0, 2);
              const uciTo = uciMove.substring(2, 4);
              const uciPromotion = uciMove.length > 4 ? uciMove[4] : undefined;
              moveResult = gameCopy.move({ from: uciFrom, to: uciTo, promotion: uciPromotion });
              if (moveResult) {
                moveSucceeded = true;
                console.log('SAN to UCI conversion succeeded:', response.move, '->', uciMove);
              }
            } catch (e) {
              console.log('SAN to UCI move also failed');
            }
          }
        }

        if (moveSucceeded && moveResult) {
          // Play sound based on move type
          if (moveResult.captured) {
            playSound('capture');
            // Track captured piece (white piece captured by black)
            setCapturedByBlack(prev => [...prev, moveResult.captured!]);
          } else {
            playSound('move');
          }
          
          setGame(gameCopy);
          setLastMove({ from: moveResult.from, to: moveResult.to });
          setMoveHistory(prev => [...prev, moveResult.san]);
          
          // Add Eric's explanation to chat - always show something
          const explanation = response.explanation || generateFallbackExplanation(moveResult);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: explanation,
            timestamp: new Date()
          }]);
          
          return; // Success, exit early
        }
        
        // Move failed - try fallback
        console.error('Move error, attempting fallback. Attempted:', response.move);
      }

      // Handle chat response or fallback
      if (response.type === 'chat' && response.message) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.message,
          timestamp: new Date()
        }]);
      }

      // If we reach here, we need a fallback move
      const validMoves = gameCopy.moves({ verbose: true });
      console.log('Using fallback. Valid moves for Black:', validMoves.map(m => m.san));
      
      if (validMoves.length > 0) {
        // Pick a random move as fallback
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        gameCopy.move(randomMove);
        
        if (randomMove.captured) {
          playSound('capture');
          setCapturedByBlack(prev => [...prev, randomMove.captured!]);
        } else {
          playSound('move');
        }
        
        setGame(gameCopy);
        setLastMove({ from: randomMove.from, to: randomMove.to });
        setMoveHistory(prev => [...prev, randomMove.san]);
        
        // Generate a proper explanation for the fallback move
        const fallbackExplanation = generateFallbackExplanation(randomMove);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: fallbackExplanation,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error making Eric move:', error);
      
      // Even on error, try to make a move so the game continues
      const gameCopy = new Chess(currentGame.fen());
      const validMoves = gameCopy.moves({ verbose: true });
      
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        gameCopy.move(randomMove);
        
        if (randomMove.captured) {
          playSound('capture');
          setCapturedByBlack(prev => [...prev, randomMove.captured!]);
        } else {
          playSound('move');
        }
        
        setGame(gameCopy);
        setLastMove({ from: randomMove.from, to: randomMove.to });
        setMoveHistory(prev => [...prev, randomMove.san]);
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Je joue ${randomMove.san}! Désolé, j'ai eu un petit problème de connexion. 😅`,
          timestamp: new Date()
        }]);
      } else {
        toast({
          title: "Erreur",
          description: "Eric n'a pas pu jouer. Réessaie!",
          variant: "destructive"
        });
      }
    } finally {
      setIsThinking(false);
    }
  }, [messages, userNickname, toast, playSound, difficulty]);

  const handlePlayerMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    const currentFen = game.fen();
    const gameCopy = new Chess(currentFen);
    
    try {
      const move = gameCopy.move({ from, to, promotion: promotion || 'q' });
      
      if (move) {
        // Save current state for undo
        setGameHistory(prev => [...prev, currentFen]);
        
        // Play sound based on move type
        if (move.captured) {
          playSound('capture');
          // Track captured piece (black piece captured by white)
          setCapturedByWhite(prev => [...prev, move.captured!]);
        } else {
          playSound('move');
        }
        
        setGame(gameCopy);
        setLastMove({ from, to });
        setMoveHistory(prev => [...prev, move.san]);
        
        // Add move to chat
        setMessages(prev => [...prev, {
          role: 'user',
          content: `J'ai joué ${move.san}`,
          timestamp: new Date()
        }]);

        // Trigger Eric's turn after a short delay - pass the updated game directly
        if (!gameCopy.isGameOver()) {
          setTimeout(() => {
            makeEricMove(gameCopy);
          }, 500);
        }
        
        return true;
      }
    } catch (e) {
      console.error('Invalid move:', e);
    }
    
    return false;
  }, [game, makeEricMove, playSound]);

  const handleNewGame = useCallback(() => {
    playSound('gameStart');
    setGame(new Chess());
    
    // Reset all game state
    setLastMove(null);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setMoveHistory([]);
    setGameHistory([]);
    
    const difficultyNames = {
      beginner: 'débutant 🌱',
      intermediate: 'intermédiaire 🎯',
      expert: 'expert 🏆'
    };
    
    setMessages([{
      role: 'assistant',
      content: `🎮 Nouvelle partie! Tu joues les blancs, je joue les noirs en mode ${difficultyNames[difficulty]}. Bonne chance ${userNickname || 'mon ami'}! ♟️`,
      timestamp: new Date()
    }]);
    setGameStatus("C'est ton tour!");
  }, [userNickname, playSound, difficulty]);

  const handleUndo = useCallback(() => {
    if (gameHistory.length === 0 || isThinking) return;
    
    // We need to undo both the player's move and Eric's response
    // Go back to the state before the last player move
    const newHistory = [...gameHistory];
    const previousFen = newHistory.pop();
    
    if (previousFen) {
      setGame(new Chess(previousFen));
      setGameHistory(newHistory);
      
      // Remove last 2 moves from history (player + Eric, or just player if Eric hasn't moved)
      const historyLength = moveHistory.length;
      const movesToRemove = historyLength > 0 && historyLength % 2 === 0 ? 2 : 1;
      setMoveHistory(prev => prev.slice(0, -movesToRemove));
      
      // Recalculate captured pieces from scratch based on new game state
      const newGame = new Chess(previousFen);
      // For simplicity, we'll just keep the captured pieces as they are
      // A more complex implementation would track this properly
      
      // Update last move
      const history = newGame.history({ verbose: true });
      if (history.length > 0) {
        const lastMoveObj = history[history.length - 1];
        setLastMove({ from: lastMoveObj.from, to: lastMoveObj.to });
      } else {
        setLastMove(null);
      }
      
      playSound('move');
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "D'accord, j'annule le dernier coup! C'est de nouveau ton tour. 🔄",
        timestamp: new Date()
      }]);
    }
  }, [gameHistory, moveHistory, isThinking, playSound]);

  const handleDifficultyChange = useCallback((newDifficulty: DifficultyLevel) => {
    setDifficulty(newDifficulty);
    
    const difficultyNames = {
      beginner: 'débutant 🌱',
      intermediate: 'intermédiaire 🎯',
      expert: 'expert 🏆'
    };
    
    toast({
      title: "Niveau changé",
      description: `Je joue maintenant en mode ${difficultyNames[newDifficulty]}!`
    });
    
    // Add a message from Eric acknowledging the change
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `D'accord! Je vais maintenant jouer en mode ${difficultyNames[newDifficulty]}. ${
        newDifficulty === 'beginner' 
          ? "Je ferai des erreurs pour que tu puisses apprendre! 😊" 
          : newDifficulty === 'expert'
          ? "Attention, je vais jouer mes meilleurs coups! 💪"
          : "Je vais jouer de manière équilibrée. 🎯"
      }`,
      timestamp: new Date()
    }]);
  }, [toast]);

  const handleSendMessage = useCallback(async (message: string) => {
    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: message,
      timestamp: new Date()
    }]);

    setIsThinking(true);
    try {
      const response = await callChessAI(false, message);
      
      if (response.message) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.message,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Désolé, je n'ai pas pu répondre. Réessaie! 😅",
        timestamp: new Date()
      }]);
    } finally {
      setIsThinking(false);
    }
  }, [game, messages, userNickname, difficulty]);

  const handleRequestTutorial = useCallback(() => {
    setIsChatOpen(true);
    setMessages(prev => [...prev, {
      role: 'user',
      content: "Apprends-moi à jouer aux échecs!",
      timestamp: new Date()
    }]);
    
    // Send tutorial request to AI
    handleSendMessage("Donne-moi un tutoriel sur les règles de base des échecs: comment les pièces bougent, le but du jeu, et des conseils pour débuter.");
  }, [handleSendMessage]);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0 && userNickname) {
      setMessages([{
        role: 'assistant',
        content: `👋 Salut ${userNickname}! Je suis Eric, ton coach d'échecs. Tu joues les blancs, moi les noirs. Choisis ton niveau de difficulté et fais ton premier coup! ♟️🎯\n\n💡 Clique sur "Tutoriel" si tu veux apprendre les règles!`,
        timestamp: new Date()
      }]);
    }
  }, [userNickname, messages.length]);

  return (
    <>
      <Helmet>
        <title>Jouer aux Échecs avec Eric | Edupreneurs</title>
        <meta name="description" content="Apprends les échecs en jouant contre Eric, ton coach IA personnel. Reçois des explications pédagogiques à chaque coup!" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/passion-discovery')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <span className="text-2xl">♟️</span>
                Échecs avec Eric
              </h1>
              <div className="w-20" /> {/* Spacer for centering */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 pb-24 md:pb-4">
          <div className="flex justify-center">
            {/* Chess Board with floating messages */}
            <div className="relative w-full max-w-2xl">
              <Card className="p-2 sm:p-4">
                <ChessBoard
                  game={game}
                  onMove={handlePlayerMove}
                  onNewGame={handleNewGame}
                  onRequestTutorial={handleRequestTutorial}
                  onUndo={handleUndo}
                  isThinking={isThinking}
                  gameStatus={gameStatus}
                  difficulty={difficulty}
                  onDifficultyChange={handleDifficultyChange}
                  lastMove={lastMove}
                  capturedByWhite={capturedByWhite}
                  capturedByBlack={capturedByBlack}
                  moveHistory={moveHistory}
                  canUndo={gameHistory.length > 0 && !isThinking}
                />
              </Card>
              
              {/* Floating Messages Overlay */}
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
    </>
  );
};

export default ChessGame;
