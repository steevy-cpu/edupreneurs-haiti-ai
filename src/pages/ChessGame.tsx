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
import ChessChat from '@/components/chess/ChessChat';
import { Helmet } from 'react-helmet';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChessGame: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { playSound } = useChessSounds();
  const [game, setGame] = useState(new Chess());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [userNickname, setUserNickname] = useState('');
  const [gameStatus, setGameStatus] = useState("C'est ton tour!");

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
          isEricTurn
        }
      });

      if (error) throw error;
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
      console.log('Eric making move, FEN:', currentFen, 'Turn:', currentGame.turn());
      
      const response = await callChessAI(true, undefined, currentFen);

      if (response.type === 'move' && response.move) {
        const gameCopy = new Chess(currentFen);
        
        // Parse the move
        const from = response.move.substring(0, 2);
        const to = response.move.substring(2, 4);
        const promotion = response.move.length > 4 ? response.move[4] : undefined;

        console.log('Eric attempting move:', { from, to, promotion, currentTurn: gameCopy.turn() });

        try {
          const moveResult = gameCopy.move({ from, to, promotion });
          
          if (moveResult) {
            // Play sound based on move type
            if (moveResult.captured) {
              playSound('capture');
            } else {
              playSound('move');
            }
            
            setGame(gameCopy);
            
            // Add Eric's explanation to chat
            if (response.explanation) {
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.explanation,
                timestamp: new Date()
              }]);
            }
          } else {
            throw new Error('Invalid move returned');
          }
        } catch (moveError) {
          console.error('Move error:', moveError, 'Attempted:', { from, to });
          // Try to get any valid move for Black
          const validMoves = gameCopy.moves({ verbose: true });
          console.log('Valid moves for Black:', validMoves.map(m => m.san));
          if (validMoves.length > 0) {
            const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            gameCopy.move(randomMove);
            setGame(gameCopy);
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `Je joue ${randomMove.san}! 🎯`,
              timestamp: new Date()
            }]);
          }
        }
      }
    } catch (error) {
      console.error('Error making Eric move:', error);
      toast({
        title: "Erreur",
        description: "Eric n'a pas pu jouer. Réessaie!",
        variant: "destructive"
      });
    } finally {
      setIsThinking(false);
    }
  }, [messages, userNickname, toast, playSound]);

  const handlePlayerMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    const gameCopy = new Chess(game.fen());
    
    try {
      const move = gameCopy.move({ from, to, promotion: promotion || 'q' });
      
      if (move) {
        // Play sound based on move type
        if (move.captured) {
          playSound('capture');
        } else {
          playSound('move');
        }
        
        setGame(gameCopy);
        
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
    setMessages([{
      role: 'assistant',
      content: `🎮 Nouvelle partie! Tu joues les blancs, je joue les noirs. Bonne chance ${userNickname || 'mon ami'}! ♟️`,
      timestamp: new Date()
    }]);
    setGameStatus("C'est ton tour!");
  }, [userNickname, playSound]);

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
  }, [game, messages, userNickname]);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0 && userNickname) {
      setMessages([{
        role: 'assistant',
        content: `👋 Salut ${userNickname}! Je suis Eric, ton coach d'échecs. Tu joues les blancs, moi les noirs. Fais ton premier coup et je t'expliquerai ma stratégie! ♟️🎯`,
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
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 h-[calc(100vh-5rem)]">
            {/* Chess Board - Left side on tablet/desktop */}
            <div className="flex-shrink-0 md:flex-1 md:max-w-[55%]">
              <Card className="p-2 sm:p-4">
                <ChessBoard
                  game={game}
                  onMove={handlePlayerMove}
                  onNewGame={handleNewGame}
                  isThinking={isThinking}
                  gameStatus={gameStatus}
                />
              </Card>
            </div>

            {/* Chat Area - Right side on tablet/desktop */}
            <Card className="flex-1 overflow-hidden flex flex-col min-h-[50vh] md:min-h-0 md:max-w-[45%]">
              <ChessChat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isThinking}
                userNickname={userNickname}
              />
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChessGame;
