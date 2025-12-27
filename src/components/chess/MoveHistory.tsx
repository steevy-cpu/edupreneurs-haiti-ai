import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MoveHistoryProps {
  moves: string[]; // Array of SAN moves
  currentMoveIndex?: number;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, currentMoveIndex }) => {
  // Group moves into pairs (white, black)
  const movePairs: { moveNumber: number; white: string; black?: string }[] = [];
  
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1]
    });
  }

  if (moves.length === 0) {
    return (
      <div className="text-xs text-muted-foreground text-center py-2">
        Aucun coup joué
      </div>
    );
  }

  return (
    <ScrollArea className="h-24 w-full">
      <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 gap-y-0.5 text-xs p-2">
        {movePairs.map((pair, index) => {
          const whiteIndex = index * 2;
          const blackIndex = index * 2 + 1;
          
          return (
            <React.Fragment key={pair.moveNumber}>
              <span className="text-muted-foreground font-mono">
                {pair.moveNumber}.
              </span>
              <span 
                className={`font-mono ${
                  currentMoveIndex === whiteIndex 
                    ? 'bg-primary/20 text-primary font-semibold rounded px-1' 
                    : ''
                }`}
              >
                {pair.white}
              </span>
              <span 
                className={`font-mono ${
                  currentMoveIndex === blackIndex 
                    ? 'bg-primary/20 text-primary font-semibold rounded px-1' 
                    : ''
                }`}
              >
                {pair.black || '...'}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default MoveHistory;
