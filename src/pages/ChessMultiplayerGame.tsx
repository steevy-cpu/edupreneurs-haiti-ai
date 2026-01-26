import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Chess, Square } from 'chess.js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useSessionAuth } from '@/contexts/SessionAuthContext';
import { 
  ArrowLeft, 
  Flag, 
  Loader2,
  Crown,
  Trophy,
  X,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useChessMultiplayer, TimeControl } from '@/hooks/useChessMultiplayer';
import { useChessSounds } from '@/hooks/useChessSounds';
import { useMessageSounds } from '@/hooks/useMessageSounds';
import { PromotionDialog, PromotionPiece } from '@/components/chess/PromotionDialog';
import { ChessBoardSkeleton } from '@/components/chess/ChessBoardSkeleton';
import FloatingMatchChat from '@/components/chess/FloatingMatchChat';
import { saveChessSession, clearChessSession } from '@/chess/store/chessSession.store';
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

// Lazy load heavy chessboard component for 3G optimization
const Chessboard = lazy(() => 
  import('react-chessboard').then(m => ({ default: m.Chessboard }))
);

const ChessMultiplayerGame = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { playSound } = useChessSounds();
  const { playReceiveSound } = useMessageSounds();

  // Auth state from context
  const { user, isAuthenticated, isLoading: isAuthLoading } = useSessionAuth();
  const userId = user?.id ?? null;
  
  // Profile state (still need to fetch separately for nickname/avatar)
  const [userProfile, setUserProfile] = useState<{ nickname: string; avatar_url: string | null } | null>(null);

  // Game state
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showResignDialog, setShowResignDialog] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [isMatchLoading, setIsMatchLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Promotion state
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
    gameCopy: Chess;
  } | null>(null);
  
  // Timer state - local countdown for smooth display
  const [localWhiteTime, setLocalWhiteTime] = useState<number | null>(null);
  const [localBlackTime, setLocalBlackTime] = useState<number | null>(null);

  // Multiplayer hook with new message callback
  const {
    match,
    opponent,
    chatMessages,
    isLoading,
    eloChanges,
    joinMatch,
    submitMove,
    endMatch,
    resignMatch,
    sendMessage,
    requestRematch,
    acceptRematch,
    isMyTurn,
    myColor,
    refreshMatch,
  } = useChessMultiplayer({ 
    userId, 
    enabled: true,
    onNewMessage: (msg) => {
      playReceiveSound();
      if (!showChat) {
        setUnreadCount(prev => prev + 1);
        toast({ 
          title: opponent?.nickname || 'Adversaire', 
          description: msg.message.slice(0, 50) + (msg.message.length > 50 ? '...' : ''),
        });
      }
    }
  });

  // Reset unread count when chat opens
  useEffect(() => {
    if (showChat) setUnreadCount(0);
  }, [showChat]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/auth/login', { state: { returnTo: '/chess-multiplayer' } });
    }
  }, [isAuthLoading, isAuthenticated, navigate]);

  // Fetch user profile when userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('user_id', userId)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
      }
    };

    fetchProfile();
  }, [userId]);

  // Load match and handle joining
  useEffect(() => {
    if (!matchId || !userId || isAuthLoading) return;

    const loadMatch = async () => {
      setIsMatchLoading(true);
      
      try {
        // Check if we need to join
        const shouldJoin = searchParams.get('join') === 'true';
        
        if (shouldJoin) {
          const success = await joinMatch(matchId);
          if (!success) {
            navigate('/chess-multiplayer');
          }
        } else {
          // Load match data by ID from URL
          await refreshMatch(matchId);
        }
      } finally {
        setIsMatchLoading(false);
      }
    };

    loadMatch();
  }, [matchId, userId, isAuthLoading, searchParams, joinMatch, refreshMatch, navigate]);

  // Save session when match is active
  useEffect(() => {
    if (match && (match.status === 'waiting' || match.status === 'playing')) {
      saveChessSession(match.id);
    }
  }, [match?.id, match?.status]);

  // Clear session when game ends
  useEffect(() => {
    if (match?.status === 'completed' || match?.status === 'cancelled' || match?.status === 'abandoned') {
      clearChessSession();
    }
  }, [match?.status]);

  // Ref to track previous move count for opponent sound detection
  const prevMoveCountRef = useRef<number>(0);

  // Sync game state with match and play sound on opponent move
  useEffect(() => {
    if (!match?.current_fen) return;

    const newGame = new Chess(match.current_fen);
    setGame(newGame);

    // Extract last move from history
    if (match.move_history && match.move_history.length > 0) {
      const lastMoveRecord = match.move_history[match.move_history.length - 1];
      setLastMove({ from: lastMoveRecord.from, to: lastMoveRecord.to });
      
      // Play sound if this is a new move from opponent
      const currentMoveCount = match.move_history.length;
      if (currentMoveCount > prevMoveCountRef.current && lastMoveRecord.player_id !== userId) {
        // Determine if it was a capture by checking the previous position
        const prevFen = currentMoveCount > 1 
          ? match.move_history[currentMoveCount - 2]?.fen 
          : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        try {
          const prevGame = new Chess(prevFen);
          const targetPiece = prevGame.get(lastMoveRecord.to as Square);
          if (targetPiece) {
            playSound('capture');
          } else {
            playSound('move');
          }
        } catch {
          playSound('move');
        }
      }
      prevMoveCountRef.current = currentMoveCount;
    }
  }, [match?.current_fen, match?.move_history, userId, playSound]);

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

  // Sync local timers with server state
  useEffect(() => {
    if (match?.white_time_remaining !== undefined && match?.white_time_remaining !== null) {
      setLocalWhiteTime(match.white_time_remaining);
    }
    if (match?.black_time_remaining !== undefined && match?.black_time_remaining !== null) {
      setLocalBlackTime(match.black_time_remaining);
    }
  }, [match?.white_time_remaining, match?.black_time_remaining]);

  // Timer countdown effect - decrements every second for the active player
  useEffect(() => {
    if (match?.status !== 'playing' || !match?.time_per_player || match?.time_control === 'untimed') return;
    if (gameEnded) return;

    const interval = setInterval(() => {
      if (match.current_turn === 'w') {
        setLocalWhiteTime(prev => prev !== null ? Math.max(0, prev - 1) : null);
      } else {
        setLocalBlackTime(prev => prev !== null ? Math.max(0, prev - 1) : null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [match?.status, match?.current_turn, match?.time_per_player, match?.time_control, gameEnded]);

  // Check for timeout - only the player whose time expired triggers the end
  useEffect(() => {
    if (gameEnded || match?.status !== 'playing') return;
    
    // If my time ran out, I lose
    if (myColor === 'w' && localWhiteTime === 0) {
      setGameEnded(true);
      playSound('gameEnd');
      endMatch(match?.black_player_id || null, 'black_wins', 'timeout');
      toast({
        title: 'Temps écoulé!',
        description: 'Vous avez perdu au temps.',
        variant: 'destructive',
      });
    } else if (myColor === 'b' && localBlackTime === 0) {
      setGameEnded(true);
      playSound('gameEnd');
      endMatch(match?.white_player_id || null, 'white_wins', 'timeout');
      toast({
        title: 'Temps écoulé!',
        description: 'Vous avez perdu au temps.',
        variant: 'destructive',
      });
    }
  }, [localWhiteTime, localBlackTime, myColor, gameEnded, match, endMatch, playSound, toast]);

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

  // Check if a move is a pawn promotion
  const isPromotionMove = useCallback((from: Square, to: Square): boolean => {
    const piece = game.get(from);
    if (!piece || piece.type !== 'p') return false;
    
    const targetRank = to[1];
    return (piece.color === 'w' && targetRank === '8') || 
           (piece.color === 'b' && targetRank === '1');
  }, [game]);

  // Handle square click
  const onSquareClick = useCallback((square: Square) => {
    if (!isMyTurn) return;

    // If we already have a piece selected
    if (moveFrom) {
      // Check if this is a promotion move
      if (isPromotionMove(moveFrom, square)) {
        const gameCopy = new Chess(game.fen());
        // Validate move is legal (try with queen)
        try {
          const testMove = gameCopy.move({ from: moveFrom, to: square, promotion: 'q' });
          if (testMove) {
            // Valid promotion move - show dialog
            setPendingPromotion({ from: moveFrom, to: square, gameCopy: new Chess(game.fen()) });
            return;
          }
        } catch {
          // Invalid move
        }
      }
      
      // Try to make the move (non-promotion)
      const gameCopy = new Chess(game.fen());
      
      try {
        const move = gameCopy.move({
          from: moveFrom,
          to: square,
        });

        if (move) {
          // Submit move to server with remaining time
          const myTimeRemaining = myColor === 'w' ? localWhiteTime : localBlackTime;
          submitMove(moveFrom, square, gameCopy.fen(), undefined, myTimeRemaining ?? undefined);
          
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
  }, [game, moveFrom, isMyTurn, getMoveOptions, submitMove, playSound, myColor, localWhiteTime, localBlackTime, isPromotionMove]);

  // Handle piece drop (drag and drop)
  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square): boolean => {
    if (!isMyTurn) return false;

    // Check if this is a promotion move
    if (isPromotionMove(sourceSquare, targetSquare)) {
      const gameCopy = new Chess(game.fen());
      // Validate move is legal
      try {
        const testMove = gameCopy.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
        if (testMove) {
          setPendingPromotion({ from: sourceSquare, to: targetSquare, gameCopy: new Chess(game.fen()) });
          return true; // Accept the drop, will complete after selection
        }
      } catch {
        return false;
      }
    }

    const gameCopy = new Chess(game.fen());
    
    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
      });

      if (move) {
        const myTimeRemaining = myColor === 'w' ? localWhiteTime : localBlackTime;
        submitMove(sourceSquare, targetSquare, gameCopy.fen(), undefined, myTimeRemaining ?? undefined);
        
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
  }, [game, isMyTurn, submitMove, playSound, myColor, localWhiteTime, localBlackTime, isPromotionMove]);

  // Handle promotion piece selection
  const handlePromotionSelect = useCallback((piece: PromotionPiece) => {
    if (!pendingPromotion) return;
    
    const { from, to, gameCopy } = pendingPromotion;
    
    try {
      const move = gameCopy.move({ from, to, promotion: piece });
      
      if (move) {
        const myTimeRemaining = myColor === 'w' ? localWhiteTime : localBlackTime;
        submitMove(from, to, gameCopy.fen(), piece, myTimeRemaining ?? undefined);
        
        if (move.captured) {
          playSound('capture');
        } else {
          playSound('move');
        }
        
        setLastMove({ from, to });
      }
    } catch (err) {
      console.error('Promotion move failed:', err);
    }
    
    setPendingPromotion(null);
    setMoveFrom(null);
    setOptionSquares({});
  }, [pendingPromotion, myColor, localWhiteTime, localBlackTime, submitMove, playSound]);

  // Handle promotion cancel
  const handlePromotionCancel = useCallback(() => {
    setPendingPromotion(null);
    setMoveFrom(null);
    setOptionSquares({});
  }, []);

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
    clearChessSession(); // Clear session on explicit resign
    await resignMatch();
  };

  const handleBack = () => {
    navigate('/chess-multiplayer');
  };

  if (isAuthLoading || isLoading || isMatchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Partie non trouvée</p>
        <Button onClick={handleBack}>Retour au lobby</Button>
      </div>
    );
  }

  const isGameOver = match.status === 'completed' || match.status === 'cancelled' || match.status === 'abandoned';
  const didIWin = match.winner_id === userId;
  const isDraw = isGameOver && !match.winner_id;

  return (
    <main className="min-h-screen bg-background pb-20 sm:pb-24 lg:pb-8">
        <div className="mx-auto max-w-4xl px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1 sm:gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quitter</span>
            </Button>
            
            {!isGameOver && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowResignDialog(true)}
              >
                <Flag className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Abandonner</span>
              </Button>
            )}
          </div>

          {/* Main Game Area - Single column with floating chat */}
          <div className="relative">
            <div className="space-y-2 sm:space-y-4">
              {/* Floating Chat - Above opponent card */}
              <FloatingMatchChat
                messages={chatMessages}
                userId={userId}
                opponent={opponent}
                userProfile={userProfile}
                onSendMessage={sendMessage}
                isOpen={showChat}
                onToggle={() => setShowChat(!showChat)}
                unreadCount={unreadCount}
              />
              
              {/* Opponent Info */}
              <Card className="p-2 sm:p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 shrink-0">
                      <AvatarImage src={getAvatarUrl(opponent?.avatar_url || null)} />
                      <AvatarFallback className="text-sm">
                        {opponent?.nickname?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{opponent?.nickname || 'Adversaire'}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {myColor === 'w' ? 'Noirs' : 'Blancs'}
                      </p>
                    </div>
                  </div>
                  
                  {match.time_control !== 'untimed' && (
                    <div className={cn(
                      "px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg font-mono text-base sm:text-lg transition-colors shrink-0",
                      match.current_turn !== myColor ? "bg-primary text-primary-foreground" : "bg-muted",
                      // Low time warning for opponent
                      (myColor === 'w' ? localBlackTime : localWhiteTime) !== null &&
                      (myColor === 'w' ? localBlackTime : localWhiteTime)! <= 30 && 
                      match.current_turn !== myColor && "bg-destructive text-destructive-foreground animate-pulse"
                    )}>
                      {formatTime(myColor === 'w' ? localBlackTime : localWhiteTime)}
                    </div>
                  )}
                </div>
              </Card>

              {/* Chess Board - Responsive sizing */}
              <div className="relative aspect-square w-full max-w-[min(600px,calc(100vw-1rem))] mx-auto">
                <Suspense fallback={<ChessBoardSkeleton />}>
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
                </Suspense>
                
                {/* Game Over Overlay */}
                {isGameOver && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <div className="text-center space-y-4 p-6 max-w-sm">
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
                      
                      {/* ELO Changes */}
                      {eloChanges && (
                        <div className="flex justify-center">
                          <span className={cn(
                            "font-mono text-lg font-semibold px-3 py-1 rounded-lg",
                            (myColor === 'w' ? eloChanges.white : eloChanges.black) >= 0
                              ? "text-success bg-success/10"
                              : "text-destructive bg-destructive/10"
                          )}>
                            {(myColor === 'w' ? eloChanges.white : eloChanges.black) >= 0 ? '+' : ''}
                            {myColor === 'w' ? eloChanges.white : eloChanges.black} ELO
                          </span>
                        </div>
                      )}
                      
                      {/* Rematch Section */}
                      <div className="flex flex-col gap-2 pt-2">
                        {/* If no rematch yet and no request */}
                        {!match.rematch_match_id && !match.rematch_requested_by && (
                          <Button 
                            onClick={async () => {
                              const result = await requestRematch();
                              if (result.rematch_id) {
                                navigate(`/chess-multiplayer/match/${result.rematch_id}`);
                              }
                            }}
                            variant="outline"
                            className="w-full"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Proposer revanche
                          </Button>
                        )}
                        
                        {/* If I requested, waiting for opponent */}
                        {!match.rematch_match_id && match.rematch_requested_by === userId && (
                          <Button variant="outline" disabled className="w-full">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Revanche proposée...
                          </Button>
                        )}
                        
                        {/* If opponent requested, show accept button */}
                        {!match.rematch_match_id && match.rematch_requested_by && match.rematch_requested_by !== userId && (
                          <Button 
                            onClick={async () => {
                              const result = await acceptRematch();
                              if (result.rematch_id) {
                                navigate(`/chess-multiplayer/match/${result.rematch_id}`);
                              }
                            }}
                            className="w-full"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Accepter la revanche
                          </Button>
                        )}
                        
                        {/* If rematch exists, go to it */}
                        {match.rematch_match_id && (
                          <Button 
                            onClick={() => navigate(`/chess-multiplayer/match/${match.rematch_match_id}`)}
                            className="w-full"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Aller à la revanche
                          </Button>
                        )}
                        
                        <Button onClick={handleBack} variant="ghost" className="w-full">
                          Retour au lobby
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Player Info */}
              <Card className="p-2 sm:p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Avatar className="w-8 h-8 sm:w-10 sm:h-10 shrink-0">
                      <AvatarImage src={getAvatarUrl(userProfile?.avatar_url || null)} />
                      <AvatarFallback className="text-sm">
                        {userProfile?.nickname?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{userProfile?.nickname || 'Vous'}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {myColor === 'w' ? 'Blancs' : 'Noirs'}
                      </p>
                    </div>
                  </div>
                  
                  {match.time_control !== 'untimed' && (
                    <div className={cn(
                      "px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg font-mono text-base sm:text-lg transition-colors shrink-0",
                      match.current_turn === myColor ? "bg-primary text-primary-foreground" : "bg-muted",
                      // Low time warning for me
                      (myColor === 'w' ? localWhiteTime : localBlackTime) !== null &&
                      (myColor === 'w' ? localWhiteTime : localBlackTime)! <= 30 && 
                      match.current_turn === myColor && "bg-destructive text-destructive-foreground animate-pulse"
                    )}>
                      {formatTime(myColor === 'w' ? localWhiteTime : localBlackTime)}
                    </div>
                  )}
                </div>
              </Card>

              {/* Turn Indicator */}
              {!isGameOver && (
                <div className={cn(
                  "text-center py-1.5 sm:py-2 rounded-lg text-sm sm:text-base",
                  isMyTurn ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {isMyTurn ? "C'est votre tour" : "Tour de l'adversaire"}
                </div>
              )}
            </div>
            
          </div>
        </div>

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
        
        {/* Promotion Dialog */}
        <PromotionDialog
          isOpen={pendingPromotion !== null}
          color={myColor || 'w'}
          onSelect={handlePromotionSelect}
          onCancel={handlePromotionCancel}
        />
      </main>
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
