/**
 * @file passion.types.ts
 * @description Business/data model types for the Passion Discovery feature.
 * @module types
 */

/** A single quiz question in the passion discovery flow */
export interface QuizQuestion {
  id: number;
  question: string;
  options: Array<{ text: string; passion: string; judeImage: string }>;
  judeImage: string;
}

/** A single activity within a passion module */
export interface Activity {
  id: string;
  type: "video" | "quiz" | "reading" | "game";
  title: string;
  description: string;
  duration: string;
  completed: boolean;
}

/** A learning module within a passion category */
export interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  locked: boolean;
  activities: Activity[];
}

/** A top-level passion category (Music, Arts, Chess, Literature) */
export interface Category {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  fullDescription: string;
  color: string;
  modules: Module[];
  hasGameLink?: boolean;
}

/** A YouTube video recommendation for passion exploration */
export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

/** Accumulated scores across the four passion domains */
export interface PassionScores {
  music: number;
  arts: number;
  chess: number;
  literature: number;
}
