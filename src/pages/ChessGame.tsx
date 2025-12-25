import React, { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Trophy, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

  // Update game status
  useEffect(() => {
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'Eric' : 'Toi';
      setGameStatus(`🏆 Échec et mat! ${winner} a gagné!`);
    } else if (game.isDraw()) {
      setGameStatus('🤝 Match nul!');
    } else if (game.isStalemate()) {
      setGameStatus('🤝 Pat - Match nul!');
    } else if (game.isCheck()) {
      setGameStatus('⚠️ Échec!');
    } else if (game.turn() === 'w') {
      setGameStatus("C'est ton tour!");
    } else {
      setGameStatus("Tour d'Eric...");
    }
  }, [game]);

  const callChessAI = async (isEricTurn: boolean, userMessage?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('chess-ai-tutor', {
        body: {
          fen: game.fen(),
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

  const makeEricMove = useCallback(async () => {
    if (game.isGameOver()) return;

    setIsThinking(true);
    try {
      const response = await callChessAI(true);

      if (response.type === 'move' && response.move) {
        const gameCopy = new Chess(game.fen());
        
        // Parse the move
        const from = response.move.substring(0, 2);
        const to = response.move.substring(2, 4);
        const promotion = response.move.length > 4 ? response.move[4] : undefined;

        try {
          const moveResult = gameCopy.move({ from, to, promotion });
          
          if (moveResult) {
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
            throw new Error('Invalid move');
          }
        } catch (moveError) {
          console.error('Move error:', moveError);
          // Try to get any valid move
          const validMoves = gameCopy.moves({ verbose: true });
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
  }, [game, messages, userNickname, toast]);

  const handlePlayerMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    const gameCopy = new Chess(game.fen());
    
    try {
      const move = gameCopy.move({ from, to, promotion: promotion || 'q' });
      
      if (move) {
        setGame(gameCopy);
        
        // Add move to chat
        setMessages(prev => [...prev, {
          role: 'user',
          content: `J'ai joué ${move.san}`,
          timestamp: new Date()
        }]);

        // Trigger Eric's turn after a short delay
        if (!gameCopy.isGameOver()) {
          setTimeout(() => {
            makeEricMove();
          }, 500);
        }
        
        return true;
      }
    } catch (e) {
      console.error('Invalid move:', e);
    }
    
    return false;
  }, [game, makeEricMove]);

  const handleNewGame = useCallback(() => {
    setGame(new Chess());
    setMessages([{
      role: 'assistant',
      content: `🎮 Nouvelle partie! Tu joues les blancs, je joue les noirs. Bonne chance ${userNickname || 'mon ami'}! ♟️`,
      timestamp: new Date()
    }]);
    setGameStatus("C'est ton tour!");
  }, [userNickname]);

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
        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
            {/* Chat Area - Left side */}
            <Card className="lg:col-span-1 overflow-hidden flex flex-col order-2 lg:order-1 h-[50vh] lg:h-full">
              <ChessChat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isThinking}
                userNickname={userNickname}
              />
            </Card>

            {/* Chess Board - Right side */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <Card className="p-4 lg:p-6">
                <ChessBoard
                  game={game}
                  onMove={handlePlayerMove}
                  onNewGame={handleNewGame}
                  isThinking={isThinking}
                  gameStatus={gameStatus}
                />
              </Card>

              {/* Game Tips */}
              <Card className="mt-4 p-4 bg-muted/50">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  Conseils
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Clique ou glisse les pièces pour jouer</li>
                  <li>• Eric t'expliquera chaque coup qu'il fait</li>
                  <li>• N'hésite pas à lui poser des questions!</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChessGame;
