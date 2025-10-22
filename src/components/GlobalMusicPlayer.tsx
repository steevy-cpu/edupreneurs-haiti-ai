import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Play, Pause, SkipForward, Loader2, Volume2, X } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export const GlobalMusicPlayer = () => {
  const {
    tracks,
    currentTrackIndex,
    isPlaying,
    isLoading,
    playTrack,
    playPause,
    nextTrack,
  } = useMusicPlayer();

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      setHasMoved(true);
      
      // Calculate new position
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      
      // Get player dimensions
      const playerWidth = playerRef.current?.offsetWidth || 0;
      const playerHeight = playerRef.current?.offsetHeight || 0;
      
      // Constrain to screen boundaries
      newX = Math.max(0, Math.min(newX, window.innerWidth - playerWidth));
      newY = Math.max(0, Math.min(newY, window.innerHeight - playerHeight));
      
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      
      setHasMoved(true);
      
      const touch = e.touches[0];
      // Calculate new position
      let newX = touch.clientX - dragOffset.x;
      let newY = touch.clientY - dragOffset.y;
      
      // Get player dimensions
      const playerWidth = playerRef.current?.offsetWidth || 0;
      const playerHeight = playerRef.current?.offsetHeight || 0;
      
      // Constrain to screen boundaries
      newX = Math.max(0, Math.min(newX, window.innerWidth - playerWidth));
      newY = Math.max(0, Math.min(newY, window.innerHeight - playerHeight));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!playerRef.current) return;
    
    const rect = playerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHasMoved(false);
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!playerRef.current) return;
    
    const touch = e.touches[0];
    const rect = playerRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setHasMoved(false);
    setIsDragging(true);
  };

  const handlePlayerClick = () => {
    // Only open if the user didn't drag
    if (!hasMoved) {
      setMinimized(false);
      
      // Adjust position to ensure expanded player stays on screen
      setTimeout(() => {
        if (!playerRef.current) return;
        
        const rect = playerRef.current.getBoundingClientRect();
        let newX = position.x;
        let newY = position.y;
        
        // If using default position (0, 0), calculate from current rect
        if (position.x === 0 && position.y === 0) {
          newX = rect.left;
          newY = rect.top;
        }
        
        // Check right boundary
        if (rect.right > window.innerWidth) {
          newX = window.innerWidth - rect.width;
        }
        
        // Check bottom boundary
        if (rect.bottom > window.innerHeight) {
          newY = window.innerHeight - rect.height;
        }
        
        // Check left boundary
        if (newX < 0) newX = 0;
        
        // Check top boundary
        if (newY < 0) newY = 0;
        
        setPosition({ x: newX, y: newY });
      }, 0);
    }
  };

  // Only show the music player when user is authenticated and there are tracks
  if (!isAuthenticated || tracks.length === 0) return null;

  return (
    <>
      {/* Hidden YouTube player */}
      <div id="global-music-player" style={{ display: "none" }} />

      {/* Floating Music Player */}
      <div 
        ref={playerRef}
        className="fixed z-50 cursor-move"
        style={{
          left: position.x === 0 ? 'auto' : `${position.x}px`,
          top: position.y === 0 ? 'auto' : `${position.y}px`,
          right: position.x === 0 ? '24px' : 'auto',
          bottom: position.y === 0 ? '24px' : 'auto',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {minimized ? (
          <Button
            onClick={handlePlayerClick}
            className="w-14 h-14 rounded-full shadow-2xl"
            size="icon"
          >
            <Music className="w-6 h-6" />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
            )}
          </Button>
        ) : (
          <Card className="w-80 shadow-2xl border-2">
            <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-primary" />
                  Musique d'étude 🎵
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMinimized(true)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* Current Track */}
                  {tracks.length > 0 && (
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <img
                          src={tracks[currentTrackIndex].thumbnail}
                          alt={tracks[currentTrackIndex].title}
                          className="w-16 h-16 rounded object-cover flex-shrink-0"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium leading-tight line-clamp-2">
                            {tracks[currentTrackIndex].title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Piste {currentTrackIndex + 1} / {tracks.length}
                          </p>
                        </div>
                      </div>
                      
                      {/* Controls */}
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={playPause}
                          className="h-10 w-10"
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={nextTrack}
                          className="h-10 w-10"
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
                              Playlist
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0" align="end" side="top">
                            <ScrollArea className="h-80">
                              <div className="p-2 space-y-1">
                                {tracks.map((track, index) => (
                                  <button
                                    key={`${track.id}-${index}`}
                                    onClick={() => {
                                      playTrack(index);
                                      setOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left ${
                                      index === currentTrackIndex
                                        ? "bg-primary/10 border border-primary/20"
                                        : ""
                                    }`}
                                  >
                                    <img
                                      src={track.thumbnail}
                                      alt={track.title}
                                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium leading-tight line-clamp-2">
                                        {track.title}
                                      </p>
                                    </div>
                                    {index === currentTrackIndex && isPlaying && (
                                      <Music className="w-4 h-4 text-primary animate-pulse flex-shrink-0" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};
