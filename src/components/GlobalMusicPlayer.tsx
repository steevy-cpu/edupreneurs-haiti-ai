import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Music, Play, Pause, SkipForward, SkipBack, Loader2, Volume2, Volume1, VolumeX, Shuffle, Repeat, Repeat1, X, Lock } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNetworkAwareLoading } from "@/hooks/useNetworkAwareLoading";
import { useSubscription } from "@/hooks/useSubscription";
import { useVisitor } from "@/contexts/VisitorContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const GlobalMusicPlayer = () => {
  const [isStable, setIsStable] = useState(false);
  const location = useLocation();
  const {
    tracks,
    currentTrackIndex,
    isPlaying,
    isLoading,
    playTrack,
    playPause,
    nextTrack,
    prevTrack,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
  } = useMusicPlayer();
  
  const { isSlowConnection, shouldShowAnimations, shouldShowBlur } = useNetworkAwareLoading();
  const { isActive, isExpired } = useSubscription();
  const { isVisitor } = useVisitor();
  const navigate = useNavigate();
  // Visitors browse freely; only expired authenticated users are locked out
  const isMusicLocked = !isVisitor && isExpired;
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [hasDragStarted, setHasDragStarted] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  // Fix 4: Debounce ref to prevent rapid play/pause double-fires
  const lastPlayPauseRef = useRef(0);
  
  // Fix 5: Increased from 8 to reduce false drag detection on mobile
  const DRAG_THRESHOLD = 12;

  // Unified Pointer Events handler for drag
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      
      if (!hasDragStarted) {
        const dx = Math.abs(e.clientX - dragStartPos.x);
        const dy = Math.abs(e.clientY - dragStartPos.y);
        if (dx < DRAG_THRESHOLD && dy < DRAG_THRESHOLD) return;
        setHasDragStarted(true);
      }
      
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

  const handleDragStart = (e: React.PointerEvent) => {
    if (!playerRef.current) return;
    const rect = playerRef.current.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setHasDragStarted(false);
    setHasMoved(false);
    setIsDragging(true);
  };

  const handlePlayerClick = () => {
    if (!hasMoved) setMinimized(false);
  };

  const handleOpenPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMinimized(true);
    setPlaylistOpen(true);
  };

  const getExpandedPlayerStyle = (): React.CSSProperties => {
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      return {
        position: 'fixed' as const,
        left: '16px', right: '16px',
        bottom: 'calc(100px + env(safe-area-inset-bottom, 0px))',
        top: 'auto', transform: 'none',
      };
    }
    return {
      position: 'fixed' as const,
      left: '50%', top: '50%',
      transform: 'translate(-50%, -50%)',
      right: 'auto', bottom: 'auto',
    };
  };

  useEffect(() => {
    let playerDiv = document.getElementById("global-music-player");
    if (!playerDiv) {
      playerDiv = document.createElement("div");
      playerDiv.id = "global-music-player";
      playerDiv.style.display = "none";
      document.body.appendChild(playerDiv);
    }
    return () => {};
  }, []);

  // isStable guard: prevents null dispatcher crash on lazy-load mount
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsStable(true));
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  if (!isStable || tracks.length === 0) return null;

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;
  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <>
      {/* Playlist Dialog */}
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
        data-tour="music-fab"
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
            onPointerDown={isMusicLocked ? undefined : handleDragStart}
            onClick={() => {
              if (isMusicLocked) {
                toast("Renouvelez votre abonnement pour écouter de la musique", {
                  action: {
                    label: "Renouveler",
                    onClick: () => navigate('/settings?tab=account#subscription'),
                  },
                });
                return;
              }
              handlePlayerClick();
            }}
            className={cn(
              "w-14 h-14 rounded-full shadow-2xl relative overflow-hidden",
              isMusicLocked ? "cursor-pointer opacity-70" : "cursor-move"
            )}
            style={{ touchAction: 'none' }}
            size="icon"
          >
            {/* Locked state — show lock icon instead of music controls */}
            {isMusicLocked ? (
              <Lock className="w-6 h-6" />
            ) : isPlaying ? (
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
            {/* Amber dot when locked, green dot when playing */}
            {isMusicLocked ? (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full" />
            ) : isPlaying && (
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
                      {/* Track info */}
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
                      
                      {/* Playback Controls */}
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); toggleShuffle(); }}
                          className={cn("h-8 w-8", shuffle && "text-primary")}
                          title="Lecture aléatoire"
                        >
                          <Shuffle className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); prevTrack(); }}
                          className="h-9 w-9 sm:h-10 sm:w-10"
                        >
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Fix 4: 300ms debounce to prevent rapid double-fires
                            if (Date.now() - lastPlayPauseRef.current < 300) return;
                            lastPlayPauseRef.current = Date.now();
                            playPause();
                          }}
                          className="h-9 w-9 sm:h-10 sm:w-10"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); nextTrack(); }}
                          className="h-9 w-9 sm:h-10 sm:w-10"
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); cycleRepeatMode(); }}
                          className={cn("h-8 w-8", repeatMode !== 'off' && "text-primary")}
                          title={repeatMode === 'one' ? 'Répéter la piste' : repeatMode === 'all' ? 'Répéter tout' : 'Répétition désactivée'}
                        >
                          <RepeatIcon className="w-3.5 h-3.5" />
                        </Button>
                      </div>

                      {/* Volume Control */}
                      <div className="flex items-center gap-2 mt-3 px-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                        >
                          <VolumeIcon className="w-3.5 h-3.5" />
                        </Button>
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          max={100}
                          step={1}
                          onValueChange={([v]) => {
                            setVolume(v);
                            if (v > 0 && isMuted) toggleMute();
                          }}
                          className="flex-1"
                        />
                      </div>

                      {/* Playlist button */}
                      <div className="flex justify-center mt-3">
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
