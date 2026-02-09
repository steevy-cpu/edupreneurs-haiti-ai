import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from "react";

interface PlaylistTrack {
  id: string;
  title: string;
  thumbnail: string;
}

type RepeatMode = 'off' | 'one' | 'all';

interface MusicPlayerContextType {
  tracks: PlaylistTrack[];
  currentTrackIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  playerReady: boolean;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  setCurrentTrackIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  playTrack: (index: number) => void;
  playPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  initPlayer: (trackIndex?: number) => void;
  stopMusic: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [youtubeApiLoaded, setYoutubeApiLoaded] = useState(false);
  
  // New state for enhanced features
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('music-player-volume');
    return saved ? parseInt(saved) : 70;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');

  const playerRef = useRef<any>(null);
  const currentTrackIndexRef = useRef(currentTrackIndex);
  const nextTrackRef = useRef<() => void>(() => {});
  const volumeRef = useRef(volume);

  // Keep refs in sync
  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Check if on slow connection
  const isSlowConnection = useCallback(() => {
    const connection = (navigator as any).connection;
    if (!connection) return false;
    const { effectiveType, saveData } = connection;
    return saveData || effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g';
  }, []);

  useEffect(() => {
    fetchPlaylistTracks();
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
    const curatedTracks: PlaylistTrack[] = [
      { id: "ViKbB7vbK7Q", title: "Lofi Hip Hop Radio", thumbnail: "https://i.ytimg.com/vi/ViKbB7vbK7Q/hqdefault.jpg" },
      { id: "45Siu4EtXzE", title: "Musique Relaxante pour Étudier - Concentration", thumbnail: "https://i.ytimg.com/vi/45Siu4EtXzE/hqdefault.jpg" },
      { id: "Rb0UmrCXxVA", title: "Mozart - Musique Classique pour Étudier", thumbnail: "https://i.ytimg.com/vi/Rb0UmrCXxVA/hqdefault.jpg" },
      { id: "jgpJVI3tDbY", title: "Mozart - Concertos pour Piano Complets", thumbnail: "https://i.ytimg.com/vi/jgpJVI3tDbY/hqdefault.jpg" },
      { id: "hOA-2hl1Vbc", title: "Mozart - Eine Kleine Nachtmusik", thumbnail: "https://i.ytimg.com/vi/hOA-2hl1Vbc/hqdefault.jpg" },
      { id: "9E6b3swbnWg", title: "Chopin - Nocturne Op. 9 No. 2", thumbnail: "https://i.ytimg.com/vi/9E6b3swbnWg/hqdefault.jpg" },
      { id: "wygy721nzRc", title: "Chopin - Nocturnes Complets", thumbnail: "https://i.ytimg.com/vi/wygy721nzRc/hqdefault.jpg" },
      { id: "EhO_MrRfftU", title: "Chopin - Valses Célèbres", thumbnail: "https://i.ytimg.com/vi/EhO_MrRfftU/hqdefault.jpg" },
      { id: "t3217H8JppI", title: "Beethoven - Symphonies pour Étudier", thumbnail: "https://i.ytimg.com/vi/t3217H8JppI/hqdefault.jpg" },
      { id: "4Tr0otuiQuU", title: "Beethoven - Sonate au Clair de Lune", thumbnail: "https://i.ytimg.com/vi/4Tr0otuiQuU/hqdefault.jpg" },
      { id: "rOjHhS5MtvA", title: "Beethoven - Symphonie No. 9", thumbnail: "https://i.ytimg.com/vi/rOjHhS5MtvA/hqdefault.jpg" },
      { id: "6JQm5aSjX6g", title: "Bach - Le Clavier Bien Tempéré", thumbnail: "https://i.ytimg.com/vi/6JQm5aSjX6g/hqdefault.jpg" },
      { id: "Nnuq9PXbywA", title: "Bach - Toccata et Fugue en Ré Mineur", thumbnail: "https://i.ytimg.com/vi/Nnuq9PXbywA/hqdefault.jpg" },
      { id: "ho9rZjlsyYY", title: "Bach - Prélude en Do Majeur", thumbnail: "https://i.ytimg.com/vi/ho9rZjlsyYY/hqdefault.jpg" },
      { id: "GRxofEmo3HA", title: "Vivaldi - Les Quatre Saisons Complet", thumbnail: "https://i.ytimg.com/vi/GRxofEmo3HA/hqdefault.jpg" },
      { id: "l-dYNttdgl0", title: "Vivaldi - Meilleurs Concertos Baroque", thumbnail: "https://i.ytimg.com/vi/l-dYNttdgl0/hqdefault.jpg" },
      { id: "CvFH_6DNRCY", title: "Debussy - Clair de Lune et Œuvres", thumbnail: "https://i.ytimg.com/vi/CvFH_6DNRCY/hqdefault.jpg" },
      { id: "WNcsUNKlAKw", title: "Debussy - La Mer", thumbnail: "https://i.ytimg.com/vi/WNcsUNKlAKw/hqdefault.jpg" },
      { id: "KpOtuoHL45Y", title: "Liszt - Rêve d'Amour", thumbnail: "https://i.ytimg.com/vi/KpOtuoHL45Y/hqdefault.jpg" },
      { id: "H1Dvg2MxQn8", title: "Liszt - Rhapsodies Hongroises", thumbnail: "https://i.ytimg.com/vi/H1Dvg2MxQn8/hqdefault.jpg" },
      { id: "2bosouX_d8Y", title: "Schubert - Ave Maria (Version Orchestrale)", thumbnail: "https://i.ytimg.com/vi/2bosouX_d8Y/hqdefault.jpg" },
      { id: "jgpJVI3tDbY", title: "Mix Classique - 4h Concentration", thumbnail: "https://i.ytimg.com/vi/jgpJVI3tDbY/hqdefault.jpg" },
      { id: "4PUHBL1vMNY", title: "Meilleure Musique Classique Étude", thumbnail: "https://i.ytimg.com/vi/4PUHBL1vMNY/hqdefault.jpg" },
    ];
    setTracks(curatedTracks);
    setIsLoading(false);
  };

  // Volume handler
  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    localStorage.setItem('music-player-volume', String(vol));
    if (playerRef.current?.setVolume) {
      playerRef.current.setVolume(vol);
    }
  }, []);

  // Mute toggle
  const toggleMute = useCallback(() => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute?.();
        playerRef.current.setVolume?.(volume);
      } else {
        playerRef.current.mute?.();
      }
    }
    setIsMuted(prev => !prev);
  }, [isMuted, volume]);

  // Shuffle toggle
  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev);
  }, []);

  // Repeat mode cycle: all -> one -> off -> all
  const cycleRepeatMode = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'all') return 'one';
      if (prev === 'one') return 'off';
      return 'all';
    });
  }, []);

  const initPlayer = useCallback((trackIndex?: number) => {
    if (tracks.length === 0) return;
    const indexToPlay = trackIndex ?? currentTrackIndex;

    if (playerRef.current && typeof playerRef.current.destroy === 'function') {
      try { playerRef.current.destroy(); } catch (e) { console.warn('Could not destroy player:', e); }
      playerRef.current = null;
    }

    const initialize = () => {
      if (window.YT && window.YT.Player) {
        try {
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
            playerVars: { autoplay: 1, controls: 0, enablejsapi: 1, origin: window.location.origin },
            events: {
              onReady: (event: any) => {
                setPlayerReady(true);
                event.target.setVolume(volumeRef.current);
                event.target.playVideo();
                setIsPlaying(true);
              },
              onStateChange: (event: any) => {
                if (event.data === window.YT.PlayerState.ENDED) {
                  nextTrackRef.current();
                }
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setIsPlaying(true);
                } else if (event.data === window.YT.PlayerState.PAUSED) {
                  setIsPlaying(false);
                }
              },
              onError: (event: any) => {
                console.error('❌ YouTube player error:', event.data);
                setPlayerReady(false);
                playerRef.current = null;
                setTimeout(() => { nextTrackRef.current(); }, 1000);
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
  }, [tracks, currentTrackIndex]);

  const playTrack = useCallback((index: number) => {
    setCurrentTrackIndex(index);
    if (!youtubeApiLoaded) { loadYouTubeAPI(); }
    
    if (playerRef.current && playerReady && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById(tracks[index].id);
        playerRef.current.playVideo();
        setIsPlaying(true);
      } catch (error) {
        setPlayerReady(false);
        playerRef.current = null;
        initPlayer(index);
      }
    } else {
      setPlayerReady(false);
      playerRef.current = null;
      initPlayer(index);
    }
  }, [tracks, youtubeApiLoaded, loadYouTubeAPI, playerReady, initPlayer]);

  const playPause = () => {
    if (!playerRef.current || !playerReady || typeof playerRef.current.pauseVideo !== 'function') {
      setIsPlaying(true);
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
      setPlayerReady(false);
      playerRef.current = null;
      initPlayer();
    }
  };

  const nextTrack = useCallback(() => {
    const currentIndex = currentTrackIndexRef.current;
    if (repeatMode === 'one') {
      playTrack(currentIndex);
      return;
    }
    let nextIndex: number;
    if (shuffle) {
      do { nextIndex = Math.floor(Math.random() * tracks.length); }
      while (nextIndex === currentIndex && tracks.length > 1);
    } else {
      nextIndex = (currentIndex + 1) % tracks.length;
    }
    if (repeatMode === 'off' && nextIndex === 0 && !shuffle) {
      stopMusic();
      return;
    }
    playTrack(nextIndex);
  }, [tracks.length, playTrack, shuffle, repeatMode]);

  const prevTrack = useCallback(() => {
    const currentIndex = currentTrackIndexRef.current;
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(prevIndex);
  }, [tracks.length, playTrack]);

  // Keep nextTrackRef in sync
  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [nextTrack]);

  const stopMusic = useCallback(() => {
    try {
      if (playerRef.current) {
        if (typeof playerRef.current.pauseVideo === 'function') playerRef.current.pauseVideo();
        if (typeof playerRef.current.stopVideo === 'function') playerRef.current.stopVideo();
        if (typeof playerRef.current.destroy === 'function') {
          playerRef.current.destroy();
          playerRef.current = null;
          setPlayerReady(false);
        }
      }
      setIsPlaying(false);
    } catch (error) {
      playerRef.current = null;
      setPlayerReady(false);
      setIsPlaying(false);
    }
  }, []);

  return (
    <MusicPlayerContext.Provider
      value={{
        tracks, currentTrackIndex, isPlaying, isLoading, playerReady,
        volume, isMuted, shuffle, repeatMode,
        setCurrentTrackIndex, setIsPlaying, playTrack, playPause,
        nextTrack, prevTrack, initPlayer, stopMusic,
        setVolume, toggleMute, toggleShuffle, cycleRepeatMode,
      }}
    >
      {children}
    </MusicPlayerContext.Provider>
  );
};

// Safe defaults when context is unavailable
const SAFE_MUSIC_DEFAULTS: MusicPlayerContextType = {
  tracks: [], currentTrackIndex: 0, isPlaying: false, isLoading: false, playerReady: false,
  volume: 70, isMuted: false, shuffle: false, repeatMode: 'all',
  setCurrentTrackIndex: () => {}, setIsPlaying: () => {}, playTrack: () => {},
  playPause: () => {}, nextTrack: () => {}, prevTrack: () => {}, initPlayer: () => {},
  stopMusic: () => {}, setVolume: () => {}, toggleMute: () => {}, toggleShuffle: () => {},
  cycleRepeatMode: () => {},
};

export const useMusicPlayer = (): MusicPlayerContextType => {
  const context = useContext(MusicPlayerContext);
  if (!context) return SAFE_MUSIC_DEFAULTS;
  return context;
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
