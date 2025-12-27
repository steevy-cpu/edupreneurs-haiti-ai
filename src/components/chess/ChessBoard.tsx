import React, { useState, useCallback, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { Button } from '@/components/ui/button';
import { RefreshCw, GraduationCap, Undo2 } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import type { DifficultyLevel } from '@/pages/ChessGame';
import CapturedPieces from './CapturedPieces';
import MoveHistory from './MoveHistory';

interface ChessBoardProps {
  game: Chess;
  onMove: (from: string, to: string, promotion?: string) => boolean;
  onNewGame: () => void;
  onRequestTutorial: () => void;
  onUndo: () => void;
  isThinking: boolean;
  gameStatus: string;
  difficulty: DifficultyLevel;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  lastMove: { from: string; to: string } | null;
  capturedByWhite: string[];
  capturedByBlack: string[];
  moveHistory: string[];
  canUndo: boolean;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  onMove,
  onNewGame,
  onRequestTutorial,
  onUndo,
  isThinking,
  gameStatus,
  difficulty,
  onDifficultyChange,
  lastMove,
  capturedByWhite,
  capturedByBlack,
  moveHistory,
  canUndo
}) => {
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

  // Combine last move highlight with option squares
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    
    // Add last move highlighting
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)'
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(255, 255, 0, 0.5)'
      };
    }
    
    // Merge with option squares (these take priority)
    return { ...styles, ...optionSquares };
  }, [lastMove, optionSquares]);

  const getMoveOptions = useCallback((square: Square) => {
    const moves = game.moves({
      square,
      verbose: true
    });
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: Record<string, React.CSSProperties> = {};
    moves.forEach((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to as Square) && game.get(move.to as Square)?.color !== game.get(square)?.color
            ? 'radial-gradient(circle, rgba(255,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };
    setOptionSquares(newSquares);
    return true;
  }, [game]);

  const onSquareClick = useCallback((square: Square) => {
    // Don't allow moves if it's not player's turn or game is over
    if (game.turn() !== 'w' || game.isGameOver() || isThinking) {
      return;
    }

    // If no piece is selected, try to select one
    if (!moveFrom) {
      const piece = game.get(square);
      if (piece && piece.color === 'w') {
        setMoveFrom(square);
        getMoveOptions(square);
      }
      return;
    }

    // Try to make the move
    const moveResult = onMove(moveFrom, square);
    
    // Reset selection
    setMoveFrom(null);
    setOptionSquares({});
    
    if (!moveResult) {
      // If move failed, try selecting a new piece
      const piece = game.get(square);
      if (piece && piece.color === 'w') {
        setMoveFrom(square);
        getMoveOptions(square);
      }
    }
  }, [game, moveFrom, getMoveOptions, onMove, isThinking]);

  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square, piece: string) => {
    // Don't allow moves if it's not player's turn or game is over
    if (game.turn() !== 'w' || game.isGameOver() || isThinking) {
      return false;
    }

    // Check for pawn promotion
    const isPawn = piece?.toLowerCase().includes('p');
    const promotion = isPawn && (targetSquare[1] === '8' || targetSquare[1] === '1') ? 'q' : undefined;
    
    const result = onMove(sourceSquare, targetSquare, promotion);
    setMoveFrom(null);
    setOptionSquares({});
    return result;
  }, [game, onMove, isThinking]);

  const getStatusColor = () => {
    if (game.isCheckmate()) return 'text-red-500';
    if (game.isDraw()) return 'text-yellow-500';
    if (game.isCheck()) return 'text-orange-500';
    return 'text-muted-foreground';
  };

  const getDifficultyLabel = () => {
    switch (difficulty) {
      case 'beginner': return '🌱 Débutant';
      case 'intermediate': return '🎯 Intermédiaire';
      case 'expert': return '🏆 Expert';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Difficulty Selector */}
      <div className="flex items-center justify-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Niveau:</span>
        <Select value={difficulty} onValueChange={(value) => onDifficultyChange(value as DifficultyLevel)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Niveau" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">🌱 Débutant</SelectItem>
            <SelectItem value="intermediate">🎯 Intermédiaire</SelectItem>
            <SelectItem value="expert">🏆 Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Game Status */}
      <div className="text-center">
        <p className={`font-semibold ${getStatusColor()}`}>
          {gameStatus}
        </p>
        {isThinking && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Eric réfléchit... 🤔
          </p>
        )}
      </div>

      {/* Captured Pieces */}
      <CapturedPieces 
        capturedByWhite={capturedByWhite}
        capturedByBlack={capturedByBlack}
      />

      {/* Chess Board */}
      <div className="w-full max-w-[min(100%,500px)] mx-auto">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onPieceDrop}
          onSquareClick={onSquareClick}
          customSquareStyles={customSquareStyles}
          boardOrientation="white"
          arePiecesDraggable={game.turn() === 'w' && !game.isGameOver() && !isThinking}
          customBoardStyle={{
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
          customDarkSquareStyle={{ backgroundColor: '#769656' }}
          customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
        />
      </div>

      {/* Move History */}
      <div className="border rounded-lg">
        <div className="text-xs font-medium text-muted-foreground px-2 py-1 border-b bg-muted/30">
          📜 Historique des coups
        </div>
        <MoveHistory moves={moveHistory} />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          className="gap-2"
          disabled={!canUndo || isThinking}
        >
          <Undo2 className="w-4 h-4" />
          Annuler
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNewGame}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Nouvelle partie
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onRequestTutorial}
          className="gap-2"
          disabled={isThinking}
        >
          <GraduationCap className="w-4 h-4" />
          Tutoriel
        </Button>
      </div>

      {/* Move indicator */}
      <div className="text-center text-sm text-muted-foreground">
        {!game.isGameOver() && (
          game.turn() === 'w' 
            ? "🔵 C'est ton tour (Blancs)" 
            : "⚫ Tour d'Eric (Noirs)"
        )}
      </div>
    </div>
  );
};

export default ChessBoard;
