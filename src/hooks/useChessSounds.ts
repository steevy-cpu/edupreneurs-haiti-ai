import { useCallback } from 'react';

type ChessSoundType = 'move' | 'capture' | 'check' | 'checkmate' | 'gameStart' | 'gameEnd';

export const useChessSounds = () => {
  const playSound = useCallback((soundType: ChessSoundType) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const now = audioContext.currentTime;

      switch (soundType) {
        case 'move':
          // Short woody click sound
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(800, now);
          oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.05);
          gainNode.gain.setValueAtTime(0.3, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
          oscillator.start(now);
          oscillator.stop(now + 0.08);
          break;

        case 'capture':
          // Impact sound for capturing
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(600, now);
          oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1);
          gainNode.gain.setValueAtTime(0.4, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          oscillator.start(now);
          oscillator.stop(now + 0.15);
          break;

        case 'check':
          // Alert sound for check
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(880, now);
          gainNode.gain.setValueAtTime(0.2, now);
          oscillator.frequency.setValueAtTime(1100, now + 0.1);
          oscillator.frequency.setValueAtTime(880, now + 0.2);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          oscillator.start(now);
          oscillator.stop(now + 0.3);
          break;

        case 'checkmate':
          // Victory/defeat fanfare
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);

          oscillator.type = 'sine';
          osc2.type = 'sine';

          // Play a chord progression
          oscillator.frequency.setValueAtTime(523, now); // C5
          osc2.frequency.setValueAtTime(659, now); // E5
          gainNode.gain.setValueAtTime(0.3, now);
          gain2.gain.setValueAtTime(0.3, now);

          oscillator.frequency.setValueAtTime(587, now + 0.2); // D5
          osc2.frequency.setValueAtTime(740, now + 0.2); // F#5

          oscillator.frequency.setValueAtTime(659, now + 0.4); // E5
          osc2.frequency.setValueAtTime(784, now + 0.4); // G5

          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
          gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

          oscillator.start(now);
          osc2.start(now);
          oscillator.stop(now + 0.8);
          osc2.stop(now + 0.8);
          break;

        case 'gameStart':
          // Simple start chime
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(440, now);
          oscillator.frequency.setValueAtTime(554, now + 0.1);
          oscillator.frequency.setValueAtTime(659, now + 0.2);
          gainNode.gain.setValueAtTime(0.25, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          oscillator.start(now);
          oscillator.stop(now + 0.4);
          break;

        case 'gameEnd':
          // End game sound
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(659, now);
          oscillator.frequency.setValueAtTime(554, now + 0.15);
          oscillator.frequency.setValueAtTime(440, now + 0.3);
          gainNode.gain.setValueAtTime(0.25, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          oscillator.start(now);
          oscillator.stop(now + 0.5);
          break;
      }
    } catch (error) {
      console.log('Sound not available:', error);
    }
  }, []);

  return { playSound };
};
