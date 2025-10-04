import { useCallback } from "react";

// Free public domain sound effects using Howler.js or simple Audio API
export const useSoundEffects = () => {
  const playSound = useCallback((soundType: "correct" | "incorrect" | "next") => {
    const sounds = {
      // Correct answer - pleasant chime (C major chord)
      correct: () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playNote = (frequency: number, startTime: number) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.value = frequency;
          oscillator.type = "sine";
          gainNode.gain.setValueAtTime(0.3, startTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
          oscillator.start(startTime);
          oscillator.stop(startTime + 0.5);
        };
        const now = audioContext.currentTime;
        playNote(523.25, now); // C5
        playNote(659.25, now + 0.1); // E5
        playNote(783.99, now + 0.2); // G5
      },
      
      // Incorrect answer - gentle buzzer
      incorrect: () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 200;
        oscillator.type = "sawtooth";
        const now = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
      },
      
      // Next question - soft click
      next: () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = "sine";
        const now = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
      }
    };

    try {
      sounds[soundType]();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }, []);

  return { playSound };
};
