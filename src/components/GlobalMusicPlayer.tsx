import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Play, Pause, SkipForward, Loader2, Volume2, X } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";
import { cn } from "@/lib/utils";

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
  
  const { isSlowConnection, shouldShowAnimations, shouldShowBlur } = useNetworkAwareLoading();

  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [hasDragStarted, setHasDragStarted] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  
  const DRAG_THRESHOLD = 8; // pixels before drag starts

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Unified Pointer Events handler for drag
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      
      // Check if we've passed the drag threshold
      if (!hasDragStarted) {
        const dx = Math.abs(e.clientX - dragStartPos.x);
        const dy = Math.abs(e.clientY - dragStartPos.y);
        if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) {
          return; // Don't start dragging yet
        }
        setHasDragStarted(true);
      }
      
      // Prevent default to stop scroll/pan on touch devices
      e.preventDefault();
      
      setHasMoved(true);
      
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      
      const playerWidth = playerRef.current?.offsetWidth || 0;
      const playerHeight = playerRef.current?.offsetHeight || 0;
      
      newX = Math.max(0, Math.min(newX, window.innerWidth - playerWidth));
      newY = Math.max(0, Math.min(newY, window.innerHeight - playerHeight));
      
      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("pointermove", handlePointerMove, { passive: false });
      document.addEventListener("pointerup", handlePointerUp);
      document.addEventListener("pointercancel", handlePointerUp);
    }

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDragging, dragOffset, hasDragStarted, dragStartPos]);

  // Unified Pointer Event handler for drag start
  const handleDragStart = (e: React.PointerEvent) => {
    if (!playerRef.current) return;
    
    const rect = playerRef.current.getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setHasDragStarted(false);
    setHasMoved(false);
    setIsDragging(true);
  };

  const handlePlayerClick = () => {
    if (!hasMoved) {
      setMinimized(false);
    }
  };

  const handleOpenPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMinimized(true);
    setPlaylistOpen(true);
  };

  // Style for expanded player - centered on desktop, bottom on mobile
  const getExpandedPlayerStyle = (): React.CSSProperties => {
    const isMobile = window.innerWidth < 640;
    
    if (isMobile) {
      // Mobile: fixed at bottom
      return {
        position: 'fixed' as const,
        left: '16px',
        right: '16px',
        bottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
        top: 'auto',
        transform: 'none',
      };
    }
    
    // Desktop/tablet: centered on page
    return {
      position: 'fixed' as const,
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      right: 'auto',
      bottom: 'auto',
    };
  };

  // Create the YouTube player container outside React's control
  useEffect(() => {
    let playerDiv = document.getElementById("global-music-player");
    if (!playerDiv) {
      playerDiv = document.createElement("div");
      playerDiv.id = "global-music-player";
      playerDiv.style.display = "none";
      document.body.appendChild(playerDiv);
    }
    
    // Cleanup on unmount - but don't remove if player is active
    return () => {
      // We intentionally don't remove the div here to prevent React DOM conflicts
      // The YouTube player manages its own lifecycle
    };
  }, []);

  if (!isAuthenticated || tracks.length === 0 || location.pathname === '/') return null;

  return (
    <>

      {/* Playlist Dialog - always mounted, independent of Card */}
      <Dialog open={playlistOpen} onOpenChange={setPlaylistOpen}>
        <DialogContent className="w-[calc(100vw-32px)] max-w-2xl max-h-[80vh]">
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
                    setPlaylistOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-accent transition-colors text-left ${
                    index === currentTrackIndex && isPlaying
                      ? "bg-primary/10 border-2 border-primary"
                      : "border-2 border-transparent"
                  }`}
                >
                  <img
                    src={isSlowConnection 
                      ? track.thumbnail.replace('hqdefault', 'mqdefault')
                      : track.thumbnail
                    }
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
                    <Music className={cn(
                      "w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0",
                      shouldShowAnimations && "animate-pulse"
                    )} />
                  ) : (
                    <Play className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Floating Music Player */}
      <div 
        ref={playerRef}
        className="fixed z-50"
        style={{
          left: position.x !== 0 ? `${position.x}px` : 'auto',
          top: position.y !== 0 ? `${position.y}px` : 'auto',
          right: position.x === 0 && position.y === 0 ? '24px' : 'auto',
          bottom:
            position.x === 0 && position.y === 0
              ? (location.pathname === "/community"
                  ? 'calc(160px + env(safe-area-inset-bottom, 0px))'
                  : 'calc(148px + env(safe-area-inset-bottom, 0px))')
              : 'auto',
        }}
      >
        {minimized ? (
          <Button
            onPointerDown={handleDragStart}
            onClick={handlePlayerClick}
            className="w-14 h-14 rounded-full shadow-2xl cursor-move relative overflow-hidden"
            style={{ touchAction: 'none' }}
            size="icon"
          >
            {isPlaying ? (
              shouldShowAnimations ? (
                <div className="flex items-end gap-[3px] h-6">
                  <span className="w-1 bg-primary-foreground rounded-full animate-music-bar-1" />
                  <span className="w-1 bg-primary-foreground rounded-full animate-music-bar-2" />
                  <span className="w-1 bg-primary-foreground rounded-full animate-music-bar-3" />
                </div>
              ) : (
                <Volume2 className="w-6 h-6" />
              )
            ) : (
              <Music className="w-6 h-6" />
            )}
            {isPlaying && (
              <span className={cn(
                "absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full",
                shouldShowAnimations && "animate-pulse"
              )} />
            )}
          </Button>
        ) : (
          <Card 
            className="w-[calc(100vw-32px)] sm:w-80 max-w-80 shadow-2xl border-2 transition-all duration-200"
            style={getExpandedPlayerStyle()}
          >
            <CardHeader 
              className={cn(
                "pb-3 cursor-move",
                shouldShowBlur 
                  ? "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30"
                  : "bg-muted"
              )}
              style={{ touchAction: 'none' }}
              onPointerDown={handleDragStart}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2 truncate">
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                  <span className="truncate">Musique d'étude 🎵</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimized(true);
                  }}
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
                  {tracks.length > 0 && (
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start gap-2 sm:gap-3 mb-3">
                        <img
                          src={isSlowConnection 
                            ? tracks[currentTrackIndex].thumbnail.replace('hqdefault', 'mqdefault')
                            : tracks[currentTrackIndex].thumbnail
                          }
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
                          onClick={(e) => {
                            e.stopPropagation();
                            playPause();
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            nextTrack();
                          }}
                          className="h-9 w-9 sm:h-10 sm:w-10"
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs sm:text-sm"
                          onClick={handleOpenPlaylist}
                        >
                          Playlist
                        </Button>
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
