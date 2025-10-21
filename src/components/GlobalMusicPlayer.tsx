import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Play, Pause, SkipForward, Loader2, Volume2, X } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useState, useEffect } from "react";
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

  // Only show the music player when user is authenticated and there are tracks
  if (!isAuthenticated || tracks.length === 0) return null;

  return (
    <>
      {/* Hidden YouTube player */}
      <div id="global-music-player" style={{ display: "none" }} />

      {/* Floating Music Player */}
      <div className="fixed bottom-6 right-6 z-50">
        {minimized ? (
          <Button
            onClick={() => setMinimized(false)}
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
