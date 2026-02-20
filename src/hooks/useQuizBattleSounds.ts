import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Quiz Battle Sounds Hook
 * 
 * Provides timer/ticking sounds only using Web Audio API.
 * All other sounds (lobby music, correct/incorrect, etc.) have been removed.
 */
export const useQuizBattleSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const tickIntervalRef = useRef<number | null>(null);
  
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('quiz-sounds-muted') === 'true';
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
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
        stopTicking();
      }
      return newValue;
    });
  }, [stopTicking]);

  // Ascending arpeggio: C5→E5→G5 — rewarding chime
  const playCorrect = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const notes = [523, 659, 784];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        const start = now + i * 0.07;
        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.08);
        osc.start(start);
        osc.stop(start + 0.08);
      });
    } catch (e) { console.warn('playCorrect failed:', e); }
  }, [isMuted, getAudioContext]);

  // Buzzer: G3→E3 — punchy but not harsh
  const playIncorrect = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const notes = [196, 165];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        const start = now + i * 0.12;
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.2);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch (e) { console.warn('playIncorrect failed:', e); }
  }, [isMuted, getAudioContext]);

  // Ready sound: E5→G5 — energetic start cue
  const playGameStart = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const notes = [659, 784];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        const start = now + i * 0.05;
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.06);
        osc.start(start);
        osc.stop(start + 0.06);
      });
    } catch (e) { console.warn('playGameStart failed:', e); }
  }, [isMuted, getAudioContext]);

  // No spec provided — kept as no-op for backward compat
  const playQuestionStart = useCallback(() => {}, []);

  // Triumphant fanfare: C5→E5→G5→C6
  const playGameComplete = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const notes: [number, number][] = [[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.2]];
      notes.forEach(([freq, dur], i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        const start = now + i * 0.1;
        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + dur);
        osc.start(start);
        osc.stop(start + dur);
      });
    } catch (e) { console.warn('playGameComplete failed:', e); }
  }, [isMuted, getAudioContext]);
  const startLobbyMusic = useCallback(() => {}, []);
  const stopLobbyMusic = useCallback(() => {}, []);
  const transitionToGame = useCallback(async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
  }, []);

  return {
    // Timer sounds (active)
    playTick,
    startTickingTimer,
    stopTicking,
    
    // Mute controls
    isMuted,
    toggleMute,
    
    // No-op functions for backward compatibility
    playCorrect,
    playIncorrect,
    playQuestionStart,
    playGameStart,
    playGameComplete,
    startLobbyMusic,
    stopLobbyMusic,
    transitionToGame,
    isLobbyMusicPlaying: false,
  };
};
