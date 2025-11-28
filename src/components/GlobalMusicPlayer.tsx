import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Play, Pause, SkipForward, Loader2, Volume2, X } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

export const GlobalMusicPlayer = () => {
  const location = useLocation();
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
      // Before expanding, ensure the player will fit on screen
      if (playerRef.current) {
        const expandedWidth = 320; // w-80 = 320px
        const expandedHeight = 400; // approximate expanded height
        
        let newX = position.x;
        let newY = position.y;
        
        // If using default positioning (right-bottom)
        if (position.x === 0 && position.y === 0) {
          // Calculate position to ensure it fits
          newX = Math.max(0, window.innerWidth - expandedWidth - 24);
          newY = Math.max(0, window.innerHeight - expandedHeight - 24);
          setPosition({ x: newX, y: newY });
        } else {
          // Check if current position will cause overflow when expanded
          if (position.x + expandedWidth > window.innerWidth) {
            newX = Math.max(0, window.innerWidth - expandedWidth - 16);
          }
          if (position.y + expandedHeight > window.innerHeight) {
            newY = Math.max(0, window.innerHeight - expandedHeight - 16);
          }
          
          if (newX !== position.x || newY !== position.y) {
            setPosition({ x: newX, y: newY });
          }
        }
      }
      
      setMinimized(false);
    }
  };

  // Only show the music player when user is authenticated, there are tracks, and not on home page
  if (!isAuthenticated || tracks.length === 0 || location.pathname === '/') return null;

  return (
    <>
      {/* Hidden YouTube player */}
      <div id="global-music-player" style={{ display: "none" }} />

      {/* Floating Music Player */}
      <div 
        ref={playerRef}
        className="fixed z-50 cursor-move"
        style={{
          left: position.x !== 0 ? `${position.x}px` : 'auto',
          top: position.y !== 0 ? `${position.y}px` : 'auto',
          right: position.x === 0 && position.y === 0 ? '24px' : 'auto',
          bottom: position.x === 0 && position.y === 0 ? '24px' : 'auto',
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
          <Card className="w-[calc(100vw-32px)] sm:w-80 max-w-80 shadow-2xl border-2">
            <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2 truncate">
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                  <span className="truncate">Musique d'étude 🎵</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMinimized(true)}
                  className="h-8 w-8 shrink-0"
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
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3 mb-3">
                        <img
                          src={tracks[currentTrackIndex].thumbnail}
                          alt={tracks[currentTrackIndex].title}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded object-cover flex-shrink-0"
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
                          className="h-9 w-9 sm:h-10 sm:w-10"
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
                          className="h-9 w-9 sm:h-10 sm:w-10"
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                        <Dialog open={open} onOpenChange={setOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                              Playlist
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[calc(100vw-32px)] sm:max-w-2xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <Music className="w-4 h-4 sm:w-5 sm:h-5" />
                                Playlist de musique classique
                              </DialogTitle>
                              <DialogDescription className="text-xs sm:text-sm">
                                Sélectionne une piste pour commencer à écouter
                              </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-[400px] sm:h-[500px] pr-2 sm:pr-4">
                              <div className="space-y-2">
                                {tracks.map((track, index) => (
                                  <button
                                    key={`${track.id}-${index}`}
                                    onClick={() => {
                                      playTrack(index);
                                      setOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-accent transition-colors text-left ${
                                      index === currentTrackIndex && isPlaying
                                        ? "bg-primary/10 border-2 border-primary"
                                        : "border-2 border-transparent"
                                    }`}
                                  >
                                    <img
                                      src={track.thumbnail}
                                      alt={track.title}
                                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                                      loading="lazy"
                                      decoding="async"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-xs sm:text-sm leading-tight mb-1 line-clamp-2">
                                        {track.title}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Piste {index + 1} sur {tracks.length}
                                      </p>
                                    </div>
                                    {index === currentTrackIndex && isPlaying ? (
                                      <Music className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse flex-shrink-0" />
                                    ) : (
                                      <Play className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground flex-shrink-0" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
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
