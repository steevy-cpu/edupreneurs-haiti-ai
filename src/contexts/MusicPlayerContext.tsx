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
    // Fresh curated classical music for studying
    const curatedTracks: PlaylistTrack[] = [
      // Mozart - Perfect for Focus
      { id: "Rb0UmrCXxVA", title: "Mozart - Classical Music for Studying & Brain Power", thumbnail: "https://i.ytimg.com/vi/Rb0UmrCXxVA/mqdefault.jpg" },
      { id: "jgpJVI3tDbY", title: "Mozart - Complete Piano Concertos for Study", thumbnail: "https://i.ytimg.com/vi/jgpJVI3tDbY/mqdefault.jpg" },
      { id: "TlvFOdT5btc", title: "Mozart - The Magic Flute & Best Works", thumbnail: "https://i.ytimg.com/vi/TlvFOdT5btc/mqdefault.jpg" },
      
      // Chopin - Peaceful Piano
      { id: "PJL_mVgT0Ao", title: "Chopin - Complete Nocturnes for Studying", thumbnail: "https://i.ytimg.com/vi/PJL_mVgT0Ao/mqdefault.jpg" },
      { id: "NONg06Ee5Wg", title: "Chopin - Peaceful Piano Music for Study", thumbnail: "https://i.ytimg.com/vi/NONg06Ee5Wg/mqdefault.jpg" },
      { id: "oy88CcGpYYk", title: "Chopin - The Best Relaxing Classical Piano", thumbnail: "https://i.ytimg.com/vi/oy88CcGpYYk/mqdefault.jpg" },
      
      // Beethoven - Power & Concentration
      { id: "t3217H8JppI", title: "Beethoven - Complete Symphonies for Studying", thumbnail: "https://i.ytimg.com/vi/t3217H8JppI/mqdefault.jpg" },
      { id: "ip0q0HEh_SU", title: "Beethoven - Piano Sonatas for Concentration", thumbnail: "https://i.ytimg.com/vi/ip0q0HEh_SU/mqdefault.jpg" },
      { id: "EOvWPBJsEYo", title: "Beethoven - Moonlight Sonata & Best Works", thumbnail: "https://i.ytimg.com/vi/EOvWPBJsEYo/mqdefault.jpg" },
      
      // Bach - Deep Focus
      { id: "6JQm5aSjX6g", title: "Bach - The Well-Tempered Clavier for Study", thumbnail: "https://i.ytimg.com/vi/6JQm5aSjX6g/mqdefault.jpg" },
      { id: "pVEEbZn52TY", title: "Bach - Cello Suites Complete for Focus", thumbnail: "https://i.ytimg.com/vi/pVEEbZn52TY/mqdefault.jpg" },
      { id: "mGQLXRTl3Z0", title: "Bach - Brandenburg Concertos for Concentration", thumbnail: "https://i.ytimg.com/vi/mGQLXRTl3Z0/mqdefault.jpg" },
      
      // Vivaldi - Energizing Baroque
      { id: "zzE-kVadtNw", title: "Vivaldi - Four Seasons Complete for Study", thumbnail: "https://i.ytimg.com/vi/zzE-kVadtNw/mqdefault.jpg" },
      { id: "l-dYNttdgl0", title: "Vivaldi - The Best Baroque Concertos", thumbnail: "https://i.ytimg.com/vi/l-dYNttdgl0/mqdefault.jpg" },
      
      // Debussy - Calm & Peaceful
      { id: "A6s49OKp6aE", title: "Debussy - Clair de Lune & Complete Works", thumbnail: "https://i.ytimg.com/vi/A6s49OKp6aE/mqdefault.jpg" },
      { id: "CvFH_6DNRCY", title: "Debussy - Relaxing Piano Music for Study", thumbnail: "https://i.ytimg.com/vi/CvFH_6DNRCY/mqdefault.jpg" },
      
      // Tchaikovsky - Emotional & Beautiful
      { id: "eTlnotBOpUg", title: "Tchaikovsky - Swan Lake Complete Ballet", thumbnail: "https://i.ytimg.com/vi/eTlnotBOpUg/mqdefault.jpg" },
      { id: "7-OytHySsqQ", title: "Tchaikovsky - The Nutcracker Suite for Study", thumbnail: "https://i.ytimg.com/vi/7-OytHySsqQ/mqdefault.jpg" },
      
      // Liszt - Virtuoso Piano
      { id: "bZp_PKFpjwU", title: "Liszt - Complete Piano Works for Focus", thumbnail: "https://i.ytimg.com/vi/bZp_PKFpjwU/mqdefault.jpg" },
      
      // Brahms - Warm & Soothing
      { id: "luNc4RyZvmk", title: "Brahms - Complete Symphonies for Study", thumbnail: "https://i.ytimg.com/vi/luNc4RyZvmk/mqdefault.jpg" },
      
      // Schubert - Gentle & Melodic
      { id: "l65b2dJQT2k", title: "Schubert - Piano Trios & Best Works", thumbnail: "https://i.ytimg.com/vi/l65b2dJQT2k/mqdefault.jpg" },
      
      // Mixed Study Compilations
      { id: "4PUHBL1vMNY", title: "Classical Music Mix - 4 Hours Study Focus", thumbnail: "https://i.ytimg.com/vi/4PUHBL1vMNY/mqdefault.jpg" },
      { id: "qjUyKlGhDGM", title: "Best Classical Music Mix for Studying", thumbnail: "https://i.ytimg.com/vi/qjUyKlGhDGM/mqdefault.jpg" },
      { id: "0wCj6BaFn4M", title: "Peaceful Classical Piano - Brain Power", thumbnail: "https://i.ytimg.com/vi/0wCj6BaFn4M/mqdefault.jpg" },
    ];
    
    setTracks(curatedTracks);
    setIsLoading(false);
  };

  const initPlayer = () => {
    if (tracks.length === 0) return;

    // Destroy existing player if any
    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.warn('Could not destroy player:', e);
      }
      playerRef.current = null;
    }

    const initialize = () => {
      if (window.YT && window.YT.Player) {
        try {
          console.log('🎵 Initializing YouTube player with track:', tracks[currentTrackIndex].title);
          
          // Create a new div for the player if it doesn't exist
          let playerDiv = document.getElementById("global-music-player");
          if (!playerDiv) {
            playerDiv = document.createElement("div");
            playerDiv.id = "global-music-player";
            document.body.appendChild(playerDiv);
          }

          playerRef.current = new window.YT.Player("global-music-player", {
            height: "0",
            width: "0",
            videoId: tracks[currentTrackIndex].id,
            playerVars: {
              autoplay: 1,
              controls: 0,
              enablejsapi: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: (event: any) => {
                console.log('✅ Player ready');
                setPlayerReady(true);
                event.target.playVideo();
                setIsPlaying(true);
              },
              onStateChange: (event: any) => {
                console.log('🎵 Player state changed:', event.data);
                if (event.data === window.YT.PlayerState.ENDED) {
                  nextTrack();
                }
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setIsPlaying(true);
                } else if (event.data === window.YT.PlayerState.PAUSED) {
                  setIsPlaying(false);
                }
              },
              onError: (event: any) => {
                console.error('❌ YouTube player error:', event.data);
                console.error('❌ Error occurred for video:', tracks[currentTrackIndex].id);
                // Destroy and reinitialize on error
                setPlayerReady(false);
                playerRef.current = null;
                setTimeout(() => {
                  nextTrack();
                }, 1000);
              },
            },
          });
        } catch (error) {
          console.error("❌ Failed to initialize YouTube player:", error);
          setPlayerReady(false);
          playerRef.current = null;
        }
      } else {
        setTimeout(initialize, 100);
      }
    };

    initialize();
  };

  const playTrack = (index: number) => {
    console.log('▶️ Playing track:', index, tracks[index]?.title);
    setCurrentTrackIndex(index);
    
    if (playerRef.current && playerReady && typeof playerRef.current.loadVideoById === 'function') {
      try {
        console.log('🎵 Loading video:', tracks[index].id);
        playerRef.current.loadVideoById(tracks[index].id);
        playerRef.current.playVideo();
        setIsPlaying(true);
      } catch (error) {
        console.error('❌ Error playing track:', error);
        // Reinitialize player on error
        setPlayerReady(false);
        playerRef.current = null;
        initPlayer();
      }
    } else {
      console.log('⏳ Player not ready, reinitializing...');
      setPlayerReady(false);
      playerRef.current = null;
      initPlayer();
    }
  };

  const playPause = () => {
    if (!playerRef.current || !playerReady || typeof playerRef.current.pauseVideo !== 'function') {
      console.log('⏳ Player not ready, initializing...');
      initPlayer();
      return;
    }

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('❌ Error toggling playback:', error);
      setPlayerReady(false);
      playerRef.current = null;
      initPlayer();
    }
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    console.log('⏭️ Moving to next track:', nextIndex);
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
