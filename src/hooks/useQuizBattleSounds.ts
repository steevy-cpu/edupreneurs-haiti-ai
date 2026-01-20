import { useRef, useState, useCallback, useEffect } from 'react';
import { 
  getPreloadedSound, 
  preloadQuizBattleSounds, 
  isSoundsPreloaded,
  QuizSoundType 
} from '@/utils/quizBattleSoundPreloader';

// Kahoot-style melody notes for fallback (frequencies in Hz)
const LOBBY_MELODY = [
  { freq: 523.25, dur: 0.15 }, // C5
  { freq: 659.25, dur: 0.15 }, // E5
  { freq: 783.99, dur: 0.15 }, // G5
  { freq: 659.25, dur: 0.15 }, // E5
  { freq: 523.25, dur: 0.15 }, // C5
  { freq: 392.00, dur: 0.15 }, // G4
  { freq: 440.00, dur: 0.15 }, // A4
  { freq: 493.88, dur: 0.15 }, // B4
];

const LOBBY_BASS = [
  { freq: 130.81, dur: 0.3 }, // C3
  { freq: 164.81, dur: 0.3 }, // E3
  { freq: 196.00, dur: 0.3 }, // G3
  { freq: 164.81, dur: 0.3 }, // E3
];

export const useQuizBattleSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const tickIntervalRef = useRef<number | null>(null);
  const lobbyIntervalRef = useRef<number | null>(null);
  const lobbyAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('quiz-sounds-muted') === 'true';
  });
  const [isLobbyMusicPlaying, setIsLobbyMusicPlaying] = useState(false);
  const [soundsReady, setSoundsReady] = useState(false);

  // Preload sounds on mount
  useEffect(() => {
    if (isSoundsPreloaded()) {
      setSoundsReady(true);
    } else {
      preloadQuizBattleSounds().then(() => {
        setSoundsReady(true);
      });
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
      if (lobbyIntervalRef.current) {
        clearInterval(lobbyIntervalRef.current);
      }
      if (lobbyAudioRef.current) {
        lobbyAudioRef.current.pause();
        lobbyAudioRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Web Audio synthesis for ticking and fallbacks
  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback failed:', e);
    }
  }, [isMuted, getAudioContext]);

  // Play cached ElevenLabs sound with synthesized fallback
  const playSound = useCallback((soundType: QuizSoundType, fallbackFn?: () => void) => {
    if (isMuted) return;
    
    const audio = getPreloadedSound(soundType);
    if (audio) {
      // Clone the audio element for overlapping sounds
      const audioClone = audio.cloneNode() as HTMLAudioElement;
      audioClone.volume = soundType === 'lobby-music' ? 0.4 : 0.6;
      audioClone.play().catch(() => {
        // If play fails, try fallback
        fallbackFn?.();
      });
    } else {
      // Sounds not loaded yet, use fallback
      fallbackFn?.();
    }
  }, [isMuted]);

  // Synthesized fallback for correct sound
  const playSynthesizedCorrect = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.2);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.2);
      });
    } catch (e) {
      console.warn('Synthesized correct sound failed:', e);
    }
  }, [isMuted, getAudioContext]);

  // Synthesized fallback for incorrect sound
  const playSynthesizedIncorrect = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('Synthesized incorrect sound failed:', e);
    }
  }, [isMuted, getAudioContext]);

  // Synthesized fallback for game start
  const playSynthesizedGameStart = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const notes = [392, 440, 494, 523, 587, 659];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.06 + 0.15);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.15);
      });
    } catch (e) {
      console.warn('Synthesized game start sound failed:', e);
    }
  }, [isMuted, getAudioContext]);

  // Synthesized fallback for question start (whoosh)
  const playSynthesizedQuestionStart = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Synthesized question start sound failed:', e);
    }
  }, [isMuted, getAudioContext]);

  // Synthesized fallback for game complete
  const playSynthesizedGameComplete = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const melody = [523, 659, 784, 1047, 784, 1047];
      melody.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.25);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.25);
      });
    } catch (e) {
      console.warn('Synthesized game complete sound failed:', e);
    }
  }, [isMuted, getAudioContext]);

  // Fade out lobby music smoothly
  const fadeOutLobbyMusic = useCallback((duration = 500): Promise<void> => {
    return new Promise((resolve) => {
      // Stop synthesized loop if running
      if (lobbyIntervalRef.current) {
        clearInterval(lobbyIntervalRef.current);
        lobbyIntervalRef.current = null;
      }
      
      const audio = lobbyAudioRef.current;
      if (!audio) {
        setIsLobbyMusicPlaying(false);
        resolve();
        return;
      }
      
      // Clear any existing fade
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      
      const startVolume = audio.volume;
      const steps = 20;
      const stepTime = duration / steps;
      let currentStep = 0;
      
      fadeIntervalRef.current = window.setInterval(() => {
        currentStep++;
        audio.volume = Math.max(0, startVolume * (1 - currentStep / steps));
        
        if (currentStep >= steps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0.4; // Reset for next play
          lobbyAudioRef.current = null;
          setIsLobbyMusicPlaying(false);
          resolve();
        }
      }, stepTime);
    });
  }, []);

  // Play melody note for synthesized fallback
  const playMelodyNote = useCallback((frequency: number, duration: number, delay: number = 0) => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    } catch (e) {
      // Silent fail
    }
  }, [isMuted, getAudioContext]);

  // Play bass note for synthesized fallback
  const playBassNote = useCallback((frequency: number, duration: number, delay: number = 0) => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    } catch (e) {
      // Silent fail
    }
  }, [isMuted, getAudioContext]);

  // Synthesized lobby music fallback
  const startSynthesizedLobbyMusic = useCallback(() => {
    if (isMuted || isLobbyMusicPlaying) return;
    
    setIsLobbyMusicPlaying(true);
    
    const playMelodyLoop = () => {
      let melodyDelay = 0;
      LOBBY_MELODY.forEach((note) => {
        playMelodyNote(note.freq, note.dur + 0.05, melodyDelay);
        melodyDelay += note.dur;
      });
      
      let bassDelay = 0;
      LOBBY_BASS.forEach((note) => {
        playBassNote(note.freq, note.dur + 0.1, bassDelay);
        bassDelay += note.dur;
      });
    };
    
    playMelodyLoop();
    const loopDuration = LOBBY_MELODY.reduce((sum, n) => sum + n.dur, 0) * 1000;
    lobbyIntervalRef.current = window.setInterval(playMelodyLoop, loopDuration);
  }, [isMuted, isLobbyMusicPlaying, playMelodyNote, playBassNote]);

  // Start lobby music with loop (ElevenLabs or fallback)
  const startLobbyMusic = useCallback(() => {
    if (isMuted || isLobbyMusicPlaying) return;
    
    const audio = getPreloadedSound('lobby-music');
    if (audio) {
      const audioClone = audio.cloneNode() as HTMLAudioElement;
      audioClone.loop = true;
      audioClone.volume = 0.4;
      audioClone.currentTime = 0;
      audioClone.play()
        .then(() => {
          lobbyAudioRef.current = audioClone;
          setIsLobbyMusicPlaying(true);
        })
        .catch(() => {
          // Fallback to synthesized lobby music
          startSynthesizedLobbyMusic();
        });
    } else {
      // Fallback to synthesized lobby music
      startSynthesizedLobbyMusic();
    }
  }, [isMuted, isLobbyMusicPlaying, startSynthesizedLobbyMusic]);

  // Stop lobby music (with fade)
  const stopLobbyMusic = useCallback(() => {
    // Also stop synthesized loop if running
    if (lobbyIntervalRef.current) {
      clearInterval(lobbyIntervalRef.current);
      lobbyIntervalRef.current = null;
    }
    fadeOutLobbyMusic(400);
  }, [fadeOutLobbyMusic]);

  // Smooth transition from lobby to game
  const transitionToGame = useCallback(async (): Promise<void> => {
    // Stop synthesized loop if running
    if (lobbyIntervalRef.current) {
      clearInterval(lobbyIntervalRef.current);
      lobbyIntervalRef.current = null;
    }
    
    await fadeOutLobbyMusic(400);
    // Small delay before game start sound
    await new Promise(resolve => setTimeout(resolve, 100));
  }, [fadeOutLobbyMusic]);

  // Sound functions with ElevenLabs + fallbacks
  const playCorrect = useCallback(() => {
    playSound('correct', playSynthesizedCorrect);
  }, [playSound, playSynthesizedCorrect]);

  const playIncorrect = useCallback(() => {
    playSound('incorrect', playSynthesizedIncorrect);
  }, [playSound, playSynthesizedIncorrect]);

  const playQuestionStart = useCallback(() => {
    playSound('question-start', playSynthesizedQuestionStart);
  }, [playSound, playSynthesizedQuestionStart]);

  const playGameStart = useCallback(() => {
    playSound('game-start', playSynthesizedGameStart);
  }, [playSound, playSynthesizedGameStart]);

  const playGameComplete = useCallback(() => {
    playSound('game-complete', playSynthesizedGameComplete);
  }, [playSound, playSynthesizedGameComplete]);

  // Tick sound (keep as Web Audio for rapid playback)
  const playTick = useCallback((urgent = false) => {
    if (isMuted) return;
    const frequency = urgent ? 600 : 440;
    const volume = urgent ? 0.25 : 0.15;
    playTone(frequency, 0.05, 'sine', volume);
  }, [isMuted, playTone]);

  // Ticking timer with urgency
  const startTickingTimer = useCallback((timeLeft: number, maxTime: number) => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
    }
    
    if (isMuted) return;
    
    const getTickDelay = (time: number) => {
      if (time <= 3) return 250;
      if (time <= 5) return 400;
      if (time <= 10) return 600;
      return 1000;
    };
    
    let lastTick = Date.now();
    
    tickIntervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTick;
      const currentDelay = getTickDelay(timeLeft);
      
      if (elapsed >= currentDelay) {
        playTick(timeLeft <= 5);
        lastTick = now;
      }
    }, 100) as unknown as number;
  }, [isMuted, playTick]);

  const stopTicking = useCallback(() => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newValue = !prev;
      localStorage.setItem('quiz-sounds-muted', String(newValue));
      if (newValue) {
        stopLobbyMusic();
        stopTicking();
      }
      return newValue;
    });
  }, [stopLobbyMusic, stopTicking]);

  return {
    playCorrect,
    playIncorrect,
    playTick,
    playQuestionStart,
    playGameStart,
    playGameComplete,
    startTickingTimer,
    stopTicking,
    startLobbyMusic,
    stopLobbyMusic,
    transitionToGame,
    isLobbyMusicPlaying,
    isMuted,
    toggleMute,
    soundsReady,
  };
};
