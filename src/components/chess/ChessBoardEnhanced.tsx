import React, { useState, useCallback, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import CapturedPieces from './CapturedPieces';
import MoveHistory from './MoveHistory';
import ChessTimer from './ChessTimer';
import ChessGameControls from './ChessGameControls';
import EricCoachBanner from './EricCoachBanner';
import type { DifficultyLevel, TimeControl } from '@/hooks/useChessGame';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChessBoardEnhancedProps {
  game: Chess;
  onMove: (from: string, to: string, promotion?: string) => boolean;
  onNewGame: () => void;
  onRequestTutorial: () => void;
  onUndo: () => void;
  onShowStats: () => void;
  isThinking: boolean;
  gameStatus: string;
  difficulty: DifficultyLevel;
  timeControl: TimeControl;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  onTimeControlChange: (timeControl: TimeControl) => void;
  lastMove: { from: string; to: string } | null;
  capturedByWhite: string[];
  capturedByBlack: string[];
  moveHistory: string[];
  canUndo: boolean;
  whiteTime: number;
  blackTime: number;
  isGameOver: boolean;
  chatMessages?: ChatMessage[];
  onSendMessage?: (message: string) => void;
}

const ChessBoardEnhanced: React.FC<ChessBoardEnhancedProps> = ({
  game,
  onMove,
  onNewGame,
  onRequestTutorial,
  onUndo,
  onShowStats,
  isThinking,
  gameStatus,
  difficulty,
  timeControl,
  onDifficultyChange,
  onTimeControlChange,
  lastMove,
  capturedByWhite,
  capturedByBlack,
  moveHistory,
  canUndo,
  whiteTime,
  blackTime,
  isGameOver,
  chatMessages = [],
  onSendMessage
}) => {
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)'
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(255, 255, 0, 0.5)'
      };
    }
    
    return { ...styles, ...optionSquares };
  }, [lastMove, optionSquares]);

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

  const onSquareClick = useCallback((square: Square) => {
    if (game.turn() !== 'w' || game.isGameOver() || isThinking || isGameOver) {
      return;
    }

    if (!moveFrom) {
      const piece = game.get(square);
      if (piece && piece.color === 'w') {
        setMoveFrom(square);
        getMoveOptions(square);
      }
      return;
    }

    const moveResult = onMove(moveFrom, square);
    
    setMoveFrom(null);
    setOptionSquares({});
    
    if (!moveResult) {
      const piece = game.get(square);
      if (piece && piece.color === 'w') {
        setMoveFrom(square);
        getMoveOptions(square);
      }
    }
  }, [game, moveFrom, getMoveOptions, onMove, isThinking, isGameOver]);

  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square, piece: string) => {
    if (game.turn() !== 'w' || game.isGameOver() || isThinking || isGameOver) {
      return false;
    }

    const isPawn = piece?.toLowerCase().includes('p');
    const promotion = isPawn && (targetSquare[1] === '8' || targetSquare[1] === '1') ? 'q' : undefined;
    
    const result = onMove(sourceSquare, targetSquare, promotion);
    setMoveFrom(null);
    setOptionSquares({});
    return result;
  }, [game, onMove, isThinking, isGameOver]);

  const getStatusColor = () => {
    if (game.isCheckmate()) return 'text-red-500';
    if (game.isDraw() || game.isStalemate()) return 'text-yellow-500';
    if (game.isCheck()) return 'text-orange-500';
    return 'text-foreground';
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Controls */}
      <ChessGameControls
        difficulty={difficulty}
        timeControl={timeControl}
        onDifficultyChange={onDifficultyChange}
        onTimeControlChange={onTimeControlChange}
        onNewGame={onNewGame}
        onUndo={onUndo}
        onRequestTutorial={onRequestTutorial}
        onShowStats={onShowStats}
        canUndo={canUndo}
        isThinking={isThinking}
        isGameOver={isGameOver}
      />

      {/* Game Status - Compact */}
      <div className="text-center py-1">
        <p className={`font-semibold ${getStatusColor()}`}>
          {gameStatus}
        </p>
      </div>

      {/* Eric Coach Bubble - Floating after status */}
      <EricCoachBanner
        messages={chatMessages}
        isThinking={isThinking}
        isExpanded={isChatExpanded}
        onToggle={() => setIsChatExpanded(!isChatExpanded)}
        onSendMessage={onSendMessage}
      />

      {/* Timer */}
      {timeControl !== 'untimed' && (
        <ChessTimer
          whiteTime={whiteTime}
          blackTime={blackTime}
          isWhiteTurn={game.turn() === 'w'}
          isGameOver={isGameOver}
        />
      )}

      {/* Captured Pieces */}
      <CapturedPieces 
        capturedByWhite={capturedByWhite}
        capturedByBlack={capturedByBlack}
      />

      {/* Chess Board */}
      <div className="w-full max-w-[min(100%,480px)] mx-auto">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onPieceDrop}
          onSquareClick={onSquareClick}
          customSquareStyles={customSquareStyles}
          boardOrientation="white"
          arePiecesDraggable={game.turn() === 'w' && !game.isGameOver() && !isThinking && !isGameOver}
          customBoardStyle={{
            borderRadius: '12px',
            boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.15)'
          }}
          customDarkSquareStyle={{ backgroundColor: '#769656' }}
          customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
          animationDuration={200}
        />
      </div>

      {/* Move History */}
      <div className="border rounded-xl overflow-hidden">
        <div className="text-xs font-medium text-muted-foreground px-3 py-2 border-b bg-muted/30 flex items-center gap-2">
          📜 Historique ({moveHistory.length} coups)
        </div>
        <MoveHistory moves={moveHistory} />
      </div>

      {/* Turn indicator */}
      <div className="text-center text-sm text-muted-foreground">
        {!isGameOver && (
          game.turn() === 'w' 
            ? "⚪ C'est ton tour" 
            : "⚫ Tour d'Eric"
        )}
        {isGameOver && "Partie terminée"}
      </div>
    </div>
  );
};

export default ChessBoardEnhanced;
