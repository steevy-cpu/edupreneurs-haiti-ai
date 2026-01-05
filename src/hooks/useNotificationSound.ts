import { useCallback } from 'react';

export const useNotificationSound = () => {
  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // First tone (higher pitch)
      const oscillator1 = audioContext.createOscillator();
      const gainNode1 = audioContext.createGain();
      
      oscillator1.connect(gainNode1);
      gainNode1.connect(audioContext.destination);
      
      oscillator1.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
      oscillator1.type = 'sine';
      
      gainNode1.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator1.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.15);
      
      // Second tone (lower pitch) - delayed
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15); // E5 note
      oscillator2.type = 'sine';
      
      gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode2.gain.setValueAtTime(0.25, audioContext.currentTime + 0.15);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
      
      oscillator2.start(audioContext.currentTime + 0.15);
      oscillator2.stop(audioContext.currentTime + 0.35);
      
      // Clean up after sounds complete
      setTimeout(() => {
        audioContext.close();
      }, 500);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }, []);

  return { playNotificationSound };
};
