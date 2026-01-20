import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from "react";

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
  initPlayer: (trackIndex?: number) => void;
  stopMusic: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [youtubeApiLoaded, setYoutubeApiLoaded] = useState(false);
  const playerRef = useRef<any>(null);

  // Check if on slow connection
  const isSlowConnection = useCallback(() => {
    const connection = (navigator as any).connection;
    if (!connection) return false;
    const { effectiveType, saveData } = connection;
    return saveData || effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g';
  }, []);

  useEffect(() => {
    fetchPlaylistTracks();
    
    // Defer YouTube API loading on slow connections
    if (!isSlowConnection()) {
      loadYouTubeAPI();
    }
  }, [isSlowConnection]);

  const loadYouTubeAPI = useCallback(() => {
    if (youtubeApiLoaded || window.YT) {
      setYoutubeApiLoaded(true);
      return;
    }
    
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    setYoutubeApiLoaded(true);
  }, [youtubeApiLoaded]);

  const fetchPlaylistTracks = async () => {
    setIsLoading(true);
    // Curated classical music for studying - all with valid thumbnails
    const curatedTracks: PlaylistTrack[] = [
      // Special Relaxation Music
      { id: "45Siu4EtXzE", title: "Musique Relaxante pour Étudier - Concentration", thumbnail: "https://i.ytimg.com/vi/45Siu4EtXzE/hqdefault.jpg" },
      
      // Mozart - Perfect for Focus
      { id: "Rb0UmrCXxVA", title: "Mozart - Musique Classique pour Étudier", thumbnail: "https://i.ytimg.com/vi/Rb0UmrCXxVA/hqdefault.jpg" },
      { id: "jgpJVI3tDbY", title: "Mozart - Concertos pour Piano Complets", thumbnail: "https://i.ytimg.com/vi/jgpJVI3tDbY/hqdefault.jpg" },
      { id: "hOA-2hl1Vbc", title: "Mozart - Eine Kleine Nachtmusik", thumbnail: "https://i.ytimg.com/vi/hOA-2hl1Vbc/hqdefault.jpg" },
      
      // Chopin - Peaceful Piano
      { id: "9E6b3swbnWg", title: "Chopin - Nocturne Op. 9 No. 2", thumbnail: "https://i.ytimg.com/vi/9E6b3swbnWg/hqdefault.jpg" },
      { id: "wygy721nzRc", title: "Chopin - Nocturnes Complets", thumbnail: "https://i.ytimg.com/vi/wygy721nzRc/hqdefault.jpg" },
      { id: "EhO_MrRfftU", title: "Chopin - Valses Célèbres", thumbnail: "https://i.ytimg.com/vi/EhO_MrRfftU/hqdefault.jpg" },
      
      // Beethoven - Power & Concentration
      { id: "t3217H8JppI", title: "Beethoven - Symphonies pour Étudier", thumbnail: "https://i.ytimg.com/vi/t3217H8JppI/hqdefault.jpg" },
      { id: "4Tr0otuiQuU", title: "Beethoven - Sonate au Clair de Lune", thumbnail: "https://i.ytimg.com/vi/4Tr0otuiQuU/hqdefault.jpg" },
      { id: "rOjHhS5MtvA", title: "Beethoven - Symphonie No. 9", thumbnail: "https://i.ytimg.com/vi/rOjHhS5MtvA/hqdefault.jpg" },
      
      // Bach - Deep Focus
      { id: "6JQm5aSjX6g", title: "Bach - Le Clavier Bien Tempéré", thumbnail: "https://i.ytimg.com/vi/6JQm5aSjX6g/hqdefault.jpg" },
      { id: "Nnuq9PXbywA", title: "Bach - Toccata et Fugue en Ré Mineur", thumbnail: "https://i.ytimg.com/vi/Nnuq9PXbywA/hqdefault.jpg" },
      { id: "ho9rZjlsyYY", title: "Bach - Prélude en Do Majeur", thumbnail: "https://i.ytimg.com/vi/ho9rZjlsyYY/hqdefault.jpg" },
      
      // Vivaldi - Energizing Baroque
      { id: "GRxofEmo3HA", title: "Vivaldi - Les Quatre Saisons Complet", thumbnail: "https://i.ytimg.com/vi/GRxofEmo3HA/hqdefault.jpg" },
      { id: "l-dYNttdgl0", title: "Vivaldi - Meilleurs Concertos Baroque", thumbnail: "https://i.ytimg.com/vi/l-dYNttdgl0/hqdefault.jpg" },
      
      // Debussy - Calm & Peaceful
      { id: "CvFH_6DNRCY", title: "Debussy - Clair de Lune et Œuvres", thumbnail: "https://i.ytimg.com/vi/CvFH_6DNRCY/hqdefault.jpg" },
      { id: "WNcsUNKlAKw", title: "Debussy - La Mer", thumbnail: "https://i.ytimg.com/vi/WNcsUNKlAKw/hqdefault.jpg" },
      
      // Liszt - Virtuoso Piano
      { id: "KpOtuoHL45Y", title: "Liszt - Rêve d'Amour", thumbnail: "https://i.ytimg.com/vi/KpOtuoHL45Y/hqdefault.jpg" },
      { id: "H1Dvg2MxQn8", title: "Liszt - Rhapsodies Hongroises", thumbnail: "https://i.ytimg.com/vi/H1Dvg2MxQn8/hqdefault.jpg" },
      
      // Brahms - Warm & Soothing
      { id: "luNc4RyZvmk", title: "Brahms - Symphonies Complètes", thumbnail: "https://i.ytimg.com/vi/luNc4RyZvmk/hqdefault.jpg" },
      { id: "FRqfbBM2pQQ", title: "Brahms - Berceuse", thumbnail: "https://i.ytimg.com/vi/FRqfbBM2pQQ/hqdefault.jpg" },
      
      // Schubert - Gentle & Melodic
      { id: "2bosouX_d8Y", title: "Schubert - Ave Maria (Version Orchestrale)", thumbnail: "https://i.ytimg.com/vi/2bosouX_d8Y/hqdefault.jpg" },
      { id: "k-x7QBFXguQ", title: "Schubert - Sérénade", thumbnail: "https://i.ytimg.com/vi/k-x7QBFXguQ/hqdefault.jpg" },
      
      // Mixed Study Compilations
      { id: "jgpJVI3tDbY", title: "Mix Classique - 4h Concentration", thumbnail: "https://i.ytimg.com/vi/jgpJVI3tDbY/hqdefault.jpg" },
      { id: "4PUHBL1vMNY", title: "Meilleure Musique Classique Étude", thumbnail: "https://i.ytimg.com/vi/4PUHBL1vMNY/hqdefault.jpg" },
      
      // User Requested
      { id: "pxrNYPc0GmQ", title: "Musique pour Étudier", thumbnail: "https://i.ytimg.com/vi/pxrNYPc0GmQ/hqdefault.jpg" },
    ];
    
    setTracks(curatedTracks);
    setIsLoading(false);
  };

  const initPlayer = (trackIndex?: number) => {
    if (tracks.length === 0) return;

    // Use provided index or fall back to currentTrackIndex
    const indexToPlay = trackIndex ?? currentTrackIndex;

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
          console.log('🎵 Initializing YouTube player with track:', tracks[indexToPlay].title);
          
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
            videoId: tracks[indexToPlay].id,
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
                console.error('❌ Error occurred for video:', tracks[indexToPlay].id);
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
    
    // Ensure YouTube API is loaded on first play (for slow connections)
    if (!youtubeApiLoaded) {
      loadYouTubeAPI();
    }
    
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
        initPlayer(index);
      }
    } else {
      console.log('⏳ Player not ready, reinitializing...');
      setPlayerReady(false);
      playerRef.current = null;
      initPlayer(index);
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

  const stopMusic = () => {
    console.log('🛑 stopMusic called, playerRef:', !!playerRef.current);
    
    try {
      if (playerRef.current) {
        // Try pause first
        if (typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
        
        // Also try stopVideo for stronger guarantee
        if (typeof playerRef.current.stopVideo === 'function') {
          playerRef.current.stopVideo();
        }
        
        // Destroy the player entirely to guarantee audio stops
        if (typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
          playerRef.current = null;
          setPlayerReady(false);
        }
      }
      
      setIsPlaying(false);
      console.log('🛑 Music stopped and player destroyed');
    } catch (error) {
      console.error('Error stopping music:', error);
      // Force cleanup even on error
      playerRef.current = null;
      setPlayerReady(false);
      setIsPlaying(false);
    }
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
        stopMusic,
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
