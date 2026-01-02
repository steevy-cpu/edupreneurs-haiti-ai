import React from 'react';

interface CapturedPiecesProps {
  capturedByWhite: string[]; // Pieces white has captured (black pieces)
  capturedByBlack: string[]; // Pieces black has captured (white pieces)
}

const pieceSymbols: Record<string, string> = {
  p: '♟',
  n: '♞',
  b: '♝',
  r: '♜',
  q: '♛',
  k: '♚',
  P: '♙',
  N: '♘',
  B: '♗',
  R: '♖',
  Q: '♕',
  K: '♔'
};

const pieceValues: Record<string, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 0
};

const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  capturedByWhite,
  capturedByBlack
}) => {
  const calculateMaterialAdvantage = () => {
    const whitePoints = capturedByWhite.reduce((sum, p) => sum + (pieceValues[p.toLowerCase()] || 0), 0);
    const blackPoints = capturedByBlack.reduce((sum, p) => sum + (pieceValues[p.toLowerCase()] || 0), 0);
    return whitePoints - blackPoints;
  };

  const advantage = calculateMaterialAdvantage();

  const renderPieces = (pieces: string[], isBlack: boolean) => {
    // Sort by value (queens first, then rooks, etc.)
    const sorted = [...pieces].sort((a, b) => 
      (pieceValues[b.toLowerCase()] || 0) - (pieceValues[a.toLowerCase()] || 0)
    );
    
    return (
      <div className="flex flex-wrap gap-0.5">
        {sorted.map((piece, index) => (
          <span 
            key={index} 
            className={`text-lg ${isBlack ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {pieceSymbols[isBlack ? piece.toLowerCase() : piece.toUpperCase()]}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="flex justify-between items-center gap-4 px-2 py-1 bg-muted/50 rounded-lg text-sm">
      {/* Black's captured pieces (pieces Jude lost) */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-muted-foreground shrink-0">⚫</span>
        <div className="flex-1 min-w-0">
          {capturedByWhite.length > 0 ? (
            renderPieces(capturedByWhite, true)
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </div>
        {advantage > 0 && (
          <span className="text-xs font-medium text-green-600 dark:text-green-400 shrink-0">
            +{advantage}
          </span>
        )}
      </div>

      {/* White's captured pieces (pieces player lost) */}
      <div className="flex items-center gap-2 min-w-0">
        {advantage < 0 && (
          <span className="text-xs font-medium text-green-600 dark:text-green-400 shrink-0">
            +{Math.abs(advantage)}
          </span>
        )}
        <div className="flex-1 min-w-0">
          {capturedByBlack.length > 0 ? (
            renderPieces(capturedByBlack, false)
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground shrink-0">⚪</span>
      </div>
    </div>
  );
};

export default CapturedPieces;
