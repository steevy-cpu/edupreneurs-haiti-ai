import { useRef, useState, useCallback, useEffect } from 'react';

// Kahoot-style melody notes for lobby music (frequencies in Hz)
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
  
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('quiz-sounds-muted') === 'true';
  });
  const [isLobbyMusicPlaying, setIsLobbyMusicPlaying] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
      if (lobbyIntervalRef.current) {
        clearInterval(lobbyIntervalRef.current);
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

  // Web Audio synthesis for ticking
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

  // Synthesized correct sound (ascending arpeggio)
  const playCorrect = useCallback(() => {
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

  // Synthesized incorrect sound (descending buzz)
  const playIncorrect = useCallback(() => {
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

  // Synthesized game start (ascending scale)
  const playGameStart = useCallback(() => {
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

  // Synthesized question start (whoosh)
  const playQuestionStart = useCallback(() => {
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

  // Synthesized game complete (victory jingle)
  const playGameComplete = useCallback(() => {
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

  // Play melody note for lobby music
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

  // Play bass note for lobby music
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

  // Start synthesized lobby music loop
  const startLobbyMusic = useCallback(() => {
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

  // Stop lobby music
  const stopLobbyMusic = useCallback(() => {
    if (lobbyIntervalRef.current) {
      clearInterval(lobbyIntervalRef.current);
      lobbyIntervalRef.current = null;
    }
    setIsLobbyMusicPlaying(false);
  }, []);

  // Smooth transition from lobby to game
  const transitionToGame = useCallback(async (): Promise<void> => {
    stopLobbyMusic();
    // Small delay before game start sound
    await new Promise(resolve => setTimeout(resolve, 100));
  }, [stopLobbyMusic]);

  // Tick sound for timer
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
  };
};
