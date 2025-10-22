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
    // Use curated classical music library (YouTube API has quota limits)
    const curatedTracks: PlaylistTrack[] = [
      // Mozart Collection
      { id: "jgpJVI3tDbY", title: "Mozart - Classical Music for Brain Power & Studying", thumbnail: "https://i.ytimg.com/vi/jgpJVI3tDbY/mqdefault.jpg" },
      { id: "TlvFOdT5btc", title: "Mozart - The Best of Classical Music", thumbnail: "https://i.ytimg.com/vi/TlvFOdT5btc/mqdefault.jpg" },
      { id: "sw6r-clEV1w", title: "Mozart for Studying and Concentration", thumbnail: "https://i.ytimg.com/vi/sw6r-clEV1w/mqdefault.jpg" },
      
      // Beethoven Collection
      { id: "ip0q0HEh_SU", title: "Beethoven - Classical Music for Studying", thumbnail: "https://i.ytimg.com/vi/ip0q0HEh_SU/mqdefault.jpg" },
      { id: "t3217H8JppI", title: "Beethoven - The Best Symphonies", thumbnail: "https://i.ytimg.com/vi/t3217H8JppI/mqdefault.jpg" },
      { id: "EOvWPBJsEYo", title: "Beethoven Piano Sonatas for Study", thumbnail: "https://i.ytimg.com/vi/EOvWPBJsEYo/mqdefault.jpg" },
      
      // Bach Collection
      { id: "Rb0UmrCXxVA", title: "Bach - Classical Music for Studying and Concentration", thumbnail: "https://i.ytimg.com/vi/Rb0UmrCXxVA/mqdefault.jpg" },
      { id: "6JQm5aSjX6g", title: "Bach - The Best Works for Studying", thumbnail: "https://i.ytimg.com/vi/6JQm5aSjX6g/mqdefault.jpg" },
      { id: "pVEEbZn52TY", title: "Bach Cello Suites - Relaxing Study Music", thumbnail: "https://i.ytimg.com/vi/pVEEbZn52TY/mqdefault.jpg" },
      
      // Chopin Collection
      { id: "PJL_mVgT0Ao", title: "Chopin - Classical Piano Music for Studying", thumbnail: "https://i.ytimg.com/vi/PJL_mVgT0Ao/mqdefault.jpg" },
      { id: "NONg06Ee5Wg", title: "Chopin Nocturnes - Peaceful Study Music", thumbnail: "https://i.ytimg.com/vi/NONg06Ee5Wg/mqdefault.jpg" },
      { id: "oy88CcGpYYk", title: "Chopin - The Best Relaxing Piano", thumbnail: "https://i.ytimg.com/vi/oy88CcGpYYk/mqdefault.jpg" },
      
      // Vivaldi Collection
      { id: "zzE-kVadtNw", title: "Vivaldi - Four Seasons for Studying", thumbnail: "https://i.ytimg.com/vi/zzE-kVadtNw/mqdefault.jpg" },
      { id: "l-dYNttdgl0", title: "Vivaldi - The Best Classical Baroque", thumbnail: "https://i.ytimg.com/vi/l-dYNttdgl0/mqdefault.jpg" },
      
      // Debussy Collection  
      { id: "A6s49OKp6aE", title: "Debussy - Classical Music for Relaxation", thumbnail: "https://i.ytimg.com/vi/A6s49OKp6aE/mqdefault.jpg" },
      { id: "CvFH_6DNRCY", title: "Debussy - Clair de Lune & Best Works", thumbnail: "https://i.ytimg.com/vi/CvFH_6DNRCY/mqdefault.jpg" },
      
      // Tchaikovsky Collection
      { id: "eTlnotBOpUg", title: "Tchaikovsky - The Best Classical Music", thumbnail: "https://i.ytimg.com/vi/eTlnotBOpUg/mqdefault.jpg" },
      { id: "7-OytHySsqQ", title: "Tchaikovsky - Swan Lake & Nutcracker", thumbnail: "https://i.ytimg.com/vi/7-OytHySsqQ/mqdefault.jpg" },
      
      // Mixed Classical Compilations
      { id: "4PUHBL1vMNY", title: "Classical Music for Studying & Concentration - 4 Hours", thumbnail: "https://i.ytimg.com/vi/4PUHBL1vMNY/mqdefault.jpg" },
      { id: "PZkSTgap8d8", title: "Relaxing Classical Piano Music - Study & Focus", thumbnail: "https://i.ytimg.com/vi/PZkSTgap8d8/mqdefault.jpg" },
      { id: "qjUyKlGhDGM", title: "Classical Music Mix - The Best Composers", thumbnail: "https://i.ytimg.com/vi/qjUyKlGhDGM/mqdefault.jpg" },
      { id: "0wCj6BaFn4M", title: "Peaceful Classical Music for Brain Power", thumbnail: "https://i.ytimg.com/vi/0wCj6BaFn4M/mqdefault.jpg" },
      { id: "3OC674bks7A", title: "Study Music - Relaxing Classical Piano", thumbnail: "https://i.ytimg.com/vi/3OC674bks7A/mqdefault.jpg" },
      { id: "iT9NeVMHXiw", title: "Mozart, Chopin, Bach - Classical Study Mix", thumbnail: "https://i.ytimg.com/vi/iT9NeVMHXiw/mqdefault.jpg" },
      
      // Liszt Collection
      { id: "bZp_PKFpjwU", title: "Liszt - The Best Classical Piano Works", thumbnail: "https://i.ytimg.com/vi/bZp_PKFpjwU/mqdefault.jpg" },
      
      // Brahms Collection
      { id: "luNc4RyZvmk", title: "Brahms - Relaxing Classical Music", thumbnail: "https://i.ytimg.com/vi/luNc4RyZvmk/mqdefault.jpg" },
      
      // Schubert Collection
      { id: "l65b2dJQT2k", title: "Schubert - Classical Music for Studying", thumbnail: "https://i.ytimg.com/vi/l65b2dJQT2k/mqdefault.jpg" },
      
      // Handel Collection
      { id: "usfiAsWR4qU", title: "Handel - Water Music & Best Works", thumbnail: "https://i.ytimg.com/vi/usfiAsWR4qU/mqdefault.jpg" },
      
      // Mendelssohn Collection
      { id: "YLt8HowfN_o", title: "Mendelssohn - Classical Music Collection", thumbnail: "https://i.ytimg.com/vi/YLt8HowfN_o/mqdefault.jpg" },
    ];
    
    setTracks(curatedTracks);
    setIsLoading(false);
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
