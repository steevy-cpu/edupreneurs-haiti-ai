import { LucideIcon, Swords, Crown } from 'lucide-react';

// Game schema - matches existing property names
export interface Game {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  features: string[];
  path: string;
  isNew: boolean;
  isLocked: boolean;
  xpReward: number;
  modes: ('solo' | 'multiplayer')[];
}

// Games configuration - single source of truth
export const GAMES_CONFIG: Game[] = [
  {
    id: 'quiz-battle',
    title: 'Quiz Battle',
    description: 'Teste tes connaissances et défie tes amis dans des quiz éducatifs!',
    icon: Swords,
    color: 'from-primary to-secondary',
    features: ['Mode Solo', 'Multijoueur', 'Badges & XP'],
    path: '/quiz-battle',
    isNew: true,
    isLocked: false,
    xpReward: 50,
    modes: ['solo', 'multiplayer'],
  },
  {
    id: 'chess',
    title: 'Échecs',
    description: "Joue aux échecs contre l'IA ou défie tes amis en temps réel!",
    icon: Crown,
    color: 'from-secondary to-accent',
    features: ['Contre l\'IA', 'Multijoueur', 'Puzzles', 'Classement ELO'],
    path: '/chess-game',
    isNew: false,
    isLocked: false,
    xpReward: 30,
    modes: ['solo', 'multiplayer'],
  },
];

// Access control utility
interface GameUser {
  isSuperUser: boolean;
}

export function canAccessGame(game: Game, user: GameUser): boolean {
  if (user.isSuperUser) return true;
  return !game.isLocked;
}

// Stats computation - derived, not hardcoded
export interface GamesHubStats {
  totalGames: number;
  playableGames: number;
  totalXP: number;
  hasMultiplayer: boolean;
}

export function computeGamesStats(games: Game[], user: GameUser): GamesHubStats {
  const accessible = games.filter(g => canAccessGame(g, user));
  return {
    totalGames: games.length,
    playableGames: accessible.length,
    totalXP: accessible.reduce((sum, g) => sum + g.xpReward, 0),
    hasMultiplayer: accessible.some(g => g.modes.includes('multiplayer')),
  };
}
