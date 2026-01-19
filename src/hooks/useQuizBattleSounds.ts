import { useRef, useState, useCallback, useEffect } from 'react';

export const useQuizBattleSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const tickIntervalRef = useRef<number | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    // Persist mute preference
    return localStorage.getItem('quiz-sounds-muted') === 'true';
  });

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

  const playCorrect = useCallback(() => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') ctx.resume();
      
      // Cheerful ascending arpeggio (C-E-G)
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
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
      
      // Soft descending buzz
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
      
      // Quick whoosh/pop sound (frequency sweep)
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
      // Quick ascending fanfare
      const notes = [392, 440, 494, 523, 587, 659]; // G4 to E5
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
      // Victory jingle - ascending with final chord
      const melody = [523, 587, 659, 784]; // C5-D5-E5-G5
      melody.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.2, 'sine', 0.25), i * 100);
      });
      
      // Final chord
      setTimeout(() => {
        [523, 659, 784].forEach(freq => playTone(freq, 0.4, 'sine', 0.2));
      }, 450);
    } catch (e) {
      console.warn('Game complete sound failed:', e);
    }
  }, [isMuted, playTone]);

  const startTickingTimer = useCallback((timeLeft: number, maxTime: number) => {
    // Clear any existing interval
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
    }
    
    if (isMuted) return;
    
    // Calculate tick frequency based on time remaining
    const getTickDelay = (time: number) => {
      if (time <= 3) return 250; // Very fast when critically low
      if (time <= 5) return 400; // Fast when urgent
      if (time <= 10) return 600; // Medium pace
      return 1000; // Normal pace
    };
    
    let lastTick = Date.now();
    const isUrgent = timeLeft <= 5;
    
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
      return newValue;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTicking();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopTicking]);

  return {
    playCorrect,
    playIncorrect,
    playTick,
    playQuestionStart,
    playGameStart,
    playGameComplete,
    startTickingTimer,
    stopTicking,
    isMuted,
    toggleMute,
  };
};
