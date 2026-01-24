import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Flag, 
  MessageCircle, 
  Loader2,
  Crown,
  Trophy,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useChessMultiplayer, TimeControl } from '@/hooks/useChessMultiplayer';
import { ChessMatchChat } from '@/components/chess/ChessMatchChat';
import { useChessSounds } from '@/hooks/useChessSounds';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ChessMultiplayerGame = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { playSound } = useChessSounds();

  // Auth state
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ nickname: string; avatar_url: string | null } | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Game state
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showResignDialog, setShowResignDialog] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  // Multiplayer hook
  const {
    match,
    opponent,
    chatMessages,
    isLoading,
    joinMatch,
    submitMove,
    endMatch,
    resignMatch,
    sendMessage,
    isMyTurn,
    myColor,
    refreshMatch,
  } = useChessMultiplayer({ userId, enabled: true });

  // Check auth and load profile
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth?redirect=/chess-multiplayer');
        return;
      }
      setUserId(user.id);

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }

      setIsAuthLoading(false);
    };
    checkAuth();
  }, [navigate]);

  // Load match and handle joining
  useEffect(() => {
    if (!matchId || !userId || isAuthLoading) return;

    const loadMatch = async () => {
      // Check if we need to join
      const shouldJoin = searchParams.get('join') === 'true';
      
      if (shouldJoin) {
        const success = await joinMatch(matchId);
        if (!success) {
          navigate('/chess-multiplayer');
        }
      } else {
        // Just refresh match data
        await refreshMatch();
      }
    };

    loadMatch();
  }, [matchId, userId, isAuthLoading, searchParams, joinMatch, refreshMatch, navigate]);

  // Sync game state with match
  useEffect(() => {
    if (!match?.current_fen) return;

    const newGame = new Chess(match.current_fen);
    setGame(newGame);

    // Extract last move from history
    if (match.move_history && match.move_history.length > 0) {
      const lastMoveRecord = match.move_history[match.move_history.length - 1];
      setLastMove({ from: lastMoveRecord.from, to: lastMoveRecord.to });
    }
  }, [match?.current_fen, match?.move_history]);

  // Handle game end conditions
  useEffect(() => {
    if (!match || match.status !== 'playing' || gameEnded) return;

    const checkGameEnd = async () => {
      if (game.isCheckmate()) {
        const winnerId = game.turn() === 'w' ? match.black_player_id : match.white_player_id;
        const result = game.turn() === 'w' ? 'black_wins' : 'white_wins';
        
        playSound('gameEnd');
        setGameEnded(true);
        
        await endMatch(winnerId, result, 'checkmate');
        
        toast({
          title: 'Échec et mat!',
          description: winnerId === userId ? 'Vous avez gagné!' : 'Vous avez perdu.',
        });
      } else if (game.isDraw()) {
        playSound('gameEnd');
        setGameEnded(true);
        
        let reason = 'draw';
        if (game.isStalemate()) reason = 'stalemate';
        else if (game.isThreefoldRepetition()) reason = 'repetition';
        else if (game.isInsufficientMaterial()) reason = 'insufficient_material';
        
        await endMatch(null, 'draw', reason);
        
        toast({
          title: 'Partie nulle!',
        });
      } else if (game.isCheck()) {
        playSound('check');
      }
    };

    checkGameEnd();
  }, [game, match, userId, gameEnded, endMatch, toast, playSound]);

  // Handle match completion
  useEffect(() => {
    if (match?.status === 'completed' && !gameEnded) {
      setGameEnded(true);
      playSound('gameEnd');
    }
  }, [match?.status, gameEnded, playSound]);

  // Board orientation
  const boardOrientation = useMemo(() => {
    return myColor === 'b' ? 'black' : 'white';
  }, [myColor]);

  // Get move options for a square
  const getMoveOptions = useCallback((square: Square) => {
    if (!isMyTurn) return false;

    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) return false;

    const newSquares: Record<string, React.CSSProperties> = {};
    moves.forEach((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to as Square) &&
          game.get(move.to as Square)?.color !== game.get(square)?.color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };

    setOptionSquares(newSquares);
    return true;
  }, [game, isMyTurn]);

  // Handle square click
  const onSquareClick = useCallback((square: Square) => {
    if (!isMyTurn) return;

    // If we already have a piece selected
    if (moveFrom) {
      // Try to make the move
      const gameCopy = new Chess(game.fen());
      
      try {
        const move = gameCopy.move({
          from: moveFrom,
          to: square,
          promotion: 'q', // Always promote to queen for simplicity
        });

        if (move) {
          // Submit move to server
          submitMove(moveFrom, square, gameCopy.fen(), move.promotion);
          
          // Play sound
          if (move.captured) {
            playSound('capture');
          } else {
            playSound('move');
          }
          
          setLastMove({ from: moveFrom, to: square });
        }
      } catch {
        // Invalid move, try selecting new piece
        if (getMoveOptions(square)) {
          setMoveFrom(square);
          return;
        }
      }
      
      setMoveFrom(null);
      setOptionSquares({});
      return;
    }

    // Select a piece
    if (getMoveOptions(square)) {
      setMoveFrom(square);
    }
  }, [game, moveFrom, isMyTurn, getMoveOptions, submitMove, playSound]);

  // Handle piece drop (drag and drop)
  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square): boolean => {
    if (!isMyTurn) return false;

    const gameCopy = new Chess(game.fen());
    
    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move) {
        submitMove(sourceSquare, targetSquare, gameCopy.fen(), move.promotion);
        
        if (move.captured) {
          playSound('capture');
        } else {
          playSound('move');
        }
        
        setLastMove({ from: sourceSquare, to: targetSquare });
        setMoveFrom(null);
        setOptionSquares({});
        return true;
      }
    } catch {
      return false;
    }

    return false;
  }, [game, isMyTurn, submitMove, playSound]);

  // Custom square styles
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = { ...optionSquares };
    
    if (lastMove) {
      styles[lastMove.from] = {
        ...styles[lastMove.from],
        backgroundColor: 'rgba(255, 255, 0, 0.3)',
      };
      styles[lastMove.to] = {
        ...styles[lastMove.to],
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
      };
    }
    
    return styles;
  }, [lastMove, optionSquares]);

  const getAvatarUrl = (avatarUrl: string | null) => {
    if (!avatarUrl) return undefined;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/user-avatars/${avatarUrl}`;
  };

  const handleResign = async () => {
    setShowResignDialog(false);
    await resignMatch();
  };

  const handleBack = () => {
    navigate('/chess-multiplayer');
  };

  if (isAuthLoading || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!match) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Partie non trouvée</p>
          <Button onClick={handleBack}>Retour au lobby</Button>
        </div>
      </Layout>
    );
  }

  const isGameOver = match.status === 'completed' || match.status === 'cancelled' || match.status === 'abandoned';
  const didIWin = match.winner_id === userId;
  const isDraw = isGameOver && !match.winner_id;

  return (
    <Layout>
      <main className="min-h-screen bg-background">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quitter
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className="relative"
              >
                <MessageCircle className="w-4 h-4" />
                {chatMessages.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>
              
              {!isGameOver && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowResignDialog(true)}
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Abandonner
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            {/* Main Game Area */}
            <div className="space-y-4">
              {/* Opponent Info */}
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={getAvatarUrl(opponent?.avatar_url || null)} />
                      <AvatarFallback>
                        {opponent?.nickname?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{opponent?.nickname || 'Adversaire'}</p>
                      <p className="text-xs text-muted-foreground">
                        {myColor === 'w' ? 'Noirs' : 'Blancs'}
                      </p>
                    </div>
                  </div>
                  
                  {match.time_control !== 'untimed' && (
                    <div className={cn(
                      "px-3 py-1 rounded-lg font-mono text-lg",
                      match.current_turn !== myColor ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {formatTime(myColor === 'w' ? match.black_time_remaining : match.white_time_remaining)}
                    </div>
                  )}
                </div>
              </Card>

              {/* Chess Board */}
              <div className="relative aspect-square max-w-[600px] mx-auto">
                <Chessboard
                  position={game.fen()}
                  onSquareClick={onSquareClick}
                  onPieceDrop={onPieceDrop}
                  boardOrientation={boardOrientation}
                  customSquareStyles={customSquareStyles}
                  arePiecesDraggable={isMyTurn && !isGameOver}
                  customBoardStyle={{
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  }}
                />
                
                {/* Game Over Overlay */}
                {isGameOver && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="text-center space-y-4 p-6">
                      {isDraw ? (
                        <>
                          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                            <Crown className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <h2 className="text-2xl font-bold">Partie nulle</h2>
                        </>
                      ) : didIWin ? (
                        <>
                          <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-success" />
                          </div>
                          <h2 className="text-2xl font-bold text-success">Victoire!</h2>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
                            <X className="w-8 h-8 text-destructive" />
                          </div>
                          <h2 className="text-2xl font-bold text-destructive">Défaite</h2>
                        </>
                      )}
                      <p className="text-muted-foreground">
                        {match.result_reason === 'checkmate' && 'Échec et mat'}
                        {match.result_reason === 'resignation' && 'Abandon'}
                        {match.result_reason === 'timeout' && 'Temps écoulé'}
                        {match.result_reason === 'stalemate' && 'Pat'}
                      </p>
                      <Button onClick={handleBack} className="mt-4">
                        Retour au lobby
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Player Info */}
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={getAvatarUrl(userProfile?.avatar_url || null)} />
                      <AvatarFallback>
                        {userProfile?.nickname?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{userProfile?.nickname || 'Vous'}</p>
                      <p className="text-xs text-muted-foreground">
                        {myColor === 'w' ? 'Blancs' : 'Noirs'}
                      </p>
                    </div>
                  </div>
                  
                  {match.time_control !== 'untimed' && (
                    <div className={cn(
                      "px-3 py-1 rounded-lg font-mono text-lg",
                      match.current_turn === myColor ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {formatTime(myColor === 'w' ? match.white_time_remaining : match.black_time_remaining)}
                    </div>
                  )}
                </div>
              </Card>

              {/* Turn Indicator */}
              {!isGameOver && (
                <div className={cn(
                  "text-center py-2 rounded-lg",
                  isMyTurn ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {isMyTurn ? "C'est votre tour" : "Tour de l'adversaire"}
                </div>
              )}
            </div>

            {/* Chat Panel */}
            {showChat && (
              <ChessMatchChat
                messages={chatMessages}
                userId={userId}
                opponent={opponent}
                userProfile={userProfile}
                onSendMessage={sendMessage}
                onClose={() => setShowChat(false)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Resign Confirmation Dialog */}
      <AlertDialog open={showResignDialog} onOpenChange={setShowResignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abandonner la partie?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous perdrez cette partie si vous abandonnez. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleResign} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Abandonner
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

// Helper function to format time
const formatTime = (seconds: number | null): string => {
  if (seconds === null) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default ChessMultiplayerGame;
