import { useRef, useState, useCallback, useEffect } from 'react';

// Kahoot-style melody notes (frequencies in Hz)
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
  const lobbyTimeoutRef = useRef<number | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('quiz-sounds-muted') === 'true';
  });
  const [isLobbyMusicPlaying, setIsLobbyMusicPlaying] = useState(false);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
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

  // Play a single melody note with smooth attack/release
  const playMelodyNote = useCallback((frequency: number, duration: number, delay: number = 0) => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
      
      // Smooth envelope
      gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + delay + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
      
      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + duration);
    } catch (e) {
      // Silent fail
    }
  }, [isMuted, getAudioContext]);

  // Play bass note
  const playBassNote = useCallback((frequency: number, duration: number, delay: number = 0) => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + delay + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
      
      oscillator.start(ctx.currentTime + delay);
      oscillator.stop(ctx.currentTime + delay + duration);
    } catch (e) {
      // Silent fail
    }
  }, [isMuted, getAudioContext]);

  // Start the Kahoot-style lobby music
  const startLobbyMusic = useCallback(() => {
    if (isMuted || isLobbyMusicPlaying) return;
    
    setIsLobbyMusicPlaying(true);
    
    const playMelodyLoop = () => {
      let melodyDelay = 0;
      LOBBY_MELODY.forEach((note) => {
        playMelodyNote(note.freq, note.dur + 0.05, melodyDelay);
        melodyDelay += note.dur;
      });
      
      // Bass plays slower
      let bassDelay = 0;
      LOBBY_BASS.forEach((note) => {
        playBassNote(note.freq, note.dur + 0.1, bassDelay);
        bassDelay += note.dur;
      });
    };
    
    // Play immediately
    playMelodyLoop();
    
    // Loop every ~1.2 seconds (melody length)
    const loopDuration = LOBBY_MELODY.reduce((sum, n) => sum + n.dur, 0) * 1000;
    lobbyIntervalRef.current = window.setInterval(playMelodyLoop, loopDuration);
  }, [isMuted, isLobbyMusicPlaying, playMelodyNote, playBassNote]);

  // Stop lobby music
  const stopLobbyMusic = useCallback(() => {
    if (lobbyIntervalRef.current) {
      clearInterval(lobbyIntervalRef.current);
      lobbyIntervalRef.current = null;
    }
    if (lobbyTimeoutRef.current) {
      clearTimeout(lobbyTimeoutRef.current);
      lobbyTimeoutRef.current = null;
    }
    setIsLobbyMusicPlaying(false);
  }, []);

  const playCorrect = useCallback(() => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.2, 'sine', 0.25), i * 80);
      });
    } catch (e) {
      console.warn('Correct sound failed:', e);
    }
  }, [isMuted, getAudioContext, playTone]);

  const playIncorrect = useCallback(() => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      
      playTone(200, 0.3, 'triangle', 0.2);
      setTimeout(() => playTone(150, 0.2, 'triangle', 0.15), 100);
    } catch (e) {
      console.warn('Incorrect sound failed:', e);
    }
  }, [isMuted, getAudioContext, playTone]);

  const playTick = useCallback((urgent = false) => {
    if (isMuted) return;
    
    const frequency = urgent ? 600 : 440;
    const volume = urgent ? 0.25 : 0.15;
    playTone(frequency, 0.05, 'sine', volume);
  }, [isMuted, playTone]);

  const playQuestionStart = useCallback(() => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn('Question start sound failed:', e);
    }
  }, [isMuted, getAudioContext]);

  const playGameStart = useCallback(() => {
    if (isMuted) return;
    
    try {
      const notes = [392, 440, 494, 523, 587, 659];
      notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.15, 'sine', 0.2), i * 60);
      });
    } catch (e) {
      console.warn('Game start sound failed:', e);
    }
  }, [isMuted, playTone]);

  const playGameComplete = useCallback(() => {
    if (isMuted) return;
    
    try {
      const melody = [523, 587, 659, 784];
      melody.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.2, 'sine', 0.25), i * 100);
      });
      
      setTimeout(() => {
        [523, 659, 784].forEach(freq => playTone(freq, 0.4, 'sine', 0.2));
      }, 450);
    } catch (e) {
      console.warn('Game complete sound failed:', e);
    }
  }, [isMuted, playTone]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTicking();
      stopLobbyMusic();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopTicking, stopLobbyMusic]);

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
    isLobbyMusicPlaying,
    isMuted,
    toggleMute,
  };
};
