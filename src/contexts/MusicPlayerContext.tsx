import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";

interface PlaylistTrack {
  id: string;
  title: string;
  thumbnail: string;
}

interface MusicPlayerContextType {
  tracks: PlaylistTrack[];
  currentTrackIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  playerReady: boolean;
  setCurrentTrackIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  playTrack: (index: number) => void;
  playPause: () => void;
  nextTrack: () => void;
  initPlayer: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

const YOUTUBE_API_KEY = "AIzaSyDu6sWsM5NEgb48nFFIz49guKR5amdsGWA";

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    fetchPlaylistTracks();
    loadYouTubeAPI();
  }, []);

  const loadYouTubeAPI = () => {
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
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `maxResults=20&` +
        `q=classical+music+for+studying+relaxing+mozart+beethoven+bach&` +
        `type=video&` +
        `videoDuration=long&` +
        `videoEmbeddable=true&` +
        `videoCategoryId=10&` +
        `key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      
      const trackList: PlaylistTrack[] = [
        {
          id: "4PUHBL1vMNY",
          title: "Classical Music for Studying & Concentration",
          thumbnail: "https://i.ytimg.com/vi/4PUHBL1vMNY/default.jpg",
        },
        ...data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.default.url,
        }))
      ];

      setTracks(trackList);
    } catch (error) {
      const fallbackTracks: PlaylistTrack[] = [
        { id: "4PUHBL1vMNY", title: "Classical Music for Studying & Concentration", thumbnail: "https://i.ytimg.com/vi/4PUHBL1vMNY/default.jpg" },
        { id: "jgpJVI3tDbY", title: "Mozart - Classical Music for Brain Power", thumbnail: "https://i.ytimg.com/vi/jgpJVI3tDbY/default.jpg" },
        { id: "ip0q0HEh_SU", title: "Beethoven - Classical Music for Studying", thumbnail: "https://i.ytimg.com/vi/ip0q0HEh_SU/default.jpg" },
        { id: "Rb0UmrCXxVA", title: "Bach - Classical Music for Studying", thumbnail: "https://i.ytimg.com/vi/Rb0UmrCXxVA/default.jpg" },
        { id: "PJL_mVgT0Ao", title: "Chopin - Classical Piano Music", thumbnail: "https://i.ytimg.com/vi/PJL_mVgT0Ao/default.jpg" },
      ];
      setTracks(fallbackTracks);
    } finally {
      setIsLoading(false);
    }
  };

  const initPlayer = () => {
    if (playerRef.current || tracks.length === 0) return;

    const initialize = () => {
      if (window.YT && window.YT.Player) {
        try {
          playerRef.current = new window.YT.Player("global-music-player", {
            height: "0",
            width: "0",
            videoId: tracks[currentTrackIndex].id,
            playerVars: {
              autoplay: 1,
              controls: 0,
            },
            events: {
              onReady: (event: any) => {
                setPlayerReady(true);
                event.target.playVideo();
                setIsPlaying(true);
              },
              onStateChange: (event: any) => {
                if (event.data === window.YT.PlayerState.ENDED) {
                  nextTrack();
                }
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setIsPlaying(true);
                } else if (event.data === window.YT.PlayerState.PAUSED) {
                  setIsPlaying(false);
                }
              },
            },
          });
        } catch (error) {
          console.error("Failed to initialize YouTube player:", error);
        }
      } else {
        setTimeout(initialize, 100);
      }
    };

    initialize();
  };

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    if (playerRef.current && playerReady) {
      playerRef.current.loadVideoById(tracks[index].id);
      playerRef.current.playVideo();
      setIsPlaying(true);
    } else {
      // Initialize player if not ready
      setTimeout(() => {
        if (window.YT && window.YT.Player) {
          playerRef.current = new window.YT.Player("global-music-player", {
            height: "0",
            width: "0",
            videoId: tracks[index].id,
            playerVars: {
              autoplay: 1,
              controls: 0,
            },
            events: {
              onReady: (event: any) => {
                setPlayerReady(true);
                event.target.playVideo();
                setIsPlaying(true);
              },
              onStateChange: (event: any) => {
                if (event.data === window.YT.PlayerState.ENDED) {
                  nextTrack();
                }
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setIsPlaying(true);
                } else if (event.data === window.YT.PlayerState.PAUSED) {
                  setIsPlaying(false);
                }
              },
            },
          });
        }
      }, 500);
    }
  };

  const playPause = () => {
    if (!playerRef.current) {
      initPlayer();
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

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    playTrack(nextIndex);
  };

  return (
    <MusicPlayerContext.Provider
      value={{
        tracks,
        currentTrackIndex,
        isPlaying,
        isLoading,
        playerReady,
        setCurrentTrackIndex,
        setIsPlaying,
        playTrack,
        playPause,
        nextTrack,
        initPlayer,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error("useMusicPlayer must be used within MusicPlayerProvider");
  }
  return context;
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
