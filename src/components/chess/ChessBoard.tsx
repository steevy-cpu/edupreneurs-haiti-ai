import React, { useState, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ChessBoardProps {
  game: Chess;
  onMove: (from: string, to: string, promotion?: string) => boolean;
  onNewGame: () => void;
  isThinking: boolean;
  gameStatus: string;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  game,
  onMove,
  onNewGame,
  isThinking,
  gameStatus
}) => {
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

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

  const handleSquareClick = useCallback(({ square }: { piece: unknown; square: string }) => {
    // Don't allow moves if it's not player's turn or game is over
    if (game.turn() !== 'w' || game.isGameOver() || isThinking) {
      return;
    }

    // If no piece is selected, try to select one
    if (!moveFrom) {
      const piece = game.get(square as Square);
      if (piece && piece.color === 'w') {
        setMoveFrom(square as Square);
        getMoveOptions(square as Square);
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
      const piece = game.get(square as Square);
      if (piece && piece.color === 'w') {
        setMoveFrom(square as Square);
        getMoveOptions(square as Square);
      }
    }
  }, [game, moveFrom, getMoveOptions, onMove, isThinking]);

  const handlePieceDrop = useCallback(({ piece, sourceSquare, targetSquare }: { 
    piece: unknown; 
    sourceSquare: string; 
    targetSquare: string | null 
  }) => {
    // Don't allow moves if it's not player's turn or game is over
    if (game.turn() !== 'w' || game.isGameOver() || isThinking || !targetSquare) {
      return false;
    }

    // Check for pawn promotion
    const pieceStr = String(piece);
    const isPawn = pieceStr?.toLowerCase().includes('p');
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

  return (
    <div className="flex flex-col gap-4">
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

      {/* Chess Board */}
      <div className="w-full max-w-[600px] mx-auto">
        <Chessboard
          options={{
            position: game.fen(),
            onPieceDrop: handlePieceDrop,
            onSquareClick: handleSquareClick,
            squareStyles: optionSquares,
            boardOrientation: 'white',
            allowDragging: game.turn() === 'w' && !game.isGameOver() && !isThinking,
            boardStyle: {
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            },
            darkSquareStyle: { backgroundColor: '#769656' },
            lightSquareStyle: { backgroundColor: '#eeeed2' }
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onNewGame}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Nouvelle partie
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
