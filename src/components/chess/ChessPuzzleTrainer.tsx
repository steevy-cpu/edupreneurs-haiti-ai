import React, { useState, useCallback, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Lightbulb, 
  RotateCcw, 
  ChevronRight, 
  Trophy, 
  Target,
  Clock,
  Loader2,
  Sparkles
} from 'lucide-react';
import ericThinking from '@/assets/eric-thinking-pose.png';

interface ChessPuzzle {
  id: string;
  fen: string;
  solution: string[];
  difficulty: string;
  theme: string | null;
  hint: string | null;
  explanation: string | null;
}

interface ChessPuzzleTrainerProps {
  userId: string | null;
  onBack: () => void;
}

const ChessPuzzleTrainer: React.FC<ChessPuzzleTrainerProps> = ({ userId, onBack }) => {
  const [puzzle, setPuzzle] = useState<ChessPuzzle | null>(null);
  const [game, setGame] = useState<Chess>(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

  const loadPuzzle = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chess_puzzles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        // Pick a random puzzle
        const randomPuzzle = data[Math.floor(Math.random() * data.length)];
        setPuzzle(randomPuzzle);
        
        const newGame = new Chess(randomPuzzle.fen);
        setGame(newGame);
        setCurrentMoveIndex(0);
        setIsPlayerTurn(true);
        setShowHint(false);
        setSolved(false);
        setFailed(false);
        setAttempts(0);
        setStartTime(new Date());
        setSelectedSquare(null);
        setOptionSquares({});
      }
    } catch (error) {
      console.error('Error loading puzzle:', error);
      toast.error('Erreur lors du chargement du puzzle');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPuzzle();
  }, [loadPuzzle]);

  const getMoveOptions = useCallback((square: Square) => {
    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: Record<string, React.CSSProperties> = {};
    moves.forEach((move) => {
      const isCapture = game.get(move.to as Square) && 
        game.get(move.to as Square)?.color !== game.get(square)?.color;
      
      newSquares[move.to] = {
        background: isCapture
          ? 'radial-gradient(circle, rgba(255,0,0,.2) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(0,0,0,.15) 25%, transparent 25%)',
        borderRadius: '50%'
      };
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };
    setOptionSquares(newSquares);
    return true;
  }, [game]);

  const makeComputerMove = useCallback(() => {
    if (!puzzle || currentMoveIndex >= puzzle.solution.length) return;

    setTimeout(() => {
      const move = puzzle.solution[currentMoveIndex];
      const gameCopy = new Chess(game.fen());
      
      try {
        gameCopy.move(move);
        setGame(gameCopy);
        setCurrentMoveIndex(prev => prev + 1);
        setIsPlayerTurn(true);
        
        // Check if puzzle is complete
        if (currentMoveIndex + 1 >= puzzle.solution.length) {
          setSolved(true);
          setPuzzlesSolved(prev => prev + 1);
          setStreak(prev => prev + 1);
          savePuzzleAttempt(true);
          toast.success('🎉 Bravo! Puzzle résolu!');
        }
      } catch (error) {
        console.error('Invalid computer move:', error);
      }
    }, 500);
  }, [puzzle, currentMoveIndex, game]);

  const savePuzzleAttempt = async (success: boolean) => {
    if (!userId || !puzzle || !startTime) return;

    const timeSeconds = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    
    try {
      await supabase.from('chess_puzzle_attempts').insert({
        user_id: userId,
        puzzle_id: puzzle.id,
        solved: success,
        attempts: attempts + 1,
        time_seconds: timeSeconds
      });
    } catch (error) {
      console.error('Error saving puzzle attempt:', error);
    }
  };

  const onSquareClick = useCallback((square: Square) => {
    if (!isPlayerTurn || solved || failed || !puzzle) return;

    if (!selectedSquare) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        getMoveOptions(square);
      }
      return;
    }

    // Try to make the move
    const gameCopy = new Chess(game.fen());
    try {
      const moveResult = gameCopy.move({
        from: selectedSquare,
        to: square,
        promotion: 'q'
      });

      if (moveResult) {
        const expectedMove = puzzle.solution[currentMoveIndex];
        const playerMove = moveResult.from + moveResult.to + (moveResult.promotion || '');
        
        // Check if move matches expected
        if (playerMove === expectedMove || 
            moveResult.san === expectedMove ||
            (moveResult.from + moveResult.to) === expectedMove.slice(0, 4)) {
          setGame(gameCopy);
          setCurrentMoveIndex(prev => prev + 1);
          setIsPlayerTurn(false);
          setSelectedSquare(null);
          setOptionSquares({});
          
          // Check if there's a computer response needed
          if (currentMoveIndex + 1 < puzzle.solution.length) {
            makeComputerMove();
          } else {
            setSolved(true);
            setPuzzlesSolved(prev => prev + 1);
            setStreak(prev => prev + 1);
            savePuzzleAttempt(true);
            toast.success('🎉 Bravo! Puzzle résolu!');
          }
        } else {
          // Wrong move
          setAttempts(prev => prev + 1);
          if (attempts >= 2) {
            setFailed(true);
            setStreak(0);
            savePuzzleAttempt(false);
            toast.error('😢 Pas tout à fait... Essaie encore!');
          } else {
            toast.warning('Ce n\'est pas le meilleur coup. Réessaie!');
          }
          setSelectedSquare(null);
          setOptionSquares({});
        }
      }
    } catch (error) {
      // Invalid move, try selecting the new square
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        getMoveOptions(square);
      } else {
        setSelectedSquare(null);
        setOptionSquares({});
      }
    }
  }, [game, selectedSquare, isPlayerTurn, solved, failed, puzzle, currentMoveIndex, attempts, getMoveOptions, makeComputerMove]);

  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square) => {
    if (!isPlayerTurn || solved || failed || !puzzle) return false;

    const gameCopy = new Chess(game.fen());
    try {
      const moveResult = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (moveResult) {
        const expectedMove = puzzle.solution[currentMoveIndex];
        const playerMove = moveResult.from + moveResult.to + (moveResult.promotion || '');
        
        if (playerMove === expectedMove || 
            moveResult.san === expectedMove ||
            (moveResult.from + moveResult.to) === expectedMove.slice(0, 4)) {
          setGame(gameCopy);
          setCurrentMoveIndex(prev => prev + 1);
          setIsPlayerTurn(false);
          setSelectedSquare(null);
          setOptionSquares({});
          
          if (currentMoveIndex + 1 < puzzle.solution.length) {
            makeComputerMove();
          } else {
            setSolved(true);
            setPuzzlesSolved(prev => prev + 1);
            setStreak(prev => prev + 1);
            savePuzzleAttempt(true);
            toast.success('🎉 Bravo! Puzzle résolu!');
          }
          return true;
        } else {
          setAttempts(prev => prev + 1);
          if (attempts >= 2) {
            setFailed(true);
            setStreak(0);
            savePuzzleAttempt(false);
            toast.error('😢 Pas tout à fait... Essaie encore!');
          } else {
            toast.warning('Ce n\'est pas le meilleur coup. Réessaie!');
          }
          return false;
        }
      }
    } catch (error) {
      return false;
    }
    return false;
  }, [game, isPlayerTurn, solved, failed, puzzle, currentMoveIndex, attempts, makeComputerMove]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-primary';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement du puzzle...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Retour au jeu
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Trophy className="w-3 h-3" />
            {puzzlesSolved} résolus
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="w-3 h-3" />
            Série: {streak}
          </Badge>
        </div>
      </div>

      {/* Puzzle Info */}
      {puzzle && (
        <Card>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Puzzle Tactique</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(puzzle.difficulty)}>
                  {puzzle.difficulty}
                </Badge>
                {puzzle.theme && (
                  <Badge variant="secondary">{puzzle.theme}</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-2">
              {game.turn() === 'w' ? '⚪ Trait aux blancs' : '⚫ Trait aux noirs'} - 
              Trouve le meilleur coup!
            </p>
            <Progress 
              value={(currentMoveIndex / puzzle.solution.length) * 100} 
              className="h-2"
            />
          </CardContent>
        </Card>
      )}

      {/* Chess Board */}
      <div className="w-full max-w-[min(100%,400px)] mx-auto">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onPieceDrop}
          onSquareClick={onSquareClick}
          customSquareStyles={optionSquares}
          boardOrientation={puzzle && game.turn() === 'b' ? 'black' : 'white'}
          arePiecesDraggable={isPlayerTurn && !solved && !failed}
          customBoardStyle={{
            borderRadius: '12px',
            boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.15)'
          }}
          customDarkSquareStyle={{ backgroundColor: '#769656' }}
          customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
          animationDuration={200}
        />
      </div>

      {/* Eric's Hint/Explanation */}
      {(showHint || solved || failed) && puzzle && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <img 
                src={ericThinking} 
                alt="Eric" 
                className="w-12 h-12 rounded-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div>
                <p className="font-semibold text-sm mb-1">Eric dit:</p>
                <p className="text-sm text-muted-foreground">
                  {solved ? (
                    puzzle.explanation || "Excellent! Tu as trouvé la bonne combinaison! 🎉"
                  ) : failed ? (
                    `La solution était: ${puzzle.solution.join(', ')}. ${puzzle.explanation || 'Continue à t\'entraîner!'}`
                  ) : (
                    puzzle.hint || "Cherche une tactique... peut-être une fourchette ou un clouage? 🤔"
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 justify-center">
        {!solved && !failed && !showHint && (
          <Button 
            variant="outline" 
            onClick={() => setShowHint(true)}
            className="gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            Indice
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={loadPuzzle}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {solved || failed ? 'Nouveau Puzzle' : 'Réinitialiser'}
        </Button>

        {(solved || failed) && (
          <Button 
            onClick={loadPuzzle}
            className="gap-2"
          >
            <ChevronRight className="w-4 h-4" />
            Puzzle Suivant
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChessPuzzleTrainer;
