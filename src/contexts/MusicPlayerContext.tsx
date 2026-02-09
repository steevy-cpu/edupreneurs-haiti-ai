import { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    try {
      const { data, error } = await supabase
        .from('study_music_tracks')
        .select('youtube_id, title, thumbnail_url')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching study music tracks:', error);
        setTracks([]);
      } else {
        const mapped: PlaylistTrack[] = (data || []).map((t: any) => ({
          id: t.youtube_id,
          title: t.title,
          thumbnail: t.thumbnail_url,
        }));
        setTracks(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch study music tracks:', err);
      setTracks([]);
    } finally {
      setIsLoading(false);
    }
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
