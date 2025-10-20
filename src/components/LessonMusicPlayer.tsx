import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, Play, Pause, SkipForward, Loader2, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlaylistTrack {
  id: string;
  title: string;
  thumbnail: string;
}

const YOUTUBE_API_KEY = "AIzaSyDu6sWsM5NEgb48nFFIz49guKR5amdsGWA";
const CLASSICAL_VIDEO_ID = "4PUHBL1vMNY"; // Classical Music for Studying

export const LessonMusicPlayer = () => {
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const playerRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlaylistTracks();
    loadYouTubeAPI();
  }, []);

  const loadYouTubeAPI = () => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  };

  const fetchPlaylistTracks = async () => {
    setIsLoading(true);
    try {
      // Search for classical music study playlists
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `maxResults=20&` +
        `q=classical+music+for+studying+relaxing+mozart+beethoven+bach&` +
        `type=video&` +
        `videoDuration=long&` +
        `videoEmbeddable=true&` +
        `videoCategoryId=10&` + // Music category
        `key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch classical music");
      }

      const data = await response.json();
      
      // Add the reference video first
      const trackList: PlaylistTrack[] = [
        {
          id: CLASSICAL_VIDEO_ID,
          title: "Classical Music for Studying & Concentration",
          thumbnail: `https://i.ytimg.com/vi/${CLASSICAL_VIDEO_ID}/default.jpg`,
        },
        ...data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.default.url,
        }))
      ];

      setTracks(trackList);
    } catch (error) {
      console.error("Error fetching classical music:", error);
      // Fallback to a curated list of classical music videos
      const fallbackTracks: PlaylistTrack[] = [
        {
          id: "4PUHBL1vMNY",
          title: "Classical Music for Studying & Concentration",
          thumbnail: "https://i.ytimg.com/vi/4PUHBL1vMNY/default.jpg",
        },
        {
          id: "jgpJVI3tDbY",
          title: "Mozart - Classical Music for Brain Power",
          thumbnail: "https://i.ytimg.com/vi/jgpJVI3tDbY/default.jpg",
        },
        {
          id: "ip0q0HEh_SU",
          title: "Beethoven - Classical Music for Studying",
          thumbnail: "https://i.ytimg.com/vi/ip0q0HEh_SU/default.jpg",
        },
        {
          id: "Rb0UmrCXxVA",
          title: "Bach - Classical Music for Studying and Concentration",
          thumbnail: "https://i.ytimg.com/vi/Rb0UmrCXxVA/default.jpg",
        },
        {
          id: "PJL_mVgT0Ao",
          title: "Chopin - Classical Piano Music for Studying",
          thumbnail: "https://i.ytimg.com/vi/PJL_mVgT0Ao/default.jpg",
        },
      ];
      setTracks(fallbackTracks);
      // Don't show error toast - just use fallback silently
    } finally {
      setIsLoading(false);
    }
  };

  const initializePlayer = (videoId: string) => {
    if (playerRef.current) {
      playerRef.current.loadVideoById(videoId);
      return;
    }

    if (window.YT && window.YT.Player) {
      playerRef.current = new window.YT.Player("music-player", {
        height: "0",
        width: "0",
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              handleNext();
            }
          },
        },
      });
    } else {
      setTimeout(() => initializePlayer(videoId), 100);
    }
  };

  const handlePlayPause = () => {
    if (!playerRef.current) {
      if (tracks.length > 0) {
        initializePlayer(tracks[currentTrackIndex].id);
      }
      return;
    }

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIndex);
    if (playerRef.current) {
      playerRef.current.loadVideoById(tracks[nextIndex].id);
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleTrackSelect = (index: number) => {
    setCurrentTrackIndex(index);
    if (playerRef.current) {
      playerRef.current.loadVideoById(tracks[index].id);
      playerRef.current.playVideo();
      setIsPlaying(true);
    } else {
      initializePlayer(tracks[index].id);
    }
    setOpen(false);
  };

  return (
    <>
      {/* Hidden YouTube player */}
      <div id="music-player" style={{ display: "none" }} />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 relative"
          >
            <Music className="w-5 h-5" />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 max-h-[600px]" align="end" side="bottom" sideOffset={5}>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
              <CardTitle className="text-base flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-primary" />
                Musique d'étude 🎵
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Musique classique pour mieux te concentrer
              </p>
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
                    <div className="p-4 border-b bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
                      <div className="flex items-start gap-3 mb-3">
                        <img
                          src={tracks[currentTrackIndex].thumbnail}
                          alt={tracks[currentTrackIndex].title}
                          className="w-16 h-16 rounded object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-xs font-medium leading-tight break-words">
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
                          onClick={handlePlayPause}
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
                          onClick={handleNext}
                          className="h-10 w-10"
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Track List */}
                  <ScrollArea className="h-[320px]">
                    <div className="p-2 space-y-1">
                      {tracks.map((track, index) => (
                        <button
                          key={`${track.id}-${index}`}
                          onClick={() => handleTrackSelect(index)}
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
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-xs font-medium leading-tight break-words">
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
                </>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </>
  );
};

// Extend Window interface for YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
