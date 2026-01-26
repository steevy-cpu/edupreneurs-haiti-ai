/**
 * ChessBoardSkeleton - Loading placeholder for the chessboard component.
 * 
 * Displays an 8x8 grid matching the chess board pattern while the
 * heavy react-chessboard library loads. Optimized for 3G connections.
 */
export function ChessBoardSkeleton() {
  return (
    <div className="aspect-square w-full max-w-[400px] mx-auto rounded-lg overflow-hidden shadow-lg animate-pulse">
      <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
        {Array.from({ length: 64 }).map((_, i) => {
          const row = Math.floor(i / 8);
          const col = i % 8;
          const isLight = (row + col) % 2 === 0;
          
          return (
            <div 
              key={i} 
              className={isLight 
                ? 'bg-amber-100 dark:bg-amber-900/40' 
                : 'bg-amber-600/50 dark:bg-amber-800/60'
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export default ChessBoardSkeleton;
