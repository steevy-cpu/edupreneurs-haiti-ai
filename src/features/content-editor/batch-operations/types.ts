import { LucideIcon } from "lucide-react";

// Core types for batch operations
export interface BatchLesson {
  id: string;
  title: string;
  slug: string;
  grade_level: string;
  contenu?: string | null;
  exemples_exercices?: string | null;
  quiz_final?: string | null;
  activites_interactives?: string | null;
  last_content_validated_at?: string | null;
  last_activities_validated_at?: string | null;
  needs_quiz_regeneration?: boolean | null;
  needs_activities_regeneration?: boolean | null;
  validation_details_json?: any;
  content_alignment_score?: number | null;
  activities_alignment_score?: number | null;
  subjects?: { name: string } | null;
}

export interface OperationResult {
  lessonId: string;
  lessonTitle: string;
  success: boolean;
  aligned?: boolean;
  confidence?: number;
  offContentCount?: number;
  error?: string;
}

export interface OperationProgress {
  current: number;
  total: number;
}

export interface OperationStats {
  success: number;
  failed: number;
  aligned: number;
  misaligned: number;
}

export type OperationType = 'validate' | 'regenerate';
export type ContentType = 'quiz' | 'activities';

export interface BatchOperationTheme {
  color: 'amber' | 'purple' | 'primary' | 'destructive';
  icon: LucideIcon;
  progressBgClass: string;
  borderClass: string;
  textClass: string;
  hoverClass: string;
  buttonClass: string;
}

export interface BatchOperationMessages {
  empty: string;
  progress: string;
  success: string;
  partial: string;
  error: string;
  pauseInfo: string;
}

export interface BatchOperationConfig<TResult = OperationResult> {
  // Operation identification
  operationType: OperationType;
  contentType: ContentType;
  
  // Filtering
  filterLesson: (lesson: BatchLesson, skipCompleted: boolean) => boolean;
  
  // Processing
  processLesson: (lesson: BatchLesson) => Promise<TResult>;
  
  // Database update (with merge logic for validation_details_json)
  updateLesson: (lessonId: string, result: TResult, existingDetails: any) => Promise<void>;
  
  // UI customization
  theme: BatchOperationTheme;
  messages: BatchOperationMessages;
  
  // Rate limiting (ms between requests)
  rateLimit: number;
}

export interface BatchDialogConfig {
  title: string;
  description: string;
  confirmLabel: string;
  skipCheckboxLabel: string;
  showSkipCheckbox: boolean;
}

export interface UseBatchOperationReturn {
  // State
  isRunning: boolean;
  progress: OperationProgress;
  results: OperationResult[];
  currentItem: string;
  skipCompleted: boolean;
  
  // Actions
  start: () => Promise<void>;
  pause: () => void;
  setSkipCompleted: (skip: boolean) => void;
  
  // Computed
  stats: OperationStats;
  itemsToProcess: BatchLesson[];
  canStart: boolean;
  estimatedMinutes: number;
}
