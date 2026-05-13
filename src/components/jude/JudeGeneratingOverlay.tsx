/**
 * JudeGeneratingOverlay Component
 * 
 * Reusable loading overlay showing Jude at his desk with a pulse animation
 * and a customizable message. Used for quiz/activities/translation generation.
 * Includes a subtle synthesized typing sound effect via Web Audio API.
 */

import { useEffect, useRef, forwardRef } from "react";
const judeChairDesk = "/images/eric-chair-desk-200w.webp";

interface JudeGeneratingOverlayProps {
  isVisible: boolean;
  message: string;
}

// Wrapped in forwardRef so Radix Presence (TabsContent) can attach its ref
export const JudeGeneratingOverlay = forwardRef<HTMLDivElement, JudeGeneratingOverlayProps>(function JudeGeneratingOverlay({ isVisible, message }, ref) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keystrokeCountRef = useRef(0);

  useEffect(() => {
    if (!isVisible) return;

    let cancelled = false;

    const startTyping = () => {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;

        const playKeystroke = () => {
          if (cancelled || ctx.state === 'closed') return;

          // Create white noise buffer (30ms)
          const duration = 0.03;
          const sampleRate = ctx.sampleRate;
          const bufferSize = Math.floor(sampleRate * duration);
          const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
          }

          const source = ctx.createBufferSource();
          source.buffer = buffer;

          // Bandpass filter for mechanical click character
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 2000 + Math.random() * 2000; // 2000-4000Hz
          filter.Q.value = 1.5;

          // Gain envelope
          const gain = ctx.createGain();
          const now = ctx.currentTime;
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

          source.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          source.start(now);
          source.stop(now + duration);
        };

        const scheduleNext = () => {
          if (cancelled) return;
          keystrokeCountRef.current++;

          playKeystroke();

          // Every 4-8 keystrokes, add a longer pause (simulates thinking)
          const isPause = keystrokeCountRef.current % (4 + Math.floor(Math.random() * 5)) === 0;
          const delay = isPause
            ? 300 + Math.random() * 200   // 300-500ms pause
            : 80 + Math.random() * 70;    // 80-150ms normal

          intervalRef.current = setTimeout(scheduleNext, delay);
        };

        scheduleNext();
      } catch {
        // Audio not critical — silently fail
      }
    };

    startTyping();

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      keystrokeCountRef.current = 0;
    };
  }, [isVisible]);

  if (!isVisible) return null;
  
  return (
    <div ref={ref} className="min-h-[200px] flex flex-col items-center justify-center p-6">
      {/* Jude at desk with pulse animation */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
        <img
          src={judeChairDesk}
          srcSet="/images/eric-chair-desk-200w.webp 200w, /images/eric-chair-desk-400w.webp 400w"
          sizes="(max-width: 640px) 96px, 128px"
          alt="Jude prépare le contenu"
          className="relative w-24 h-24 sm:w-32 sm:h-32 object-contain"
          style={{
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
          loading="lazy"
          decoding="async"
        />
      </div>
      
      {/* Status text */}
      <p className="text-sm font-medium text-foreground mb-2">
        {message}
      </p>
      
      {/* Bouncing dots - thinking indicator */}
      <div className="flex gap-1">
        <span 
          className="w-2 h-2 bg-primary rounded-full animate-bounce" 
          style={{ animationDelay: '0ms' }} 
        />
        <span 
          className="w-2 h-2 bg-primary rounded-full animate-bounce" 
          style={{ animationDelay: '150ms' }} 
        />
        <span 
          className="w-2 h-2 bg-primary rounded-full animate-bounce" 
          style={{ animationDelay: '300ms' }} 
        />
      </div>
    </div>
  );
});
