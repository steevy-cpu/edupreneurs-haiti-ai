import confetti from 'canvas-confetti';
import { toast } from 'sonner';

/**
 * Fires a gold-themed confetti + toast exactly once per device.
 * Safe to call after every successful increment_gold RPC — localStorage guard
 * ensures subsequent calls are instant no-ops.
 */
export function celebrateFirstGold() {
  if (localStorage.getItem('first-gold-earned')) return;
  localStorage.setItem('first-gold-earned', 'true');
  confetti({
    particleCount: 100,
    spread: 70,
    colors: ['#f59e0b', '#fbbf24', '#fcd34d'], // gold palette
  });
  toast.success('🥇 Tu as gagné ton premier Gold! Continue comme ça!', {
    duration: 4000,
  });
}
