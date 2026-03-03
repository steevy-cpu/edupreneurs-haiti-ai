/**
 * ExamHub Practice - Barrel exports
 */

// Types
export * from './types';

// Utils
export { 
  detectQuestionType, 
  parseMatchingColumns, 
  formatMatchingAnswer,
  type QuestionType 
} from './utils';

// Hooks
export { useTutorAction } from './hooks/useTutorAction';
export { useExerciseExplanation } from './hooks/useExerciseExplanation';
export { useExamTutorChat, type ChatMessage } from './hooks/useExamTutorChat';
export { useExamTimer } from './hooks/useExamTimer';

// Components
export { ExamTutorPanel } from './components/ExamTutorPanel';
export { ExerciseHeader } from './components/ExerciseHeader';
export { ExercisePrompt } from './components/ExercisePrompt';
export { AnswerInput } from './components/AnswerInput';
export { FeedbackCard } from './components/FeedbackCard';
export { ActionRow } from './components/ActionRow';
export { AskJudeDrawer } from './components/AskJudeDrawer';
export { ExamResultsModal } from './components/ExamResultsModal';
export { ExamModeSelector } from './components/ExamModeSelector';

// Input Components (for direct usage if needed)
export { MCQInput, ShortInput, MatchingInput, EssayInput } from './components/inputs';
